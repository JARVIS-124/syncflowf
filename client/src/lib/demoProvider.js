export const PROVIDERS = {
  hubspot: {
    label: 'HubSpot CRM',
    type: 'crm',
    vertical: 'accounting',
    fields: [
      { name: 'company_name', label: 'Company Name', type: 'string' },
      { name: 'contact_name', label: 'Contact Name', type: 'string' },
      { name: 'contact_email', label: 'Contact Email', type: 'string' },
      { name: 'phone', label: 'Phone', type: 'string' },
      { name: 'deal_name', label: 'Deal Name', type: 'string' },
      { name: 'deal_value', label: 'Deal Value', type: 'number' },
      { name: 'deal_stage', label: 'Deal Stage', type: 'string' },
      { name: 'industry', label: 'Industry', type: 'string' },
      { name: 'city', label: 'City', type: 'string' },
      { name: 'notes', label: 'Notes', type: 'string' },
    ],
    sampleData: [
      { company_name: 'Acme Corp', contact_name: 'John Smith', contact_email: 'john@acme.com', phone: '+1-555-0101', deal_name: 'Enterprise License', deal_value: 45000, deal_stage: 'Closed Won', industry: 'Technology', city: 'San Francisco', notes: 'Annual contract' },
      { company_name: 'GlobalTech Inc', contact_name: 'Sarah Connor', contact_email: 'sarah@globaltech.io', phone: '+1-555-0102', deal_name: 'Premium Support', deal_value: 12000, deal_stage: 'Negotiation', industry: 'SaaS', city: 'Austin', notes: 'Needs custom onboarding' },
      { company_name: 'Starlight Media', contact_name: 'David Bowie', contact_email: 'david@starlight.com', phone: '+1-555-0103', deal_name: 'Ad Campaign', deal_value: 25000, deal_stage: 'Proposal', industry: 'Media', city: 'Los Angeles', notes: 'Interested in Q3 launch' },
      { company_name: 'BioGenics', contact_name: 'Alice Wong', contact_email: 'alice@biogenics.com', phone: '+1-555-0104', deal_name: 'Lab Equipment Sync', deal_value: 65000, deal_stage: 'Contract Sent', industry: 'Healthcare', city: 'Boston', notes: 'Legal review ongoing' },
      { company_name: 'Oceanic Shipping', contact_name: 'James Cook', contact_email: 'james@oceanic.net', phone: '+1-555-0105', deal_name: 'Logistics Integration', deal_value: 30000, deal_stage: 'Discovery', industry: 'Logistics', city: 'Seattle', notes: 'Checking API compatibility' },
      { company_name: 'Iron Works', contact_name: 'Tony Stark', contact_email: 'tony@stark.com', phone: '+1-555-0106', deal_name: 'Energy Management', deal_value: 150000, deal_stage: 'Closed Won', industry: 'Energy', city: 'New York', notes: 'Priority client' },
      { company_name: 'Green Leaf', contact_name: 'Ivy Rose', contact_email: 'ivy@greenleaf.org', phone: '+1-555-0107', deal_name: 'Sustainability Audit', deal_value: 8000, deal_stage: 'Lead', industry: 'Consulting', city: 'Portland', notes: 'Referral' },
      { company_name: 'Nova Robotics', contact_name: 'Isaac Asimov', contact_email: 'isaac@nova.io', phone: '+1-555-0108', deal_name: 'AI Automation', deal_value: 95000, deal_stage: 'Presentation', industry: 'Robotics', city: 'Pittsburgh', notes: 'Demo scheduled for next week' },
      { company_name: 'Blue Sky Travel', contact_name: 'Amelia Earhart', contact_email: 'amelia@bluesky.com', phone: '+1-555-0109', deal_name: 'Flight Syncing', deal_value: 20000, deal_stage: 'Qualified', industry: 'Travel', city: 'Chicago', notes: 'High growth potential' },
      { company_name: 'Mountain Peak', contact_name: 'Edmund Hillary', contact_email: 'edmund@mountain.com', phone: '+1-555-0110', deal_name: 'Gear Supply', deal_value: 15000, deal_stage: 'Lost', industry: 'Retail', city: 'Denver', notes: 'Went with competitor' }
    ],
  },
  salesforce: {
    label: 'Salesforce',
    type: 'crm',
    vertical: 'erp_crm',
    fields: [
      { name: 'Account_Name', label: 'Account Name', type: 'string' },
      { name: 'Contact_First', label: 'First Name', type: 'string' },
      { name: 'Contact_Last', label: 'Last Name', type: 'string' },
      { name: 'Email', label: 'Email', type: 'string' }
    ],
    sampleData: [
      { Account_Name: 'TechStart LLC', Contact_First: 'Robert', Contact_Last: 'Johnson', Email: 'robert@techstart.com' },
      { Account_Name: 'Future Soft', Contact_First: 'Linda', Contact_Last: 'Garrison', Email: 'linda@futuresoft.net' },
      { Account_Name: 'Apex Systems', Contact_First: 'Mark', Contact_Last: 'Zucker', Email: 'mark@apex.com' },
      { Account_Name: 'Zenith Corp', Contact_First: 'Nancy', Contact_Last: 'Drew', Email: 'nancy@zenith.io' },
      { Account_Name: 'Cyberdyne', Contact_First: 'Miles', Contact_Last: 'Dyson', Email: 'miles@cyberdyne.com' },
      { Account_Name: 'Wayne Ent', Contact_First: 'Bruce', Contact_Last: 'Wayne', Email: 'bruce@wayne.com' },
      { Account_Name: 'LexCorp', Contact_First: 'Lex', Contact_Last: 'Luthor', Email: 'lex@lexcorp.com' },
      { Account_Name: 'Oscorp', Contact_First: 'Norman', Contact_Last: 'Osborn', Email: 'norman@oscorp.com' },
      { Account_Name: 'Umbrella Co', Contact_First: 'Albert', Contact_Last: 'Wesker', Email: 'albert@umbrella.com' },
      { Account_Name: 'Aperture Sci', Contact_First: 'Cave', Contact_Last: 'Johnson', Email: 'cave@aperture.com' }
    ],
  },
  quickbooks: {
    label: 'QuickBooks',
    type: 'invoicing',
    vertical: 'accounting',
    fields: [
      { name: 'CustomerName', label: 'Customer Name', type: 'string' },
      { name: 'Amount', label: 'Amount', type: 'number' },
      { name: 'InvoiceNumber', label: 'Invoice Number', type: 'string' },
      { name: 'DueDate', label: 'Due Date', type: 'date' },
      { name: 'Status', label: 'Status', type: 'string' }
    ],
    sampleData: [
      { CustomerName: 'Acme Corp', Amount: 45000, InvoiceNumber: 'INV-001', DueDate: '2026-05-15', Status: 'Sent' },
      { CustomerName: 'TechStart LLC', Amount: 12000, InvoiceNumber: 'INV-002', DueDate: '2026-05-20', Status: 'Paid' },
      { CustomerName: 'Starlight Media', Amount: 25000, InvoiceNumber: 'INV-003', DueDate: '2026-06-01', Status: 'Overdue' },
      { CustomerName: 'BioGenics', Amount: 65000, InvoiceNumber: 'INV-004', DueDate: '2026-06-10', Status: 'Draft' },
      { CustomerName: 'Oceanic Shipping', Amount: 30000, InvoiceNumber: 'INV-005', DueDate: '2026-06-15', Status: 'Sent' },
      { CustomerName: 'Iron Works', Amount: 150000, InvoiceNumber: 'INV-006', DueDate: '2026-07-01', Status: 'Paid' },
      { CustomerName: 'Green Leaf', Amount: 8000, InvoiceNumber: 'INV-007', DueDate: '2026-07-05', Status: 'Void' },
      { CustomerName: 'Nova Robotics', Amount: 95000, InvoiceNumber: 'INV-008', DueDate: '2026-07-10', Status: 'Sent' },
      { CustomerName: 'Blue Sky Travel', Amount: 20000, InvoiceNumber: 'INV-009', DueDate: '2026-07-20', Status: 'Paid' },
      { CustomerName: 'Mountain Peak', Amount: 15000, InvoiceNumber: 'INV-010', DueDate: '2026-08-01', Status: 'Sent' }
    ],
  },
  xero: {
    label: 'Xero',
    type: 'invoicing',
    vertical: 'accounting',
    fields: [
      { name: 'ContactName', label: 'Contact Name', type: 'string' },
      { name: 'Total', label: 'Total', type: 'number' },
      { name: 'Reference', label: 'Reference', type: 'string' },
      { name: 'CurrencyCode', label: 'Currency', type: 'string' }
    ],
    sampleData: [
      { ContactName: 'TechStart LLC', Total: 55000, Reference: 'PO-2026-001', CurrencyCode: 'USD' },
      { ContactName: 'Global Dynamics', Total: 87500, Reference: 'PO-2026-002', CurrencyCode: 'USD' },
      { ContactName: 'Quantum Systems', Total: 42000, Reference: 'PO-2026-003', CurrencyCode: 'GBP' },
      { ContactName: 'Helix Biotech', Total: 12000, Reference: 'PO-2026-004', CurrencyCode: 'EUR' },
      { ContactName: 'Solar Flare', Total: 33000, Reference: 'PO-2026-005', CurrencyCode: 'AUD' },
      { ContactName: 'Titan Mining', Total: 150000, Reference: 'PO-2026-006', CurrencyCode: 'USD' },
      { ContactName: 'Veridian Solutions', Total: 9500, Reference: 'PO-2026-007', CurrencyCode: 'CAD' },
      { ContactName: 'Vortex Media', Total: 27000, Reference: 'PO-2026-008', CurrencyCode: 'USD' },
      { ContactName: 'Ember Soft', Total: 18000, Reference: 'PO-2026-009', CurrencyCode: 'USD' },
      { ContactName: 'Peak Performance', Total: 11000, Reference: 'PO-2026-010', CurrencyCode: 'NZD' }
    ],
  },
  sap: {
    label: 'SAP S/4HANA',
    type: 'erp',
    vertical: 'erp_crm',
    fields: [
      { name: 'SalesOrder', label: 'Sales Order', type: 'string' },
      { name: 'Material', label: 'Material', type: 'string' },
      { name: 'Quantity', label: 'Quantity', type: 'number' },
      { name: 'NetValue', label: 'Net Value', type: 'number' },
      { name: 'CustomerCode', label: 'Customer Code', type: 'string' },
      { name: 'Plant', label: 'Plant', type: 'string' },
      { name: 'DeliveryDate', label: 'Delivery Date', type: 'date' }
    ],
    sampleData: [
      { SalesOrder: 'SO-400012', Material: 'PRD-A100', Quantity: 250, NetValue: 125000, CustomerCode: 'CUST-0001', Plant: 'US-EAST', DeliveryDate: '2026-06-01' },
      { SalesOrder: 'SO-400013', Material: 'PRD-B200', Quantity: 100, NetValue: 75000, CustomerCode: 'CUST-0002', Plant: 'EU-WEST', DeliveryDate: '2026-06-15' },
      { SalesOrder: 'SO-400014', Material: 'PRD-C300', Quantity: 500, NetValue: 250000, CustomerCode: 'CUST-0003', Plant: 'US-WEST', DeliveryDate: '2026-07-01' },
      { SalesOrder: 'SO-400015', Material: 'PRD-D400', Quantity: 75, NetValue: 35000, CustomerCode: 'CUST-0004', Plant: 'ASIA-SOUTH', DeliveryDate: '2026-07-10' },
      { SalesOrder: 'SO-400016', Material: 'PRD-E500', Quantity: 300, NetValue: 180000, CustomerCode: 'CUST-0005', Plant: 'US-EAST', DeliveryDate: '2026-07-20' },
      { SalesOrder: 'SO-400017', Material: 'PRD-F600', Quantity: 150, NetValue: 90000, CustomerCode: 'CUST-0006', Plant: 'EU-CENTRAL', DeliveryDate: '2026-08-01' },
      { SalesOrder: 'SO-400018', Material: 'PRD-G700', Quantity: 400, NetValue: 210000, CustomerCode: 'CUST-0007', Plant: 'US-WEST', DeliveryDate: '2026-08-15' },
      { SalesOrder: 'SO-400019', Material: 'PRD-H800', Quantity: 200, NetValue: 110000, CustomerCode: 'CUST-0008', Plant: 'ASIA-EAST', DeliveryDate: '2026-09-01' },
      { SalesOrder: 'SO-400020', Material: 'PRD-I900', Quantity: 1000, NetValue: 500000, CustomerCode: 'CUST-0009', Plant: 'EU-WEST', DeliveryDate: '2026-09-15' },
      { SalesOrder: 'SO-400021', Material: 'PRD-J000', Quantity: 50, NetValue: 25000, CustomerCode: 'CUST-0010', Plant: 'LATAM-1', DeliveryDate: '2026-10-01' }
    ],
  },
  netsuite: {
    label: 'NetSuite',
    type: 'erp',
    vertical: 'erp_crm',
    fields: [
      { name: 'EntityId', label: 'Entity ID', type: 'string' },
      { name: 'CompanyName', label: 'Company Name', type: 'string' },
      { name: 'Subsidiary', label: 'Subsidiary', type: 'string' },
      { name: 'Balance', label: 'Balance', type: 'number' },
      { name: 'Currency', label: 'Currency', type: 'string' },
      { name: 'Status', label: 'Status', type: 'string' }
    ],
    sampleData: [
      { EntityId: 'NS-10042', CompanyName: 'Meridian Industries', Subsidiary: 'US Operations', Balance: 340000, Currency: 'USD', Status: 'Active' },
      { EntityId: 'NS-10043', CompanyName: 'Pacific Ventures', Subsidiary: 'APAC Division', Balance: 215000, Currency: 'USD', Status: 'Active' },
      { EntityId: 'NS-10044', CompanyName: 'Continental Corp', Subsidiary: 'EU Branch', Balance: 125000, Currency: 'EUR', Status: 'Hold' },
      { EntityId: 'NS-10045', CompanyName: 'Northern Log', Subsidiary: 'Canada Ops', Balance: 89000, Currency: 'CAD', Status: 'Active' },
      { EntityId: 'NS-10046', CompanyName: 'Desert Sands', Subsidiary: 'MENA Region', Balance: 450000, Currency: 'USD', Status: 'Active' },
      { EntityId: 'NS-10047', CompanyName: 'Valley Systems', Subsidiary: 'US Operations', Balance: 12000, Currency: 'USD', Status: 'Prospect' },
      { EntityId: 'NS-10048', CompanyName: 'Summit Peaks', Subsidiary: 'US Operations', Balance: 77000, Currency: 'USD', Status: 'Active' },
      { EntityId: 'NS-10049', CompanyName: 'River Delta', Subsidiary: 'Brazil Unit', Balance: 33000, Currency: 'BRL', Status: 'Inactive' },
      { EntityId: 'NS-10050', CompanyName: 'Polaris Research', Subsidiary: 'US Operations', Balance: 920000, Currency: 'USD', Status: 'Active' },
      { EntityId: 'NS-10051', CompanyName: 'Alpha Omega', Subsidiary: 'US Operations', Balance: 15000, Currency: 'USD', Status: 'Active' }
    ],
  },
  dynamics: {
    label: 'MS Dynamics 365',
    type: 'erp',
    vertical: 'erp_crm',
    fields: [
      { name: 'AccountNumber', label: 'Account Number', type: 'string' },
      { name: 'Name', label: 'Name', type: 'string' },
      { name: 'Revenue', label: 'Revenue', type: 'number' },
      { name: 'Industry', label: 'Industry', type: 'string' },
      { name: 'Territory', label: 'Territory', type: 'string' },
      { name: 'OwnerEmail', label: 'Owner Email', type: 'string' }
    ],
    sampleData: [
      { AccountNumber: 'DYN-5001', Name: 'Apex Manufacturing', Revenue: 890000, Industry: 'Manufacturing', Territory: 'North America', OwnerEmail: 'jdoe@apex.com' },
      { AccountNumber: 'DYN-5002', Name: 'Summit Logistics', Revenue: 450000, Industry: 'Logistics', Territory: 'Europe', OwnerEmail: 'mchen@summit.io' },
      { AccountNumber: 'DYN-5003', Name: 'Nexus Creative', Revenue: 220000, Industry: 'Advertising', Territory: 'North America', OwnerEmail: 'sarah@nexus.com' },
      { AccountNumber: 'DYN-5004', Name: 'Unity Tech', Revenue: 1200000, Industry: 'Software', Territory: 'Global', OwnerEmail: 'admin@unity.com' },
      { AccountNumber: 'DYN-5005', Name: 'Grand Hotel', Revenue: 750000, Industry: 'Hospitality', Territory: 'Europe', OwnerEmail: 'reception@grand.com' },
      { AccountNumber: 'DYN-5006', Name: 'Steel Mill Co', Revenue: 3100000, Industry: 'Industrial', Territory: 'Asia', OwnerEmail: 'factory@steel.com' },
      { AccountNumber: 'DYN-5007', Name: 'Quick Courier', Revenue: 95000, Industry: 'Logistics', Territory: 'North America', OwnerEmail: 'dispatch@quick.com' },
      { AccountNumber: 'DYN-5008', Name: 'Ocean View', Revenue: 410000, Industry: 'Real Estate', Territory: 'Oceania', OwnerEmail: 'sales@oceanview.com' },
      { AccountNumber: 'DYN-5009', Name: 'Urban Styles', Revenue: 670000, Industry: 'Fashion', Territory: 'Europe', OwnerEmail: 'hq@urban.com' },
      { AccountNumber: 'DYN-5010', Name: 'Level Up Games', Revenue: 880000, Industry: 'Entertainment', Territory: 'North America', OwnerEmail: 'dev@levelup.com' }
    ],
  },
};

export function getProviderInfo(provider) {
  return PROVIDERS[provider] || null;
}

export function getProviderFields(provider) {
  const p = PROVIDERS[provider];
  return p ? p.fields : [];
}

export function getProviderSampleData(provider) {
  const p = PROVIDERS[provider];
  return p ? p.sampleData : [];
}

export function getAllProviders() {
  return Object.entries(PROVIDERS).map(([key, val]) => ({
    key,
    label: val.label,
    type: val.type,
    vertical: val.vertical,
    fieldCount: val.fields.length,
    recordCount: val.sampleData.length,
  }));
}

export function getProvidersByVertical(vertical) {
  if (!vertical || vertical === 'all') return getAllProviders();
  return getAllProviders().filter(p => p.vertical === vertical);
}

export const VERTICALS = [
  { key: 'all', label: 'All Integrations', icon: '🔗' },
  { key: 'accounting', label: 'Accounting Firms', icon: '🏦' },
  { key: 'erp_crm', label: 'ERP + CRM', icon: '🔶' },
];
