<script setup lang="ts">
import { onMounted } from 'vue'
onMounted(() => { document.body.className = 'platformpage' })
</script>

<template>
  <div class="register-container">
    <div class="logo-section">
      <div class="logo-wrapper">
        <router-link to="/login"><img src="/onbording/img/logo.png" alt="TenantOS" class="logo" /></router-link>
      </div>
    </div>

    <div class="form-header">
      <p class="subtitle">Select the type of project you want to build</p>
      <h2 class="title">What would you like to build?</h2>
    </div>

    <div class="packages-packages">
      <div class="main-card">
        <div class="card-content">
          <router-link to="/packages">
            <form class="register-form" @submit.prevent>
              <div class="package-grid">
                <div class="package-card" data-package="website">
                  <label class="package-label">
                    <div class="package-header">
                      <div class="package-icon">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"/></svg>
                      </div>
                    </div>
                    <div class="package-features">
                      <ul class="feature-list">
                        <h3 class="package-name">Website</h3>
                        <p class="feature-item">Websites for your business</p>
                      </ul>
                    </div>
                  </label>
                </div>
              </div>
            </form>
          </router-link>
        </div>
      </div>

      <div class="main-card">
        <div class="card-content">
          <form class="register-form" @submit.prevent>
            <div class="package-grid">
              <div class="package-card" data-package="marketplace">
                <label class="package-label">
                  <div class="package-header">
                    <div class="package-icon">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"/></svg>
                    </div>
                  </div>
                  <div class="package-features">
                    <ul class="feature-list">
                      <h3 class="package-name">Marketplace</h3>
                      <p class="feature-item">Transform your website into a marketplace and help others sell online while you earn comissions</p>
                    </ul>
                  </div>
                </label>
              </div>
            </div>
          </form>
        </div>
      </div>

      <div class="main-card">
        <div class="card-content">
          <form class="register-form" @submit.prevent>
            <div class="package-grid">
              <div class="package-card" data-package="saasapp">
                <label class="package-label">
                  <div class="package-header">
                    <div class="package-icon">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"/></svg>
                    </div>
                  </div>
                  <div class="package-features">
                    <ul class="feature-list">
                      <h3 class="package-name">Saas App</h3>
                      <p class="feature-item">Fully hosted and managed web apps inspired by today's most popular SaaS platforms</p>
                    </ul>
                  </div>
                </label>
              </div>
            </div>
          </form>
        </div>
      </div>

      <div class="main-card">
        <div class="card-content">
          <form class="register-form" @submit.prevent>
            <div class="package-grid">
              <div class="package-card" data-package="wordpress">
                <label class="package-label">
                  <div class="package-header">
                    <div class="package-icon">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"/></svg>
                    </div>
                  </div>
                  <div class="package-features">
                    <ul class="feature-list">
                      <h3 class="package-name">Wordpress</h3>
                      <p class="feature-item">World-class security and performance hosting designed for WordPress</p>
                    </ul>
                  </div>
                </label>
              </div>
            </div>
          </form>
        </div>
      </div>

      <div class="main-card">
        <div class="card-content">
          <form class="register-form" @submit.prevent>
            <div class="package-grid">
              <div class="package-card" data-package="custom">
                <label class="package-label">
                  <div class="package-header">
                    <div class="package-icon">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"/></svg>
                    </div>
                  </div>
                  <div class="package-features">
                    <ul class="feature-list">
                      <h3 class="package-name">Dev Shipyard</h3>
                      <p class="feature-item">The fastest and easiest way to deploy and scale your applications serverless</p>
                    </ul>
                  </div>
                </label>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>

