/**
 * Integration Manager for fetching real data from various providers
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
 * HubSpot implementation
 */
async function fetchHubSpot(token) {
  const response = await fetch('/api/hubspot/crm/v3/objects/contacts?limit=10&properties=company,firstname,lastname,email,phone,industry,city', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!response.ok) throw new Error('HubSpot Error: ' + response.statusText);
  const data = await response.json();
  return data.results.map(contact => ({
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
 * Push data to HubSpot (Create Contacts)
 */
export async function pushHubSpot(token, records) {
  if (!records || records.length === 0) {
    // If no records provided, create a test contact
    records = [{
      email: `test_${Date.now()}@example.com`,
      firstname: 'SyncFlow',
      lastname: 'Test User',
      company: 'SyncFlow Inc',
      city: 'San Francisco'
    }];
  }

  const results = { success: 0, failed: 0 };

  // HubSpot allows batch creation, but for this demo we'll do them individually or use the batch API
  // We'll use the basic create API for simplicity in this example
  for (const record of records) {
    try {
      // Robust mapping for demo data from various providers
      const firstname = record.Contact_First || record.firstname || record.contact_name?.split(' ')[0] || record.CustomerName?.split(' ')[0] || record.ContactName?.split(' ')[0] || 'User';
      const lastname = record.Contact_Last || record.lastname || record.contact_name?.split(' ').slice(1).join(' ') || record.CustomerName?.split(' ').slice(1).join(' ') || record.ContactName?.split(' ').slice(1).join(' ') || '';
      const email = record.Email || record.contact_email || record.email || (record.CustomerName ? `${record.CustomerName.toLowerCase().replace(/ /g, '.')}@example.com` : `contact_${Date.now()}@example.com`);
      const company = record.Account_Name || record.company_name || record.CompanyName || record.company || record.industry || 'Demo Corp';

      const response = await fetch('/api/hubspot/crm/v3/objects/contacts', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          properties: {
            email: email,
            firstname: firstname,
            lastname: lastname,
            company: company,
            city: record.city || record.location || 'N/A'
          }
        })
      });

      if (response.ok) {
        results.success++;
      } else {
        const err = await response.json();
        console.error('HubSpot Push Item Error:', err);
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
 * Salesforce implementation (Example using Bearer token / Instance URL)
 * Note: Real SF usually needs instance-specific URLs
 */
async function fetchSalesforce(token) {
  // Salesforce usually requires an instance URL. For demo, we assume the user might provide it or we use a common one.
  const response = await fetch('/api/salesforce/services/data/v57.0/query/?q=SELECT+Name,Email,Phone,Account.Name+FROM+Contact+LIMIT+10', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!response.ok) throw new Error('Salesforce Error: ' + response.statusText);
  const data = await response.json();
  return data.records.map(record => ({
    Account_Name: record.Account?.Name || 'N/A',
    Contact_First: record.Name.split(' ')[0],
    Contact_Last: record.Name.split(' ').slice(1).join(' '),
    Email: record.Email || 'N/A',
    Phone: record.Phone || 'N/A'
  }));
}

/**
 * QuickBooks implementation
 */
async function fetchQuickBooks(token) {
  // QuickBooks requires a RealmID (Company ID) which is usually part of the OAuth flow.
  // This is a placeholder for how the API call looks.
  const response = await fetch('/api/quickbooks/v3/company/REPLACE_WITH_REALMID/query?query=SELECT * FROM Customer LIMIT 10', {
    headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
  });
  if (!response.ok) throw new Error('QuickBooks Error: ' + response.statusText);
  const data = await response.json();
  return data.QueryResponse.Customer.map(c => ({
    CustomerName: c.DisplayName,
    Amount: c.Balance || 0,
    Status: c.Active ? 'Active' : 'Inactive',
    Email: c.PrimaryEmailAddr?.Address || 'N/A'
  }));
}

/**
 * Xero implementation
 */
async function fetchXero(token) {
  const response = await fetch('/api/xero/api.xro/2.0/Contacts?page=1', {
    headers: { 'Authorization': `Bearer ${token}`, 'Xero-tenant-id': 'REPLACE_WITH_TENANT_ID' }
  });
  if (!response.ok) throw new Error('Xero Error: ' + response.statusText);
  const data = await response.json();
  return data.Contacts.map(c => ({
    ContactName: c.Name,
    Total: 0,
    Reference: c.ContactID,
    CurrencyCode: c.DefaultCurrency || 'USD'
  }));
}
