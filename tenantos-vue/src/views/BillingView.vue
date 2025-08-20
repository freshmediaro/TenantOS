<script setup lang="ts">
import { onMounted } from 'vue'
onMounted(() => { document.body.className = '' })
</script>

<template>
  <div class="register-container">
    <div class="logo-section">
      <div class="logo-wrapper">
        <router-link to="/login"><img src="/onbording/img/logo.png" alt="TenantOS" class="logo" /></router-link>
      </div>
    </div>

    <div class="main-card">
      <div class="cc-topbar">
        <button type="button" class="cc-icon-btn" @click="$router.back()" aria-label="Back">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><path d="M15 19l-7-7 7-7" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/></svg>
        </button>
        <router-link to="/login" class="cc-icon-btn" aria-label="Close">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><path d="M6 18L18 6M6 6l12 12" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/></svg>
        </router-link>
      </div>
      <div class="card-content">
        <div class="form-header">
          <p class="subtitle">Displayed on invoices</p>
          <h2 class="title">Billing</h2>
        </div>

        <form class="register-form" @submit.prevent>
          <div class="form-group">
            <div class="input-wrapper">
              <input type="text" id="company_name" class="form-input peer" placeholder="Company Name" required />
              <label for="company_name" class="form-label">Company Name</label>
              <div class="input-icon"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg></div>
            </div>
          </div>

          <div class="billing-form-row">
            <div class="form-group">
              <div class="input-wrapper">
                <input type="text" id="vat_number" class="form-input peer" placeholder="VAT Number" required />
                <label for="vat_number" class="form-label">VAT Number</label>
                <div class="input-icon"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg></div>
              </div>
            </div>
            <div class="form-group">
              <div class="input-wrapper">
                <input type="text" id="id_number" class="form-input peer" placeholder="ID Number" required />
                <label for="id_number" class="form-label">ID Number</label>
                <div class="input-icon"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg></div>
              </div>
            </div>
          </div>

          <div class="form-group">
            <div class="dropdown-wrapper billing-dropdown">
              <button type="button" class="dropdown-trigger billing-trigger peer" data-empty="true"><span class="dropdown-value"></span></button>
              <div class="dropdown-chevron"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg></div>
              <label class="dropdown-label">Country</label>
              <div class="input-icon"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg></div>
              <div class="dropdown-menu hidden">
                <div class="dropdown-search-wrapper"><input type="text" class="dropdown-search" placeholder="Search country..." /></div>
                <div class="dropdown-options">
                  <div class="dropdown-option" data-value="romania" data-code="+40"><span class="flag-emoji">🇷🇴</span> Romania (+40)</div>
                  <div class="dropdown-option" data-value="hungary" data-code="+36"><span class="flag-emoji">🇭🇺</span> Hungary (+36)</div>
                  <div class="dropdown-option" data-value="germany" data-code="+49"><span class="flag-emoji">🇩🇪</span> Germany (+49)</div>
                </div>
              </div>
            </div>
          </div>

          <div class="billing-form-row">
            <div class="form-group">
              <div class="input-wrapper">
                <input type="text" id="county" class="form-input peer" placeholder="County/State" required />
                <label for="county" class="form-label">County/State</label>
                <div class="input-icon"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3"/></svg></div>
              </div>
            </div>
            <div class="form-group">
              <div class="input-wrapper">
                <input type="text" id="city" class="form-input peer" placeholder="City" required />
                <label for="city" class="form-label">City</label>
                <div class="input-icon"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg></div>
              </div>
            </div>
          </div>

          <div class="form-group">
            <div class="input-wrapper">
              <input type="text" id="address" class="form-input peer" placeholder="Street Address" required />
              <label for="address" class="form-label">Street Address</label>
              <div class="input-icon"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg></div>
            </div>
          </div>

          <div class="billing-form-row">
            <div class="form-group billing-building-group">
              <div class="input-wrapper">
                <input type="text" id="building" class="form-input peer" placeholder="Building" required />
                <label for="building" class="form-label">Building</label>
                <div class="input-icon"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg></div>
              </div>
            </div>
            <div class="form-group billing-zip-group">
              <div class="input-wrapper">
                <input type="text" id="zip_code" class="form-input peer" placeholder="ZIP/Postal Code" required />
                <label for="zip_code" class="form-label">ZIP/Postal Code</label>
                <div class="input-icon"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg></div>
              </div>
            </div>
          </div>

          <div class="terms-group">
            <input type="checkbox" id="terms" class="form-checkbox" checked />
            <label for="terms" class="terms-label">I agree to use this data for invocing purposes.</label>
          </div>

          <div class="form-group">
            <button type="submit" class="submit-button" @click="$router.push('/payment')">Checkout</button>
          </div>

          <div class="form-footer">
            <span class="footer-text">I do not want a company account </span>
            <router-link to="/login" class="footer-link">Skip billing</router-link>
          </div>
        </form>
      </div>
    </div>

    <div class="page-footer">
      <div class="footer-links">
        <a href="#" class="footer-link">Terms of use</a>
        <span class="separator">|</span>
        <a href="#" class="footer-link">Privacy policy</a>
        <span class="separator">|</span>
        <a href="#" class="footer-link">Cookies</a>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>

