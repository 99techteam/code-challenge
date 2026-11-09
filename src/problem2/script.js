import { formatAmount, loadPrices, quote } from './quote.js';

const $ = id => document.getElementById(id);
const form = $('swap-form');
const fields = $('swap-fields');
const amount = $('input-amount');
const output = $('output-amount');
const fromSelect = $('from-token');
const toSelect = $('to-token');
const confirm = $('confirm');
const error = $('amount-error');
let tokens = [];
let busy = false;
let submitted = false;

function selected(select) {
  return tokens.find(token => token.currency === select.value);
}

function updateIcon(id, currency) {
  const image = $(id);
  image.hidden = false;
  image.onerror = () => { image.hidden = true; };
  image.src = `https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/${encodeURIComponent(currency)}.svg`;
}

function update() {
  const from = selected(fromSelect);
  const to = selected(toSelect);
  $('swap-status').textContent = '';
  error.textContent = '';
  amount.removeAttribute('aria-invalid');
  confirm.disabled = true;
  confirm.textContent = 'Enter an amount ↗';
  output.value = '0.00';
  $('exchange-rate').textContent = from && to
    ? `1 ${from.currency} ≈ ${formatAmount(from.price / to.price)} ${to.currency}` : '—';
  try {
    const received = quote(amount.value, from, to);
    output.value = formatAmount(received);
    confirm.disabled = busy;
    confirm.textContent = 'Preview swap ↗';
  } catch (issue) {
    if (amount.value || submitted) {
      error.textContent = issue.message;
      amount.setAttribute('aria-invalid', 'true');
    }
  }
}

async function initialize() {
  fields.disabled = true;
  $('retry').hidden = true;
  $('price-status').textContent = 'Loading reference prices…';
  try {
    tokens = await loadPrices();
    for (const select of [fromSelect, toSelect]) {
      select.replaceChildren(...tokens.map(token => new Option(token.currency, token.currency)));
    }
    fromSelect.value = tokens.some(t => t.currency === 'ETH') ? 'ETH' : tokens[0].currency;
    toSelect.value = tokens.some(t => t.currency === 'USDC') ? 'USDC' : tokens.find(t => t.currency !== fromSelect.value).currency;
    for (const [select, icon] of [[fromSelect, 'from-icon'], [toSelect, 'to-icon']]) updateIcon(icon, select.value);
    const newest = Math.max(...tokens.map(t => Date.parse(t.date)));
    $('price-status').textContent = `Reference dataset · ${new Date(newest).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })} · not live prices`;
    fields.disabled = false;
    update();
  } catch {
    $('price-status').textContent = 'Prices are unavailable. Check your connection and try again.';
    $('retry').hidden = false;
  }
}

amount.addEventListener('input', update);
amount.addEventListener('blur', () => { if (amount.value) update(); });
for (const [select, other, icon, otherIcon] of [[fromSelect, toSelect, 'from-icon', 'to-icon'], [toSelect, fromSelect, 'to-icon', 'from-icon']]) {
  let previous;
  select.addEventListener('focus', () => { previous = select.value; });
  select.addEventListener('change', () => {
    if (select.value === other.value) other.value = previous || tokens.find(t => t.currency !== select.value).currency;
    previous = select.value;
    updateIcon(icon, select.value);
    updateIcon(otherIcon, other.value);
    update();
  });
}
$('reverse').addEventListener('click', () => {
  [fromSelect.value, toSelect.value] = [toSelect.value, fromSelect.value];
  updateIcon('from-icon', fromSelect.value);
  updateIcon('to-icon', toSelect.value);
  update();
});
$('retry').addEventListener('click', initialize);
form.addEventListener('submit', async event => {
  event.preventDefault();
  if (busy || fields.disabled) return;
  submitted = true;
  update();
  if (confirm.disabled) return;
  const from = selected(fromSelect);
  const to = selected(toSelect);
  const sent = amount.value;
  const received = quote(sent, from, to);
  busy = true;
  fields.disabled = true;
  confirm.disabled = true;
  form.setAttribute('aria-busy', 'true');
  confirm.textContent = 'Preparing preview…';
  try {
    await new Promise(resolve => setTimeout(resolve, 700));
    $('swap-status').textContent = `Preview ready: ${formatAmount(Number(sent))} ${from.currency} → ${formatAmount(received)} ${to.currency}. No funds were moved.`;
  } finally {
    busy = false;
    fields.disabled = false;
    confirm.disabled = false;
    form.removeAttribute('aria-busy');
    confirm.textContent = 'Preview swap ↗';
  }
});

initialize();
