import * as Localization from 'expo-localization';

const translations: Record<string, Record<string, string>> = {
  en: {
    home: 'Home', invoices: 'Invoices', clients: 'Clients', more: 'More',
    createInvoice: 'Create Invoice', revenue: 'Revenue', outstanding: 'Outstanding',
    overdue: 'Overdue', expenses: 'Expenses', save: 'Save', send: 'Send',
    signIn: 'Sign In', signUp: 'Sign Up', settings: 'Settings',
    recurring: 'Recurring Invoices', plan: 'Plan & Usage', integrations: 'Integrations',
    editInvoice: 'Edit Invoice', payWithPayPal: 'Pay with PayPal', scanToPay: 'Scan to Pay',
    depositPaid: 'Deposit Paid', freePlan: 'Free Plan', webhookUrl: 'Webhook URL',
  },
  es: {
    home: 'Inicio', invoices: 'Facturas', clients: 'Clientes', more: 'Más',
    createInvoice: 'Crear Factura', revenue: 'Ingresos', outstanding: 'Pendiente',
    overdue: 'Vencido', expenses: 'Gastos', save: 'Guardar', send: 'Enviar',
    signIn: 'Iniciar Sesión', signUp: 'Registrarse', settings: 'Ajustes',
    recurring: 'Facturas Recurrentes', plan: 'Plan y Uso', integrations: 'Integraciones',
    editInvoice: 'Editar Factura', payWithPayPal: 'Pagar con PayPal', scanToPay: 'Escanear para Pagar',
    depositPaid: 'Depósito Pagado', freePlan: 'Plan Gratis', webhookUrl: 'URL Webhook',
  },
  fr: {
    home: 'Accueil', invoices: 'Factures', clients: 'Clients', more: 'Plus',
    createInvoice: 'Créer Facture', revenue: 'Revenus', outstanding: 'En attente',
    overdue: 'En retard', expenses: 'Dépenses', save: 'Enregistrer', send: 'Envoyer',
    signIn: 'Connexion', signUp: "S'inscrire", settings: 'Paramètres',
  },
  de: {
    home: 'Start', invoices: 'Rechnungen', clients: 'Kunden', more: 'Mehr',
    createInvoice: 'Rechnung erstellen', revenue: 'Umsatz', outstanding: 'Offen',
    overdue: 'Überfällig', expenses: 'Ausgaben', save: 'Speichern', send: 'Senden',
    signIn: 'Anmelden', signUp: 'Registrieren', settings: 'Einstellungen',
  },
  pt: {
    home: 'Início', invoices: 'Faturas', clients: 'Clientes', more: 'Mais',
    createInvoice: 'Criar Fatura', revenue: 'Receita', outstanding: 'Pendente',
    overdue: 'Vencido', expenses: 'Despesas', save: 'Salvar', send: 'Enviar',
    signIn: 'Entrar', signUp: 'Cadastrar', settings: 'Configurações',
  },
};

let currentLang = Localization.getLocales()[0]?.languageCode || 'en';

export function setLanguage(lang: string) {
  currentLang = translations[lang] ? lang : 'en';
}

export function t(key: string): string {
  return translations[currentLang]?.[key] || translations.en[key] || key;
}

export const supportedLanguages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'pt', name: 'Português' },
];
