<script setup lang="ts">
import { onMounted } from 'vue'
onMounted(() => { document.body.className = 'packagespage views-page' })
</script>

<template>
  <div class="register-container">
    <div class="logo-section">
      <div class="logo-wrapper">
        <router-link to="/login"><img src="/onbording/img/logo.png" alt="TenantOS" class="logo" /></router-link>
      </div>
    </div>

    <div class="form-header">
      <p class="subtitle">Choose the best view for your dashboard.</p>
      <h2 class="title">Setup your experience</h2>
    </div>

    <div class="packages-packages">
      <div class="main-card">
        <div class="card-content">
          <a href="#">
            <div class="package-grid">
              <div class="package-card" data-package="website">
                <div class="pkgs-image"><img src="/onbording/img/desktopmode.png" alt="Desktop"></div>
                <header class="pkgs-header">
                  <h3 class="pkgs-title">Desktop Mode</h3>
                  <p class="pkgs-cycle">A multitask multi-window OS like desktop experienceode</p>
                </header>
              </div>
            </div>
          </a>
        </div>
        <div class="experience-demo">View demo</div>
      </div>

      <div class="main-card">
        <div class="card-content">
          <div class="package-grid">
            <div class="package-card" data-package="website">
              <div class="pkgs-image"><img src="/onbording/img/tabletmode.png" alt="Desktop"></div>
              <header class="pkgs-header">
                <h3 class="pkgs-title">Tablet Mode</h3>
                <p class="pkgs-cycle">A multitask multi-window Tablet like experience</p>
              </header>
            </div>
          </div>
        </div>
        <div class="experience-demo">View demo</div>
      </div>

      <div class="main-card">
        <div class="card-content">
          <div class="package-grid">
            <div class="package-card" data-package="website">
              <div class="pkgs-image"><img src="/onbording/img/easymode1.png" alt="Desktop"></div>
              <header class="pkgs-header">
                <h3 class="pkgs-title">Easy Mode</h3>
                <p class="pkgs-cycle">Easiest way to manage your project without windows or multitask</p>
              </header>
            </div>
          </div>
        </div>
        <div class="experience-demo">View demo</div>
      </div>
    </div>

    <div class="experience-demo">You can change your experience later</div>
  </div>
</template>

<style scoped>
</style>

