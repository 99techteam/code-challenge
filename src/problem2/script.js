(() => {
	const PRICE_URL = 'https://interview.switcheo.com/prices.json';
	const ICON_BASE = 'https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens';

	// Single source of truth for the swap UI so we can re-render deterministically.
	const state = {
		tokens: [],
		tokenMap: new Map(),
		fromSymbol: null,
		toSymbol: null,
		amountFrom: '',
		amountTo: '',
		modalType: null,
		loading: false,
		submitting: false,
		toastTimer: null,
		hasInteracted: false
	};

	const ui = {};

	document.addEventListener('DOMContentLoaded', () => {
		cacheDom();
		bindEvents();
		loadPrices();
	});

	function cacheDom() {
		ui.swapCard = document.getElementById('swapCard');
		ui.rateBanner = document.getElementById('rateBanner');
		ui.fromAmount = document.getElementById('fromAmount');
		ui.toAmount = document.getElementById('toAmount');
		ui.fromTokenButton = document.getElementById('fromTokenButton');
		ui.toTokenButton = document.getElementById('toTokenButton');
		ui.fromTokenSymbol = document.getElementById('fromTokenSymbol');
		ui.toTokenSymbol = document.getElementById('toTokenSymbol');
		ui.fromTokenIcon = document.getElementById('fromTokenIcon');
		ui.toTokenIcon = document.getElementById('toTokenIcon');
		ui.maxButton = document.getElementById('maxButton');
		ui.flipButton = document.getElementById('flipButton');
		ui.refreshButton = document.getElementById('refreshButton');
		ui.swapButton = document.getElementById('swapButton');
		ui.errorText = document.getElementById('errorText');
		ui.fromBalance = document.getElementById('fromBalance');
		ui.toBalance = document.getElementById('toBalance');
		ui.fromUsd = document.getElementById('fromUsd');
		ui.toUsd = document.getElementById('toUsd');
		ui.toast = document.getElementById('toast');
		ui.tokenModal = document.getElementById('tokenModal');
		ui.modalBackdrop = document.getElementById('modalBackdrop');
		ui.closeModal = document.getElementById('closeModal');
		ui.tokenSearch = document.getElementById('tokenSearch');
		ui.tokenList = document.getElementById('tokenList');
		ui.modalTitle = document.getElementById('modalTitle');
	}

	function bindEvents() {
		ui.fromAmount.addEventListener('input', (event) => {
			handleAmountInput('from', event.target.value);
		});

		ui.toAmount.addEventListener('input', (event) => {
			handleAmountInput('to', event.target.value);
		});

		ui.maxButton.addEventListener('click', handleMaxClick);
		ui.flipButton.addEventListener('click', handleFlipTokens);
		ui.refreshButton.addEventListener('click', () => loadPrices());
		ui.swapButton.addEventListener('click', handleSwapSubmit);

		ui.fromTokenButton.addEventListener('click', () => openTokenModal('from'));
		ui.toTokenButton.addEventListener('click', () => openTokenModal('to'));

		ui.modalBackdrop.addEventListener('click', closeTokenModal);
		ui.closeModal.addEventListener('click', closeTokenModal);
		ui.tokenSearch.addEventListener('input', handleTokenSearch);
		ui.tokenList.addEventListener('click', (event) => {
			const row = event.target.closest('.token-row');
			if (!row) return;
			const symbol = row.dataset.symbol;
			selectToken(symbol);
		});

		document.addEventListener('keydown', (event) => {
			if (event.key === 'Escape' && !ui.tokenModal.classList.contains('hidden')) {
				closeTokenModal();
			}
		});
	}

	// Fetch latest token prices and rebuild the UI state.
	async function loadPrices() {
		setLoading(true);
		try {
			const response = await fetch(PRICE_URL);
			if (!response.ok) {
				throw new Error('Unable to fetch latest prices.');
			}
			const raw = await response.json();
			const tokens = normalizeTokens(raw);
			if (!tokens.length) {
				throw new Error('No tokens with prices were returned.');
			}
			state.tokens = tokens;
			state.tokenMap = new Map(tokens.map((token) => [token.symbol, token]));
			setDefaultPairs();
			updateTokenDisplays();
			updateUsdHints();
			updateBalances();
			updateDerivedAmounts('from');
			updateRateBanner();
			state.hasInteracted = false;
			setError('');
		} catch (error) {
			console.error(error);
			setError(error.message || 'Something went wrong while loading prices.');
		} finally {
			setLoading(false);
			updateValidation();
		}
	}

	function setDefaultPairs() {
		const fallback = state.tokens[0]?.symbol;
		const second = state.tokens[1]?.symbol;
		const preferredFrom = pickAvailableSymbol(['USDC', 'USD', fallback]);
		const preferredTo = pickAvailableSymbol(['ETH', 'ATOM', second].filter(Boolean), preferredFrom);
		state.fromSymbol = preferredFrom || fallback || null;
		const alternative = state.tokens.find((token) => token.symbol !== state.fromSymbol)?.symbol;
		state.toSymbol = preferredTo || alternative || state.fromSymbol;
	}

	function pickAvailableSymbol(candidates, disallow) {
		for (const symbol of candidates) {
			if (symbol && state.tokenMap.has(symbol) && symbol !== disallow) {
				return symbol;
			}
		}
		return null;
	}

	function handleAmountInput(side, value) {
		state.hasInteracted = true;
		const sanitized = sanitizeAmount(value);
		const key = side === 'from' ? 'amountFrom' : 'amountTo';
		state[key] = sanitized;
		const target = side === 'from' ? ui.fromAmount : ui.toAmount;
		target.value = sanitized;
		updateDerivedAmounts(side);
		updateUsdHints();
		updateValidation();
	}

	function sanitizeAmount(value) {
		if (!value) return '';
		const cleaned = value.replace(/[^\d.]/g, '');
		const [whole, ...rest] = cleaned.split('.');
		const decimals = rest.join('');
		return decimals ? `${whole}.${decimals.slice(0, 8)}` : whole;
	}

	function handleMaxClick() {
		const token = getToken(state.fromSymbol);
		if (!token) return;
		state.hasInteracted = true;
		state.amountFrom = trimTrailingZeros(token.balance);
		ui.fromAmount.value = state.amountFrom;
		updateDerivedAmounts('from');
		updateUsdHints();
		updateValidation();
	}

	function handleFlipTokens() {
		if (!state.fromSymbol || !state.toSymbol) return;
		const from = state.fromSymbol;
		state.fromSymbol = state.toSymbol;
		state.toSymbol = from;
		updateTokenDisplays();
		updateDerivedAmounts('from');
		updateUsdHints();
		updateBalances();
		updateRateBanner();
		updateValidation();
	}

	function updateDerivedAmounts(source) {
		const fromToken = getToken(state.fromSymbol);
		const toToken = getToken(state.toSymbol);
		if (!fromToken || !toToken) {
			ui.toAmount.value = '';
			return;
		}
		if (source === 'from') {
			if (state.amountFrom === '') {
				state.amountTo = '';
				ui.toAmount.value = '';
				return;
			}
			const amount = Number(state.amountFrom);
			if (Number.isFinite(amount)) {
				const converted = convertAmount(amount, fromToken, toToken);
				state.amountTo = converted ? trimTrailingZeros(converted) : '';
				ui.toAmount.value = state.amountTo;
			} else {
				state.amountTo = '';
				ui.toAmount.value = '';
			}
		} else {
			if (state.amountTo === '') {
				state.amountFrom = '';
				ui.fromAmount.value = '';
				return;
			}
			const amount = Number(state.amountTo);
			if (Number.isFinite(amount)) {
				const converted = convertAmount(amount, toToken, fromToken);
				state.amountFrom = converted ? trimTrailingZeros(converted) : '';
				ui.fromAmount.value = state.amountFrom;
			} else {
				state.amountFrom = '';
				ui.fromAmount.value = '';
			}
		}
	}

	function convertAmount(amount, fromToken, toToken) {
		if (!fromToken || !toToken || !Number.isFinite(fromToken.price) || !Number.isFinite(toToken.price)) {
			return 0;
		}
		return (amount * fromToken.price) / toToken.price;
	}

	function updateTokenDisplays() {
		const fromToken = getToken(state.fromSymbol);
		const toToken = getToken(state.toSymbol);

		if (fromToken) {
			ui.fromTokenSymbol.textContent = fromToken.symbol;
			setTokenIcon(ui.fromTokenIcon, fromToken.symbol);
		}
		if (toToken) {
			ui.toTokenSymbol.textContent = toToken.symbol;
			setTokenIcon(ui.toTokenIcon, toToken.symbol);
		}
	}

	function updateUsdHints() {
		const fromToken = getToken(state.fromSymbol);
		const toToken = getToken(state.toSymbol);
		const fromUsd = Number(state.amountFrom || 0) * (fromToken?.price || 0);
		const toUsd = Number(state.amountTo || 0) * (toToken?.price || 0);
		ui.fromUsd.textContent = `≈ ${formatUsd(fromUsd)}`;
		ui.toUsd.textContent = `≈ ${formatUsd(toUsd)}`;
	}

	function updateBalances() {
		const fromToken = getToken(state.fromSymbol);
		const toToken = getToken(state.toSymbol);
		ui.fromBalance.textContent = fromToken
			? `Balance — ${formatAmount(fromToken.balance)} ${fromToken.symbol}`
			: 'Balance — 0';
		ui.toBalance.textContent = toToken
			? `Balance — ${formatAmount(toToken.balance)} ${toToken.symbol}`
			: 'Balance — 0';
		ui.maxButton.disabled = !fromToken || fromToken.balance <= 0;
	}

	function updateRateBanner() {
		const fromToken = getToken(state.fromSymbol);
		const toToken = getToken(state.toSymbol);
		if (!fromToken || !toToken) {
			ui.rateBanner.textContent = 'Fetching live prices…';
			return;
		}
		const quote = convertAmount(1, fromToken, toToken);
		ui.rateBanner.textContent = `1 ${fromToken.symbol} ≈ ${formatAmount(quote)} ${toToken.symbol} • ${state.tokens.length} tokens live`;
	}

	function handleSwapSubmit() {
		state.hasInteracted = true;
		const { valid, message } = validateState();
		if (!valid) {
			setError(message);
			return;
		}
		setSubmitting(true);
		// Simulate a network delay
		const delay = 1100 + Math.random() * 900;
		setTimeout(() => {
			finalizeSwap();
			setSubmitting(false);
			showToast(
				`Swapped ${formatAmount(Number(state.amountFrom))} ${state.fromSymbol} → ${formatAmount(
					Number(state.amountTo)
				)} ${state.toSymbol}`
			);
			clearAmounts();
				state.hasInteracted = false;
			updateBalances();
			updateUsdHints();
			updateRateBanner();
			updateValidation();
		}, delay);
	}

	function finalizeSwap() {
		const fromToken = getToken(state.fromSymbol);
		const toToken = getToken(state.toSymbol);
		const amountIn = Number(state.amountFrom);
		const amountOut = Number(state.amountTo);
		if (!fromToken || !toToken || !Number.isFinite(amountIn) || !Number.isFinite(amountOut)) {
			return;
		}
		fromToken.balance = Math.max(fromToken.balance - amountIn, 0);
		toToken.balance += amountOut;
	}

	function clearAmounts() {
		state.amountFrom = '';
		state.amountTo = '';
		ui.fromAmount.value = '';
		ui.toAmount.value = '';
	}

	function setSubmitting(isSubmitting) {
		state.submitting = isSubmitting;
		ui.swapButton.classList.toggle('is-loading', isSubmitting);
		updateValidation();
	}

	function validateState() {
		if (state.loading) {
			return { valid: false, message: 'Loading live prices…' };
		}
		if (!state.fromSymbol || !state.toSymbol) {
			return { valid: false, message: 'Select both tokens to continue.' };
		}
		if (state.fromSymbol === state.toSymbol) {
			return { valid: false, message: 'Pick two different tokens.' };
		}
		if (!state.amountFrom) {
			return { valid: false, message: 'Enter an amount to swap.' };
		}
		const amount = Number(state.amountFrom);
		if (!Number.isFinite(amount) || amount <= 0) {
			return { valid: false, message: 'Enter a valid numeric amount.' };
		}
		const balance = getToken(state.fromSymbol)?.balance ?? 0;
		if (amount > balance) {
			return {
				valid: false,
				message: `Exceeds available balance (${formatAmount(balance)} ${state.fromSymbol}).`
			};
		}
		return { valid: true, message: '' };
	}

	function updateValidation() {
		const { valid, message } = validateState();
		const shouldShow = state.hasInteracted || state.submitting;
		setError(shouldShow ? message : '');
		ui.swapButton.disabled = !valid || state.submitting;
	}

	function setLoading(isLoading) {
		state.loading = isLoading;
		ui.swapCard.dataset.loading = String(isLoading);
		ui.swapCard.setAttribute('aria-busy', String(isLoading));
		[ui.fromAmount, ui.toAmount, ui.maxButton, ui.flipButton, ui.fromTokenButton, ui.toTokenButton].forEach((el) => {
			if (el) el.disabled = isLoading;
		});
		ui.refreshButton.classList.toggle('is-rotating', isLoading);
		if (isLoading) {
			ui.rateBanner.textContent = 'Fetching live prices…';
		}
	}

	function setError(message) {
		ui.errorText.textContent = message || '';
	}

	function openTokenModal(type) {
		if (state.loading) return;
		state.modalType = type;
		ui.modalTitle.textContent = `Select ${type === 'to' ? 'receive' : 'send'} token`;
		ui.tokenModal.classList.remove('hidden');
		document.body.style.overflow = 'hidden';
		ui.tokenSearch.value = '';
		renderTokenList(state.tokens);
		requestAnimationFrame(() => ui.tokenSearch.focus());
	}

	function closeTokenModal() {
		ui.tokenModal.classList.add('hidden');
		document.body.style.overflow = '';
		state.modalType = null;
		ui.modalTitle.textContent = 'Select token';
	}

	function handleTokenSearch() {
		const query = ui.tokenSearch.value.trim().toLowerCase();
		const filtered = state.tokens.filter((token) => token.symbol.toLowerCase().includes(query));
		renderTokenList(filtered);
	}

	function renderTokenList(tokens) {
		ui.tokenList.innerHTML = '';
		if (!tokens.length) {
			ui.tokenList.innerHTML = '<p class="helper">No tokens match that search.</p>';
			return;
		}
		const fragment = document.createDocumentFragment();
		tokens.forEach((token) => {
			const button = document.createElement('button');
			button.type = 'button';
			button.className = 'token-row';
			if (token.symbol === state.fromSymbol || token.symbol === state.toSymbol) {
				button.classList.add('is-active');
			}
			button.dataset.symbol = token.symbol;
			button.setAttribute('role', 'option');
			const infoLeft = document.createElement('div');
			infoLeft.className = 'token-row__info';

			const icon = document.createElement('img');
			icon.className = 'token-icon';
			icon.alt = '';
			setTokenIcon(icon, token.symbol);

			const textLeft = document.createElement('div');
			textLeft.className = 'token-row__texts';
			const symbolSpan = document.createElement('span');
			symbolSpan.className = 'token-row__symbol';
			symbolSpan.textContent = token.symbol;
			const priceSpan = document.createElement('span');
			priceSpan.className = 'token-row__price';
			priceSpan.textContent = formatUsd(token.price);
			textLeft.append(symbolSpan, priceSpan);

			infoLeft.append(icon, textLeft);

			const textRight = document.createElement('div');
			textRight.className = 'token-row__texts';
			textRight.style.textAlign = 'right';
			const balanceSpan = document.createElement('span');
			balanceSpan.className = 'token-row__symbol';
			balanceSpan.textContent = `${formatAmount(token.balance)} ${token.symbol}`;
			const usdSpan = document.createElement('span');
			usdSpan.className = 'token-row__price';
			usdSpan.textContent = `≈ ${formatUsd(token.balance * token.price)}`;
			textRight.append(balanceSpan, usdSpan);

			button.append(infoLeft, textRight);
			fragment.appendChild(button);
		});
		ui.tokenList.appendChild(fragment);
	}

	function selectToken(symbol) {
		if (!state.modalType || !state.tokenMap.has(symbol)) return;
		const currentKey = state.modalType === 'from' ? 'fromSymbol' : 'toSymbol';
		const otherKey = state.modalType === 'from' ? 'toSymbol' : 'fromSymbol';
		if (symbol === state[otherKey]) {
			state[otherKey] = state[currentKey];
		}
		state[currentKey] = symbol;
		closeTokenModal();
		updateTokenDisplays();
		updateDerivedAmounts('from');
		updateUsdHints();
		updateBalances();
		updateRateBanner();
		updateValidation();
	}

	function showToast(message) {
		if (!ui.toast) return;
		ui.toast.textContent = message;
		ui.toast.classList.add('is-visible');
		clearTimeout(state.toastTimer);
		state.toastTimer = setTimeout(() => {
			ui.toast.classList.remove('is-visible');
		}, 2800);
	}

	function normalizeTokens(raw) {
		const latest = new Map();
		raw.forEach((entry) => {
			const symbol = String(entry.currency || '').trim();
			const price = Number(entry.price);
			if (!symbol || !Number.isFinite(price) || price <= 0) return;
			latest.set(symbol, {
				symbol,
				price,
				date: entry.date,
				balance: generateMockBalance(price)
			});
		});
		return Array.from(latest.values()).sort((a, b) => a.symbol.localeCompare(b.symbol));
	}

	function getToken(symbol) {
		return symbol ? state.tokenMap.get(symbol) : null;
	}

	function generateMockBalance(price) {
		// Provide believable balances so that validation/MAX behave realistically.
		const scale = price > 1000 ? 0.3 : price > 100 ? 3 : price > 1 ? 400 : 2000;
		const raw = Math.random() * scale;
		return Number(raw.toFixed(6));
	}

	function formatAmount(value) {
		const num = Number(value);
		if (!Number.isFinite(num)) return '0';
		if (num === 0) return '0';
		if (num >= 1) return num.toLocaleString(undefined, { maximumFractionDigits: 4 });
		return num.toLocaleString(undefined, { maximumFractionDigits: 6 });
	}

	function trimTrailingZeros(value) {
		const num = Number(value);
		if (!Number.isFinite(num)) return '';
		return num.toFixed(8).replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1');
	}

	function formatUsd(value) {
		if (!Number.isFinite(value) || value <= 0) return '$0.00';
		return value >= 1000
			? `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
			: `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
	}

	function setTokenIcon(imgEl, symbol) {
		if (!imgEl) return;
		imgEl.src = getIconUrl(symbol);
		imgEl.onerror = () => {
			// Gracefully fall back to an inline SVG badge if the remote icon is missing.
			imgEl.onerror = null;
			const fallbackSvg =
				'data:image/svg+xml;utf8,' +
				encodeURIComponent(
					`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" rx="20" fill="#ffffff" fill-opacity="0.12"/><text x="50%" y="55%" font-size="16" text-anchor="middle" fill="#ffffff" font-family="Inter, sans-serif">${
						symbol?.slice(0, 3) || ''
					}</text></svg>`
				);
			imgEl.src = fallbackSvg;
		};
	}

	function getIconUrl(symbol) {
		return `${ICON_BASE}/${symbol}.svg`;
	}
})();
