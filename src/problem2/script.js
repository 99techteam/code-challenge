const PRICES_API_URL = "https://interview.switcheo.com/prices.json";
const ICON_BASE_URL =
  "https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens";
const FAKE_DELAY_MS = 1500;

const fetchTokenPrices = async () => {
  const response = await fetch(PRICES_API_URL);
  if (!response.ok) throw new Error("Failed to fetch prices");
  const data = await response.json();

  const priceMap = new Map();
  for (const item of data) {
    if (!item.currency || typeof item.price !== "number" || item.price <= 0)
      continue;
    const existing = priceMap.get(item.currency);
    if (!existing || new Date(item.date) > new Date(existing.date)) {
      priceMap.set(item.currency, { price: item.price, date: item.date });
    }
  }
  return priceMap;
};

const getTokenIconUrl = (symbol) => `${ICON_BASE_URL}/${symbol}.svg`;

//  Converts amount from one token to another based on USD prices.
//  Formula: (amount * fromPrice) / toPrice

const convertAmount = (amount, fromPrice, toPrice) => {
  if (!fromPrice || !toPrice || toPrice === 0) return null;
  return (Number(amount) * fromPrice) / toPrice;
};

//  Validates the swap form state.
//  Returns { valid: boolean, errors: { amount?: string, tokens?: string } }

