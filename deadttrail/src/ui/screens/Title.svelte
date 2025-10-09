
<script lang="ts">
  import ImageWithFallback from '$lib/ImageWithFallback.svelte';
  let hasStarted = false;
  function start(){ hasStarted = true; }
</script>

{#if !hasStarted}
  <div class="wrap">
    <ImageWithFallback src="/images/backgrounds/PrisonExterior.png" label="Prison Exterior" width={960} height={540} category="background" alt="Prison Exterior" />
    <div class="overlay">
      <h1>DEAD TRAIL</h1>
      <p>Oregon Trail–style survival. No downloads. Runs in your browser.</p>
      <button on:click={start}>Start</button>
    </div>
  </div>
{:else}
  <div class="card">
    <h2>Demo Screen</h2>
    <p>Your game screens (Camp, Travel, EventModal) will mount after this.</p>
    <div class="row">
      <ImageWithFallback src="/images/portraits/John.png" label="John" width={200} height={240} category="portrait" />
      <ImageWithFallback src="/images/portraits/Ed.png" label="Ed" width={200} height={240} category="portrait" />
      <ImageWithFallback src="/images/portraits/Jean.png" label="Jean" width={200} height={240} category="portrait" />
    </div>
    <div class="row">
      <ImageWithFallback src="/images/events/RoombaGag.png" label="Roomba Gag" width={300} height={180} category="event" />
      <ImageWithFallback src="/images/backgrounds/CosmicSky.png" label="Cosmic Sky" width={300} height={180} category="background" />
      <ImageWithFallback src="/images/icons/food.png" label="Food" width={80} height={80} category="icon" />
    </div>
  </div>
{/if}

<style>
  .wrap { position: relative; width: 960px; max-width: 100%; margin: 32px auto; }
  .overlay {
    position: absolute; inset: 0; display: grid; place-items: center;
    text-align: center; background: linear-gradient(180deg, rgba(0,0,0,0.35), rgba(0,0,0,0.65));
  }
  h1 { font-size: clamp(28px, 6vw, 56px); margin: 0 0 10px; letter-spacing: 2px; }
  p { color: var(--muted); margin: 0 0 18px; }
  .row { margin-top: 12px; }
  .card { width: 960px; max-width: 95%; margin: 24px auto; }
</style>
