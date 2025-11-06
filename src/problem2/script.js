/* Globals */
(function() {
  var PRICES_URL = 'https://interview.switcheo.com/prices.json';
  var ICON_BASE = 'https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/';

  var state = {
    tokens: [], // {symbol, price, icon}
    from: null,
    to: null,
    fromAmount: '',
    toAmount: '',
    slippage: 0.5,
    submitting: false
  };

  var el = {
    form: document.getElementById('swap-form'),
    fromBtn: document.getElementById('from-token-btn'),
    toBtn: document.getElementById('to-token-btn'),
    fromIcon: document.getElementById('from-token-icon'),
    toIcon: document.getElementById('to-token-icon'),
    fromSym: document.getElementById('from-token-symbol'),
    toSym: document.getElementById('to-token-symbol'),
    fromAmt: document.getElementById('from-amount'),
    toAmt: document.getElementById('to-amount'),
    switchBtn: document.getElementById('switch-btn'),
    rate: document.getElementById('rate'),
    fee: document.getElementById('fee'),
    slippage: document.getElementById('slippage'),
    errors: document.getElementById('errors'),
    submit: document.getElementById('submit'),
    setMax: document.getElementById('set-max'),
    fromBalance: document.getElementById('from-balance')
  };

  function fetchPrices() {
    return fetch(PRICES_URL).then(function(r) { return r.json(); });
  }

  function buildTokens(priceRows) {
    var seen = new Set();
    var tokens = [];
    priceRows.forEach(function(row) {
      if (!row || !row.symbol || typeof row.price !== 'number') return;
      var sym = String(row.symbol).trim().toUpperCase();
      if (seen.has(sym)) return;
      seen.add(sym);
      tokens.push({
        symbol: sym,
        price: row.price,
        icon: ICON_BASE + encodeURIComponent(sym) + '.svg'
      });
    });
    // sort by symbol
    tokens.sort(function(a, b){ return a.symbol.localeCompare(b.symbol); });
    return tokens;
  }

  function formatNumber(x, maxDp) {
    if (!isFinite(x)) return '—';
    var dp = typeof maxDp === 'number' ? maxDp : 6;
    if (x === 0) return '0';
    if (x >= 1000) return x.toLocaleString(undefined, { maximumFractionDigits: 2 });
    if (x < 0.000001) return x.toExponential(2);
    return x.toLocaleString(undefined, { maximumFractionDigits: dp });
  }

  function setToken(side, token) {
    state[side] = token;
    if (side === 'from') {
      el.fromIcon.src = token ? token.icon : '';
      el.fromSym.textContent = token ? token.symbol : '—';
    } else {
      el.toIcon.src = token ? token.icon : '';
      el.toSym.textContent = token ? token.symbol : '—';
    }
    computeQuote();
  }

  function debounce(fn, wait) {
    var t; return function() { var args = arguments; clearTimeout(t); t = setTimeout(function(){ fn.apply(null, args); }, wait); };
  }

  function sanitizeAmount(value) {
    if (typeof value !== 'string') value = String(value || '');
    value = value.replace(/,/g, '');
    var num = parseFloat(value);
    if (!isFinite(num) || num < 0) return '';
    return String(value);
  }

  function computeRate() {
    if (!state.from || !state.to) return NaN;
    return state.from.price / state.to.price;
  }

  function computeFee(amountOut) {
    // mock 0.2% protocol fee + flat 0.0005
    var pct = 0.002;
    var flat = 0.0005;
    return amountOut * pct + flat;
  }

  function showError(msg) {
    el.errors.textContent = msg || '';
  }

  function updateInfo(amountOut) {
    var r = computeRate();
    if (isFinite(r)) {
      el.rate.textContent = '1 ' + state.from.symbol + ' = ' + formatNumber(r, 6) + ' ' + state.to.symbol;
    } else {
      el.rate.textContent = '—';
    }
    var fee = isFinite(amountOut) ? computeFee(amountOut) : NaN;
    if (isFinite(fee)) {
      el.fee.textContent = formatNumber(fee, 6) + ' ' + (state.to ? state.to.symbol : '');
    } else {
      el.fee.textContent = '—';
    }
  }

  function computeQuote(opts) {
    opts = opts || {};
    var fromVal = sanitizeAmount(el.fromAmt.value);
    var toVal = sanitizeAmount(el.toAmt.value);
    var rate = computeRate();
    var editingFrom = opts.editingFrom !== false; // default true

    if (!state.from || !state.to) {
      updateInfo(NaN);
      disableSubmit('Select both tokens');
      return;
    }
    if (state.from.symbol === state.to.symbol) {
      updateInfo(NaN);
      disableSubmit('Select two different tokens');
      return;
    }

    var errors = '';
    if (editingFrom) {
      state.fromAmount = fromVal;
      var n = parseFloat(fromVal);
      if (!fromVal || !isFinite(n) || n <= 0) {
        el.toAmt.value = '';
        updateInfo(NaN);
        disableSubmit('Enter an amount');
        showError('');
        return;
      }
      var out = n * rate;
      var slippage = Math.max(0, Math.min(5, parseFloat(el.slippage.value) || 0.5));
      var minReceived = out * (1 - slippage / 100);
      el.toAmt.value = formatNumber(out, 6);
      updateInfo(out);
      enableSubmit();
      showError(errors);
      el.toAmt.dataset.calculated = '1';
      el.toAmt.title = 'Minimum received (with ' + slippage + '% slippage): ' + formatNumber(minReceived, 6) + ' ' + state.to.symbol;
    } else {
      state.toAmount = toVal;
      var m = parseFloat(toVal);
      if (!toVal || !isFinite(m) || m <= 0) {
        el.fromAmt.value = '';
        updateInfo(NaN);
        disableSubmit('Enter an amount');
        showError('');
        return;
      }
      var inAmt = m / rate;
      el.fromAmt.value = formatNumber(inAmt, 6);
      updateInfo(m);
      enableSubmit();
      showError(errors);
    }
  }

  function enableSubmit() {
    el.submit.disabled = false;
  }
  function disableSubmit(why) {
    el.submit.disabled = true;
    if (why) showError(why);
  }

  function openTokenModal(side) {
    var backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    backdrop.style.display = 'flex';

    var modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = '' +
      '<div class="modal-header">' +
      '  <div class="modal-title">Select a token</div>' +
      '  <button class="modal-close" aria-label="Close">×</button>' +
      '</div>' +
      '<div class="modal-search"><input type="text" placeholder="Search by symbol..." /></div>' +
      '<div class="token-list"></div>';

    backdrop.appendChild(modal);
    document.body.appendChild(backdrop);

    function close() {
      document.body.removeChild(backdrop);
    }

    modal.querySelector('.modal-close').addEventListener('click', close);
    backdrop.addEventListener('click', function(e){ if (e.target === backdrop) close(); });

    var list = modal.querySelector('.token-list');
    function render(filter) {
      list.innerHTML = '';
      var q = (filter || '').trim().toUpperCase();
      state.tokens
        .filter(function(t){ return !q || t.symbol.includes(q); })
        .forEach(function(t) {
          var item = document.createElement('div');
          item.className = 'token-item';
          item.innerHTML = '' +
            '<div class="token-meta">' +
            '  <img src="' + t.icon + '" alt="" />' +
            '  <div>' +
            '    <div class="token-symbol">' + t.symbol + '</div>' +
            '    <div class="token-price">$' + formatNumber(t.price, 6) + '</div>' +
            '  </div>' +
            '</div>' +
            '<div class="token-price">Select</div>';
          item.addEventListener('click', function(){ setToken(side, t); close(); });
          list.appendChild(item);
        });
    }
    render('');
    modal.querySelector('input').addEventListener('input', debounce(function(e){ render(e.target.value); }, 100));
  }

  function swapSides() {
    var tmp = state.from; state.from = state.to; state.to = tmp;
    setToken('from', state.from);
    setToken('to', state.to);
    var v = el.fromAmt.value; el.fromAmt.value = el.toAmt.value; el.toAmt.value = v;
    computeQuote({ editingFrom: true });
  }

  function setInitialSelection() {
    if (state.tokens.length >= 2) {
      setToken('from', state.tokens[0]);
      setToken('to', state.tokens[1]);
    }
  }

  function simulateBalances() {
    // mock balances based on symbol hash
    if (!state.from) { el.fromBalance.textContent = 'Balance: —'; return; }
    var sym = state.from.symbol;
    var hash = 0; for (var i = 0; i < sym.length; i++) { hash = ((hash << 5) - hash) + sym.charCodeAt(i); hash |= 0; }
    var bal = Math.abs(hash % 1000) / 10;
    el.fromBalance.textContent = 'Balance: ' + formatNumber(bal, 4) + ' ' + sym;
  }

  function onSubmit(e) {
    e.preventDefault();
    if (state.submitting) return;
    if (!state.from || !state.to) return;
    var amt = parseFloat(el.fromAmt.value.replace(/,/g, ''));
    if (!isFinite(amt) || amt <= 0) { showError('Enter an amount'); return; }

    state.submitting = true;
    el.submit.classList.add('loading');
    el.submit.disabled = true;
    showError('');

    setTimeout(function() {
      state.submitting = false;
      el.submit.classList.remove('loading');
      el.submit.disabled = false;
      alert('Swap submitted!\n\n' +
        'From: ' + amt + ' ' + state.from.symbol + '\n' +
        'To:   ' + el.toAmt.value + ' ' + state.to.symbol + '\n' +
        'Slippage: ' + (parseFloat(el.slippage.value) || 0.5) + '%');
    }, 1200);
  }

  /* Event bindings */
  el.fromBtn.addEventListener('click', function(){ openTokenModal('from'); });
  el.toBtn.addEventListener('click', function(){ openTokenModal('to'); });
  el.switchBtn.addEventListener('click', swapSides);
  el.fromAmt.addEventListener('input', debounce(function(){ computeQuote({ editingFrom: true }); }, 120));
  el.toAmt.addEventListener('input', debounce(function(){ computeQuote({ editingFrom: false }); }, 120));
  el.slippage.addEventListener('input', function(){ computeQuote({ editingFrom: true }); });
  el.form.addEventListener('submit', onSubmit);
  el.setMax.addEventListener('click', function(){
    // quick set max to balance value parsed from UI
    var text = el.fromBalance.textContent || '';
    var match = text.match(/Balance:\s([\d.,]+)/);
    if (match) { el.fromAmt.value = match[1]; computeQuote({ editingFrom: true }); }
  });

  // Init
  fetchPrices().then(function(rows) {
    state.tokens = buildTokens(rows || []);
    setInitialSelection();
    simulateBalances();
    computeQuote({ editingFrom: true });
  }).catch(function(err){
    console.error(err);
    showError('Failed to load prices');
    disableSubmit('Failed to load prices');
  });

  // Update balances on token change
  var observer = new MutationObserver(function(){ simulateBalances(); });
  observer.observe(el.fromSym, { childList: true });
})();


