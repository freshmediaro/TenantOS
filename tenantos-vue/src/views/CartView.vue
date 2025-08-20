<script setup lang="ts">
import { onMounted } from 'vue'
onMounted(() => { document.body.className = 'checkout-page' })
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
          <p class="subtitle">Checkout</p>
          <h2 class="title">Cart</h2>
        </div>

        <div class="co-summary">
          <div class="co-row">
            <div class="co-info">
              <div class="co-label">Website: <span class="co-strong">One man army</span></div>
              <div class="co-sub">Per month</div>
            </div>
            <router-link to="/platform">
              <div class="co-toggle"><span class="co-price-chip">$43,99</span><button class="co-change-btn" type="button">Change</button></div>
            </router-link>
          </div>
          <div class="co-divider"></div>
          <div class="co-row">
            <div class="co-info">
              <div class="co-label">New Domain: <span class="co-strong">mydomain.ro</span></div>
              <div class="co-sub">Per year</div>
            </div>
            <router-link to="/domain">
              <div class="co-toggle"><span class="co-price-chip">$43,99</span><button class="co-change-btn" type="button">Change</button></div>
            </router-link>
          </div>
          <div class="co-divider"></div>
        </div>

        <div class="co-coupon">
          <div class="co-coupon-title">Discount code</div>
          <div id="co_coupon_area">
            <div class="co-coupon-form">
              <input id="co_coupon_input" type="text" class="co-coupon-input" placeholder="Add discount code" />
              <button id="co_apply_btn" class="co-apply-btn" type="button">Apply</button>
            </div>
          </div>
        </div>

        <div class="co-total">
          <div class="co-total-label">Total</div>
          <div class="co-total-amount">$647.21</div>
        </div>

        <button class="submit-button" type="button" @click="$router.push('/billing')">Add billing details <span class="co-arrow">→</span></button>
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

