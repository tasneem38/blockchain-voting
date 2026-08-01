/**
 * Truncate a hash string for display
 */
export function truncateHash(hash, start = 8, end = 6) {
  if (!hash) return '';
  if (hash.length <= start + end + 3) return hash;
  return `${hash.slice(0, start)}...${hash.slice(-end)}`;
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/**
 * Format a date/timestamp for display
 */
export function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

/**
 * Format seconds to MM:SS
 */
export function formatCountdown(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

/**
 * Capitalize first letter
 */
export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Get status color class
 */
export function statusColor(status) {
  switch (status?.toUpperCase()) {
    case 'OPEN':    return 'text-green-400 bg-green-400/10';
    case 'CLOSED':  return 'text-red-400 bg-red-400/10';
    case 'PENDING': return 'text-yellow-400 bg-yellow-400/10';
    default:        return 'text-slate-400 bg-slate-400/10';
  }
}
