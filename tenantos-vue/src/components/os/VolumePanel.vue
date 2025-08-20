<script setup lang="ts">
</script>

<template>
  <div id="volume-panel" class="volume-panel">
    <button id="close-volume-panel" class="close-volume-panel-btn" title="Close"><i class="fas fa-times"></i></button>
    <div class="music-panel-box">
      <div class="music-panel-content">
        <div class="music-info-block">
          <div class="music-title">Alina Eremia - Cea mai frum...</div>
          <div class="music-meta">Alien Station &bull; Alien Rock</div>
        </div>
        <div class="music-album-art-block"><img src="https://i.imgur.com/4M34hi2.png" alt="Album Art" /></div>
      </div>
      <div class="music-progress-row">
        <input type="range" class="music-progress-slider" min="0" max="315" value="47">
        <div class="music-time-row"><span class="music-current-time">0:47</span><span class="music-total-time">5:15</span></div>
      </div>
      <div class="music-controls-row">
        <button class="music-btn" title="Playlist"><i class="fas fa-list"></i></button>
        <button class="music-btn" title="Devices"><i class="fas fa-laptop"></i></button>
        <button class="music-btn" title="Previous"><i class="fas fa-backward"></i></button>
        <button class="music-btn play-btn" title="Play/Pause"><i class="fas fa-pause"></i></button>
        <button class="music-btn" title="Next"><i class="fas fa-forward"></i></button>
        <button class="music-btn" title="Repeat"><i class="fas fa-retweet"></i></button>
        <button class="music-btn" title="Shuffle"><i class="fas fa-random"></i></button>
      </div>
    </div>
    <div class="volume-panel-box">
      <div class="volume-slider-panel">
        <i class="fas fa-volume-up"></i>
        <input type="range" id="browser-volume-slider" min="0" max="100" value="75">
        <span id="volume-percentage">NaN</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>

