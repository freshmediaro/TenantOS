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
      <div class="card-content">
        <div class="form-header">
          <p class="subtitle">Create account</p>
          <h2 class="title">Register</h2>
        </div>

        <form class="register-form" @submit.prevent>
          <div class="form-group">
            <div class="input-wrapper">
              <input type="text" id="first_name" name="first_name" class="form-input peer" placeholder="First Name" required />
              <label for="first_name" class="form-label">First Name</label>
              <div class="input-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
              </div>
            </div>
          </div>
          <div class="form-group">
            <div class="input-wrapper">
              <input type="text" id="last_name" name="last_name" class="form-input peer" placeholder="Last Name" required />
              <label for="last_name" class="form-label">Last Name</label>
              <div class="input-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
              </div>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group country-group country-phone">
              <div class="dropdown-wrapper">
                <button type="button" class="dropdown-trigger peer" data-empty="true">
                  <span class="dropdown-value"></span>
                </button>
                <div class="dropdown-chevron"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"></svg></div>
                <label class="dropdown-label">Country</label>
                <div class="input-icon"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg></div>
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
            <div class="form-group phone-group">
              <div class="input-wrapper">
                <input type="tel" id="phone_number" name="phone_number" class="form-input peer" placeholder="Phone Number" required />
                <label for="phone_number" class="form-label">Phone Number</label>
              </div>
            </div>
          </div>

          <div class="form-description">⚠️ An SMS will be sent to this number for confirmation and will also be used for security like two-factor authentication.</div>

          <div class="form-group">
            <div class="input-wrapper">
              <input type="email" id="email" name="email" class="form-input peer" placeholder="Email Address" required />
              <label for="email" class="form-label">Email Address</label>
              <div class="input-icon"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"/></svg></div>
            </div>
          </div>
          <div class="form-group">
            <div class="input-wrapper">
              <input type="password" id="password" name="password" class="form-input peer" placeholder="Password" required />
              <label for="password" class="form-label">Password</label>
              <div class="input-icon"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg></div>
              <button type="button" class="password-toggle"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"/></svg></button>
            </div>
          </div>
          <div class="form-group">
            <div class="input-wrapper">
              <input type="password" id="password_confirm" name="password_confirm" class="form-input peer" placeholder="Confirm Password" required />
              <label for="password_confirm" class="form-label">Confirm Password</label>
              <div class="input-icon"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg></div>
              <button type="button" class="password-toggle"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"/></svg></button>
              <div class="error-message">Password does not match</div>
            </div>
          </div>

          <div class="terms-group">
            <input type="checkbox" id="terms" name="terms" class="form-checkbox" checked />
            <label for="terms" class="terms-label">I agree with <a href="#" class="terms-link">terms of use</a> and <a href="#" class="terms-link">privacy policy</a></label>
          </div>

          <div class="form-group">
            <button type="submit" class="submit-button" @click="$router.push('/confirmation')">Create Account</button>
          </div>

          <div class="form-footer">
            <span class="footer-text">Already have an account? </span>
            <router-link to="/login" class="footer-link">Login</router-link>
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

