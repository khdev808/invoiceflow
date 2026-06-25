export const templates = [
  { id: 'modern', name: 'Modern', color: '#4F46E5', accentColor: '#6366F1', layout: 'modern', premium: false },
  { id: 'minimal', name: 'Minimal', color: '#64748B', accentColor: '#94A3B8', layout: 'minimal', premium: false },
  { id: 'classic', name: 'Classic', color: '#1E293B', accentColor: '#475569', layout: 'classic', premium: true },
  { id: 'bold', name: 'Bold', color: '#7C3AED', accentColor: '#A78BFA', layout: 'bold', premium: true },
  { id: 'professional', name: 'Professional', color: '#0F766E', accentColor: '#14B8A6', layout: 'professional', premium: true },
  { id: 'creative', name: 'Creative', color: '#DB2777', accentColor: '#F472B6', layout: 'creative', premium: true },
] as const;

export const paymentMethods = [
  { value: 'manual', label: 'Manual / Other' },
  { value: 'CASH', label: 'Cash' },
  { value: 'CHECK', label: 'Check' },
  { value: 'BANK_TRANSFER', label: 'Bank transfer' },
  { value: 'STRIPE', label: 'Stripe' },
  { value: 'PAYPAL', label: 'PayPal' },
];

export const expenseCategories = [
  'General', 'Materials', 'Travel', 'Equipment', 'Office', 'Marketing', 'Insurance', 'Subcontractor', 'Meals', 'Utilities',
];

export const recurringFrequencies = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
];

export const currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'INR'];

export function showBranding(plan?: string | null) {
  return !plan || plan === 'free';
}
