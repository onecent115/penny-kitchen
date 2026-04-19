// Parse "1 1/2", "2.5", "1/4", etc. into a number (or null if non-numeric)
function parseQty(q) {
  if (q == null) return null;
  const s = String(q).trim();
  if (!s) return null;
  // mixed: "1 1/2"
  const mixed = s.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (mixed) return +mixed[1] + (+mixed[2]) / (+mixed[3]);
  // fraction: "1/2"
  const frac = s.match(/^(\d+)\/(\d+)$/);
  if (frac) return (+frac[1]) / (+frac[2]);
  // decimal/int
  const num = parseFloat(s);
  if (!isNaN(num) && /^[\d.]+$/.test(s)) return num;
  return null;
}

// Format a scaled number back to a friendly display.
function formatQty(n) {
  if (n == null || isNaN(n)) return '';
  // round to nearest 1/8 for cleaner fractions
  const rounded = Math.round(n * 8) / 8;
  const whole = Math.floor(rounded);
  const frac = rounded - whole;
  const fracMap = {
    0: '', 0.125: '⅛', 0.25: '¼', 0.375: '⅜',
    0.5: '½', 0.625: '⅝', 0.75: '¾', 0.875: '⅞',
  };
  const fracStr = fracMap[frac];
  if (fracStr !== undefined) {
    if (whole === 0) return fracStr || '0';
    return fracStr ? `${whole} ${fracStr}` : `${whole}`;
  }
  // fallback: 2 decimals trimmed
  return (+n.toFixed(2)).toString();
}

function scaleQty(qtyStr, factor) {
  const n = parseQty(qtyStr);
  if (n == null) return qtyStr; // leave non-numeric alone
  return formatQty(n * factor);
}

// Days-until helper for pantry expiry
function daysUntil(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr + 'T00:00:00');
  if (isNaN(d)) return null;
  const today = new Date();
  today.setHours(0,0,0,0);
  return Math.floor((d - today) / (1000 * 60 * 60 * 24));
}

function freshnessClass(days) {
  if (days == null) return 'fresh-none';
  if (days < 0) return 'fresh-expired';
  if (days <= 3) return 'fresh-soon';
  if (days <= 14) return 'fresh-ok';
  return 'fresh-good';
}

function fmtDate(s) {
  if (!s) return '—';
  const d = new Date(s + 'T00:00:00');
  if (isNaN(d)) return s;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

window.parseQty = parseQty;
window.formatQty = formatQty;
window.scaleQty = scaleQty;
window.daysUntil = daysUntil;
window.freshnessClass = freshnessClass;
window.fmtDate = fmtDate;
