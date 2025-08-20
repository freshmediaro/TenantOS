<script setup lang="ts">
import { onMounted } from 'vue'
onMounted(() => { document.body.className = '' })
</script>

<template>
  <div class="login-container">
    <div class="logo-section">
      <div class="logo-wrapper">
        <router-link to="/login"><img src="/onbording/img/logo.png" alt="TenantOS" class="logo" /></router-link>
      </div>
    </div>

    <div class="main-card">
      <div class="card-content">
        <div class="form-header">
          <p class="subtitle">Identity verification</p>
          <h2 class="title">Authentication</h2>
        </div>

        <div class="twofa-description">We’ve sent a text message with a verification code to the phone number <strong style="color:#ffffff;">+402 155 544 555</strong></div>

        <form class="twofa-form" @submit.prevent>
          <div class="form-group">
            <div class="twofa-inputs-wrapper">
              <input type="text" id="code1" class="twofa-input peer" maxlength="1" required />
              <input type="text" id="code2" class="twofa-input peer" maxlength="1" required />
              <input type="text" id="code3" class="twofa-input peer" maxlength="1" required />
              <input type="text" id="code4" class="twofa-input peer" maxlength="1" required />
              <input type="text" id="code5" class="twofa-input peer" maxlength="1" required />
              <input type="text" id="code6" class="twofa-input peer" maxlength="1" required />
            </div>
            <label class="twofa-label">Enter 6-digit code</label>
          </div>

          <div class="form-footer">
            <span class="footer-text">Didin’t recived the code? </span>
            <a href="#" class="footer-link">Resend code</a>
            <span class="footer-text"> in 2:59 </span>
          </div>

          <div class="form-group">
            <button type="submit" class="submit-button" @click="$router.push('/platform')">Verify identity</button>
          </div>

          <div class="verify-terms-group">
            <label for="terms" class="terms-label">Change phone number <span class="footer-text"> in 14:59 </span></label>
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

