import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ProxyRequest {
  provider: string;
  endpoint: string;
  method?: string;
  body?: any;
  apiKey: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const payload: ProxyRequest = await req.json()
    const { provider, endpoint, method, body, apiKey } = payload

    console.log(`Proxying ${method || 'GET'} request to ${provider}: ${endpoint}`)

    let baseUrl = ''
    if (provider === 'hubspot') {
      baseUrl = 'https://api.hubapi.com'
    } else if (provider === 'salesforce') {
      baseUrl = 'https://login.salesforce.com'
    } else if (provider === 'quickbooks') {
      baseUrl = 'https://quickbooks.api.intuit.com'
    } else if (provider === 'xero') {
      baseUrl = 'https://api.xero.com'
    } else {
      throw new Error(`Unsupported provider: ${provider}`)
    }

    const url = `${baseUrl}${endpoint}`

    const response = await fetch(url, {
      method: method || 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    })

    const responseData = await response.json()

    console.log(`${provider} responded with status: ${response.status}`)

    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: response.status,
    })
  } catch (error) {
    console.error('Proxy Error:', error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
