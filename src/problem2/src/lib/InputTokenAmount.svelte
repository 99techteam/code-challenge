<script lang="ts">
  import type { TypeToken } from "../types";
  import LazyImage from "./LazyImage.svelte";

  const {
    label = "",
    amount = 0,
    token = null,
    usdEquivalent = "0.00",
    disabled = false,
    inputId = "amount-input",
    onAmountChange,
    onTokenClick,
  }: {
    label?: string;
    amount?: number;
    token?: TypeToken | null;
    usdEquivalent?: string;
    disabled?: boolean;
    inputId?: string;
    onAmountChange?: (amount: number) => void;
    onTokenClick?: () => void;
  } = $props();

  function handleAmountChange(e: Event) {
    const target = e.target as HTMLInputElement;
    onAmountChange?.(parseFloat(target.value) || 0);
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (["e", "E", "+", "-"].includes(e.key)) {
      e.preventDefault();
    }
  }

  function handleTokenClick(e: MouseEvent) {
    e.stopPropagation();
    onTokenClick?.();
  }
</script>

<div class="section">
  <label class="section-label" for={inputId}>{label}</label>
  <div class="input-group" class:disabled>
    <input
      type="number"
      id={inputId}
      class="amount-input"
      placeholder="0.0"
      value={amount || ""}
      oninput={handleAmountChange}
      onkeydown={handleKeyDown}
      {disabled}
      min="0"
      step="any"
    />
    <button
      type="button"
      class="token-selector dropdown-trigger"
      onclick={handleTokenClick}
    >
      {#if token}
        <div class="token-icon-small">
          <LazyImage
            src={token.iconURL}
            alt={token.currency}
            class_name="icon-image"
          />
        </div>
        <span class="token-name">{token.currency}</span>
      {:else}
        <span class="token-name">Select token</span>
      {/if}
      <span class="dropdown-arrow">▼</span>
    </button>
  </div>
  <div class="usd-equivalent">≈ ${usdEquivalent}</div>
</div>

<style>
  .section {
    margin-bottom: 14px;
  }

  .section-label {
    display: block;
    font-size: 11px;
    font-weight: 600;
    color: rgba(0, 0, 0, 0.65);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 6px;
  }

  .input-group {
    display: flex;
    align-items: center;
    gap: 10px;
    background: rgba(255, 255, 255, 0.96);
    border: 1.5px solid rgba(148, 163, 184, 0.22);
    border-radius: 20px;
    transition: all 0.2s ease;
    padding: 6px;
  }

  .input-group:focus-within {
    border-color: #6432c8;
    background: rgba(255, 255, 255, 1);
    box-shadow: 0 0 0 3px rgba(100, 50, 200, 0.08);
  }

  .input-group.disabled {
    background: rgba(248, 250, 252, 0.85);
    border-color: rgba(148, 163, 184, 0.18);
  }

  .amount-input {
    flex: 1;
    border: none;
    background: transparent;
    font-size: 22px;
    font-weight: 700;
    color: rgba(15, 23, 42, 0.95);
    outline: none;
    font-family: inherit;
    min-width: 0;
    line-height: 1.05;
    padding: 14px 16px;
  }

  /* Hide number input spinner */
  .amount-input::-webkit-outer-spin-button,
  .amount-input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  .amount-input[type="number"] {
    -moz-appearance: textfield;
    appearance: textfield;
  }

  .amount-input::placeholder {
    color: rgba(0, 0, 0, 0.35);
  }

  .amount-input:disabled {
    color: rgba(0, 0, 0, 0.5);
    cursor: not-allowed;
  }

  .token-selector {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 10px 12px;
    min-width: 110px;
    max-width: 140px;
    width: auto;
    flex-shrink: 0;
    background: rgba(255, 255, 255, 0.96);
    border: 1px solid rgba(148, 163, 184, 0.3);
    border-radius: 16px;
    cursor: pointer;
    font-weight: 600;
    font-size: 13px;
    color: rgba(15, 23, 42, 0.86);
    transition: all 0.2s ease;
    white-space: nowrap;
    font-family: inherit;
  }

  .token-selector:hover:not(:disabled) {
    background: rgba(100, 50, 200, 0.08);
    border-color: #6432c8;
  }

  .token-selector:disabled {
    opacity: 0.75;
    cursor: not-allowed;
    background: rgba(255, 255, 255, 0.92);
  }

  .amount-input:disabled {
    color: rgba(15, 23, 42, 0.6);
  }

  .token-icon-small {
    width: 24px;
    height: 24px;
    flex-shrink: 0;
  }

  :global(.icon-image) {
    width: 100%;
    height: 100%;
  }

  .token-name {
    font-weight: 600;
    color: rgba(0, 0, 0, 0.82);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 82px;
  }

  .dropdown-arrow {
    font-size: 10px;
    margin-left: 2px;
    opacity: 0.65;
  }

  .usd-equivalent {
    font-size: 12px;
    color: rgba(15, 23, 42, 0.55);
    margin-top: 4px;
    text-align: left;
    font-weight: 500;
  }
</style>
