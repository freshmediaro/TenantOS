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
          <p class="subtitle">Recover your password</p>
          <h2 class="title">Forgot Password?</h2>
        </div>

        <form class="login-form" @submit.prevent>
          <div class="form-group">
            <div class="input-wrapper">
              <input type="email" id="email" name="email" class="form-input peer" placeholder="Email Address" required />
              <label for="email" class="form-label">Email Address</label>
              <div class="input-icon"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"/></svg></div>
            </div>
          </div>

          <div class="form-group">
            <button type="submit" class="submit-button">Recover Password</button>
          </div>

          <div class="form-footer">
            <span class="footer-text">Back to </span>
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

