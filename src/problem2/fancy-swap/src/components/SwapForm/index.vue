<template>
  <div class="swap-container">
    <!-- FROM -->
    <div class="swap-card">
      <div class="card-label">From</div>

      <div class="input-group">
        <input
          type="number"
          v-model.number="inputAmount"
          placeholder="0.00"
          min="0"
        />

        <TokenSelect
          v-model="inputToken"
          :initialOptions="tokenOptions"
          :prices="prices"
          placeholder="Select"
          :isSearchable="true"
        />
      </div>

      <div class="balance">
        Balance: {{ balances[inputToken] || 0 }}
      </div>
    </div>

    <!-- Arrow -->
    <button class="swap-arrow" @click="swapDirection">⇅</button>

    <!-- TO -->
    <div class="swap-card">
      <div class="card-label">To</div>

      <div class="input-group">
        <input
          type="text"
          :value="outputAmount"
          placeholder="0.00"
          disabled
        />

        <TokenSelect
          v-model="outputToken"
          :initialOptions="tokenOptions"
          :prices="prices"
          placeholder="Select"
          :isSearchable="true"
        />
      </div>

      <div class="balance">
        Balance: {{ balances[outputToken] || 0 }}
      </div>
    </div>

    <!-- Info -->
    <div class="exchange-info">
      <span>
        1 {{ inputToken }} ≈ {{ exchangeRate }} {{ outputToken }}
      </span>
      <span>Slippage 0.5%</span>
    </div>

    <!-- Error -->
    <p v-if="errorMessage && !loading" class="error-text">
      {{ errorMessage }}
    </p>

    <!-- Button -->
    <button
      class="swap-btn"
      @click="swapTokensInternal"
      :disabled="loading || !!errorMessage"
    >
      {{ buttonText }}
    </button>

    <!-- Success Modal -->
    <transition name="fade">
      <div
        v-if="showModal"
        class="modal-overlay"
        @click.self="showModal = false"
      >
        <div class="modal-content">
          <h3>Transaction Complete</h3>

          <div class="modal-row">
            <span>From</span>
            <span>
              {{ modalData.fromAmount }} {{ modalData.fromToken }}
            </span>
          </div>

          <div class="modal-row">
            <span>To</span>
            <span>
              {{ modalData.toAmount.toFixed(6) }}
              {{ modalData.toToken }}
            </span>
          </div>

          <div class="modal-row">
            <span>Execution Rate</span>
            <span>
              1 {{ modalData.fromToken }} ≈
              {{ modalData.rate }}
              {{ modalData.toToken }}
            </span>
          </div>

          <button class="modal-close" @click="showModal = false">
            Close
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from "vue";
import TokenSelect from "../TokenSelect/index.vue";
import { usePrices } from "../../composables/usePrice.script";
import type { Balances } from "../../type/swap.type";


const { prices, tokens } = usePrices();

const balances = ref<Balances>({
  ETH: 1240.5,
  BNB: 12.8,
  BLUR: 500,
  BUSD: 1000,
});

const inputAmount = ref<number>(0);
const outputAmount = ref<string>("0.00");

const inputToken = ref<string>("ETH");
const outputToken = ref<string>("BNB");

const loading = ref(false);

/* ---------------- Token Options ---------------- */
const tokenOptions = computed(() =>
  tokens.value.map((t) => ({ value: t, label: t }))
);

/* ---------------- Exchange Rate ---------------- */
const exchangeRate = computed(() => {
  const from = prices.value[inputToken.value] || 0;
  const to = prices.value[outputToken.value] || 0;
  if (!from || !to) return "0.000000";
  return (from / to).toFixed(6);
});

/* ---------------- Auto Calculate Output ---------------- */
watch([inputAmount, inputToken, outputToken, prices], () => {
  const from = prices.value[inputToken.value] || 0;
  const to = prices.value[outputToken.value] || 0;

  if (!inputAmount.value || !from || !to) {
    outputAmount.value = "0.00";
  } else {
    outputAmount.value = ((inputAmount.value * from) / to).toFixed(6);
  }
});

/* ---------------- Error Handling ---------------- */
const errorMessage = computed(() => {
  if (!inputAmount.value || inputAmount.value <= 0) {
    return "Enter an amount";
  }

  if (inputToken.value === outputToken.value) {
    return "Select different tokens";
  }

  if ((balances.value[inputToken.value] || 0) < inputAmount.value) {
    return "Insufficient balance";
  }

  return "";
});

/* ---------------- Button Text ---------------- */
const buttonText = computed(() => {
  if (loading.value) return "Processing...";
  if (errorMessage.value) return errorMessage.value;
  return "Swap";
});

/* ---------------- Swap Direction ---------------- */
function swapDirection() {
  const temp = inputToken.value;
  inputToken.value = outputToken.value;
  outputToken.value = temp;
}

/* ---------------- Modal ---------------- */
const showModal = ref(false);

const modalData = ref({
  fromAmount: 0,
  fromToken: "",
  toAmount: 0,
  toToken: "",
  rate: "0",
});

function showSwapModal() {
  modalData.value = {
    fromAmount: inputAmount.value,
    fromToken: inputToken.value,
    toAmount: parseFloat(outputAmount.value),
    toToken: outputToken.value,
    rate: exchangeRate.value,
  };

  showModal.value = true;
}

/* ---------------- Execute Swap ---------------- */
function swapTokensInternal() {
  if (errorMessage.value) return;

  loading.value = true;

  setTimeout(() => {
    balances.value[inputToken.value] -= inputAmount.value;
    balances.value[outputToken.value] =
      (balances.value[outputToken.value] || 0) +
      parseFloat(outputAmount.value);

    showSwapModal();

    inputAmount.value = 0;
    loading.value = false;
  }, 1000);
}
</script>

<style src="./index.css"></style>