const validateForm = (amount, fromToken, toToken) => {
  const errors = {};

  const numAmount = Number(amount);
  if (amount === "" || amount === null || amount === undefined) {
    errors.amount = "Please enter an amount";
  } else if (Number.isNaN(numAmount)) {
    errors.amount = "Amount must be a valid number";
  } else if (numAmount <= 0) {
    errors.amount = "Amount must be a positive number";
  }

  if (fromToken && toToken && fromToken === toToken) {
    errors.tokens = "From and To tokens must be different";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

//  Parses user input as a number, allowing decimals.

const parseAmount = (value) => {
  const cleaned = String(value).replace(/[^\d.]/g, "");
  const num = parseFloat(cleaned);
  return Number.isNaN(num) ? null : num;
};

//  Creates and populates token select dropdowns and custom dropdown options.

const renderTokenSelects = (priceMap, fromSelect, toSelect) => {
  const tokens = Array.from(priceMap.keys()).sort();
  const optionsHtml = tokens
    .map((symbol) => `<option value="${symbol}">${symbol}</option>`)
    .join("");

  fromSelect.innerHTML = `<option value="">Select token</option>${optionsHtml}`;
  toSelect.innerHTML = `<option value="">Select token</option>${optionsHtml}`;

  if (tokens.length >= 2) {
    fromSelect.value = tokens[0];
    toSelect.value = tokens[1];
  }

  // Populate custom dropdowns
  const fromWrapper = fromSelect.closest(".token-select-wrapper");
  const toWrapper = toSelect.closest(".token-select-wrapper");

  const renderDropdown = (wrapper, selectEl) => {
    const dropdown = wrapper.querySelector(".token-dropdown");
    const triggerLabel = wrapper.querySelector(".token-trigger-label");
    if (!dropdown || !triggerLabel) return;

    dropdown.innerHTML = tokens
      .map(
        (symbol) => {
          const isSelected = symbol === selectEl.value;
          return `
      <li class="token-option" data-value="${symbol}" role="option" tabindex="0" aria-selected="${isSelected}">
        <span class="token-option-icon" data-symbol="${symbol}"><img src="${getTokenIconUrl(symbol)}" alt="" onerror="var p=this.parentElement;p.classList.add('fallback');p.textContent=p.dataset.symbol?p.dataset.symbol[0]:'';this.remove();"></span>
        <span class="token-option-symbol">${symbol}</span>
      </li>
    `;
        }
      )
      .join("");

    triggerLabel.textContent = selectEl.value || "Select token";
  };

  renderDropdown(fromWrapper, fromSelect);
  renderDropdown(toWrapper, toSelect);
};

//  Syncs custom trigger label and option selected state with select value.
const syncTriggerLabel = (selectEl) => {
  const wrapper = selectEl.closest(".token-select-wrapper");
  const triggerLabel = wrapper?.querySelector(".token-trigger-label");
  if (triggerLabel) triggerLabel.textContent = selectEl.value || "Select token";

  const dropdown = wrapper?.querySelector(".token-dropdown");
  if (dropdown) {
    dropdown.querySelectorAll(".token-option").forEach((opt) => {
      opt.setAttribute("aria-selected", opt.dataset.value === selectEl.value ? "true" : "false");
    });
  }
};

//  Renders token icon in the given container.

const renderTokenIcon = (container, symbol) => {
  container.classList.remove("fallback");
  container.innerHTML = "";
  if (!symbol) return;

  const img = document.createElement("img");
  img.src = getTokenIconUrl(symbol);
  img.alt = "";
  img.onerror = () => {
    img.remove();
    container.textContent = symbol.charAt(0);
    container.classList.add("fallback");
  };
  container.appendChild(img);
};

//  Formats a number for display (max 8 decimal places, trim trailing zeros).

const formatDisplayAmount = (value) => {
  if (value === null || value === undefined || Number.isNaN(value)) return "";
  if (value === 0) return "0";
  const formatted = Number(value).toLocaleString("en-US", {
    maximumFractionDigits: 8,
    minimumFractionDigits: 0,
  });
  return formatted.replace(/\.?0+$/, "") || "0";
};

//  Simulates a backend request with loading state.

const simulateSwapRequest = () =>
  new Promise((resolve) => setTimeout(resolve, FAKE_DELAY_MS));

//  Application State & Initialization

const init = () => {
  const form = document.getElementById("swap-form");
  const fromSelect = document.getElementById("from-token");
  const toSelect = document.getElementById("to-token");
  const inputAmount = document.getElementById("input-amount");
  const outputAmount = document.getElementById("output-amount");
  const amountError = document.getElementById("amount-error");
  const toTokenError = document.getElementById("to-token-error");
  const submitBtn = document.getElementById("submit-btn");
  const resultModal = document.getElementById("result-modal");
  const modalIcon = document.getElementById("modal-icon");
  const modalTitle = document.getElementById("modal-title");
  const modalMessage = document.getElementById("modal-message");
  const modalCloseBtn = document.getElementById("modal-close-btn");
  const modalOverlay = document.getElementById("modal-overlay");
  const loadError = document.getElementById("load-error");
  const swapDirectionBtn = document.getElementById("swap-direction-btn");
  const fromTokenIcon = document.getElementById("from-token-icon");
  const toTokenIcon = document.getElementById("to-token-icon");

  let priceMap = new Map();
  let formTouched = false;

  //  Updates validation state and submit button.
  //  Only shows error messages when user has interacted (input or submit).

  const updateValidation = (showErrors = formTouched) => {
    const amount = inputAmount.value.trim();
    const from = fromSelect.value;
    const to = toSelect.value;
    const { valid, errors } = validateForm(amount, from, to);

    if (showErrors) {
      amountError.textContent = errors.amount || "";
      amountError.style.display = errors.amount ? "block" : "none";
      inputAmount.setAttribute(
        "aria-invalid",
        errors.amount ? "true" : "false",
      );
      toTokenError.textContent = errors.tokens || "";
      toTokenError.style.display = errors.tokens ? "block" : "none";
    } else {
      amountError.textContent = "";
      amountError.style.display = "none";
      inputAmount.setAttribute("aria-invalid", "false");
      toTokenError.textContent = "";
      toTokenError.style.display = "none";
    }

    submitBtn.disabled = !valid;
  };

  //  Updates the converted amount display.

  const updateConversion = () => {
    const from = fromSelect.value;
    const to = toSelect.value;
    const amount = parseAmount(inputAmount.value);

    if (!from || !to || amount === null || amount < 0) {
      outputAmount.value = "";
      return;
    }

    const fromData = priceMap.get(from);
    const toData = priceMap.get(to);
    if (!fromData || !toData) {
      outputAmount.value = "";
      return;
    }

    const converted = convertAmount(amount, fromData.price, toData.price);
    outputAmount.value = formatDisplayAmount(converted);
  };

  //  Updates token icons when selection changes.

  const updateIcons = () => {
    renderTokenIcon(fromTokenIcon, fromSelect.value);
    renderTokenIcon(toTokenIcon, toSelect.value);
  };

  //  Handles token selector change: update icons and conversion, no validation.

  const handleTokenChange = () => {
    updateIcons();
    updateConversion();
    updateValidation();
  };

  //  Handles amount input: validate and update conversion.

  const handleInputChange = () => {
    formTouched = true;
    updateConversion();
    updateValidation();
  };

  //  Swaps From and To tokens.

  const handleSwapDirection = () => {
    const from = fromSelect.value;
    const to = toSelect.value;
    if (!from || !to) return;

    fromSelect.value = to;
    toSelect.value = from;
    syncTriggerLabel(fromSelect);
    syncTriggerLabel(toSelect);
    updateIcons();
    updateConversion();
    updateValidation();
  };

  //  Shows result modal (success or error), then clears form when closed.

  const showResultModal = (success, message) => {
    modalIcon.className = `modal-icon ${success ? "success" : "error"}`;
    modalIcon.innerHTML = success
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5" stroke-linecap="round" stroke-linejoin="round"/></svg>'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    modalTitle.textContent = success ? "Success" : "Error";
    modalMessage.textContent = message;
    resultModal.hidden = false;
    modalCloseBtn.focus();
  };

  //  Closes modal and clears the form.

  const closeModalAndClearForm = () => {
    resultModal.hidden = true;

    const tokens = Array.from(priceMap.keys()).sort();
    inputAmount.value = "";
    outputAmount.value = "";
    amountError.textContent = "";
    amountError.style.display = "none";
    inputAmount.setAttribute("aria-invalid", "false");
    toTokenError.textContent = "";
    toTokenError.style.display = "none";

    if (tokens.length >= 2) {
      fromSelect.value = tokens[0];
      toSelect.value = tokens[1];
      syncTriggerLabel(fromSelect);
      syncTriggerLabel(toSelect);
    }
    formTouched = false;
    updateIcons();
    updateConversion();
    updateValidation();
  };

  //  Handles form submit with loading state.

  const handleSubmit = async (e) => {
    e.preventDefault();

    formTouched = true;
    const amount = inputAmount.value.trim();
    const from = fromSelect.value;
    const to = toSelect.value;
    const { valid } = validateForm(amount, from, to);
    if (!valid) {
      updateValidation(true);
      return;
    }

    submitBtn.disabled = true;
    submitBtn.setAttribute("aria-busy", "true");

    try {
      await simulateSwapRequest();
      const converted = outputAmount.value;
      showResultModal(true, `You will receive ${converted} ${to}`);
    } catch (err) {
      showResultModal(false, "Something went wrong. Please try again.");
    } finally {
      submitBtn.disabled = false;
      submitBtn.setAttribute("aria-busy", "false");
      updateValidation();
    }
  };

  //  Load prices and initialize UI.

  const loadAndInit = async () => {
    try {
      priceMap = await fetchTokenPrices();
      if (priceMap.size === 0) {
        fromSelect.innerHTML = '<option value="">No tokens available</option>';
        toSelect.innerHTML = '<option value="">No tokens available</option>';
        syncTriggerLabel(fromSelect);
        syncTriggerLabel(toSelect);
        return;
      }
      renderTokenSelects(priceMap, fromSelect, toSelect);
      setupTokenDropdown(fromSelect, handleTokenChange);
      setupTokenDropdown(toSelect, handleTokenChange);
      updateIcons();
      updateConversion();
      updateValidation();
      loadError.textContent = "";
      loadError.className = "status-message";
    } catch (err) {
      fromSelect.innerHTML = '<option value="">Failed to load</option>';
      toSelect.innerHTML = '<option value="">Failed to load</option>';
      syncTriggerLabel(fromSelect);
      syncTriggerLabel(toSelect);
      loadError.textContent = "Failed to load token prices. Please refresh.";
      loadError.className = "status-message error";
    }
  };

  // Setup custom dropdown for token selectors
  const setupTokenDropdown = (selectEl, onSelect) => {
    const wrapper = selectEl.closest(".token-select-wrapper");
    const trigger = wrapper?.querySelector(".token-trigger");
    const dropdown = wrapper?.querySelector(".token-dropdown");
    if (!wrapper || !trigger || !dropdown) return;

    const open = () => {
      document.querySelectorAll(".token-select-wrapper.is-open").forEach((w) => w.classList.remove("is-open"));
      wrapper.classList.add("is-open");
      trigger.setAttribute("aria-expanded", "true");
    };

    const close = () => {
      wrapper.classList.remove("is-open");
      trigger.setAttribute("aria-expanded", "false");
    };

    trigger.addEventListener("click", (e) => {
      e.stopPropagation();
      if (wrapper.classList.contains("is-open")) close();
      else open();
    });

    dropdown.addEventListener("click", (e) => {
      const opt = e.target.closest(".token-option");
      if (!opt) return;
      e.stopPropagation();
      const value = opt.dataset.value;
      selectEl.value = value;
      syncTriggerLabel(selectEl);
      close();
      selectEl.dispatchEvent(new Event("change", { bubbles: true }));
      onSelect?.();
    });
    dropdown.addEventListener("keydown", (e) => {
      const opt = e.target.closest(".token-option");
      if (opt && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        opt.click();
      }
    });

    document.addEventListener("click", (e) => {
      if (!wrapper.contains(e.target)) close();
    });
  };

  /* Event listeners */
  fromSelect.addEventListener("change", handleTokenChange);
  toSelect.addEventListener("change", handleTokenChange);
  inputAmount.addEventListener("input", handleInputChange);
  inputAmount.addEventListener("blur", handleInputChange);

  swapDirectionBtn.addEventListener("click", handleSwapDirection);
  swapDirectionBtn.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleSwapDirection();
    }
  });

  form.addEventListener("submit", handleSubmit);

  const handleModalKeydown = (e) => {
    if (e.key === "Escape") {
      if (!resultModal.hidden) {
        closeModalAndClearForm();
      } else {
        document.querySelectorAll(".token-select-wrapper.is-open").forEach((w) => w.classList.remove("is-open"));
        document.querySelectorAll(".token-select-wrapper .token-trigger[aria-expanded='true']").forEach((t) => t.setAttribute("aria-expanded", "false"));
      }
    }
  };

  modalCloseBtn.addEventListener("click", closeModalAndClearForm);
  modalOverlay.addEventListener("click", closeModalAndClearForm);
  document.addEventListener("keydown", handleModalKeydown);

  loadAndInit();
};

document.addEventListener("DOMContentLoaded", init);
