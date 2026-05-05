import { supabase } from './supabase';

/**
 * Integration Manager for fetching real data from various providers via Supabase Proxy
 */

/**
 * Main entry point for fetching data from any provider
 */
export async function fetchRealProviderData(provider, apiKey) {
  if (!apiKey) return null;

  switch (provider) {
    case 'hubspot':
      return await fetchHubSpot(apiKey);
    case 'salesforce':
      return await fetchSalesforce(apiKey);
    case 'quickbooks':
      return await fetchQuickBooks(apiKey);
    case 'xero':
      return await fetchXero(apiKey);
    default:
      console.warn(`Real data fetcher for ${provider} not fully implemented yet. Please use demo mode.`);
      return null;
  }
}

/**
 * HubSpot implementation via Supabase Proxy
 */
async function fetchHubSpot(token) {
  const { data, error } = await supabase.functions.invoke('crm-proxy', {
    body: {
      provider: 'hubspot',
      endpoint: '/crm/v3/objects/contacts?limit=10&properties=company,firstname,lastname,email,phone,industry,city',
      method: 'GET',
      apiKey: token
    }
  });

  if (error || !data) throw new Error('HubSpot Proxy Error: ' + (error?.message || 'Empty response'));
  
  // HubSpot returns the results in a 'results' array
  const results = data.results || [];
  
  return results.map(contact => ({
    company_name: contact.properties.company || 'N/A',
    contact_name: `${contact.properties.firstname || ''} ${contact.properties.lastname || ''}`.trim() || 'Unknown',
    contact_email: contact.properties.email || 'N/A',
    phone: contact.properties.phone || 'N/A',
    industry: contact.properties.industry || 'N/A',
    city: contact.properties.city || 'N/A',
    notes: 'Imported from HubSpot'
  }));
}

/**
 * Push data to HubSpot via Supabase Proxy
 */
export async function pushHubSpot(token, records) {
  if (!records || records.length === 0) {
    records = [{
      email: `test_${Date.now()}@example.com`,
      firstname: 'SyncFlow',
      lastname: 'Test User',
      company: 'SyncFlow Inc',
      city: 'San Francisco'
    }];
  }

  const results = { success: 0, failed: 0 };

  for (const record of records) {
    try {
      const firstname = record.Contact_First || record.firstname || record.contact_name?.split(' ')[0] || record.CustomerName?.split(' ')[0] || record.ContactName?.split(' ')[0] || 'User';
      const lastname = record.Contact_Last || record.lastname || record.contact_name?.split(' ').slice(1).join(' ') || record.CustomerName?.split(' ').slice(1).join(' ') || record.ContactName?.split(' ').slice(1).join(' ') || '';
      const email = record.Email || record.contact_email || record.email || (record.CustomerName ? `${record.CustomerName.toLowerCase().replace(/ /g, '.')}@example.com` : `contact_${Date.now()}@example.com`);
      const company = record.Account_Name || record.company_name || record.CompanyName || record.company || record.industry || 'Demo Corp';

      const { data, error } = await supabase.functions.invoke('crm-proxy', {
        body: {
          provider: 'hubspot',
          endpoint: '/crm/v3/objects/contacts',
          method: 'POST',
          apiKey: token,
          body: {
            properties: {
              email: email,
              firstname: firstname,
              lastname: lastname,
              company: company,
              city: record.city || record.location || 'N/A'
            }
          }
        }
      });

      if (!error && data) {
        results.success++;
      } else {
        console.error('HubSpot Push Error:', error);
        results.failed++;
      }
    } catch (err) {
      console.error('HubSpot Push Network Error:', err);
      results.failed++;
    }
  }

  return results;
}

/**
 * Salesforce implementation via Supabase Proxy
 */
async function fetchSalesforce(token) {
  const { data, error } = await supabase.functions.invoke('crm-proxy', {
    body: {
      provider: 'salesforce',
      endpoint: '/services/data/v57.0/query/?q=SELECT+Name,Email,Phone,Account.Name+FROM+Contact+LIMIT+10',
      method: 'GET',
      apiKey: token
    }
  });

  if (error || !data) throw new Error('Salesforce Proxy Error');
  
  return (data.records || []).map(record => ({
    Account_Name: record.Account?.Name || 'N/A',
    Contact_First: record.Name.split(' ')[0],
    Contact_Last: record.Name.split(' ').slice(1).join(' '),
    Email: record.Email || 'N/A',
    Phone: record.Phone || 'N/A'
  }));
}

/**
 * QuickBooks implementation via Supabase Proxy
 */
async function fetchQuickBooks(token) {
  const { data, error } = await supabase.functions.invoke('crm-proxy', {
    body: {
      provider: 'quickbooks',
      endpoint: '/v3/company/REPLACE_WITH_REALMID/query?query=SELECT * FROM Customer LIMIT 10',
      method: 'GET',
      apiKey: token
    }
  });

  if (error || !data) throw new Error('QuickBooks Proxy Error');
  
  return (data.QueryResponse?.Customer || []).map(c => ({
    CustomerName: c.DisplayName,
    Amount: c.Balance || 0,
    Status: c.Active ? 'Active' : 'Inactive',
    Email: c.PrimaryEmailAddr?.Address || 'N/A'
  }));
}

/**
 * Xero implementation via Supabase Proxy
 */
async function fetchXero(token) {
  const { data, error } = await supabase.functions.invoke('crm-proxy', {
    body: {
      provider: 'xero',
      endpoint: '/api.xro/2.0/Contacts?page=1',
      method: 'GET',
      apiKey: token
    }
  });

  if (error || !data) throw new Error('Xero Proxy Error');
  
  return (data.Contacts || []).map(c => ({
    ContactName: c.Name,
    Total: 0,
    Reference: c.ContactID,
    CurrencyCode: c.DefaultCurrency || 'USD'
  }));
}
