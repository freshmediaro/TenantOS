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
          <p class="subtitle">Login to your account</p>
          <h2 class="title">Welcome</h2>
        </div>

        <form class="login-form" @submit.prevent>
          <div class="form-group">
            <div class="input-wrapper">
              <input type="email" id="email" name="email" class="form-input peer" placeholder="Email Address" required />
              <label for="email" class="form-label">Email Address</label>
              <div class="input-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"/></svg>
              </div>
            </div>
          </div>

          <div class="form-group">
            <div class="input-wrapper">
              <input type="password" id="password" name="password" class="form-input peer" placeholder="Password" required />
              <label for="password" class="form-label">Password</label>
              <div class="input-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
              </div>
              <button type="button" class="password-toggle">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
              </button>
            </div>
          </div>

          <div class="form-options">
            <div class="checkbox-group">
              <input type="checkbox" id="remember" name="remember" class="form-checkbox" />
              <label for="remember" class="checkbox-label">Remember Password</label>
            </div>
            <router-link to="/forgot" class="forgot-link">Forgot Password?</router-link>
          </div>

          <div class="form-group">
            <button type="submit" class="submit-button" @click="$router.push('/2fa-email')">Login</button>
          </div>

          <div class="form-footer">
            <span class="footer-text">Don't have an account? </span>
            <router-link to="/register" class="footer-link">Register</router-link>
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

