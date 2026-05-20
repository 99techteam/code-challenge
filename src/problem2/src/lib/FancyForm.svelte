<script lang="ts">
  import type { TypeToken } from "../types";
  import InputTokenAmount from "./InputTokenAmount.svelte";
  import TokenDropdown from "./TokenDropdown.svelte";

  const { tokens }: { tokens: TypeToken[] } = $props();

  type MessageType = "success" | "error" | "loading";

  let isLoading = $state(false);
  let payAmount = $state(0);
  let receiveAmount = $state(0);
  let payToken = $state<TypeToken | null>(null);
  let receiveToken = $state<TypeToken | null>(null);
  let openDropdown = $state<"pay" | "receive" | null>(null);
  let message = $state<{ type: MessageType; text: string } | null>(null);
  let buttonIsSpinning = $state(false);

  const payUSD = $derived(
    payToken && payAmount ? (payAmount * payToken.price).toFixed(2) : "0.00",
  );
  const receiveUSD = $derived(
    payToken && receiveToken && receiveAmount ? payUSD : "0.00",
  );
  const exchangeRate = $derived(
    payToken && receiveToken
      ? (payToken.price / receiveToken.price).toFixed(6)
      : "0",
  );

  const usdReceiveRate = $derived(
    receiveToken && receiveToken.price
      ? (1 / receiveToken.price).toFixed(6)
      : "0",
  );

  const feePercent = 0.2;
  const feeUSD = $derived(
    payToken
      ? (payAmount * (feePercent / 100) * payToken.price).toFixed(2)
      : "0.00",
  );

  // const priceImpact = $derived(
  //   payAmount > 0 ? Math.min(0.05, payAmount / 10000) : 0,
  // );

  $effect(() => {
    if (!payToken && !receiveToken && tokens.length >= 2) {
      payToken = tokens[0];
      receiveToken = tokens[1];
      updateReceiveAmount();
    }
  });

  function updateReceiveAmount() {
    if (!payToken || !receiveToken) return;
    const rate = payToken.price / receiveToken.price;
    receiveAmount = Number((payAmount * rate).toFixed(6));
  }

  function handlePayAmountChange(amount: number) {
    payAmount = amount;
    updateReceiveAmount();
  }

  function handleSelectPayToken(token: TypeToken) {
    payToken = token;
    updateReceiveAmount();
  }

  function handleSelectReceiveToken(token: TypeToken) {
    receiveToken = token;
    updateReceiveAmount();
  }

  function handlePayTokenClick() {
    openDropdown = "pay";
  }

  function handleReceiveTokenClick() {
    openDropdown = "receive";
  }

  function handleSelectToken(token: TypeToken) {
    if (openDropdown === "pay") {
      handleSelectPayToken(token);
    } else if (openDropdown === "receive") {
      handleSelectReceiveToken(token);
    }
    openDropdown = null;
  }

  function handleCloseDropdown() {
    openDropdown = null;
  }

  function handleSwapTokens() {
    buttonIsSpinning = true;
    [payToken, receiveToken] = [receiveToken, payToken];
    [payAmount, receiveAmount] = [receiveAmount, payAmount];

    setTimeout(() => {
      buttonIsSpinning = false;
    }, 600);
  }

  function handleConfirmSwap(event: SubmitEvent) {
    event.preventDefault();

    if (payAmount <= 0) {
      message = { type: "error", text: "⚠️ Please enter a valid amount" };
      setTimeout(() => (message = null), 3000);
      return;
    }

    isLoading = true;
    setTimeout(() => {
      isLoading = false;
      payAmount = 0;
      receiveAmount = 0;
      message = { type: "success", text: "✓ Swap successful!" };
      setTimeout(() => (message = null), 3000);
    }, 1500);
  }
</script>

