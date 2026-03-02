/**
 * Pure utility functions: formatting, escaping, ordinals.
 */

export function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

export function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

export function ordinal(n) {
  const s = String(n);
  const last = s.slice(-1);
  const last2 = s.slice(-2);
  if (last2 === '11' || last2 === '12' || last2 === '13') return s + 'th';
  if (last === '1') return s + 'st';
  if (last === '2') return s + 'nd';
  if (last === '3') return s + 'rd';
  return s + 'th';
}

export function formatDatePickerLabel(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  const month = d.toLocaleDateString('en-US', { month: 'long' });
  const day = d.getDate();
  const year = d.getFullYear();
  const weekday = d.toLocaleDateString('en-US', { weekday: 'long' });
  return `${month} ${ordinal(day)}, ${year} (${weekday})`;
}

export function formatSetSummary(weightStr, reps, rpeVal) {
  const parts = [];
  if (weightStr && weightStr !== '—') parts.push(weightStr + ' kg');
  parts.push(reps + ' reps');
  if (rpeVal >= 1 && rpeVal <= 10) parts.push('RPE ' + rpeVal);
  return parts.join(' and ');
}
