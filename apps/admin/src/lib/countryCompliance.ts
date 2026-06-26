export type CountryCompliance = {
  code: string;
  name: string;
  taxLabel: string;
  clientTaxIdLabel: string;
  businessTaxIdLabel: string;
  defaultLegalFooter?: string;
};

const EU_REVERSE_CHARGE =
  'Reverse charge: VAT to be accounted for by the recipient as per Article 196 of Council Directive 2006/112/EC.';

export const COUNTRY_COMPLIANCE: CountryCompliance[] = [
  { code: 'US', name: 'United States', taxLabel: 'Sales tax', clientTaxIdLabel: 'Tax ID', businessTaxIdLabel: 'Tax ID / EIN' },
  { code: 'GB', name: 'United Kingdom', taxLabel: 'VAT', clientTaxIdLabel: 'VAT number', businessTaxIdLabel: 'VAT number' },
  { code: 'CA', name: 'Canada', taxLabel: 'Tax', clientTaxIdLabel: 'Business number', businessTaxIdLabel: 'BN / GST number' },
  { code: 'AU', name: 'Australia', taxLabel: 'GST', clientTaxIdLabel: 'ABN', businessTaxIdLabel: 'ABN', defaultLegalFooter: 'GST may apply. Prices in AUD unless stated otherwise.' },
  { code: 'DE', name: 'Germany', taxLabel: 'VAT (MwSt.)', clientTaxIdLabel: 'USt-IdNr.', businessTaxIdLabel: 'USt-IdNr.', defaultLegalFooter: EU_REVERSE_CHARGE },
  { code: 'FR', name: 'France', taxLabel: 'TVA', clientTaxIdLabel: 'N° TVA', businessTaxIdLabel: 'N° TVA', defaultLegalFooter: EU_REVERSE_CHARGE },
  { code: 'ES', name: 'Spain', taxLabel: 'IVA', clientTaxIdLabel: 'NIF / CIF', businessTaxIdLabel: 'NIF / CIF', defaultLegalFooter: EU_REVERSE_CHARGE },
  { code: 'IT', name: 'Italy', taxLabel: 'IVA', clientTaxIdLabel: 'P. IVA', businessTaxIdLabel: 'P. IVA', defaultLegalFooter: EU_REVERSE_CHARGE },
  { code: 'NL', name: 'Netherlands', taxLabel: 'BTW', clientTaxIdLabel: 'BTW-nummer', businessTaxIdLabel: 'BTW-nummer', defaultLegalFooter: EU_REVERSE_CHARGE },
  { code: 'IE', name: 'Ireland', taxLabel: 'VAT', clientTaxIdLabel: 'VAT number', businessTaxIdLabel: 'VAT number', defaultLegalFooter: EU_REVERSE_CHARGE },
  { code: 'IN', name: 'India', taxLabel: 'GST', clientTaxIdLabel: 'GSTIN', businessTaxIdLabel: 'GSTIN', defaultLegalFooter: 'Tax invoice under GST. Supply details as per applicable GST rules.' },
  { code: 'PT', name: 'Portugal', taxLabel: 'IVA', clientTaxIdLabel: 'NIF', businessTaxIdLabel: 'NIF', defaultLegalFooter: EU_REVERSE_CHARGE },
];

const MAP = Object.fromEntries(COUNTRY_COMPLIANCE.map((c) => [c.code, c]));

export function getCountryCompliance(code?: string | null): CountryCompliance {
  return MAP[code || 'US'] || MAP.US;
}