<div class="min-h-screen w-screen flex items-center justify-center px-4 py-8">
  <form class="swap-card" onsubmit={handleConfirmSwap}>
    <header class="card-header">
      <div class="badge">
        <h1 class="title">💱 Swap Speed</h1>
      </div>
    </header>

    <!-- Pay Section -->
    <InputTokenAmount
      label="You pay"
      amount={payAmount}
      token={payToken}
      usdEquivalent={payUSD}
      disabled={false}
      inputId="payAmount"
      onAmountChange={handlePayAmountChange}
      onTokenClick={handlePayTokenClick}
    />

    <!-- Swap Arrow -->
    <button
      type="button"
      class="swap-button"
      class:spin-rotate={buttonIsSpinning}
      onclick={handleSwapTokens}
      aria-label="Swap tokens"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="swap-icon"
      >
        <path d="m3 16 4 4 4-4"></path>
        <path d="M7 20V4"></path>
        <path d="m21 8-4-4-4 4"></path>
        <path d="M17 4v16"></path>
      </svg>
    </button>

    <!-- Receive Section -->
    <InputTokenAmount
      label="Estimated receive"
      amount={receiveAmount}
      token={receiveToken}
      usdEquivalent={receiveUSD}
      disabled={true}
      inputId="receiveAmount"
      onTokenClick={handleReceiveTokenClick}
    />

    <!-- Exchange Rate -->
    {#if payToken && receiveToken}
      <div class="summary-card">
        <div class="summary-row">
          <span>Exchange rate</span>
          <span
            >1 {payToken.currency} ≈ {exchangeRate}
            {receiveToken.currency}</span
          >
        </div>
        <div class="summary-row">
          <span>USD price</span>
          <span>1 USD ≈ {usdReceiveRate} {receiveToken.currency}</span>
        </div>
        <!-- <div class="summary-row">
          <span>Price impact</span>
          <span class="impact-text">
            {priceImpact > 0 ? `-${(priceImpact * 100).toFixed(5)}%` : "-"}
          </span>
        </div> -->
        <div class="summary-row">
          <span>Fees</span>
          <span>{feePercent}% (${feeUSD})</span>
        </div>
      </div>
    {/if}

    <!-- Confirm Button -->
    <button
      type="submit"
      class="confirm-button"
      class:loading={isLoading}
      disabled={isLoading || !payToken || !receiveToken || payAmount <= 0}
    >
      {#if isLoading}
        <span class="button-spinner"></span>
        Processing...
      {:else}
        Swap now
      {/if}
    </button>

    <!-- Messages -->
    {#if message}
      <div class="message message-{message.type}">
        {message.text}
      </div>
    {/if}
  </form>

  {#if openDropdown}
    <TokenDropdown
      isOpen={true}
      {tokens}
      selectedToken={openDropdown === "pay" ? payToken : receiveToken}
      excludedToken={openDropdown === "pay" ? receiveToken : payToken}
      onSelect={handleSelectToken}
      onClose={handleCloseDropdown}
    />
  {/if}
</div>

<style>
  .swap-card {
    max-width: 480px;
    width: 100%;
    padding: 24px;
    border-radius: 24px;
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.4);
    box-shadow:
      0 0 40px rgba(100, 50, 200, 0.3),
      0 0 80px rgba(100, 50, 200, 0.15),
      0 30px 60px rgba(0, 0, 0, 0.3),
      0 18px 50px rgba(0, 0, 0, 0.12),
      0 0 1px rgba(255, 255, 255, 0.5) inset;
    animation: slideUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
    position: relative;
    z-index: 10;
    will-change: transform;
  }

  @media (max-width: 640px) {
    .swap-card {
      padding: 24px;
      border-radius: 20px;
    }
  }

  .card-header {
    margin-bottom: 20px;
    text-align: center;
  }

  .badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.6px;
    color: rgba(100, 50, 200, 0.85);
    background: rgba(100, 50, 200, 0.14);
    padding: 10px 18px;
    border-radius: 18px;
  }

  .title {
    font-size: 30px;
    font-weight: 800;
    background: linear-gradient(135deg, #6432c8 0%, #c85a8e 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0;
  }

  .subtitle {
    font-size: 14px;
    color: rgba(0, 0, 0, 0.6);
    margin: 0;
    font-weight: 400;
  }

  .swap-button {
    width: 44px;
    height: 44px;
    margin: 10px auto;
    border: 1px solid rgba(100, 50, 200, 0.18);
    background: rgba(255, 255, 255, 0.95);
    border-radius: 16px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition:
      all 0.25s ease,
      transform 0.3s ease;
    color: rgba(55, 65, 81, 0.8);
    box-shadow:
      0 0 15px rgba(100, 50, 200, 0.2),
      0 10px 18px rgba(15, 23, 42, 0.06);
  }

  .swap-button:hover {
    background: rgba(100, 50, 200, 0.12);
    color: rgba(15, 23, 42, 0.95);
    border-color: rgba(100, 50, 200, 0.3);
  }
  .swap-button:active {
    transform: scale(0.96);
  }

  .swap-button.spin-rotate {
    animation: spin360 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    background-color: rgba(100, 50, 200);
    color: whitesmoke;
  }

  .swap-icon {
    width: 20px;
    height: 20px;
  }

  .summary-card {
    margin: 18px 0;
    padding: 14px 18px;
    background: rgba(246, 247, 251, 0.9);
    border: 1px solid rgba(100, 50, 200, 0.12);
    border-radius: 18px;
    display: grid;
    gap: 10px;
  }

  .summary-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    font-size: 13px;
    color: rgba(0, 0, 0, 0.75);
  }

  .summary-row span:last-child {
    font-weight: 700;
    color: rgba(0, 0, 0, 0.9);
    text-align: right;
    white-space: nowrap;
  }

  .impact-text {
    color: #e11d48;
  }

  .confirm-button {
    width: 100%;
    height: 56px;
    border: none;
    background: linear-gradient(145deg, #6b3bd8 0%, #db4a9c 100%);
    color: white;
    font-weight: 800;
    font-size: 14px;
    border-radius: 18px;
    cursor: pointer;
    transition:
      transform 0.2s ease,
      box-shadow 0.2s ease,
      filter 0.2s ease;
    box-shadow:
      0 16px 22px -10px rgba(100, 50, 200, 0.5),
      inset 0 -4px 0px rgba(0, 0, 0, 0.15);
    font-family: inherit;
    letter-spacing: 0.6px;
    position: relative;
    overflow: hidden;
    text-transform: uppercase;
  }

  .confirm-button::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.18),
      transparent 45%
    );
    pointer-events: none;
  }

  .confirm-button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow:
      0 20px 32px -12px rgba(100, 50, 200, 0.55),
      inset 0 -4px 0px rgba(0, 0, 0, 0.12);
    filter: saturate(1.1);
  }

  .confirm-button:active:not(:disabled) {
    transform: translateY(1px);
    box-shadow:
      0 10px 18px -12px rgba(100, 50, 200, 0.45),
      inset 0 -2px 0px rgba(0, 0, 0, 0.12);
  }

  .confirm-button.loading {
    transform: translateY(1px);
    box-shadow:
      0 8px 18px -12px rgba(100, 50, 200, 0.45),
      inset 0 -2px 0px rgba(0, 0, 0, 0.12);
    filter: saturate(0.95);
    cursor: wait;
  }

  .confirm-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .button-spinner {
    display: inline-block;
    width: 14px;
    height: 14px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin-right: 8px;
    vertical-align: middle;
  }

  .message {
    margin-top: 16px;
    padding: 12px 16px;
    border-radius: 12px;
    font-size: 13px;
    font-weight: 600;
    text-align: center;
    animation: slideDown 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .message-success {
    background: rgba(34, 197, 94, 0.15);
    color: #15803d;
    border: 1px solid rgba(34, 197, 94, 0.3);
  }

  .message-error {
    background: rgba(239, 68, 68, 0.15);
    color: #991b1b;
    border: 1px solid rgba(239, 68, 68, 0.3);
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes spin360 {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
</style>
