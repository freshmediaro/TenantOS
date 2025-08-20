<script setup lang="ts">
import { onMounted } from 'vue'

onMounted(() => {
  document.body.className = 'packagespage'
})
</script>

<template>
  <div class="register-container">
    <div class="logo-section">
      <div class="logo-wrapper">
        <router-link to="/login">
          <img src="/onbording/img/logo.png" alt="TenantOS" class="logo" />
        </router-link>
      </div>
    </div>

    <div class="form-header">
      <p class="subtitle">Choose the best plan for your business.</p>
      <h2 class="title">
        <button type="button" class="cc-icon-btn-packages" @click="$router.back()" aria-label="Back">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
            <path d="M15 19l-7-7 7-7" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />
          </svg>
        </button>
        Plans &amp; Pricing
      </h2>
    </div>

    <div class="packages-packages">
      <div class="main-card">
        <div class="card-content">
          <router-link class="package-grid" to="/domain">
            <div class="package-card" data-package="website">
              <header class="pkgs-header">
                <h3 class="pkgs-title">Entrepreneur</h3>
                <p class="pkgs-sub">One man army</p>
              </header>
              <div class="pkgs-price"><span class="pkgs-amount">39</span><span class="pkgs-sup">99</span><span class="pkgs-currency">€</span></div>
              <div class="pkgs-cycle">billed monthly</div>
              <div class="co-divider"></div>
              <ul class="pkgs-features">
                <li class="ok">1 Staff Account (You)</li>
                <li class="ok">1 Email Address</li>
                <li class="ok">20 GB Cloud Storage</li>
                <li class="ok">Alien Payments</li>
                <li class="ok">100 GB Data Transfer</li>
                <li class="no">More staff accounts</li>
              </ul>
            </div>
          </router-link>
        </div>
      </div>

      <div class="main-card">
        <div class="card-content">
          <div class="package-grid">
            <div class="package-card" data-package="marketplace">
              <header class="pkgs-header">
                <h3 class="pkgs-title">Business</h3>
                <p class="pkgs-sub">Startups &amp; small businesses</p>
              </header>
              <div class="pkgs-price"><span class="pkgs-amount">69</span><span class="pkgs-sup">99</span><span class="pkgs-currency">€</span></div>
              <div class="pkgs-cycle">billed monthly</div>
              <div class="co-divider"></div>
              <ul class="pkgs-features">
                <li class="ok">3 Staff Accounts (You + 2)</li>
                <li class="ok">3 Email Addresses</li>
                <li class="ok">50 GB Cloud Storage</li>
                <li class="ok">Alien Payments</li>
                <li class="ok">300 GB Data Transfer</li>
                <li class="ok">More staff accounts</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div class="main-card">
        <div class="card-content">
          <div class="package-grid">
            <div class="package-card" data-package="saasapp">
              <header class="pkgs-header">
                <h3 class="pkgs-title">Enterprise</h3>
                <p class="pkgs-sub">Grown up businesses</p>
              </header>
              <div class="pkgs-price enterprise-contact-us"><span class="pkgs-amount">Contact us</span></div>
              <div class="pkgs-cycle">get in touch</div>
              <div class="co-divider"></div>
              <ul class="pkgs-features">
                <li class="ok">10 Staff Accounts (You + 9)</li>
                <li class="ok">10 Email Addresses</li>
                <li class="ok">100 GB Cloud Storage</li>
                <li class="ok">100+ Payment Gateways</li>
                <li class="ok">500 GB Data Transfer</li>
                <li class="ok">Dedicated servers</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>

