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
          <p class="subtitle">Congratulations!</p>
          <h2 class="title">You have successfully created your account</h2>
        </div>
        <div class="confirmation-image-container">
          <router-link to="/verify"><img src="/onbording/img/checkmark.png" alt="Confirmation" class="confirmation-image"></router-link>
        </div>
        <div class="twofa-description-top">We've sent you an email with a link to confirm your account.</div>
        <div class="twofa-description">Please check your inbox and click the link to continue. If you can't find it, check your spam or junk folder.</div>
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

