<script setup lang="ts">
import { onMounted } from 'vue'
onMounted(() => { document.body.className = 'payment-page' })
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
          <p class="subtitle">Enter your card details</p>
          <h2 class="title">Payment</h2>
        </div>

        <div class="cc-merchant">
          <div class="cc-merchant-label">Billing company:</div>
          <div class="cc-merchant-name">Fresh Media &amp; Marketing SRL</div>
        </div>

        <div class="co-summary">
          <form class="cc-form" @submit.prevent>
            <div class="cc-field">
              <div class="input-wrapper">
                <input type="text" id="cc_name" class="form-input peer" placeholder="Name on the card" autocomplete="cc-name" required>
                <label for="cc_name" class="form-label">Name on the card</label>
                <div class="input-icon"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg></div>
              </div>
            </div>

            <div class="cc-field cc-number-field">
              <div class="input-wrapper">
                <input type="text" id="cc_number" class="form-input peer cc-number-input" placeholder="Card number" inputmode="numeric" autocomplete="cc-number" maxlength="23" required>
                <label for="cc_number" class="form-label">Card number</label>
                <div class="input-icon"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2 7a2 2 0 012-2h16a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V7z"/></svg></div>
                <div class="cc-brands" aria-hidden="true"><span class="cc-brand cc-visa">VISA</span></div>
              </div>
            </div>

            <div class="cc-field cc-split-group">
              <div class="cc-col">
                <div class="input-wrapper">
                  <input type="text" id="cc_exp" class="form-input peer" placeholder="MM / YY" inputmode="numeric" autocomplete="cc-exp" maxlength="7" required>
                  <label for="cc_exp" class="form-label">MM / YY</label>
                  <div class="input-icon"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3M3 11h18M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg></div>
                </div>
              </div>
              <div class="cc-col">
                <div class="input-wrapper">
                  <input type="text" id="cc_cvc" class="form-input peer" placeholder="CVC" inputmode="numeric" autocomplete="cc-csc" maxlength="4" required>
                  <label for="cc_cvc" class="form-label">CVC</label>
                  <div class="input-icon"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c0-1.657 1.567-3 3.5-3S19 9.343 19 11v5H5v-5c0-1.657 1.567-3 3.5-3S12 9.343 12 11z"/></svg></div>
                </div>
              </div>
            </div>

            <div class="checkout-summary">
              <div class="co-row">
                <div class="co-info">
                  <div class="co-label">Website: <span class="co-strong">One man army</span></div>
                  <div class="co-sub">Per month</div>
                </div>
                <div class="co-toggl1e"><span class="co-price-chip">$43,99</span></div>
              </div>
              <div class="co-divider"></div>
              <div class="co-row">
                <div class="co-info">
                  <div class="co-label">New Domain: <span class="co-strong">mydomain.ro</span></div>
                  <div class="co-sub">Per year</div>
                </div>
                <div class="co-toggl1e"><span class="co-price-chip">$43,99</span></div>
              </div>
              <div class="co-divider"></div>
              <div class="co-row">
                <div class="co-info">
                  <div class="co-label">Discount: <span class="co-strong">Winter</span></div>
                  <div class="co-sub">From the subscription</div>
                </div>
                <div class="co-toggl1e"><span class="co-price-chip">- $43,99</span></div>
              </div>
              <div class="co-divider"></div>
            </div>
          </form>
        </div>

        <div class="cc-total">
          <div class="cc-total-label">Total</div>
          <div class="cc-total-amount-row">
            <div class="cc-total-amount" id="cc_total_display">$ 647.21</div>
            <button type="button" class="cc-currency-toggle" aria-haspopup="listbox" aria-expanded="false" aria-label="Change currency">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><path d="M19 9l-7 7-7-7" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/></svg>
            </button>
            <ul class="cc-currency-menu hidden" role="listbox">
              <li role="option" data-currency="USD" data-symbol-prefix="$" data-symbol-suffix="">$ 647.21</li>
              <div class="co-divider"></div>
              <li role="option" data-currency="EUR" data-symbol-prefix="" data-symbol-suffix=" €">752.7 € </li>
              <div class="co-divider"></div>
              <li role="option" data-currency="RON" data-symbol-prefix="" data-symbol-suffix=" lei">2 583.25 Lei</li>
            </ul>
          </div>
        </div>

        <label class="cc-save"><input type="checkbox" id="cc_save" class="cc-checkbox" checked><span>Save this card in wallet for future payments</span></label>
        <button type="submit" class="submit-button" id="cc_pay_btn" @click="$router.push('/payment-confirmation')">Pay - 647.21 lei</button>
        <img src="/onbording/img/payments.png" alt="Payment" class="payment-image">
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

