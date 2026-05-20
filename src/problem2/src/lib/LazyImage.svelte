<script lang="ts">
  import { onMount } from "svelte";

  const {
    src = undefined,
    alt = "",
    class_name = "",
  }: {
    src?: string;
    alt?: string;
    class_name?: string;
  } = $props();

  let loaded = $state(false);
  let error = $state(false);

  onMount(() => {
    if (!src) return;
    const img = new Image();
    img.onload = () => { loaded = true; };
    img.onerror = () => { error = true; };
    img.src = src;
  });
</script>

{#if error}
  <div class="placeholder {class_name}" title={alt}>🪙</div>
{:else if loaded}
  <img {src} {alt} class={class_name} />
{:else}
  <div class="placeholder {class_name}" title={alt}>⏳</div>
{/if}

<style>
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    background: rgba(0, 0, 0, 0.05);
    border-radius: 50%;
  }
</style>
