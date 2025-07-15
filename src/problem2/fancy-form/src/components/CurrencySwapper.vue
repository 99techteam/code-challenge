<script setup>
import { watch, reactive, ref } from "vue";
import CurrencyList from "./CurrencyList.vue";

const fromToken = reactive({
  currency: "",
  price: 0,
  thumb: false,
});
const toToken = reactive({
  currency: "",
  price: 0,
  thumb: false,
});
const tokenControls = reactive({
  from: false,
  to: false,
});
const amountToConvert = ref(1);
const result = ref(0);
const error = reactive({
  msg: "",
  isError: true,
});

const getFromToken = ({ currency, price }) => {
  fromToken.currency = currency;
  fromToken.price = price;
  fromToken.thumb = true;
  tokenControls.from = false;
};
const getToToken = ({ currency, price }) => {
  toToken.currency = currency;
  toToken.price = price;
  toToken.thumb = true;
  tokenControls.to = false;
};
const convertToken = () => {
  const amount = +amountToConvert.value;
  const tokenA = fromToken.price;
  const tokenB = toToken.price;

  if (amount <= 0) {
    error.isError = true;
    error.msg = "Amount must be 1 or greater";
    return;
  }

  if (tokenA === 0 || tokenB === 0) {
    error.isError = true;
    error.msg = "Please select a valid token to convert";
    return;
  }

  result.value = (amount * tokenA) / tokenB;
  error.isError = false;
};
const checkAndConvertToken = () => {
  if (fromToken.price === 0 || toToken.price === 0 || result.value === 0)
    return;

  convertToken();
};
const swap = () => {
  const holderA = { ...fromToken };
  const holderB = { ...toToken };

  toToken.currency = holderA.currency;
  toToken.price = holderA.price;
  toToken.thumb = holderA.thumb;

  fromToken.currency = holderB.currency;
  fromToken.price = holderB.price;
  fromToken.thumb = holderB.thumb;

  tokenControls.to = false;
  tokenControls.from = false;

  checkAndConvertToken();
};

watch(amountToConvert, () => {
  checkAndConvertToken();
});

watch(fromToken, () => {
  checkAndConvertToken();
});

watch(toToken, () => {
  checkAndConvertToken();
});
</script>

<template>
  <div class="currency-form-container">
    <div class="currency-form">
      <div class="currency-output currency-box">
        <label for="">Amount</label>
        <input type="number" v-model="amountToConvert" />
      </div>
      <div class="currency-swapper">
        <div class="currency-input currency-box">
          <label for="">From</label>
          <div class="currency-thumb" v-if="fromToken.thumb">
            <img
              :src="`public/tokens/${fromToken.currency}.svg`"
              :alt="fromToken.currency"
              width="25px"
            />
          </div>
          <input
            type="text"
            placeholder="Type to search..."
            v-model="fromToken.currency"
            @focus="tokenControls.from = true"
            @input="fromToken.thumb = false"
            :class="{ 'pl-4': fromToken.thumb }"
          />
          <div class="currency-list">
            <Transition name="fade">
              <CurrencyList
                @token="getFromToken"
                :filterString="fromToken.currency.trim().toLowerCase()"
                :visible="tokenControls.from"
                v-show="tokenControls.from"
              />
            </Transition>
          </div>
        </div>
        <div class="swapper">
          <button @click="swap">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 17 17"
              aria-hidden="true"
            >
              <path
                fill="currentColor"
                fill-rule="evenodd"
                d="M11.726 1.273l2.387 2.394H.667V5h13.446l-2.386 2.393.94.94 4-4-4-4-.94.94zM.666 12.333l4 4 .94-.94L3.22 13h13.447v-1.333H3.22l2.386-2.394-.94-.94-4 4z"
                clip-rule="evenodd"
              ></path>
            </svg>
          </button>
        </div>
        <div class="currency-input currency-b currency-box">
          <label for="">To</label>
          <div class="currency-thumb" v-if="toToken.thumb">
            <img
              :src="`public/tokens/${toToken.currency}.svg`"
              :alt="toToken.currency"
              width="25px"
            />
          </div>
          <input
            type="text"
            placeholder="Type to search..."
            v-model="toToken.currency"
            @focus="tokenControls.to = true"
            @input="toToken.thumb = false"
            :class="{ 'pl-4': toToken.thumb }"
          />
          <div class="currency-list">
            <Transition name="fade">
              <CurrencyList
                @token="getToToken"
                :filterString="toToken.currency.trim().toLowerCase()"
                :visible="tokenControls.to"
                v-show="tokenControls.to"
              />
            </Transition>
          </div>
        </div>
      </div>
    </div>

    <div class="submit-btn-container">
      <div class="break-word" v-if="!error.isError">
        <div class="text-input">
          {{ fromToken.currency }} = {{ fromToken.price }}
        </div>
        <div class="text-input">
          {{ toToken.currency }} = {{ toToken.price }}
        </div>
        <div class="text-result">
          {{ amountToConvert }} {{ fromToken.currency }} = {{ result }}
          {{ toToken.currency }}
        </div>
      </div>
      <div class="error" v-if="error.isError">
        {{ error.msg }}
      </div>
      <button @click="convertToken">Convert</button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.pl-4 {
  padding-left: 44px;
}

