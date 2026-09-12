// Formatters & Text Helpers

export function formatCurrency(amount) {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(num);
}

/**
 * Generates official booking ID in the format: OLDD-YYYY-XXXXXX
 * Example: OLDD-2026-000123
 */
export function generateBookingId() {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `OLDD-${year}-${randomNum}`;
}

export function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function truncate(str, max = 50) {
  if (!str) return '';
  if (str.length <= max) return str;
  return str.substring(0, max) + '...';
}
