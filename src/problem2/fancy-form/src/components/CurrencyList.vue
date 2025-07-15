<script setup>
import { watch, reactive, ref, defineEmits } from "vue";
import { useTokensStore } from "../stores/tokens";

const emit = defineEmits(["handleClick"]);
const { filterString, visible } = defineProps({
  filterString: String,
  visible: Boolean,
});
const { tokens } = useTokensStore();
const tokenData = reactive({ tokens: [...tokens] });
const selected = ref(false);

const handleClick = (token) => {
  emit("token", token);
  selected.value = true;
};

watch(
  () => filterString,
  (v) => {
    if (!v) tokenData.tokens = [...tokens];
    if (selected.value) {
      selected.value = false;
      return;
    }
    tokenData.tokens = tokens.filter((token) => {
      const tokenName = token.currency.trim().toLowerCase();
      return tokenName.includes(v);
    });
  }
);

watch(
  () => visible,
  (v) => {
    if (v) tokenData.tokens = [...tokens];
  }
);
</script>

<template>
  <ul>
    <li v-for="token in tokenData.tokens" @click="handleClick(token)">
      <div>
        <img
          :src="`public/tokens/${token.currency}.svg`"
          :alt="token.currency"
          width="25px"
        />
      </div>
      <div>{{ token.currency }}</div>
    </li>
  </ul>
</template>

<style lang="scss" scope>
ul {
  list-style: none;
  padding: 0;
  margin: 0;

  li {
    padding: 5px 15px;
    font-weight: 600;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    &:hover {
      background-color: rgba($color: #000000, $alpha: 0.1);
    }
  }
}
</style>
