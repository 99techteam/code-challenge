const PRICES_URL = "https://interview.switcheo.com/prices.json";
const ICON_BASE  = "https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens";
const icon = (s) => `${ICON_BASE}/${s}.svg`;
const $    = (id) => document.getElementById(id);

let prices = {}, tokens = [], fromToken = null, toToken = null;

const els = {
  fromBtn:      $("from-btn"),
  fromChevron:  $("from-chevron"),
  fromIcon:     $("from-icon"),
  fromSymbol:   $("from-symbol"),
  fromDropdown: $("from-dropdown"),
  fromList:     $("from-list"),
  fromSearch:   $("from-search"),
  toBtn:        $("to-btn"),
  toChevron:    $("to-chevron"),
  toIcon:       $("to-icon"),
  toSymbol:     $("to-symbol"),
  toDropdown:   $("to-dropdown"),
  toList:       $("to-list"),
  toSearch:     $("to-search"),
  inputAmount:  $("input-amount"),
  outputAmount: $("output-amount"),
  rateBar:      $("rate-bar"),
  amountError:  $("amount-error"),
  globalError:  $("global-error"),
  confirmBtn:   $("confirm-btn"),
  btnText:      $("btn-text"),
  spinner:      $("spinner"),
  swapDirBtn:   $("swap-direction"),
  toast:        $("toast"),
  toastMsg:     $("toast-msg"),
  themeToggle:  $("theme-toggle"),
  iconSun:      $("icon-sun"),
  iconMoon:     $("icon-moon"),
};

// ── Init ──────────────────────────────────────────────────────────────────────
async function init() {
  try {
    const data = await fetch(PRICES_URL).then(r => r.json());
    data.forEach(({ currency, price }) => { prices[currency] = parseFloat(price); });
    tokens = Object.keys(prices).sort();

    renderList(els.fromList, selectFrom);
    renderList(els.toList, selectTo);

    const preferred = ["ETH", "BTC", "USDC", "SWTH"];
    const first  = preferred.find(t => tokens.includes(t)) || tokens[0];
    const second = preferred.filter(t => t !== first).find(t => tokens.includes(t)) || tokens[1];
    selectFrom(first);
    selectTo(second);
  } catch {
    showErr(els.globalError, "⚠ Failed to load prices. Please refresh.");
  }
}

// ── Render token list ─────────────────────────────────────────────────────────
function renderList(ul, onSelect, list = tokens) {
  ul.innerHTML = list.map(t => `
    <li class="flex items-center gap-2.5 px-3.5 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-sm font-medium transition-colors" data-symbol="${t}">
      <img class="w-7 h-7 rounded-full object-contain flex-shrink-0"
           src="${icon(t)}" alt="${t}" onerror="this.style.visibility='hidden'" />
      <span>${t}</span>
      <span class="ml-auto text-[11px] text-gray-400 dark:text-gray-500">
        $${prices[t].toFixed(prices[t] < 0.01 ? 6 : 4)}
      </span>
    </li>`).join("");

  ul.querySelectorAll("li").forEach(li =>
    li.addEventListener("click", () => onSelect(li.dataset.symbol))
  );
}

function markActive(ul, symbol) {
  ul.querySelectorAll("li").forEach(li =>
    li.classList.toggle("active-token", li.dataset.symbol === symbol)
  );
}

// ── Token selection ───────────────────────────────────────────────────────────
function selectToken(side, symbol) {
  if (side === "from") fromToken = symbol;
  else toToken = symbol;

  els[`${side}Symbol`].textContent = symbol;
  els[`${side}Icon`].src = icon(symbol);
  els[`${side}Icon`].style.visibility = "";
  closeDropdown(els[`${side}Dropdown`], els[`${side}Chevron`]);
  markActive(els[`${side}List`], symbol);
  compute();
  updateRate();
}

const selectFrom = (s) => selectToken("from", s);
const selectTo   = (s) => selectToken("to", s);

// ── Compute & rate ────────────────────────────────────────────────────────────
function compute() {
  const val = parseFloat(els.inputAmount.value);
  const canCompute = fromToken && toToken && !isNaN(val) && val > 0;
  els.outputAmount.value = canCompute
    ? fmt((val * prices[fromToken]) / prices[toToken])
    : "";
}

function updateRate() {
  if (!fromToken || !toToken) {
    els.rateBar.style.display = "none";
    return;
  }
  const rate = prices[fromToken] / prices[toToken];
  els.rateBar.innerHTML = `
    <span class="w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0"></span>
    1&nbsp;<strong>${fromToken}</strong>&nbsp;≈&nbsp;
    <strong>${fmt(rate)}&nbsp;${toToken}</strong>
    <span class="ml-auto text-[11px] text-gray-400 dark:text-gray-500">live prices</span>`;
  els.rateBar.style.display = "flex";
}

