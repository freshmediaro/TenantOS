<script setup lang="ts">
</script>

<template>
  <div class="start-menu" id="start-menu">
    <div class="start-menu-body">
      <div class="start-menu-left-panel">
        <div class="installed-apps-header">
          <h3>My Apps</h3>
          <button type="button" class="start-menu-category-link"><i class="fas fa-arrow-down-a-z"></i> Alphabet</button>
        </div>
      </div>
      <div class="start-menu-right-sidebar">
        <div class="start-menu-right-sidebar-header">
          <div class="start-menu-right-sidebar-header-left">
            <img src="/img/avatar.png" alt="Site Logo" class="site-logo-round start-menu-right-sidebar-avatar">
            <span class="start-menu-right-sidebar-header-left-name">Michael Muchmore</span>
            <span class="start-menu-right-sidebar-header-website-url">mywebsite.ro</span>
          </div>
          <div class="start-menu-right-sidebar-header-right"></div>
        </div>
        <div class="start-menu-right-sidebar-body">
          <div class="menu-section">
            <h3>WEBSITE</h3>
            <ul class="menu-links-list">
              <li><a href="#" class="menu-item"><i class="fas fa-rocket"></i><span>Website Builder</span><i class="fas fa-chevron-right"></i></a></li>
              <li><a href="#" class="menu-item"><i class="fas fa-box-open"></i><span>Products</span></a></li>
              <li><a href="#" class="menu-item"><i class="fas fa-search-dollar"></i><span>SEO</span><i class="fas fa-chevron-right"></i></a></li>
              <li><a href="#" class="menu-item"><i class="fas fa-chart-pie"></i><span>Analytics</span><i class="fas fa-chevron-right"></i></a></li>
              <li><a href="#" class="menu-item"><i class="fas fa-bullhorn"></i><span>Marketing</span><i class="fas fa-chevron-right"></i></a></li>
              <li><a href="#" class="menu-item"><i class="fas fa-wallet"></i><span>Digital Wallet</span></a></li>
            </ul>
          </div>
          <div class="menu-section">
            <h3>SETTINGS</h3>
            <ul class="menu-links-list">
              <li><a href="#" class="menu-item"><i class="fas fa-cog"></i><span>Settings</span><i class="fas fa-chevron-right"></i></a></li>
              <li><a href="#" class="menu-item"><i class="fas fa-cogs"></i><span>Apps Integrations</span></a></li>
              <li><a href="#" class="menu-item"><i class="fas fa-bell"></i><span>Notifications</span></a></li>
              <li><a href="#" class="menu-item"><i class="fas fa-language"></i><span>Languages</span></a></li>
              <li><a href="#" class="menu-item"><i class="fas fa-users-cog"></i><span>Administrators</span></a></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    <div class="start-menu-footer">
      <div class="start-menu-search-bar-bottom">
        <i class="fas fa-search search-icon-bottom"></i>
        <input type="text" id="start-menu-search-input-bottom" class="start-menu-search-input-bottom" placeholder="Search apps (windows key)">
      </div>
      <button class="start-menu-logout-button">
        <i class="fas fa-sign-out-alt"></i>
        <span>Log Out</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
</style>

