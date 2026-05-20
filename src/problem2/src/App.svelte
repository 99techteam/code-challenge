<script lang="ts">
  import { onMount } from "svelte";
  import FancyForm from "./lib/FancyForm.svelte";
  import Spinner from "./lib/Spinner.svelte";
  import IntroOverlay from "./lib/IntroOverlay.svelte";
  import type { ITokenDTO, TypeToken } from "./types";

  let isLoading = $state(true);
  let error = $state("");
  let tokens = $state<TypeToken[]>([]);
  let showIntro = $state(true);

  onMount(async () => {
    try {
      const res = await fetch("https://interview.switcheo.com/prices.json");
      if (!res.ok) {
        error = "Failed to fetch prices";
        isLoading = false;
        return;
      }
      const data: ITokenDTO[] = await res.json();

      const currencyMap = new Map<string, ITokenDTO>();
      data.forEach((item) => {
        const existing = currencyMap.get(item.currency);
        if (!existing || item.price > 0) {
          currencyMap.set(item.currency, item);
        }
      });

      const tokenList: TypeToken[] = Array.from(currencyMap.values())
        .filter((token) => token.price > 0)
        .map((token) => {
          let renameToken = token.currency;
          if (token.currency === "STEVMOS") {
            renameToken = "stEVMOS";
          }
          if (token.currency === "RATOM") {
            renameToken = "rATOM";
          }
          if (token.currency === "STOSMO") {
            renameToken = "stOSMO";
          }
          if (token.currency === "STATOM") {
            renameToken = "stATOM";
          }
          if (token.currency === "STLUNA") {
            renameToken = "stLUNA";
          }
          return {
            ...token,
            iconURL: `https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/${renameToken}.svg`,
          } as TypeToken;
        })
        .sort((a, b) => a.currency.localeCompare(b.currency));
      tokens = tokenList;
      isLoading = false;
    } catch (err) {
      error = err instanceof Error ? err.message : "Failed to load tokens";
      isLoading = false;
    }
  });
</script>

{#if showIntro}
  <IntroOverlay onComplete={() => (showIntro = false)} />
{/if}

{#if !showIntro}
  {#if isLoading}
    <section class="h-screen w-screen flex items-center justify-center">
      <Spinner />
    </section>
  {:else if error}
    <section class="h-screen w-screen flex items-center justify-center">
      <p class="text-red-500 text-lg">{error}</p>
    </section>
  {:else}
    <section class="h-screen w-screen flex items-center justify-center">
      <FancyForm {tokens} />
    </section>
  {/if}
{/if}
