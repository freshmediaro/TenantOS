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
          <h2 class="title">Your payment has been processed successfully</h2>
        </div>
        <div class="confirmation-image-container">
          <img src="/onbording/img/checkmark.png" alt="Confirmation" class="confirmation-image">
        </div>
        <div class="twofa-description">Your account has been created successfully. You can start setting up your environment now.</div>
        <button type="button" class="submit-button" id="cc_pay_btn" @click="$router.push('/views-setup')">Setup environment</button>
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

