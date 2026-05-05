/**
 * HubSpot API utility for fetching real data
 */

export async function fetchHubSpotContacts(accessToken) {
  try {
    const response = await fetch('/api/hubspot/crm/v3/objects/contacts?limit=10&properties=company,firstname,lastname,email,phone,industry,city', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch HubSpot contacts');
    }

    const data = await response.json();
    
    // Map HubSpot response to our internal format
    return data.results.map(contact => ({
      company_name: contact.properties.company || 'N/A',
      contact_name: `${contact.properties.firstname || ''} ${contact.properties.lastname || ''}`.trim() || 'Unknown',
      contact_email: contact.properties.email || 'N/A',
      phone: contact.properties.phone || 'N/A',
      deal_name: 'Existing Lead',
      deal_value: 0,
      deal_stage: 'Contacted',
      industry: contact.properties.industry || 'N/A',
      city: contact.properties.city || 'N/A',
      notes: 'Imported from HubSpot'
    }));
  } catch (error) {
    console.error('HubSpot Fetch Error:', error);
    throw error;
  }
}
