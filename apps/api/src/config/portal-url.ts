/** Resolve client portal base URL for emails, payment links, and share flows. */
export function getPortalBase(): string {
  const explicit = process.env.PORTAL_URL?.trim();
  if (explicit) {
    const normalized = explicit.replace(/\/$/, '');
    return normalized.endsWith('/portal') ? normalized : `${normalized}/portal`;
  }

  const adminUrl = process.env.ADMIN_APP_URL?.trim();
  if (adminUrl) {
    return `${adminUrl.replace(/\/$/, '')}/portal`;
  }

  return 'http://localhost:3000/portal';
}