function fmt(n) {
  if (!n)           return "0";
  if (n < 0.000001) return n.toExponential(4);
  if (n < 0.01)     return n.toFixed(8);
  if (n < 1000)     return n.toFixed(6);
  return n.toLocaleString("en-US", { maximumFractionDigits: 4 });
}

// ── Dropdown ──────────────────────────────────────────────────────────────────
function openDropdown(d, c) {
  d.classList.remove("hidden");
  c.classList.add("rotate-180");
}
function closeDropdown(d, c) {
  d.classList.add("hidden");
  c.classList.remove("rotate-180");
}
function closeAll() {
  closeDropdown(els.fromDropdown, els.fromChevron);
  closeDropdown(els.toDropdown, els.toChevron);
}

els.fromBtn.addEventListener("click", e => {
  e.stopPropagation();
  const wasHidden = els.fromDropdown.classList.contains("hidden");
  closeAll();
  if (wasHidden) { 
    openDropdown(els.fromDropdown, els.fromChevron); 
    els.fromSearch.focus(); 
}
});

els.toBtn.addEventListener("click", e => {
  e.stopPropagation();
  const wasHidden = els.toDropdown.classList.contains("hidden");
  closeAll();
  if (wasHidden) { 
    openDropdown(els.toDropdown, els.toChevron); 
    els.toSearch.focus(); 
}
});

document.addEventListener("click", closeAll);
els.fromDropdown.addEventListener("click", e => e.stopPropagation());
els.toDropdown.addEventListener("click",   e => e.stopPropagation());

els.fromSearch.addEventListener("input", e => {
  const q = e.target.value.toLowerCase();
  renderList(els.fromList, selectFrom, tokens.filter(t => t.toLowerCase().includes(q)));
  markActive(els.fromList, fromToken);
});
els.toSearch.addEventListener("input", e => {
  const q = e.target.value.toLowerCase();
  renderList(els.toList, selectTo, tokens.filter(t => t.toLowerCase().includes(q)));
  markActive(els.toList, toToken);
});

// ── Errors ────────────────────────────────────────────────────────────────────
const showErr  = (el, msg) => { 
    el.textContent = msg; el.classList.remove("hidden"); 
};
const clearErr = (el)      => { 
    el.textContent = "";  el.classList.add("hidden"); 
};

els.inputAmount.addEventListener("input", () => {
  clearErr(els.amountError);
  compute();
});

// ── Swap direction ────────────────────────────────────────────────────────────
els.swapDirBtn.addEventListener("click", () => {
  if (!fromToken || !toToken) return;
  const [a, b, out] = [fromToken, toToken, els.outputAmount.value];
  selectFrom(b);
  selectTo(a);
  if (out) { els.inputAmount.value = parseFloat(out.replace(/,/g, "")); compute(); }
});

// ── Submit ────────────────────────────────────────────────────────────────────
els.confirmBtn.addEventListener("click", () => {
  clearErr(els.amountError);
  clearErr(els.globalError);

  const val = parseFloat(els.inputAmount.value);
  if (!fromToken || !toToken)
    return showErr(els.globalError, "Please select both tokens.");
  if (fromToken === toToken)
    return showErr(els.globalError, "Cannot swap a token for itself.");
  if (!els.inputAmount.value || isNaN(val) || val <= 0) {
    showErr(els.amountError, "Enter a valid amount greater than 0.");
    return els.inputAmount.focus();
  }

  els.confirmBtn.disabled = true;
  els.spinner.classList.remove("hidden");
  els.btnText.textContent = "Processing…";

  setTimeout(() => {
    const msg = `Swapped ${fmt(val)} ${fromToken} → ${els.outputAmount.value} ${toToken}`;
    els.confirmBtn.disabled = false;
    els.spinner.classList.add("hidden");
    els.btnText.textContent = "CONFIRM SWAP";
    els.inputAmount.value = els.outputAmount.value = "";
    showToast(msg);
  }, 1800);
});

// ── Theme ────────────────────────────────────────────────────────────────────
els.themeToggle.addEventListener("click", () => {
  const isDark = document.documentElement.classList.toggle("dark");
  els.iconSun.classList.toggle("hidden", !isDark);
  els.iconMoon.classList.toggle("hidden", isDark);
});

// ── Toast ─────────────────────────────────────────────────────────────────────
function showToast(msg) {
  els.toastMsg.textContent = msg;
  els.toast.classList.replace("opacity-0", "opacity-100");
  els.toast.classList.replace("translate-y-20", "translate-y-0");
  setTimeout(() => {
    els.toast.classList.replace("opacity-100", "opacity-0");
    els.toast.classList.replace("translate-y-0", "translate-y-20");
  }, 3500);
}

init();
