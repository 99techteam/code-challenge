<script lang="ts">
  import type { TypeToken } from "../types";
  import LazyImage from "./LazyImage.svelte";

  const {
    isOpen = false,
    tokens = [],
    selectedToken = null,
    excludedToken = null,
    onSelect,
    onClose,
  }: {
    isOpen?: boolean;
    tokens?: TypeToken[];
    selectedToken?: TypeToken | null;
    excludedToken?: TypeToken | null;
    onSelect?: (token: TypeToken) => void;
    onClose?: () => void;
  } = $props();

  let searchQuery = $state("");
  let searchInput = $state<HTMLInputElement | undefined>(undefined);

  const filteredTokens = $derived(
    tokens.filter((t) => {
      const matchesSearch = t.currency
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const isExcluded = excludedToken
        ? t.currency === excludedToken.currency
        : false;
      return matchesSearch && !isExcluded;
    }),
  );

  function handleSelectToken(token: TypeToken) {
    onSelect?.(token);
  }

  function handleClose() {
    onClose?.();
  }

  $effect(() => {
    if (!isOpen) return;

    function handleClickOutside(e: MouseEvent) {
      if (!(e.target as HTMLElement).closest(".dropdown-trigger")) {
        handleClose();
      }
    }

    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  });

  $effect(() => {
    if (isOpen && searchInput) {
      setTimeout(() => searchInput?.focus(), 0);
    }
  });
</script>

{#if isOpen}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <div class="token-dropdown" onclick={handleClose} role="presentation">
    <div
      class="dropdown-content"
      onclick={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
      tabindex={-1}
    >
      <input
        type="text"
        class="dropdown-search"
        placeholder="🔍 Search token..."
        bind:value={searchQuery}
        bind:this={searchInput}
      />
      <div class="token-list">
        {#if filteredTokens.length === 0}
          <div class="no-data">No tokens found</div>
        {:else}
          {#each filteredTokens as token (token)}
            <button
              class="token-item"
              class:selected={token.currency === selectedToken?.currency}
              onclick={() => handleSelectToken(token)}
              type="button"
            >
              <div class="token-icon-wrapper">
                <LazyImage
                  src={token.iconURL}
                  alt={token.currency}
                  class_name="token-icon"
                />
              </div>
              <div class="token-info">
                <span class="token-name">{token.currency}</span>
              </div>
              <span class="token-price">${token.price.toFixed(4)}</span>
            </button>
          {/each}
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
  .token-dropdown {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    animation: fadeIn 0.2s ease;
    padding: 16px;
  }

  .dropdown-content {
    width: 100%;
    max-width: 420px;
    max-height: 62vh;
    background: #ffffff;
    border-radius: 24px;
    border: 1px solid rgba(148, 163, 184, 0.2);
    box-shadow: 0 24px 70px rgba(15, 23, 42, 0.18);
    display: flex;
    flex-direction: column;
    animation: dropdownSlide 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
    overflow: hidden;
  }

  .dropdown-search {
    padding: 14px 18px;
    border: none;
    background: rgba(248, 250, 252, 1);
    font-size: 14px;
    font-weight: 500;
    outline: none;
    font-family: inherit;
    flex-shrink: 0;
    border-bottom: 1px solid rgba(148, 163, 184, 0.16);
  }

  .dropdown-search::placeholder {
    color: rgba(0, 0, 0, 0.4);
  }

  .token-list {
    overflow-y: auto;
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .token-item {
    width: 100%;
    padding: 14px 18px;
    border: none;
    background: transparent;
    cursor: pointer;
    display: grid;
    grid-template-columns: auto 1fr auto auto;
    align-items: center;
    gap: 12px;
    transition:
      background 0.15s ease,
      transform 0.15s ease;
    font-family: inherit;
    border-bottom: 1px solid rgba(148, 163, 184, 0.18);
    text-align: left;
  }

  .token-item:hover {
    background: rgba(100, 50, 200, 0.08);
    transform: translateX(1px);
  }

  .token-item.selected {
    background: rgba(100, 50, 200, 0.12);
    box-shadow: inset 0 0 0 1px rgba(100, 50, 200, 0.18);
  }

  .no-data {
    padding: 28px 18px;
    color: rgba(55, 65, 81, 0.5);
    text-align: center;
    font-size: 14px;
    line-height: 1.5;
  }

  .token-item:last-child {
    border-bottom: none;
  }

  .token-icon-wrapper {
    width: 32px;
    height: 32px;
    flex-shrink: 0;
  }

  :global(.token-icon) {
    width: 100%;
    height: 100%;
  }

  .token-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .token-name {
    font-size: 14px;
    color: rgba(15, 23, 42, 0.9);
    font-weight: 700;
  }

  .token-item.selected .token-name {
    color: #3730a3;
  }

  .token-item.selected .token-price {
    color: #1d4ed8;
  }

  .token-price {
    font-weight: 600;
    color: rgba(55, 65, 81, 0.75);
    font-size: 13px;
    white-space: nowrap;
  }

  .token-item.selected .token-price {
    color: #4338ca;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes dropdownSlide {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
