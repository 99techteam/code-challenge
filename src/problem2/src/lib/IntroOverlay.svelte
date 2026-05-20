<script lang="ts">
  import { onMount } from "svelte";

  const { onComplete }: { onComplete: () => void } = $props();

  let isContracting = $state(false);

  onMount(() => {
    const timeout1 = setTimeout(() => {
      isContracting = true;
    }, 300);

    const timeout2 = setTimeout(onComplete, 300 + 600);

    return () => {
      clearTimeout(timeout1);
      clearTimeout(timeout2);
    };
  });
</script>

<div class="overlay" class:contracting={isContracting}></div>

<style>
  .overlay {
    position: fixed;
    inset: 0;
    z-index: 9999;
    pointer-events: none;
    background: linear-gradient(145deg, #6b3bd8 0%, #db4a9c 100%);
    clip-path: circle(150vmax at 50% 50%);
  }

  /* Circle contracts to nothing */
  .contracting {
    animation: circleContract 0.6s ease-in forwards;
  }

  @keyframes circleContract {
    from {
      clip-path: circle(150vmax at 50% 50%);
    }
    to {
      clip-path: circle(0px at 50% 50%);
    }
  }
</style>
