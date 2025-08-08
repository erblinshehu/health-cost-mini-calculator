// Basic static calculator: loads data/prices.json and estimates a range.
// Super lightweight + no libraries.

const SVC_SELECT = document.getElementById('service');
const ZIP_INPUT = document.getElementById('zip');
const INS_SELECT = document.getElementById('ins');
const FORM = document.getElementById('calcForm');
const RESULT = document.getElementById('result');
const TIPS = document.getElementById('tipsList');

const INSURANCE_MULT = {
  insured: 0.85,          // negotiated rate often lower than list
  "high-deductible": 1.0, // you pay near list until deductible met
  uninsured: 0.9          // cash-pay discounts are common (ask!)
};

// Simple region mapping by first digit of ZIP (0-9 → rough US regions)
const REGION_BY_ZIP_FIRST = {
  "0": "northeast",
  "1": "northeast",
  "2": "midatlantic",
  "3": "southeast",
  "4": "midwest",
  "5": "midwest",
  "6": "midwest",
  "7": "southwest",
  "8": "mountain",
  "9": "west"
};

let SERVICES_DATA = [];
let REGION_FACTORS = {};
let TIPS_LIBRARY = {};

(async function init() {
  try {
    const res = await fetch('data/prices.json', { cache: 'no-store' });
    const data = await res.json();
    SERVICES_DATA = data.services || [];
    REGION_FACTORS = data.regionFactors || {};
    TIPS_LIBRARY = data.tips || {};

    // populate services dropdown
    SVC_SELECT.innerHTML = SERVICES_DATA
      .map(s => `<option value="${s.code}">${s.name}</option>`)
      .join('');

    // preload tips list with general tips
    updateTips("general");
  } catch (e) {
    console.error(e);
    alert('Failed to load data. Check data/prices.json path.');
  }
})();

FORM.addEventListener('submit', (e) => {
  e.preventDefault();
  const code = SVC_SELECT.value;
  const zip = ZIP_INPUT.value.trim();
  const ins = INS_SELECT.value;

  if (!/^\d{5}$/.test(zip)) {
    showError('Please enter a valid 5-digit ZIP code.');
    return;
  }
  const svc = SERVICES_DATA.find(s => s.code === code);
  if (!svc) {
    showError('Unknown service selected.');
    return;
  }

  // Region detect
  const first = zip[0];
  const region = REGION_BY_ZIP_FIRST[first] || 'national';
  const regionFactor = REGION_FACTORS[region] ?? 1.0;

  // Base range (national) → apply region factor → then insurance multiplier
  const mult = INSURANCE_MULT[ins] ?? 1.0;
  const low = Math.round(svc.base.low * regionFactor * mult);
  const high = Math.round(svc.base.high * regionFactor * mult);

  renderResult({
    service: svc.name,
    zip,
    region,
    insurance: ins,
    low,
    high
  });

  updateTips(svc.tipKey || "general");
});

function showError(msg) {
  RESULT.classList.remove('hidden');
  RESULT.innerHTML = `<p class="error">${msg}</p>`;
}

function renderResult({ service, zip, region, insurance, low, high }) {
  const insLabel = {
    insured: 'Insured',
    "high-deductible": 'High-deductible plan',
    uninsured: 'Uninsured / cash'
  }[insurance] || insurance;

  const regionLabel = region.charAt(0).toUpperCase() + region.slice(1);

  RESULT.classList.remove('hidden');
  RESULT.innerHTML = `
    <h2>${service}</h2>
    <div class="range">$${format(low)} – $${format(high)}</div>
    <div class="note">
      <div><strong>ZIP:</strong> ${zip} &nbsp; • &nbsp; <strong>Region:</strong> ${regionLabel} &nbsp; • &nbsp; <strong>Coverage:</strong> ${insLabel}</div>
      <div style="margin-top:6px;">These are rough estimates based on public ranges, regional factors, and common insurance effects.</div>
    </div>
  `;
}

function format(n) {
  return n.toLocaleString('en-US');
}

function updateTips(key) {
  const arr = TIPS_LIBRARY[key] || TIPS_LIBRARY["general"] || [];
  TIPS.innerHTML = arr.map(t => `<li>${t}</li>`).join('');
}