.text-input {
  color: #5c667b;
  font-weight: 500;
  margin-bottom: 5px;
  @media only screen and (max-width: 564px) {
    font-size: 13px;
  }
}

.text-result {
  font-size: 30px;
  font-weight: 600;
  color: #f46ac1;
  @media only screen and (max-width: 564px) {
    font-size: 15px;
  }
}

.break-word {
  word-break: break-word;
}

input {
  color: rgb(49 63 91);
  min-height: 84px;
  padding: 8px 16px;
  background-color: #fff;
  border: 1px solid #e8e9ea;
  border-radius: 10px;
  width: 100%;
  box-sizing: border-box;
  transition: outline 0.1s;
  font-size: 30px;

  &:focus {
    outline: 2px solid #a65be7;
  }

  @media only screen and (max-width: 768px) {
    font-size: 18px;
  }
}

.currency {
  &-form-container {
    max-width: 80%;
    width: 100%;
    background-color: #ffffff;
    border-radius: 15px;
    box-shadow: rgba(149, 157, 165, 0.2) 0px 8px 24px;
    padding: 25px;
  }

  &-box {
    position: relative;

    label {
      position: absolute;
      top: 8px;
      left: 16px;
      color: #909797;
      font-size: 14px;
    }
  }

  &-list {
    position: absolute;
    bottom: -10px;
    left: 0;
    transform: translateY(100%);
    height: fit-content;
    max-height: 300px;
    width: 100%;
    overflow-y: auto;
    background-color: #fff;
    border-radius: 10px;
    box-shadow: rgba(0, 0, 0, 0.04) 0px 3px 5px;

    &::-webkit-scrollbar {
      width: 4px;
    }

    &::-webkit-scrollbar-track {
      background: #f1f1f1;
    }

    &::-webkit-scrollbar-thumb {
      background: #a65be7;
    }

    &::-webkit-scrollbar-thumb:hover {
      background: #555;
    }
  }

  &-output,
  &-input {
    flex: 1;
  }

  &-input {
    position: relative;
    input {
      cursor: pointer;
      &::placeholder {
        font-size: 16px;
        opacity: 0.4;
      }
    }
  }

  &-thumb {
    position: absolute;
    top: 50%;
    left: 16px;
    transform: translateY(-50%);
  }

  &-swapper {
    position: relative;
    display: flex;
    gap: 8px;
    flex: 1;

    button {
      width: 100%;
      height: 100%;
      border: 0;
      background-color: transparent;
      cursor: pointer;
    }
  }

  &-form {
    display: flex;
    justify-content: center;
    gap: 8px;
    flex-direction: column;
    @media only screen and (min-width: 992px) {
      flex-direction: row;
    }
  }
}

.submit-btn-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 25px;
  button {
    margin-left: auto;
    justify-self: flex-end;
    background-color: #f46ac1;
    border: 0;
    color: #fff;
    padding: 16px 24px;
    text-transform: uppercase;
    border-radius: 5px;
    cursor: pointer;
    transition: transform 0.2s;

    &:active {
      transform: translateY(2px);
    }
  }
}

.swapper {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 2;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fff;
  box-shadow: rgba(149, 157, 165, 0.2) 0px 8px 24px;

  svg {
    width: 16px;
    height: 16px;
  }
}

.currency-b {
  input {
    padding-left: 32px;

    &.pl-4 {
      padding-left: 60px;
    }
  }

  .currency-thumb {
    left: 32px;
  }

  label {
    left: 32px;
  }
}

.error {
  color: #fc3776;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
