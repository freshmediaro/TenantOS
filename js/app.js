// OS Dashboard App - Cross-browser (Chrome, Firefox, Edge, Safari)
// This app is now tested and compatible with all major browsers. If you find a browser-specific bug, please report it.
// [ ... other globally defined functions or variables if any ... ]

// --- Global mute state ---
let isMuted = false;
let previousVolume = 75; // Default volume

// --- Notifications mute state ---
let isNotificationsMuted = false;

// --- Desktop notification stacking mode ---
// Modes: 'one', 'three', 'all'
let desktopNotificationMode = 'three'; // Default to 3 notifications stacked

// Initialize volume button
const volumeBtn = document.querySelector('#volume-btn');
const volumePanel = document.querySelector('#volume-panel');




//Notification
//Notification system 
let notifications = [];
let lastAddedNotificationId = null;

function clearAllNotifications() {
  const notificationsPanel = document.getElementById('notifications-panel');
  if (notificationsPanel) {
    const notifCards = Array.from(notificationsPanel.querySelectorAll('.notif-card'));
    let cardsToRemove = notifCards.length;
    let prevPositions = notifCards.map(card => card.getBoundingClientRect().top);
    let prevIds = notifCards.map(card => card.dataset.notifId);
    notifCards.forEach((card, idx) => {
      setTimeout(() => {
        card.style.transition = 'transform 0.3s cubic-bezier(0.4,0,0.2,1), opacity 0.3s cubic-bezier(0.4,0,0.2,1)';
        card.style.transform = 'translateX(120%)';
        card.style.opacity = '0';
        setTimeout(() => {
          card.remove();
          // FLIP animate remaining cards up
          const remainingCards = Array.from(notificationsPanel.querySelectorAll('.notif-card'));
          remainingCards.forEach(remCard => {
            const notifId = remCard.dataset.notifId;
            const prevIdx = prevIds.indexOf(notifId);
            if (prevIdx !== -1) {
              const oldTop = prevPositions[prevIdx];
              const newTop = remCard.getBoundingClientRect().top;
              const dy = oldTop - newTop;
              if (dy !== 0) {
                remCard.style.transition = 'none';
                remCard.style.transform = `translateY(${dy}px)`;
                requestAnimationFrame(() => {
                  remCard.style.transition = 'transform 0.35s cubic-bezier(0.4,0,0.2,1)';
                  remCard.style.transform = '';
                });
                remCard.addEventListener('transitionend', function handler() {
                  remCard.style.transition = '';
                  remCard.removeEventListener('transitionend', handler);
                });
              }
            }
          });
          cardsToRemove--;
          if (cardsToRemove === 0) {
            notifications.length = 0;
            renderNotificationsPanel();
            if (typeof updateNotificationsBadge === 'function') updateNotificationsBadge();
            const toastContainer = document.getElementById('os-toast-container');
            if (toastContainer) {
              Array.from(toastContainer.children).forEach(child => child.remove());
            }
          }
        }, 300);
      }, idx * 30); // 60ms delay between each
    });
  } else {
    notifications.length = 0;
    renderNotificationsPanel();
    if (typeof updateNotificationsBadge === 'function') updateNotificationsBadge();
    const toastContainer = document.getElementById('os-toast-container');
    if (toastContainer) {
      Array.from(toastContainer.children).forEach(child => child.remove());
    }
  }
}

function renderNotificationsPanel() {
  const notificationsPanel = document.getElementById('notifications-panel');
  if (!notificationsPanel) return;
  let todaySection = notificationsPanel.querySelector('.notifications-panel-content');
  if (!todaySection) {
    todaySection = document.createElement('div');
    todaySection.className = 'notifications-panel-content';
    notificationsPanel.appendChild(todaySection);
  }
  todaySection.innerHTML = '';
  // Header
  const headerRow = document.createElement('div');
  headerRow.className = 'notifications-header';
  headerRow.innerHTML = `
      <button class="notif-menu-toggle" aria-label="Menu"><i class="fas fa-bars"></i></button>
      <div class="notif-title"><i class="fas fa-bell"></i> <span> Notifications</span></div>
      <button id="notif-close-btn" class="panel-close-btn" aria-label="Close notifications"><i class="fas fa-times"></i></button>
    `;
  todaySection.appendChild(headerRow);
  // Section label (only if notifications exist)
  if (notifications.length > 0) {
    const sectionLabel = document.createElement('div');
    sectionLabel.className = 'notif-section-label';
    sectionLabel.innerHTML = 'Today <span class="notif-clear">Clear all</span>';
    todaySection.appendChild(sectionLabel);
  }
  // List
  const todayList = document.createElement('div');
  todayList.className = 'notif-list';
  notifications.forEach((notif, idx) => {
    const card = document.createElement('div');
    card.className = 'notif-card' + (notif.unread ? ' unread' : '');
    card.dataset.notifId = notif.id;
    card.innerHTML = `
      <button class="notif-delete-btn" title="Delete notification">&times;</button>
      <div class="notif-icon-bg ${notif.iconBgClass}"><i class="fas ${notif.iconClass}"></i></div>
      <div class="notif-content">
        <div class="notif-main-row">
          <span class="notif-main-title">${notif.title}</span>
        </div>
        <div class="notif-desc">${notif.desc}</div>
        <div class="notif-meta">${notif.meta}</div>
      </div>
      <img class="notif-avatar" src="${notif.avatar}" />
    `;
    // --- SLIDE IN ANIMATION ONLY FOR NEWEST ---
    if (notif.id && notif.id === lastAddedNotificationId) {
      card.style.transform = 'translateX(120%)';
      card.style.opacity = '0';
      requestAnimationFrame(() => {
        card.style.transition = 'transform 0.3s cubic-bezier(0.4,0,0.2,1), opacity 0.3s cubic-bezier(0.4,0,0.2,1)';
        card.style.transform = 'translateX(0)';
        card.style.opacity = '1';
      });
    }
    todayList.appendChild(card);
  });
  todaySection.appendChild(todayList);
  if (notifications.length === 0) {
    const emptyMsg = document.createElement('div');
    emptyMsg.className = 'no-notifications-msg';
    emptyMsg.textContent = 'No new notifications';
    emptyMsg.style.cssText = 'display: flex; align-items: center; justify-content: center; height: 100%; color: #888; font-size: 1.15rem; font-weight: 500; text-align: center; margin-top: 60px;';
    todaySection.appendChild(emptyMsg);
  }
  if (typeof enableNotificationSwipeToDelete === 'function') enableNotificationSwipeToDelete();
  if (typeof updateNotificationsBadge === 'function') updateNotificationsBadge();
  // Clear the lastAddedNotificationId after rendering
  lastAddedNotificationId = null;
}

function addNotification({
  title = 'New incoming notification',
  desc = 'This is a test notification',
  meta = 'now',
  iconClass = 'fa-shopping-cart',
  iconBgClass = 'notif-bg-blue',
  avatar = 'img/avatar.png',
  unread = true
} = {}) {
  const notificationsPanel = document.getElementById('notifications-panel');
  let prevPositions = [];
  let prevIds = [];
  let panelOpen = false;
  if (notificationsPanel && notificationsPanel.style.display === 'flex' && notificationsPanel.classList.contains('notifications-visible')) {
    panelOpen = true;
    const prevCards = notificationsPanel.querySelectorAll('.notif-card');
    prevCards.forEach(card => {
      prevPositions.push(card.getBoundingClientRect().top);
      prevIds.push(card.dataset.notifId);
    });
  }
  // Add a unique id (timestamp-based)
  const id = 'notif-' + Date.now() + '-' + Math.random().toString(36).slice(2);
  notifications.unshift({ id, title, desc, meta, iconClass, iconBgClass, avatar, unread });
  lastAddedNotificationId = id;
  renderNotificationsPanel();
  // FLIP animation for existing notifications
  if (panelOpen) {
    const notifCards = notificationsPanel.querySelectorAll('.notif-card');
    notifCards.forEach((card, idx) => {
      const notifId = card.dataset.notifId;
      if (notifId && notifId !== id) {
        const prevIdx = prevIds.indexOf(notifId);
        if (prevIdx !== -1) {
          const oldTop = prevPositions[prevIdx];
          const newTop = card.getBoundingClientRect().top;
          const dy = oldTop - newTop;
          if (dy !== 0) {
            card.style.transition = 'none';
            card.style.transform = `translateY(${dy}px)`;
            requestAnimationFrame(() => {
              card.style.transition = 'transform 0.35s cubic-bezier(0.4,0,0.2,1)';
              card.style.transform = '';
            });
            card.addEventListener('transitionend', function handler() {
              card.style.transition = '';
              card.removeEventListener('transitionend', handler);
            });
          }
        }
      }
    });
  }
  if (notificationsPanel && notificationsPanel.style.display !== 'flex') {
    showToastNotification({
      content: `
        <button class="notif-delete-btn" title="Dismiss notification">&times;</button>
        <div class="notif-icon-bg ${iconBgClass}"><i class="fas ${iconClass}"></i></div>
        <div class="notif-content">
          <div class="notif-main-row">
            <span class="notif-main-title">${title}</span>
          </div>
          <div class="notif-desc">${desc}</div>
          <div class="notif-meta">${meta}</div>
        </div>
        <img class="notif-avatar" src="${avatar}" />
      `
    });
  }
  if (typeof updateNotificationsBadge === 'function') updateNotificationsBadge();
}

// Show a toast notification in the bottom right
function showToastNotification({ content }) {
  let toastContainer = document.getElementById('os-toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'os-toast-container';
    toastContainer.style.position = 'fixed';
    toastContainer.style.bottom = '32px';
    toastContainer.style.right = '32px';
    toastContainer.style.zIndex = '999999';
    toastContainer.style.display = 'flex';
    toastContainer.style.flexDirection = 'column-reverse';
    toastContainer.style.gap = '12px';
    document.body.appendChild(toastContainer);
  }
  const toast = document.createElement('div');
  toast.className = 'os-toast-notification';
  toast.innerHTML = content;
  toast.style.background = 'var(--widget-bg)';
  toast.style.backdropFilter = 'blur(30px)';
  toast.style.color = '#fff';
  toast.style.fontSize = '15px';
  toast.style.fontWeight = '400';
  toast.style.padding = '16px 24px 16px 16px';
  toast.style.borderRadius = '16px';
  toast.style.boxShadow = '0 4px 24px rgba(0,0,0,0.18)';
  toast.style.opacity = '0';
  toast.style.transform = 'translateY(40px)';
  toast.style.transition = 'opacity 0.25s, transform 0.25s';
  toast.style.position = 'relative';
  toast.style.display = 'flex';
  toast.style.alignItems = 'center';
  toast.style.gap = '16px';
  // Dismiss button logic
  const dismissBtn = toast.querySelector('.notif-delete-btn');
  if (dismissBtn) {
    dismissBtn.addEventListener('click', () => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(40px)';
      setTimeout(() => toast.remove(), 250);
    });
  }
  toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  }, 10);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(40px)';
    setTimeout(() => toast.remove(), 250);
  }, 4000);
}

// --- Taskbar Icon Animation Helpers ---
function animateTaskbarIconIn(iconEl) {
  // Force reflow before adding the class
  void iconEl.offsetWidth;
  iconEl.classList.add('anim-in');
  iconEl.addEventListener('animationend', function handler(e) {
    if (e.animationName === 'taskbarAppIconIn') {
      iconEl.classList.remove('anim-in');
      iconEl.removeEventListener('animationend', handler);
    }
  });
}
function animateTaskbarIconOut(iconEl, removeCallback) {
  iconEl.classList.add('anim-out');
  iconEl.addEventListener('animationend', function handler(e) {
    if (e.animationName === 'taskbarAppIconOut') {
      iconEl.removeEventListener('animationend', handler);
      if (iconEl.parentNode) iconEl.parentNode.removeChild(iconEl);
      if (typeof removeCallback === 'function') removeCallback();
    }
  });
}

document.addEventListener('DOMContentLoaded', function () {
  // --- CLEANUP: Remove legacy/incorrect and duplicate desktop icons ---
  var validAppIds = (window.startMenuApps || []).map(app => app.id);
  var seen = new Set();
  document.querySelectorAll('.desktop-icon').forEach(icon => {
    var appId = icon.getAttribute('data-app');
    // Remove if not a valid app id, or if already seen (duplicate)
    if (!appId || !validAppIds.includes(appId) || seen.has(appId)) {
      icon.remove();
    } else {
      seen.add(appId);
    }
  });

  // --- Dynamically create the Taskbar ---
  function createTaskbar() {
    const desktopArea = document.getElementById('desktop-area');
    if (!desktopArea) return;
    // Create taskbar
    const taskbar = document.createElement('div');
    taskbar.className = 'taskbar';
    // Start button
    const startButton = document.createElement('div');
    startButton.className = 'start-button';
    startButton.id = 'start-button';
    startButton.innerHTML = '<i class="fas fa-th"></i>';
    // Search container
    const searchContainer = document.createElement('div');
    searchContainer.className = 'search-container';
    searchContainer.innerHTML = '<input type="text" placeholder="Search" class="search-input"><i class="fas fa-search search-icon"></i>';
    // App icons container
    const appIcons = document.createElement('div');
    appIcons.className = 'taskbar-app-icons';
    appIcons.id = 'taskbar-app-icons';
    // Taskbar right
    const taskbarRight = document.createElement('div');
    taskbarRight.className = 'taskbar-right';
    // Notifications
    const notifIcon = document.createElement('div');
    notifIcon.className = 'taskbar-icon';
    notifIcon.style.position = 'relative';
    notifIcon.innerHTML = '<button id="notifications-btn" class="taskbar-user-btn"><i class="fas fa-bell"></i></button>';
    // Wallet
    const walletIcon = document.createElement('div');
    walletIcon.className = 'taskbar-icon';
    walletIcon.innerHTML = '<button id="wallet-btn" class="taskbar-user-btn"><i class="fas fa-wallet"></i></button>';
    // Fullscreen
    const fullscreenIcon = document.createElement('div');
    fullscreenIcon.className = 'taskbar-icon';
    fullscreenIcon.innerHTML = '<button id="fullscreen-btn" class="taskbar-user-btn"><i class="fas fa-expand"></i></button>';
    // Volume
    const volumeIcon = document.createElement('div');
    volumeIcon.className = 'taskbar-icon';
    volumeIcon.innerHTML = '<button id="volume-btn" class="taskbar-user-btn" title="Volume"><i class="fas fa-volume-up"></i></button>';
    // Global search
    const globalSearchIcon = document.createElement('div');
    globalSearchIcon.className = 'taskbar-icon';
    globalSearchIcon.innerHTML = '<button id="global-search-btn" class="taskbar-search-btn"><i class="fas fa-search"></i></button>';
    // App launcher
    const appLauncherIcon = document.createElement('div');
    appLauncherIcon.className = 'taskbar-icon';
    appLauncherIcon.innerHTML = '<button id="app-launcher-btn" class="taskbar-user-btn"><i class="fas fa-th"></i></button>';
    // Time
    const taskbarTime = document.createElement('div');
    taskbarTime.className = 'taskbar-time';
    taskbarTime.innerHTML = '<span id="current-time">22:30</span><span class="date">Mie. 25 Aprilie</span>';
    // AI button
    const taskbarAI = document.createElement('div');
    taskbarAI.className = 'taskbar-ai';
    taskbarAI.innerHTML = '<button id="ai-chat-btn" class="taskbar-user-btn"><img src="img/alien.png" alt="User" class="user-avatar"></button>';
    // Widgets toggle
    const widgetsToggleBtn = document.createElement('button');
    widgetsToggleBtn.setAttribute('id', 'widgets-toggle-btn');
    widgetsToggleBtn.setAttribute('class', 'taskbar-icon');
    widgetsToggleBtn.innerHTML = '<span id="widgets-toggle-arrow"><i class="fas fa-chevron-right"></i></span>';
    // Append right icons
    taskbarRight.appendChild(notifIcon);
    taskbarRight.appendChild(walletIcon);
    taskbarRight.appendChild(fullscreenIcon);
    taskbarRight.appendChild(volumeIcon);
    taskbarRight.appendChild(globalSearchIcon);
    taskbarRight.appendChild(appLauncherIcon);
    taskbarRight.appendChild(taskbarTime);
    taskbarRight.appendChild(taskbarAI);
    taskbarRight.appendChild(widgetsToggleBtn);
    // Assemble taskbar
    taskbar.appendChild(startButton);
    taskbar.appendChild(searchContainer);
    taskbar.appendChild(appIcons);
    taskbar.appendChild(taskbarRight);
    // Insert into DOM (at the end of .desktop-area)
    desktopArea.appendChild(taskbar);

    // Attach robust listeners to right-side icons (wallet, volume, etc.)
    taskbarRight.querySelectorAll('.taskbar-icon, .taskbar-time, .taskbar-ai').forEach(function(el) {
      if (typeof attachTaskbarIconListeners === 'function') attachTaskbarIconListeners(el);
    });
  }
  createTaskbar();



  // --- Calendar Slide-out Logic ---
  const calendarTodayBtn = document.getElementById('calendar-today-btn');
  const calendarPanel = document.getElementById('calendar-panel');
  const taskbarTime = document.querySelector('.taskbar-time');
  let calendarPanelVisible = false;
  let todayPanel = null;
  
  function positionTodayPanel() {
    if (!todayPanel || !calendarPanel) return;
    const rect = calendarPanel.getBoundingClientRect();
    todayPanel.style.position = 'fixed';
    todayPanel.style.left = rect.left + 'px';
    todayPanel.style.width = rect.width + 'px';
    todayPanel.style.zIndex = 5000;
  }
  
// Centralized close function for today panel
function closeTodayPanel() {
  if (!todayPanel) return;
  todayPanel.classList.remove('active');
  window.removeEventListener('resize', positionTodayPanel);
  setTimeout(() => {
    if (todayPanel && todayPanel.parentNode) {
      todayPanel.parentNode.removeChild(todayPanel);
    }
    todayPanel = null;
  }, 350);
}

// Prevent outside click handler when pressing the today button
calendarTodayBtn.addEventListener('pointerdown', function(e) {
  e.stopPropagation();
});


// Toggle today panel on button click
calendarTodayBtn.addEventListener('click', function() {
  if (!todayPanel) {
    // Open today panel
        todayPanel = document.createElement('div');
        todayPanel.className = 'calendar-today-panel-slide';
        todayPanel.innerHTML = `
          <div style="padding: 18px 18px 10px 18px; color: #fff; font-size: 16px; font-weight: 600; display: flex; align-items: center; justify-content: space-between;">
            <span>Today Panel (placeholder)</span>
            <button class="panel-close-btn" id="calendar-today-panel-close" aria-label="Close today panel"><i class="fas fa-times"></i></button>
          </div>
          <div style="padding: 18px 18px 10px 18px; color: #fff; font-size: 16px; font-weight: 500; display: flex; align-items: center; justify-content: center; height: 100%; text-align: center;">
            <span>No events today</span>
          </div>
        `;
        calendarPanel.parentNode.appendChild(todayPanel);
        positionTodayPanel();
        window.addEventListener('resize', positionTodayPanel);
        setTimeout(() => {
          todayPanel.classList.add('active');
        }, 10);
    
        todayPanel.querySelector('#calendar-today-panel-close').onclick = function(ev) {
          ev.stopPropagation();
          closeTodayPanel();
        };
      } else {
        // Close today panel
        closeTodayPanel();
      }
    });
    
    // Outside click handler: always closes both panels if open
document.addEventListener('mousedown', function(e) {
  const clickedInsideCalendar = calendarPanel && calendarPanel.contains(e.target);
  const clickedInsideTodayPanel = todayPanel && todayPanel.contains(e.target);
  const clickedTaskbarTime = taskbarTime && taskbarTime.contains(e.target);
  const clickedTodayBtn = calendarTodayBtn && calendarTodayBtn.contains(e.target);

  // If click is on the today button, do nothing
  if (clickedTodayBtn) return;

  // If click is outside both panels and taskbar time, close both panels if open
  if (!clickedInsideCalendar && !clickedInsideTodayPanel && !clickedTaskbarTime) {
    if (calendarPanelVisible) hideCalendarPanel();
    if (todayPanel) closeTodayPanel();
  }
});

  



  function showCalendarPanel() {
    if (typeof window.hideWalletSidebar === 'function') window.hideWalletSidebar();
    // Hide ai-chat panel if visible
    const aiChatWindow = document.getElementById('ai-chat-window');
    if (aiChatWindow && aiChatWindow.classList.contains('ai-chat-visible')) {
      aiChatWindow.classList.remove('ai-chat-visible');
      aiChatWindow.addEventListener('transitionend', function handler(e) {
        if (e.propertyName === 'transform') {
          aiChatWindow.style.display = 'none';
          aiChatWindow.removeEventListener('transitionend', handler);
        }
      });
    }
    if (!calendarPanel) return;
    calendarPanel.style.display = 'flex';
    requestAnimationFrame(() => {
      calendarPanel.classList.add('visible');
      calendarPanelVisible = true;
    });
    renderCalendar();
  }
  function hideCalendarPanel() {
    if (!calendarPanel) return;
    calendarPanel.classList.remove('visible');
    calendarPanelVisible = false;
    setTimeout(() => {
      if (!calendarPanelVisible) calendarPanel.style.display = 'none';
    }, 350);
  }
  function toggleCalendarPanel() {
    if (calendarPanelVisible) {
      hideCalendarPanel();
    } else {
      showCalendarPanel();
    }
  }
  if (taskbarTime && calendarPanel) {
    taskbarTime.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleCalendarPanel();
    });
    document.addEventListener('mousedown', (e) => {
      const todayPanel = document.querySelector('.calendar-today-panel-slide');
      const calendarPanel = document.getElementById('calendar-panel');
      const clickedInsideCalendar = calendarPanel && calendarPanel.contains(e.target);
      const clickedInsideTodayPanel = todayPanel && todayPanel.contains(e.target);
      const clickedTaskbarTime = taskbarTime && taskbarTime.contains(e.target);
      const clickedTodayBtn = calendarTodayBtn && calendarTodayBtn.contains(e.target);
    
      // If click is on the today button, do nothing (let its handler run)
      if (clickedTodayBtn) return;
    
      // If click is outside both panels and taskbar time, close both panels if open
      if (!clickedInsideCalendar && !clickedInsideTodayPanel && !clickedTaskbarTime) {
        if (calendarPanelVisible) hideCalendarPanel();
        if (todayPanel) {
          todayPanel.classList.remove('active');
          setTimeout(() => {
            if (todayPanel.parentNode) todayPanel.parentNode.removeChild(todayPanel);
          
        }, 350);
        }
      }
    });
    document.addEventListener('keydown', (e) => {
      if (calendarPanelVisible && e.key === 'Escape') {
        hideCalendarPanel();
      }
    });
  }
  // Simple calendar rendering (current month)
  function renderCalendar() {
    const calendarBody = document.getElementById('calendar-body');
    const calendarMonth = document.getElementById('calendar-month');
    if (!calendarBody || !calendarMonth) return;
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    calendarMonth.textContent = `${monthNames[month]} ${year}`;
    // Calendar grid
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let html = '<div class="calendar-days" style="display:grid;grid-template-columns:repeat(7,1fr);gap:2px;text-align:center;font-size:0.95em;">';
    const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    for (let d of weekDays) html += `<div class='calendar-day' style='font-weight:600;opacity:0.8;'>${d}</div>`;
    html += '</div>';
    html += '<div class="calendar-numbers" style="display:grid;grid-template-columns:repeat(7,1fr);gap:2px;text-align:center;font-size:0.95em;">';
    for (let i = 0; i < firstDay; i++) html += '<div></div>';
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = day === now.getDate();
      html += `<div class='calendar-number' style='padding:6px 0;border-radius:7px;${isToday ? "background:rgba(255,255,255,0.13);font-weight:700;" : ""}'>${day}</div>`;
    }
    html += '</div>';
    calendarBody.innerHTML = html;
  }


  // GLOBAL SEARCH OVERLAY LOGIC
  const globalSearchBtn = document.getElementById('global-search-btn');
  const globalSearchOverlay = document.getElementById('global-search-overlay');
  const globalSearchInput = document.getElementById('global-search-input');
  const globalSearchDropdownBtn = document.getElementById('global-search-dropdown-btn');
  const globalSearchDropdownList = document.getElementById('global-search-dropdown-list');
  const globalSearchSelected = document.getElementById('global-search-selected');
  let globalSearchDropdownOpen = false;
  function showGlobalSearch() {
    if (typeof window.hideWalletSidebar === 'function') window.hideWalletSidebar();
    if (window.innerWidth <= 1023) return;
    globalSearchOverlay.style.display = 'flex';
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        globalSearchOverlay.style.opacity = '1';
        globalSearchOverlay.style.visibility = 'visible';
        if (globalSearchInput) {
          // Force input to be focusable and reset focus state
          globalSearchInput.tabIndex = -1;
          globalSearchInput.blur();
          globalSearchInput.tabIndex = 0;
          globalSearchInput.focus();
          globalSearchInput.select();
        }
        document.body.style.overflow = 'hidden';
      });
    });
  }
  function hideGlobalSearch() {
    globalSearchOverlay.style.opacity = '0';
    globalSearchOverlay.style.visibility = 'hidden';
    setTimeout(() => {
      globalSearchOverlay.style.display = 'none';
      document.body.style.overflow = '';
    }, 300);
    closeDropdown();
  }
  function openDropdown() {
    globalSearchDropdownList.style.display = 'flex';
    globalSearchDropdownOpen = true;
  }
  function closeDropdown() {
    globalSearchDropdownList.style.display = 'none';
    globalSearchDropdownOpen = false;
  }
  if (globalSearchBtn && globalSearchOverlay) {
    globalSearchBtn.addEventListener('click', function () {
      if (window.innerWidth <= 1023) return;
      if (globalSearchOverlay.style.display !== 'flex') {
        globalSearchOverlay.style.display = 'flex';
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            globalSearchOverlay.style.opacity = '1';
            globalSearchOverlay.style.visibility = 'visible';
            if (globalSearchInput) {
              // Remove and re-append input for bulletproof focus
              const parent = globalSearchInput.parentNode;
              const next = globalSearchInput.nextSibling;
              parent.removeChild(globalSearchInput);
              if (next) parent.insertBefore(globalSearchInput, next);
              else parent.appendChild(globalSearchInput);
              setTimeout(() => {
                globalSearchInput.focus();
                globalSearchInput.setSelectionRange(0, globalSearchInput.value.length);
              }, 30);
            }
            document.body.style.overflow = 'hidden';
          });
        });
      } else {
        if (globalSearchInput) {
          // Remove and re-append input for bulletproof focus
          const parent = globalSearchInput.parentNode;
          const next = globalSearchInput.nextSibling;
          parent.removeChild(globalSearchInput);
          if (next) parent.insertBefore(globalSearchInput, next);
          else parent.appendChild(globalSearchInput);
          setTimeout(() => {
            globalSearchInput.focus();
            globalSearchInput.setSelectionRange(0, globalSearchInput.value.length);
          }, 30);
        }
      }
    });
    globalSearchInput && globalSearchInput.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') hideGlobalSearch();
    });
    document.addEventListener('keydown', function (e) {
      if (globalSearchOverlay.style.display !== 'none' && e.key === 'Escape') hideGlobalSearch();
    });
    globalSearchOverlay.addEventListener('mousedown', function (e) {
      if (e.target === globalSearchOverlay) hideGlobalSearch();
    });
    // Dropdown logic
    if (globalSearchDropdownBtn && globalSearchDropdownList) {
      globalSearchDropdownBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        if (globalSearchDropdownOpen) closeDropdown();
        else openDropdown();
      });
      globalSearchDropdownList.addEventListener('mousedown', function (e) {
        e.stopPropagation();
      });
      document.addEventListener('mousedown', function (e) {
        if (globalSearchDropdownOpen && !globalSearchDropdownList.contains(e.target) && e.target !== globalSearchDropdownBtn) {
          closeDropdown();
        }
      });
      Array.from(globalSearchDropdownList.querySelectorAll('.dropdown-item')).forEach(item => {
        item.addEventListener('click', function () {
          globalSearchDropdownList.querySelectorAll('.dropdown-item').forEach(i => i.classList.remove('selected'));
          item.classList.add('selected');
          // Set icon and text in the selected button
          globalSearchSelected.innerHTML = item.innerHTML;
          closeDropdown();
        });
      });
      // On page load, set the default selected icon+text
      const initiallySelected = globalSearchDropdownList.querySelector('.dropdown-item.selected');
      if (initiallySelected) {
        globalSearchSelected.innerHTML = initiallySelected.innerHTML;
      }
    }
  }

  // --- Dynamic Widget Generation ---
  function generateWidgets() {
    const widgetsScreen = document.getElementById('widgets-screen');
    if (!widgetsScreen) return;
    widgetsScreen.innerHTML = '';
    
    // Widget templates for each app (customize as needed)
    const widgetTemplates = {
      'my-files': app => `<div class="widget"><div class="widget-header"><span>${app.name}</span></div><div class="widget-content notification-widget"><div class="big-number">23</div><div class="widget-subtitle">No more events today</div></div></div>`,
      'this-pc': app => `<div class="widget"><div class="widget-header"><span>${app.name}</span></div><div class="widget-content disk-space-widget"><div class="big-number">23%</div><div class="progress-bar"><div class="progress" style="width: 23%"></div></div><div class="widget-subtitle">15 GB / 50 GB</div></div></div>`,
      'web-files': app => `<div class="widget"><div class="widget-content email-widget"><div class="widget-icon"><i class="fas fa-headphones"></i></div><div class="widget-data"><div class="big-number">23</div><div class="widget-subtitle">Unread emails</div></div></div></div>`,
      'trash-sm': app => `<div class="widget"><div class="widget-content messages-widget"><div class="widget-icon"><i class="fas fa-dollar-sign"></i></div><div class="widget-data"><div class="big-number">23</div><div class="widget-subtitle">Unread messages</div></div></div></div>`,
      'settings-sm': app => `<div class="widget"><div class="widget-header"><span>${app.name}</span></div><div class="widget-content"><div class="big-number">Settings</div><div class="widget-subtitle">Configure your system</div></div></div>`,
      'site-builder-sm': app => `<div class="widget"><div class="widget-header"><span>${app.name}</span></div><div class="widget-content"><div class="big-number">Site</div><div class="widget-subtitle">Build your website</div></div></div>`,
      'app-store-sm': app => `<div class="widget"><div class="widget-header"><span>${app.name}</span></div><div class="widget-content"><div class="big-number">Store</div><div class="widget-subtitle">Find new apps</div></div></div>`,
      'social-master': app => `<div class="widget"><div class="widget-header"><span>${app.name}</span></div><div class="widget-content"><div class="big-number">Social</div><div class="widget-subtitle">Connect with friends</div></div></div>`,
      'personalize': app => `<div class="widget"><div class="widget-header"><span>${app.name}</span></div><div class="widget-content"><div class="big-number">Theme</div><div class="widget-subtitle">Personalize your desktop</div></div></div>`,
      'word-doc': app => `<div class="widget"><div class="widget-header"><span>${app.name}</span></div><div class="widget-content"><div class="big-number">Docs</div><div class="widget-subtitle">Word documents</div></div></div>`,
      'excel-numbers': app => `<div class="widget"><div class="widget-header"><span>${app.name}</span></div><div class="widget-content"><div class="big-number">Excel</div><div class="widget-subtitle">Spreadsheets</div></div></div>`,
      'notepad': app => `<div class="widget"><div class="widget-header"><span>${app.name}</span></div><div class="widget-content"><div class="big-number">Notes</div><div class="widget-subtitle">Quick notes</div></div></div>`,
      'wordpad': app => `<div class="widget"><div class="widget-header"><span>${app.name}</span></div><div class="widget-content"><div class="big-number">Wordpad</div><div class="widget-subtitle">Rich text notes</div></div></div>`,
      'calculator-sm': app => `<div class="widget"><div class="widget-header"><span>${app.name}</span></div><div class="widget-content"><div class="big-number">Calc</div><div class="widget-subtitle">Calculator</div></div></div>`,
      'photoshop-sm': app => `<div class="widget"><div class="widget-header"><span>${app.name}</span></div><div class="widget-content"><div class="big-number">Photo</div><div class="widget-subtitle">Edit images</div></div></div>`,
      'calendar-sm': app => `<div class="widget"><div class="widget-header"><span>${app.name}</span></div><div class="widget-content"><div class="big-number">Calendar</div><div class="widget-subtitle">Your events</div></div></div>`,
      'notes': app => `<div class="widget"><div class="widget-header"><span>${app.name}</span></div><div class="widget-content"><div class="big-number">Notes</div><div class="widget-subtitle">Sticky notes</div></div></div>`
      // Add more mappings as needed
    };
    
    startMenuApps.forEach(app => {
      // Skip app-launcher itself
      if (app.id === 'app-launcher') return;
      let widgetHTML = '';
      if (widgetTemplates[app.id]) {
        widgetHTML = widgetTemplates[app.id](app);
      } else {
        widgetHTML = `<div class="widget"><div class="widget-header"><span>${app.name}</span></div><div class="widget-content"><div class="big-number">App</div><div class="widget-subtitle">${app.name} widget</div></div></div>`;
      }
      widgetsScreen.insertAdjacentHTML('beforeend', widgetHTML);
    });
  }

  // Ensure widgets are visible by default on desktop
  const widgetsScreen = document.getElementById('widgets-screen');
  if (widgetsScreen && window.innerWidth > 1023) {
    widgetsScreen.classList.remove('widgets-hidden');
    widgetsScreen.style.display = '';
  }
  generateWidgets();


});
// ... existing code ...




// --- Robust volume UI update function ---
function updateVolumeUI(value) {
  const volumeBtn = document.getElementById('volume-btn');
  const volumePanel = document.getElementById('volume-panel');
  const icon = volumeBtn ? volumeBtn.querySelector('i') : null;
  const panelIcon = volumePanel ? volumePanel.querySelector('.volume-slider-panel i') : null;
  const volumePercent = document.getElementById('volume-percentage');
  isMuted = (value === 0);
  if (icon) {
    icon.classList.remove('fa-volume-up', 'fa-volume-mute');
    icon.classList.add(isMuted ? 'fa-volume-mute' : 'fa-volume-up');
  }
  if (panelIcon) {
    panelIcon.classList.remove('fa-volume-up', 'fa-volume-mute');
    panelIcon.classList.add(isMuted ? 'fa-volume-mute' : 'fa-volume-up');
  }
  if (volumePercent) {
    volumePercent.textContent = value + '%';
  }
}

// ... existing code ...



// Volume Panel: Live percentage and volume control
function setupVolumePanelListeners() {
  const volumeSlider = document.getElementById('browser-volume-slider');
  const volumePercent = document.getElementById('volume-percentage');
  // Try to find a global <audio> element (if you have one)
  const audio = document.querySelector('audio');

  if (volumeSlider && volumePercent) {
    const updateVolume = () => {
      const value = parseInt(volumeSlider.value, 10);
      volumePercent.textContent = value + '%';
      updateVolumeUI(value);
      if (audio) {
        audio.volume = value / 100;
      }
    };
    volumeSlider.addEventListener('input', updateVolume);
    // Set initial value
    updateVolume();
  }
}

document.addEventListener('DOMContentLoaded', function () {
  // ... existing code ...

  // Define the populateContextMenu function globally
  window.populateContextMenu = function (menuItems, x, y) {
    const contextMenu = document.getElementById('context-menu');
    if (!contextMenu) {
      console.error('Context menu element not found.');
      return;
    }

    // Clear existing menu items
    contextMenu.innerHTML = '';

    // Populate menu items
    menuItems.forEach(item => {
      if (item.type === 'separator') {
        const separator = document.createElement('div');
        separator.className = 'context-menu-separator';
        contextMenu.appendChild(separator);
      } else {
        const menuItem = document.createElement('div');
        menuItem.className = 'context-menu-item';
        menuItem.innerHTML = `<i class="fas ${item.icon}"></i><span>${item.label}</span>`;
        menuItem.addEventListener('click', () => {
          if (typeof window.executeContextMenuAction === 'function') {
            window.executeContextMenuAction(item.action);
          }
        });
        contextMenu.appendChild(menuItem);
      }
    });

    // Position and display the context menu
    contextMenu.style.left = `${x}px`;
    contextMenu.style.top = `${y}px`;
    contextMenu.classList.remove('hidden');
  };

  // Ensure the context menu is hidden when clicking outside
  document.addEventListener('click', (e) => {
    const contextMenu = document.getElementById('context-menu');
    if (contextMenu && !contextMenu.contains(e.target)) {
      contextMenu.classList.add('hidden');
    }
  });

  // ... existing code ...
  setupVolumePanelListeners();
  setNotificationsBtnOpacity();

  // Fix: Always attach close button event after DOM is ready
  const volumePanel = document.getElementById('volume-panel');
  const closeBtn = document.getElementById('close-volume-panel');
  const volumeBtn = document.getElementById('volume-btn');
  if (closeBtn && volumePanel) {
    closeBtn.addEventListener('click', () => {
      volumePanel.classList.remove('visible');
      setTimeout(() => {
        volumePanel.style.display = 'none';
      }, 350);
    });
  }

  // --- Mute/unmute logic for BOTH icons in the panel ---
  const browserVolumeSlider = document.getElementById('browser-volume-slider');
  // Icon in the slider panel
  const panelIcon = volumePanel ? volumePanel.querySelector('.volume-slider-panel i') : null;
  // Icon in the volume-panel-box (music section)
  const boxIcon = volumePanel ? volumePanel.querySelector('.music-panel-box i.fas.fa-volume-up, .music-panel-box i.fas.fa-volume-mute') : null;

  function handleMuteUnmuteClick() {
    if (!browserVolumeSlider) return;
    if (!isMuted) {
      previousVolume = browserVolumeSlider.value;
      browserVolumeSlider.value = 0;
      browserVolumeSlider.dispatchEvent(new Event('input', { bubbles: true }));
    } else {
      browserVolumeSlider.value = previousVolume;
      browserVolumeSlider.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  if (panelIcon) {
    panelIcon.style.cursor = 'pointer';
    panelIcon.addEventListener('click', handleMuteUnmuteClick);
  }
  if (boxIcon) {
    boxIcon.style.cursor = 'pointer';
    boxIcon.addEventListener('click', handleMuteUnmuteClick);
  }

  // --- Playlist button logic: always attach after DOMContentLoaded ---
  const musicPanel = volumePanel ? volumePanel.querySelector('.music-panel-box') : null;
  const playlistBtn = musicPanel ? musicPanel.querySelector('.music-btn[title="Playlist"]') : null;
  if (playlistBtn && musicPanel) {
    playlistBtn.addEventListener('click', () => {
      if (musicPanel.style.display === 'none') return;
      let domPlaylistPanel = musicPanel.parentNode.querySelector('.playlist-panel-slide');
      if (!domPlaylistPanel) {
        domPlaylistPanel = document.createElement('div');
        domPlaylistPanel.className = 'music-panel-box playlist-panel-slide';
        domPlaylistPanel.style.position = 'absolute';
        domPlaylistPanel.style.left = '0';
        domPlaylistPanel.style.right = '0';
        domPlaylistPanel.style.bottom = '100%';
        domPlaylistPanel.style.margin = '0 auto 28px auto';
        domPlaylistPanel.style.transition = 'transform 0.35s cubic-bezier(0.4,0,0.2,1)';
        domPlaylistPanel.style.transform = 'translateY(100%)';
        domPlaylistPanel.innerHTML = '<div style="padding: 18px 18px 10px 18px; color: #fff; font-size: 1.1rem; font-weight: 600;">Playlist (placeholder)</div>';
        musicPanel.style.position = 'relative';
        musicPanel.parentNode.insertBefore(domPlaylistPanel, musicPanel);
        setTimeout(() => {
          domPlaylistPanel.style.transform = 'translateY(0)';
        }, 10);
      } else {
        domPlaylistPanel.style.transform = 'translateY(100%)';
        if (window._playlistPanelRemoveTimeout) {
          clearTimeout(window._playlistPanelRemoveTimeout);
          window._playlistPanelRemoveTimeout = null;
        }
        window._playlistPanelRemoveTimeout = setTimeout(() => {
          if (domPlaylistPanel && domPlaylistPanel.parentNode) {
            domPlaylistPanel.parentNode.removeChild(domPlaylistPanel);
          }
          window._playlistPanelRemoveTimeout = null;
        }, 350);
      }
    });
  }

  // --- Always close volume panel when clicking outside ---
  document.addEventListener('mousedown', function(e) {
    const panel = document.getElementById('volume-panel');
    const btn = document.getElementById('volume-btn');
    if (
      panel &&
      panel.classList.contains('visible') &&
      !panel.contains(e.target) &&
      !(btn && btn.contains(e.target))
    ) {
      panel.classList.remove('visible');
      setTimeout(() => {
        panel.style.display = 'none';
      }, 350);
    }
  });

  // --- Volume Panel Show/Hide Handler ---
  function attachVolumeBtnHandler() {
    const volumeBtn = document.getElementById('volume-btn');
    const volumePanel = document.getElementById('volume-panel');
    if (!volumeBtn || !volumePanel) return;
    // Remove previous click handlers by cloning
    const newBtn = volumeBtn.cloneNode(true);
    volumeBtn.parentNode.replaceChild(newBtn, volumeBtn);
    newBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      // Always reset display before toggling
      if (volumePanel.classList.contains('visible')) {
        volumePanel.classList.remove('visible');
        setTimeout(() => {
          volumePanel.style.display = 'none';
        }, 350);
      } else {
        if (typeof window.hideWalletSidebar === 'function') window.hideWalletSidebar();
        volumePanel.style.display = 'flex';
        requestAnimationFrame(() => {
          volumePanel.classList.add('visible');
        });
      }
    });
  }
  attachVolumeBtnHandler();
});
// ... existing code ...


//logout function
const handleLogout = () => {
  showConfirmDialog({
    title: "Log out?",
    message: "Are you sure you want to log out?",
    iconClass: "fa-sign-out-alt",
    okText: "Log out",
    cancelText: "Cancel"
  }).then(confirmed => {
    if (confirmed) {
      if (typeof startMenu !== 'undefined' && startMenu) startMenu.style.display = 'none';
      window._loggingOut = true;
      if (window._allPopoutWindows && Array.isArray(window._allPopoutWindows)) {
        window._allPopoutWindows = window._allPopoutWindows.filter(win => {
          if (win && !win.closed) {
            try { win.close(); } catch (e) { }
            return false;
          }
          return false;
        });
      }
      setTimeout(() => { window._loggingOut = false; }, 2000);
    }
  });
};

const logOutButton = document.querySelector('.start-menu-logout-button') || document.querySelector('.logout-button');
if (logOutButton) {
  logOutButton.addEventListener('click', (e) => {
    e.preventDefault();
    handleLogout();
  });
}



function getAppIconDetails(appName) {
  let iconClass = 'fa-window-maximize';
  let iconBgClass = 'gray-icon';
  // First, try to get from startMenuApps
  if (typeof startMenuApps !== 'undefined') {
    const appObj = startMenuApps.find(a => a.id === appName);
    if (appObj) {
      iconClass = appObj.iconClass || iconClass;
      iconBgClass = appObj.iconBgClass || iconBgClass;
      return { iconClass, iconBgClass };
    }
  }
  // Fallback: try to get from desktop icon
  const desktopIcon = document.querySelector(`.desktop-icon[data-app="${appName}"]`);
  if (desktopIcon) {
    const iElem = desktopIcon.querySelector('i');
    const cElem = desktopIcon.querySelector('.icon-container');
    if (iElem) iconClass = iElem.className.split(' ').find(cls => cls.startsWith('fa-')) || iconClass;
    if (cElem) iconBgClass = cElem.className.split(' ').find(cls => cls.endsWith('-icon')) || iconBgClass;
  }
  return { iconClass, iconBgClass };
}


//Top bar with icons and profile
function createAppLauncherTopBar() {
  const topBar = document.createElement('div');
  topBar.className = 'app-launcher-top-bar';
  topBar.style.display = 'flex';
  topBar.style.justifyContent = 'space-between';
  topBar.style.alignItems = 'center';
  topBar.style.height = '35px';
  topBar.style.padding = '0 15px 0 3px';
  topBar.style.background = '#050217c5';
  topBar.style.backdropFilter = 'blur(30px)';

  // Profile (left)
  const profileBtn = document.createElement('button');
  profileBtn.className = 'app-launcher-profile-btn';
  profileBtn.innerHTML = '<img src="img/avatar.png" alt="User" class="profile-avatar" style="width:24px;height:24px;border-radius:50%;">Michael Muchmore';
  profileBtn.style.background = 'transparent';
  profileBtn.style.color = '#fff';
  profileBtn.style.border = 'none';
  profileBtn.style.borderRadius = '5px';
  profileBtn.style.padding = '5px 15px';
  profileBtn.style.fontSize = '14px';
  profileBtn.style.fontWeight = '500';
  profileBtn.style.cursor = 'pointer';
  profileBtn.style.display = 'flex';
  profileBtn.style.alignItems = 'center';
  profileBtn.style.transition = 'background 0.18s';
  profileBtn.addEventListener('mouseover', () => { profileBtn.style.background = 'var(--accent-color)' });
  profileBtn.addEventListener('mouseout', () => { profileBtn.style.background = 'transparent' });
  profileBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    if (window._profileDropdown && window._profileDropdown.parentNode) window._profileDropdown.parentNode.removeChild(window._profileDropdown);
    const profileDropdown = document.createElement('div');
    window._profileDropdown = profileDropdown;
    profileDropdown.className = 'context-menu app-launcher-profile-dropdown';
    profileDropdown.style.position = 'absolute';
    profileDropdown.style.zIndex = '10000';
    const rect = profileBtn.getBoundingClientRect();
    profileDropdown.style.left = rect.left + 'px';
    profileDropdown.style.top = (rect.bottom + 4) + 'px';
    const userProfile = document.createElement('div');
    userProfile.className = 'settings-user-profile';
    userProfile.style.display = 'flex';
    userProfile.style.flexDirection = 'column';
    userProfile.style.alignItems = 'center';
    userProfile.style.justifyContent = 'center';
    userProfile.style.padding = '25px 10px';
    userProfile.style.borderBottom = '1px solid rgba(255,255,255,0.08)';
    userProfile.style.marginBottom = '6px';
    userProfile.innerHTML = `
      <img src="img/avatar.png" alt="User" class="profile-avatar" style="width:54px;height:54px;border-radius:50%;margin-bottom:8px;">
      <div class="profile-info" style="text-align:center;">
        <span class="profile-name" style="display:block;font-size:15px;font-weight:600;margin-top:5px;">Michael Muchmore</span>
        <span class="profile-id" style="display:block;font-size:13px;color:#aaa;margin-top:5px;">argenti.ro</span>
      </div>
    `;
    profileDropdown.appendChild(userProfile);
    const backToDesktop = document.createElement('div');
    backToDesktop.className = 'context-menu-item';
    backToDesktop.innerHTML = '<i class="fas fa-desktop"></i><span>Back to desktop mode</span>';
    backToDesktop.addEventListener('click', function (ev) {
      window.executeContextMenuAction && window.executeContextMenuAction('desktop-mode');
      if (profileDropdown && profileDropdown.parentNode) profileDropdown.parentNode.removeChild(profileDropdown);
      ev.stopPropagation();
    });
    profileDropdown.appendChild(backToDesktop);
    const sep1 = document.createElement('div');
    sep1.className = 'context-menu-separator';
    profileDropdown.appendChild(sep1);
    const profileAction = document.createElement('div');
    profileAction.className = 'context-menu-item';
    profileAction.innerHTML = '<i class="fas fa-user-cog"></i><span>Open Profile Settings</span>';
    profileAction.style.justifyContent = 'center';
    profileAction.addEventListener('click', function (ev) {
      openApp('settings', 'Settings', 'fa-cog', 'green');
      if (profileDropdown && profileDropdown.parentNode) profileDropdown.parentNode.removeChild(profileDropdown);
      ev.stopPropagation();
    });
    profileDropdown.appendChild(profileAction);
    const viewItem = document.createElement('div');
    viewItem.className = 'context-menu-item has-submenu';
    viewItem.innerHTML = '<i class="fas fa-eye"></i><span>View</span><i class="fas fa-chevron-right context-menu-chevron"></i>';
    const viewSubmenu = document.createElement('div');
    viewSubmenu.className = 'context-menu submenu';
    viewSubmenu.style.position = 'fixed';
    viewSubmenu.style.zIndex = '10001';
    viewSubmenu.style.visibility = 'hidden';
    viewSubmenu.innerHTML = '';
    const multitask = document.createElement('div');
    multitask.className = 'context-menu-item context-menu-submenu-item';
    multitask.innerHTML = '<i class="fas fa-object-ungroup"></i><span>Multitask</span>';
    multitask.addEventListener('click', function (ev) {
      window.executeContextMenuAction && window.executeContextMenuAction('multi-task-mode');
      if (profileDropdown && profileDropdown.parentNode) profileDropdown.parentNode.removeChild(profileDropdown);
      ev.stopPropagation();
    });
    viewSubmenu.appendChild(multitask);
    const easyMode = document.createElement('div');
    easyMode.className = 'context-menu-item context-menu-submenu-item';
    easyMode.innerHTML = '<i class="fas fa-table-columns"></i><span>Easy Mode</span>';
    easyMode.addEventListener('click', function (ev) {
      window.executeContextMenuAction && window.executeContextMenuAction('single-task-mode');
      if (profileDropdown && profileDropdown.parentNode) profileDropdown.parentNode.removeChild(profileDropdown);
      ev.stopPropagation();
    });
    viewSubmenu.appendChild(easyMode);
    let submenuHover = false;
    let submenuCloseTimer = null;
    function openSubmenu() {
      const rect = viewItem.getBoundingClientRect();
      viewSubmenu.style.left = (rect.right) + 'px';
      viewSubmenu.style.top = (rect.top) + 'px';
      viewSubmenu.style.visibility = '';
      document.body.appendChild(viewSubmenu);
    }
    function closeSubmenu() {
      if (viewSubmenu && viewSubmenu.parentNode) viewSubmenu.parentNode.removeChild(viewSubmenu);
    }
    viewItem.addEventListener('mouseenter', function () {
      if (submenuCloseTimer) { clearTimeout(submenuCloseTimer); submenuCloseTimer = null; }
      openSubmenu();
    });
    viewItem.addEventListener('mouseleave', function () {
      submenuCloseTimer = setTimeout(() => {
        if (!submenuHover) closeSubmenu();
      }, 120);
    });
    viewSubmenu.addEventListener('mouseenter', function () {
      submenuHover = true;
      if (submenuCloseTimer) { clearTimeout(submenuCloseTimer); submenuCloseTimer = null; }
    });
    viewSubmenu.addEventListener('mouseleave', function () {
      submenuHover = false;
      submenuCloseTimer = setTimeout(() => {
        closeSubmenu();
      }, 120);
    });
    profileDropdown.appendChild(viewItem);
    const settingsItem = document.createElement('div');
    settingsItem.className = 'context-menu-item';
    settingsItem.innerHTML = '<i class="fas fa-cog"></i><span>Settings</span>';
    settingsItem.addEventListener('click', function (ev) {
      openApp('settings', 'Settings', 'fa-cog', 'green');
      if (profileDropdown && profileDropdown.parentNode) profileDropdown.parentNode.removeChild(profileDropdown);
      ev.stopPropagation();
    });
    profileDropdown.appendChild(settingsItem);
    const sep2 = document.createElement('div');
    sep2.className = 'context-menu-separator';
    profileDropdown.appendChild(sep2);
    const helpItem = document.createElement('div');
    helpItem.className = 'context-menu-item';
    helpItem.innerHTML = '<i class="fas fa-question-circle"></i><span>Help and Support</span>';
    helpItem.addEventListener('click', function (ev) {
      window.executeContextMenuAction && window.executeContextMenuAction('help-and-support');
      if (profileDropdown && profileDropdown.parentNode) profileDropdown.parentNode.removeChild(profileDropdown);
      ev.stopPropagation();
    });
    profileDropdown.appendChild(helpItem);
    const logoutItem = document.createElement('div');
    logoutItem.className = 'context-menu-item';
    logoutItem.innerHTML = '<i class="fas fa-sign-out-alt"></i><span>Logout</span>';
    logoutItem.addEventListener('click', function (ev) {
      handleLogout();
      if (profileDropdown && profileDropdown.parentNode) profileDropdown.parentNode.removeChild(profileDropdown);
      ev.stopPropagation();
    });
    profileDropdown.appendChild(logoutItem);
    setTimeout(() => {
      function closeDropdown(ev) {
        if (profileDropdown && !profileDropdown.contains(ev.target) && ev.target !== profileBtn) {
          profileDropdown.classList.remove('anim-slide-down');
          profileDropdown.classList.add('anim-slide-up');
          profileDropdown.addEventListener('animationend', function handler(e) {
            if (e.animationName === 'appLauncherProfileDropdownSlideUp') {
              if (profileDropdown.parentNode) profileDropdown.parentNode.removeChild(profileDropdown);
              profileDropdown.removeEventListener('animationend', handler);
            }
          });
          document.removeEventListener('mousedown', closeDropdown);
          document.removeEventListener('scroll', closeDropdown, true);
        }
      }
      document.addEventListener('mousedown', closeDropdown);
      document.addEventListener('scroll', closeDropdown, true);
    }, 0);
    document.body.appendChild(profileDropdown);
    profileDropdown.classList.remove('anim-slide-up');
    void profileDropdown.offsetWidth;
    profileDropdown.classList.add('anim-slide-down');
    profileDropdown.addEventListener('animationend', function handler(e) {
      if (e.animationName === 'appLauncherProfileDropdownSlideDown') {
        profileDropdown.classList.remove('anim-slide-down');
      }
    });
  });
  topBar.appendChild(profileBtn);

  // Taskbar-right icons (right) - CLONE, NOT MOVE
  const rightIcons = createAppLauncherTaskbarRightIcons();
  topBar.appendChild(rightIcons);
  // Re-attach listeners to cloned icons
  rightIcons.querySelectorAll('.taskbar-icon').forEach(attachTaskbarIconListeners);
  // --- After moving/replacing, update window.walletBtn to the new element ---
  window.walletBtn = document.getElementById('wallet-btn');

  return topBar;
}


// Helper: Attach event listeners to a taskbar icon clone (robust, no event forwarding)
function attachTaskbarIconListeners(cloneBtn) {
  // Remove ID to avoid duplicate IDs in DOM, but do NOT remove id from widgets-toggle-btn, wallet-btn, notifications-btn, volume-btn, fullscreen-btn, global-search-btn, app-launcher-btn, ai-chat-btn
  if (
    cloneBtn.id &&
    !['widgets-toggle-btn','wallet-btn','notifications-btn','volume-btn','fullscreen-btn','global-search-btn','app-launcher-btn','ai-chat-btn'].includes(cloneBtn.id)
  ) cloneBtn.removeAttribute('id');
  // Only attach to buttons or clickable divs
  if (
    !(cloneBtn.tagName === 'BUTTON' ||
      cloneBtn.classList.contains('taskbar-icon') ||
      cloneBtn.classList.contains('taskbar-time') ||
      cloneBtn.classList.contains('taskbar-ai'))
  ) {
    return;
  }


  // Helper to attach the correct click logic to a button or div
  function attachLogicToEl(el) {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      // Always use the .taskbar-icon as the context for icon checks
      let iconContainer = el;
      if (el.tagName === 'BUTTON' && el.parentElement && el.parentElement.classList.contains('taskbar-icon')) {
        iconContainer = el.parentElement;
      }
      // AI Chat
      if (iconContainer.classList.contains('taskbar-icon') && iconContainer.querySelector('.fa-comment-dots')) {
        if (typeof openApp === 'function') openApp('ai-chat', 'AI Chat', 'fa-comment-dots', 'blue-icon');
      }
      // Notifications (use the same function as the original button)
      else if (iconContainer.classList.contains('taskbar-icon') && iconContainer.querySelector('.fa-bell, .fa-bell-slash')) {
        if (typeof toggleNotificationsPanel === 'function') toggleNotificationsPanel();
      }
      // Fullscreen
      else if (iconContainer.classList.contains('taskbar-icon') && iconContainer.querySelector('.fa-expand, .fa-compress')) {
        // Fullscreen button logic
        const fullscreenIcon = iconContainer.querySelector('i');
        function isFullscreen() {
          return document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
        }
        function requestFullscreen(elem) {
          if (elem.requestFullscreen) {
            elem.requestFullscreen();
          } else if (elem.webkitRequestFullscreen) {
            elem.webkitRequestFullscreen();
          } else if (elem.mozRequestFullScreen) {
            elem.mozRequestFullScreen();
          } else if (elem.msRequestFullscreen) {
            elem.msRequestFullscreen();
          }
        }
        function exitFullscreen() {
          if (document.exitFullscreen) {
            document.exitFullscreen();
          } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
          } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
          } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
          }
        }
        function updateFullscreenIcon() {
          if (fullscreenIcon) {
            if (isFullscreen()) {
              fullscreenIcon.classList.remove('fa-expand');
              fullscreenIcon.classList.add('fa-compress');
            } else {
              fullscreenIcon.classList.remove('fa-compress');
              fullscreenIcon.classList.add('fa-expand');
            }
          }
        }
        if (isFullscreen()) {
          exitFullscreen();
        } else {
          requestFullscreen(document.documentElement);
        }
        setTimeout(updateFullscreenIcon, 100); // update icon after state change
      }
      // REMOVE: Volume panel toggle logic from here. Handled exclusively by attachVolumeBtnHandler.
      // Global search (exclude volume)
      else if (iconContainer.classList.contains('taskbar-icon') && iconContainer.querySelector('.fa-search') && !iconContainer.querySelector('.fa-volume-up, .fa-volume-mute')) {
        const globalSearchOverlay = document.getElementById('global-search-overlay');
        const globalSearchInput = document.getElementById('global-search-input');
        if (globalSearchOverlay && globalSearchInput) {
          if (window.innerWidth <= 1023) return;
          if (globalSearchOverlay.style.display !== 'flex') {
            globalSearchOverlay.style.display = 'flex';
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                globalSearchOverlay.style.opacity = '1';
                globalSearchOverlay.style.visibility = 'visible';
                globalSearchInput.tabIndex = -1;
                globalSearchInput.blur();
                globalSearchInput.tabIndex = 0;
                globalSearchInput.focus();
                globalSearchInput.select();
                document.body.style.overflow = 'hidden';
              });
            });
          } else {
            globalSearchInput.tabIndex = -1;
            globalSearchInput.blur();
            globalSearchInput.tabIndex = 0;
            globalSearchInput.focus();
            globalSearchInput.select();
          }
        }
      }
      // Generic app
      else if (iconContainer.classList.contains('taskbar-icon') && iconContainer.hasAttribute('data-app')) {
        const app = iconContainer.getAttribute('data-app');
        if (typeof openApp === 'function') openApp(app, app.charAt(0).toUpperCase() + app.slice(1), '', '');
      }
    });
  }

  // Attach to the element itself
  attachLogicToEl(cloneBtn);

  // If this is a .taskbar-icon, also attach to its child button (if present)
  if (cloneBtn.classList.contains('taskbar-icon')) {
    const btn = cloneBtn.querySelector('button');
    if (btn) {
      attachLogicToEl(btn);
    }
  }


} // <-- Properly close the function

// --- Wallet Sidebar Toggle Logic ---
function attachWalletBtnToggleHandler() {
  const walletBtn = document.getElementById('wallet-btn');
  const walletSidebar = document.getElementById('wallet-sidebar');
  if (!walletBtn || !walletSidebar) return;
  // Remove previous click handlers
  walletBtn.replaceWith(walletBtn.cloneNode(true));
  const newWalletBtn = document.getElementById('wallet-btn');
  let walletVisible = walletSidebar.classList.contains('wallet-sidebar-visible');
  newWalletBtn.addEventListener('click', function () {
    if (window.innerWidth <= 1023) return;
    walletVisible = walletSidebar.classList.contains('wallet-sidebar-visible');
    if (!walletVisible) {
      if (typeof window.showWalletSidebar === 'function') window.showWalletSidebar();
    } else {
      if (typeof window.hideWalletSidebar === 'function') window.hideWalletSidebar();
    }
  });
}

document.addEventListener('DOMContentLoaded', function () {
  attachWalletBtnToggleHandler();
});
// ... existing code ...

(function () {
  window.attachWalletBtnToggleHandler = attachWalletBtnToggleHandler;
  const origExecuteContextMenuAction = window.executeContextMenuAction;
  window.executeContextMenuAction = async function (action) {
    if (
      window.currentContextMenuTarget &&
      window.currentContextMenuTarget.classList &&
      window.currentContextMenuTarget.classList.contains('taskbar-icon') &&
      window.currentContextMenuTarget.closest('.app-launcher-taskbar-right')
    ) {
      window.currentContextMenuTarget.click();
      if (typeof hideContextMenu === 'function') hideContextMenu();
      return;
    }
    return origExecuteContextMenuAction.call(this, action);
  };
})();

// --- App Launcher Top Bar Right Icons (robust, unified) ---
function createAppLauncherTaskbarRightIcons() {
  const taskbarRight = document.querySelector('.taskbar-right');
  let rightIcons = document.createElement('div');
  rightIcons.className = 'app-launcher-taskbar-right';
  rightIcons.style.display = 'flex';
  rightIcons.style.alignItems = 'center';
  let launcherTaskbarRightWrapper = document.createElement('div');
  launcherTaskbarRightWrapper.className = 'taskbar-right';
  launcherTaskbarRightWrapper.style.display = 'flex';
  launcherTaskbarRightWrapper.style.alignItems = 'center';
  // MOVE, do not clone
  Array.from(taskbarRight.children).forEach(child => {
    launcherTaskbarRightWrapper.appendChild(child); // MOVE, do not clone
  });
  rightIcons.appendChild(launcherTaskbarRightWrapper);
  // Hide the main .taskbar-right in App Launcher mode
  if (taskbarRight) taskbarRight.style.display = 'none';
  return rightIcons;
}



// --- Wallet Sidebar Toggle Logic ---
(function () {
  const walletBtn = document.getElementById('wallet-btn');
  const walletSidebar = document.getElementById('wallet-sidebar');
  const walletCloseBtn = walletSidebar ? walletSidebar.querySelector('#wallet-close-btn') : null;
  let walletVisible = false;

  // --- Wallet display mode state ---
  window.walletDisplayMode = window.walletDisplayMode || 'icon';
  window.walletAccountBalance = '$ 254.00';

  function updateWalletBtnDisplay() {
    const walletBtn = window.walletBtn || document.getElementById('wallet-btn');
    if (!walletBtn) return;
    if (window.walletDisplayMode === 'icon') {
      walletBtn.innerHTML = '<i class="fas fa-wallet"></i>';
    } else if (window.walletDisplayMode === 'balance') {
      walletBtn.innerHTML = `<span style="font-weight:600;font-size:15px;">${window.walletAccountBalance}</span>`;
    }
  }

  function showWalletSidebar() {
    if (!walletSidebar) return;
    const aiChatWindow = document.getElementById('ai-chat-window');
    if (aiChatWindow && aiChatWindow.classList.contains('ai-chat-visible')) {
      aiChatWindow.classList.remove('ai-chat-visible');
      aiChatWindow.addEventListener('transitionend', function handler(e) {
        if (e.propertyName === 'transform') {
          aiChatWindow.style.display = 'none';
          aiChatWindow.removeEventListener('transitionend', handler);
        }
      });
    }
    walletSidebar.style.display = 'flex';
    setTimeout(() => walletSidebar.classList.add('wallet-sidebar-visible'), 10);
    walletVisible = true;
  }
  window.showWalletSidebar = showWalletSidebar;
  function hideWalletSidebar() {
    if (!walletSidebar) return;
    walletSidebar.classList.remove('wallet-sidebar-visible');
    // Remove any previous transitionend handlers to avoid duplicates
    walletSidebar.removeEventListener('transitionend', walletSidebar._onTransitionEnd);
    walletSidebar._onTransitionEnd = function (e) {
      if (e.propertyName === 'transform' && !walletSidebar.classList.contains('wallet-sidebar-visible')) {
        walletSidebar.style.display = 'none';
        walletSidebar.removeEventListener('transitionend', walletSidebar._onTransitionEnd);
      }
    };
    walletSidebar.addEventListener('transitionend', walletSidebar._onTransitionEnd);
    walletVisible = false;
  }
  window.hideWalletSidebar = hideWalletSidebar;

document.addEventListener('DOMContentLoaded', function () {
    updateWalletBtnDisplay();
    if (walletBtn && walletSidebar) {
      walletBtn.addEventListener('click', function () {
        if (window.innerWidth <= 1023) return;
        if (!walletVisible) {
          showWalletSidebar();
        } else {
          hideWalletSidebar();
        }
      });
    }
    if (walletCloseBtn) {
      walletCloseBtn.addEventListener('click', function () {
        if (!walletVisible) return;
        hideWalletSidebar();
      });
    }
    document.addEventListener('mousedown', function (e) {
      if (
        walletVisible &&
        walletSidebar &&
        !walletSidebar.contains(e.target) &&
        walletBtn &&
        !walletBtn.contains(e.target) &&
        window.innerWidth > 1023
      ) {
        hideWalletSidebar();
      }
    });
  });
  window.updateWalletBtnDisplay = updateWalletBtnDisplay;
})();

// ... existing code ...



// --- Fade out helper for notif-section-label ---
function fadeOutSectionLabel(sectionLabel) {
  if (!sectionLabel) return;
  if (sectionLabel.classList.contains('fading-out')) return;
  sectionLabel.classList.add('fading-out');
  sectionLabel.style.transition = 'all 0.3s ease-out';
  sectionLabel.style.opacity = '0';
  sectionLabel.style.height = '0';
  sectionLabel.style.marginTop = '0';
  sectionLabel.style.marginBottom = '0';
  sectionLabel.style.overflow = 'hidden';

  setTimeout(() => {
    sectionLabel.style.display = 'none';
    sectionLabel.remove();
  }, 300);
}


// In setupFileExplorerInteraction or after creating the File Explorer window:
function setupSidebarToggleForFileExplorer(fileExplorerWindow) {
  const sidebar = fileExplorerWindow.querySelector('.file-explorer-sidebar');
  const toggleLabel = fileExplorerWindow.querySelector('#file-explorer-sidebar-toggle-label');
  const toggle = fileExplorerWindow.querySelector('#file-explorer-sidebar-toggle');
  if (!sidebar || !toggle) return;
  // Only show toggle on desktop
  function updateToggleVisibility() {
    if (window.innerWidth > 500) {
      toggleLabel.style.display = '';
      // Set initial state: ON = collapsed, OFF = expanded
      if (toggle.checked) {
        sidebar.classList.add('sidebar-collapsed');
        sidebar.setAttribute('data-user-collapsed', 'true');
      } else {
        sidebar.classList.remove('sidebar-collapsed');
        sidebar.setAttribute('data-user-collapsed', 'false');
      }
    } else {
      toggleLabel.style.display = 'none';
      sidebar.classList.remove('sidebar-collapsed');
      toggle.checked = false;
      sidebar.removeAttribute('data-user-collapsed');
    }
  }
  updateToggleVisibility();
  window.addEventListener('resize', updateToggleVisibility);
  toggle.addEventListener('change', function () {
    if (window.innerWidth > 500) {
      if (toggle.checked) {
        sidebar.classList.add('sidebar-collapsed');
        sidebar.setAttribute('data-user-collapsed', 'true');
      } else {
        sidebar.classList.remove('sidebar-collapsed');
        sidebar.setAttribute('data-user-collapsed', 'false');
      }
      if (typeof updateSidebarForWindow === 'function') updateSidebarForWindow(fileExplorerWindow);
    }
  });
}

//Press N to open trigger notifications
document.addEventListener('keydown', function (e) {
  const active = document.activeElement;
  if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable)) return;
  if (e.key === 'n' || e.key === 'N') {
    addNotification({
      title: 'New incoming notification',
      desc: 'This is a test notification',
      meta: 'now',
      iconClass: 'fa-shopping-cart',
      iconBgClass: 'notif-bg-blue',
      avatar: 'img/avatar.png',
      unread: true
    });
  }
});

// Function to toggle the widgets screen
// function toggleWidgetsScreen() {
//   const widgetsScreen = document.getElementById('widgets-screen');
//   if (widgetsScreen) {
//     widgetsScreen.classList.toggle('active');
//   }
// }
// To test, call from console: toggleWidgetsScreen()


//disable pinch zoom
window.addEventListener(
  "touchmove",
  function (event) {
    if (event.scale !== 1) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  },
  { passive: false }
);

document.addEventListener('contextmenu', function (event) {
  event.preventDefault(); // This disables the browser's context menu elsewhere
});


// Utility: Close start menu with animation
function closeStartMenuAnimated() {
  if (!startMenu) return;
  if (startMenu.style.display === 'block') {
    startMenu.classList.remove('start-menu-anim-open');
    startMenu.classList.add('start-menu-anim-close');
    startMenu.addEventListener('animationend', function handler() {
      startMenu.style.display = 'none';
      startMenu.classList.remove('start-menu-anim-close');
      startMenu.removeEventListener('animationend', handler);
    });
  } else {
    startMenu.style.display = 'none';
  }
}

document.addEventListener('mousedown', function (e) {
  if (startMenu && startMenu.style.display === 'block' && !startMenu.contains(e.target) && e.target !== startButton && !startButton.contains(e.target)) {
    closeStartMenuAnimated();
  }
});
document.addEventListener('contextmenu', function (e) {
  // Only block context menu on the taskbar in app launcher mode
  if (
    document.body.classList.contains('app-launcher-mode') &&
    e.target.closest('.taskbar') &&
    !e.target.closest('.taskbar-app-icon')
  ) {
    e.preventDefault();
    const contextMenu = document.getElementById('context-menu');
    if (contextMenu) contextMenu.classList.add('hidden');
    return;
  }
  if (startMenu && startMenu.style.display === 'block' && !startMenu.contains(e.target) && e.target !== startButton && !startButton.contains(e.target)) {
    closeStartMenuAnimated();
  }
});


// At the top of the file or before renderPinnedTaskbarIcons:
window._animatedTaskbarWindows = window._animatedTaskbarWindows || new Set();


// --- GLOBAL STATE (move to top of file) ---
let openWindows = {};
let activeWindow = null;
let windowZIndex = 100;
let windowIdCounter = 0;
let currentContextMenuTarget = null;
let selectedDesktopIcons = new Set();
let isDraggingSelector = false;
let dragSelectorStartX, dragSelectorStartY;
let isDraggingFileSelector = false;
let fileSelectorStartX, fileSelectorStartY;
let fileExplorerContentArea = null;
let currentSelectedFileItems = new Set();
let startMenu = null;
let startButton = null;

// --- START MENU LOGIC (top-level for widgets) ---
// Define the app list before any function that uses it
  const startMenuApps = [
    { id: 'my-files', name: 'My Files', iconClass: 'fa-folder', iconBgClass: 'pink-icon', iconBgMenuClass: 'pink-bg', category: 'SYSTEM APPS' },
    { id: 'this-pc', name: 'This PC', iconClass: 'fa-desktop', iconBgClass: 'pink-icon', iconBgMenuClass: 'pink-bg', category: 'SYSTEM APPS' },
    { id: 'web-files', name: 'Web Files', iconClass: 'fa-folder-open', iconBgClass: 'green-icon', iconBgMenuClass: 'green-bg', category: 'SYSTEM APPS' },
    { id: 'trash-sm', name: 'Trash', iconClass: 'fa-trash', iconBgClass: 'purple-icon', iconBgMenuClass: 'purple-bg', category: 'SYSTEM APPS' },
    { id: 'settings-sm', name: 'Settings', iconClass: 'fa-cog', iconBgClass: 'pink-icon', iconBgMenuClass: 'pink-bg', category: 'SYSTEM APPS' },
    { id: 'site-builder-sm', name: 'Site Builder', iconClass: 'fa-globe', iconBgClass: 'pink-icon', iconBgMenuClass: 'pink-bg', category: 'CUSTOMISE' },
    { id: 'app-store-sm', name: 'AppStore', iconClass: 'fa-store', iconBgClass: 'green-icon', iconBgMenuClass: 'green-bg', category: 'CUSTOMISE' },
    { id: 'social-master', name: 'Social Master', iconClass: 'fa-users', iconBgClass: 'purple-icon', iconBgMenuClass: 'purple-bg', category: 'CUSTOMISE' },
    { id: 'personalize', name: 'Personalize', iconClass: 'fa-cog', iconBgClass: 'pink-icon', iconBgMenuClass: 'pink-bg', category: 'CUSTOMISE' },
    { id: 'word-doc', name: 'Word doc', iconClass: 'fa-file-word', iconBgClass: 'pink-icon', iconBgMenuClass: 'pink-bg', category: 'DOCS' },
    { id: 'excel-numbers', name: 'Excel Numbers', iconClass: 'fa-file-excel', iconBgClass: 'green-icon', iconBgMenuClass: 'green-bg', category: 'DOCS' },
    { id: 'notepad', name: 'Notepad', iconClass: 'fa-sticky-note', iconBgClass: 'purple-icon', iconBgMenuClass: 'purple-bg', category: 'DOCS' },
    { id: 'wordpad', name: 'Wordpad', iconClass: 'fa-file-alt', iconBgClass: 'pink-icon', iconBgMenuClass: 'pink-bg', category: 'DOCS' },
    { id: 'calculator-sm', name: 'Calculator', iconClass: 'fa-calculator', iconBgClass: 'gray-icon', iconBgMenuClass: 'gray-bg', category: 'PRODUCTIVITY' },
    { id: 'photoshop-sm', name: 'Photoshop', iconClass: 'fa-palette', iconBgClass: 'blue-icon', iconBgMenuClass: 'blue-bg', category: 'PRODUCTIVITY' },
    { id: 'calendar-sm', name: 'Calendar', iconClass: 'fa-calendar-alt', iconBgClass: 'purple-icon', iconBgMenuClass: 'purple-bg', category: 'PRODUCTIVITY' },
    { id: 'notes', name: 'Notes', iconClass: 'far fa-clipboard', iconBgClass: 'pink-icon', iconBgMenuClass: 'pink-bg', category: 'PRODUCTIVITY' },
    { id: 'app-launcher', name: 'App launcher', iconClass: 'fa-th', iconBgClass: 'blue-icon', iconBgMenuClass: 'blue-bg', category: 'SYSTEM APPS' },
    { id: 'wallet', name: 'Wallet', iconClass: 'fa-wallet', iconBgClass: 'pink-icon', iconBgMenuClass: 'pink-bg', category: 'SYSTEM APPS' }
  ];

  let startMenuAppSortMode = 'category'; // 'category' or 'alphabet'

// ... existing code ...

// --- DYNAMIC DESKTOP ICON GENERATION ---
// List of app IDs to show on desktop by default
const defaultDesktopAppIds = [
  'my-files', 'trash-sm', 'app-store-sm', 'settings-sm', 'site-builder-sm', 'wallet', 'photoshop-sm'
];

function generateDesktopIcons() {
  const desktopIconsContainer = document.querySelector('.desktop-icons');
  if (!desktopIconsContainer) return;
  desktopIconsContainer.innerHTML = '';
  if (typeof startMenuApps !== 'undefined') {
    startMenuApps.forEach(app => {
      if (!defaultDesktopAppIds.includes(app.id)) return;
      const icon = document.createElement('div');
      icon.className = 'desktop-icon';
      icon.setAttribute('data-app', app.id);
      icon.innerHTML = `
        <div class="icon-container ${app.iconBgClass}"><i class="fas ${app.iconClass}"></i></div>
        <span>${app.name}</span>
      `;
      desktopIconsContainer.appendChild(icon);
      if (typeof setupDesktopIcon === 'function') setupDesktopIcon(icon);
    });
  }
}

document.addEventListener('DOMContentLoaded', function () {
  generateDesktopIcons();
  // ... existing code ...

  // DOM Elements
  startButton = document.getElementById('start-button');
  startMenu = document.getElementById('start-menu');
  const windowsContainer = document.getElementById('windows-container');
  const currentTimeEl = document.getElementById('current-time');

  const startMenuLeftPanel = document.querySelector('.start-menu-left-panel');
  const startMenuSearchTop = document.getElementById('start-menu-search-top');
  const startMenuSearchBottom = document.getElementById('start-menu-search-bottom');
  const contextMenu = document.getElementById('context-menu');
  const dragSelector = document.getElementById('drag-selector');
  const desktopArea = document.getElementById('desktop-area');
  const desktopIconsContainer = document.querySelector('.desktop-icons');


  // Custom context menu for app-grid-item (start menu/app launcher)
  if (startMenuLeftPanel) {
    startMenuLeftPanel.addEventListener('contextmenu', function (e) {
      if (e.target.closest('.app-grid-item')) {
        currentContextMenuTarget = e.target.closest('.app-grid-item');
        const appName = currentContextMenuTarget.getAttribute('data-app-name') || currentContextMenuTarget.getAttribute('data-app-id');
        const appTitle = currentContextMenuTarget.getAttribute('data-app-title') || currentContextMenuTarget.querySelector('span')?.textContent || appName;
        const details = getAppIconDetails(appName);

        // Determine if system app
        let isSystemApp = false;
        if (typeof startMenuApps !== 'undefined') {
          const appObj = startMenuApps.find(a =>
            a.id === appName ||
            a.name === appName ||
            (a.name && a.name.toLowerCase().replace(/\s+/g, '-') === appName)
          );
          if (appObj && appObj.category && appObj.category.toUpperCase().includes('SYSTEM')) isSystemApp = true;
        }

        const menuItems = [
          { label: 'Open', action: 'open-app', icon: details.iconClass },
          { label: 'Add to Desktop', action: 'add-to-desktop', icon: 'fa-desktop' },
          { label: isAppPinned(appName) ? 'Unpin from Taskbar' : 'Pin to Taskbar', action: isAppPinned(appName) ? 'unpin-taskbar' : 'pin-to-taskbar', icon: 'fa-thumbtack' },
          { type: 'separator' },
          isSystemApp
            ? { label: 'Uninstall App', action: 'uninstall-app', icon: 'fa-trash', disabled: true }
            : { label: 'Uninstall App', action: 'uninstall-app', icon: 'fa-trash' }
        ];
        populateContextMenu(menuItems, e.clientX, e.clientY);
        e.preventDefault();
        return;
      }
    });
  }

  const taskbarAppIconsContainer = document.getElementById('taskbar-app-icons');
  // ... other variables ...

  // --- PERSISTENT PINNED TASKBAR ICONS SYSTEM ---
  function getPinnedTaskbarApps() {
    try {
      return JSON.parse(localStorage.getItem('pinnedTaskbarApps') || '[]');
    } catch (e) { return []; }
  }
  function setPinnedTaskbarApps(list) {
    localStorage.setItem('pinnedTaskbarApps', JSON.stringify(list));
  }
  function isAppPinned(appName) {
    return getPinnedTaskbarApps().includes(appName);
  }
  function pinAppToTaskbar(appName) {
    const pins = getPinnedTaskbarApps();
    if (!pins.includes(appName)) {
      pins.push(appName);
      setPinnedTaskbarApps(pins);
      renderPinnedTaskbarIcons();
      // Animate in the new pinned icon
      const iconEl = document.querySelector('.taskbar-app-icon.pinned-only[data-app="' + appName + '"]');
      if (iconEl) animateTaskbarIconIn(iconEl);
    }
  }
  function unpinAppFromTaskbar(appName) {
    const iconEl = document.querySelector('.taskbar-app-icon.pinned-only[data-app="' + appName + '"]');
    if (iconEl) {
      animateTaskbarIconOut(iconEl, function () {
        const pins = getPinnedTaskbarApps().filter(a => a !== appName);
        setPinnedTaskbarApps(pins);
        renderPinnedTaskbarIcons();
      });
    } else {
      const pins = getPinnedTaskbarApps().filter(a => a !== appName);
      setPinnedTaskbarApps(pins);
      renderPinnedTaskbarIcons();
    }
  }
  function renderPinnedTaskbarIcons(prevUnpinnedIdsArg) {
    // --- PATCH: Collect IDs of currently open unpinned app icons before clearing ---
    let prevUnpinnedIds;
    if (prevUnpinnedIdsArg) {
      prevUnpinnedIds = prevUnpinnedIdsArg;
    } else {
      prevUnpinnedIds = new Set();
      Array.from(taskbarAppIconsContainer.querySelectorAll('.taskbar-app-icon.opened-app[data-window-id]')).forEach(el => {
        prevUnpinnedIds.add(el.getAttribute('data-window-id'));
      });
    }
    // --- PATCH: Collect IDs of currently open pinned app icons before clearing ---
    const prevPinnedIds = new Set();
    Array.from(taskbarAppIconsContainer.querySelectorAll('.taskbar-app-icon.pinned-only.opened-app[data-window-id]')).forEach(el => {
      prevPinnedIds.add(el.getAttribute('data-window-id'));
    });
    // Clear all icons and separators
    taskbarAppIconsContainer.innerHTML = '';
    const pins = getPinnedTaskbarApps();
  
    // Render all pinned icons (open or not), in pin order
    pins.forEach(appName => {
      const details = getAppIconDetails(appName);
      let appTitle = appName.charAt(0).toUpperCase() + appName.slice(1).replace(/-/g, ' ');
      const desktopIcon = document.querySelector(`.desktop-icon[data-app="${appName}"] span`);
      if (desktopIcon) appTitle = desktopIcon.textContent;
      // Check if app is open
      const openWin = Object.values(openWindows).find(w => w.name === appName && w.element);
      const iconEl = document.createElement('div');
      if (openWin && openWin.element) {
        iconEl.className = 'taskbar-app-icon pinned-only opened-app';
        iconEl.setAttribute('data-window-id', openWin.element.id);
        // Update openWindows to point to this icon
        if (openWindows[openWin.element.id]) {
          openWindows[openWin.element.id].taskbarIcon = iconEl;
        }
      } else {
        iconEl.className = 'taskbar-app-icon pinned-only';
      }
      // Always remove animation classes
      iconEl.classList.remove('anim-in', 'anim-out');
      iconEl.setAttribute('data-app', appName);
      iconEl.setAttribute('title', appTitle);
      iconEl.innerHTML = `<div class="icon-container ${details.iconBgClass}"><i class="fas ${details.iconClass}"></i></div>`;
      iconEl.addEventListener('click', function () {
        const currentOpenWin = Object.values(openWindows).find(w => w.name === appName && w.element);
        if (currentOpenWin && currentOpenWin.element) {
          if (currentOpenWin.element.classList.contains('minimized')) {
            toggleMinimizeWindow(currentOpenWin.element, iconEl);
          } else if (activeWindow === currentOpenWin.element) {
            toggleMinimizeWindow(currentOpenWin.element, iconEl);
          } else {
            makeWindowActive(currentOpenWin.element);
          }
        } else {
          openApp(appName, appTitle, details.iconClass, details.iconBgClass, this);
        }
      });
      taskbarAppIconsContainer.appendChild(iconEl);
      // Do NOT animate in for pinned icons
      // Never animate in/out here (old comment, now handled above)
    });
  
    // Add separator if there are open (unpinned) apps AND there is at least one pinned app
    const openUnpinned = Object.values(openWindows).filter(w => w.element && !isAppPinned(w.name));
    if (pins.length > 0 && openUnpinned.length > 0) {
      const separator = document.createElement('div');
      separator.className = 'taskbar-separator';
      taskbarAppIconsContainer.appendChild(separator);
    }
  
    // Render open (unpinned) app icons
    openUnpinned.forEach(winObj => {
      if (!winObj.element) return;
      const appName = winObj.name;
      const details = getAppIconDetails(appName);
      let iconClass = winObj.iconClass || details.iconClass || 'fa-window-maximize';
      let iconBgClass = winObj.iconBgClass || details.iconBgClass || 'gray-icon';
      // Try to get the icon background class from the desktop icon
      const desktopIcon = document.querySelector(`.desktop-icon[data-app="${appName}"] .icon-container`);
      if (desktopIcon) {
        const bgClass = Array.from(desktopIcon.classList).find(cls => cls.endsWith('-icon'));
        if (bgClass) iconBgClass = bgClass;
      }
      const appTitle = winObj.appTitle || appName.charAt(0).toUpperCase() + appName.slice(1).replace(/-/g, ' ');
      const iconEl = document.createElement('div');
      iconEl.className = 'taskbar-app-icon opened-app';
      iconEl.setAttribute('data-window-id', winObj.element.id);
      iconEl.setAttribute('title', appTitle);
      iconEl.innerHTML = `<div class="icon-container ${iconBgClass}"><i class="fas ${iconClass}"></i></div>`;
      iconEl.addEventListener('click', function () {
        const windowToFocus = winObj.element;
        if (windowToFocus) {
          if (windowToFocus.classList.contains('minimized')) {
            toggleMinimizeWindow(windowToFocus, iconEl);
          } else if (activeWindow === windowToFocus) {
            toggleMinimizeWindow(windowToFocus, iconEl);
          } else {
            makeWindowActive(windowToFocus);
          }
        }
      });
      // Update openWindows to point to this icon
      if (openWindows[winObj.element.id]) {
        openWindows[winObj.element.id].taskbarIcon = iconEl;
      }
      taskbarAppIconsContainer.appendChild(iconEl);
      // Animate in if this is a new unpinned icon
      if (!prevUnpinnedIds.has(winObj.element.id)) {
        void iconEl.offsetWidth; // Force reflow before adding animation class
        animateTaskbarIconIn(iconEl);
      }
    });
  
    // After rendering, update the active state
    updateTaskbarActiveState();
  }

  // On load, render pinned icons
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderPinnedTaskbarIcons);
  } else {
    renderPinnedTaskbarIcons();
  }



  // Templates
  const fileExplorerTemplate = document.getElementById('file-explorer-template');

  // State
  const GRID_CELL_WIDTH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--grid-cell-width'));
  const GRID_CELL_HEIGHT = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--grid-cell-height'));
  const GRID_GAP = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--grid-gap'));
  let iconZoomLevel = parseFloat(localStorage.getItem('iconZoomLevel')) || 1.0;


  let draggedIcon = null;
  let isActuallyDraggingIcon = false;
  let dragStartMouseX, dragStartMouseY;
  let dragOffsetX, dragOffsetY;
  const DRAG_THRESHOLD = 5;
  let originalIconTransition = ''; // Variable to store original transition
  const MOBILE_BREAKPOINT = 1023; // Max width for tablet/mobile behavior



  function setupDesktopIcon(icon) {
    // Function to handle app opening
    const openAppFromIcon = function (e) {
      e.stopPropagation();
      e.preventDefault();
      const appName = this.getAttribute('data-app');
      const appTitleElement = this.querySelector('span');
      const appTitle = appTitleElement ? appTitleElement.textContent : 'Unknown App';
      const iconElement = this.querySelector('i');
      const iconContainer = this.querySelector('.icon-container');
      const iconClass = iconElement ? iconElement.className.split(' ').find(cls => cls.startsWith('fa-')) : 'fa-question-circle';
      const iconBgClass = iconContainer ? iconContainer.className.split(' ').find(cls => cls.endsWith('-icon')) : 'gray-icon';
      if (!appName) return;
      openApp(appName, appTitle, iconClass, iconBgClass, this);
    };

    // Desktop: Double click to open
    icon.addEventListener('dblclick', function (e) {
      if (window.innerWidth > MOBILE_BREAKPOINT) {
        openAppFromIcon.call(this, e);
      }
    });

    // Mobile: Single tap to open
    icon.addEventListener('click', function (e) {
      if (window.innerWidth <= MOBILE_BREAKPOINT) {
        openAppFromIcon.call(this, e);
      }
    });

    icon.addEventListener('mousedown', function (e) {
      if (e.button !== 0) return;
      if (!this.classList.contains('selected')) {
        clearIconSelection();
        this.classList.add('selected');
        selectedDesktopIcons.add(this);
      }
      draggedIcon = this;
      isActuallyDraggingIcon = false;
      dragStartMouseX = e.clientX;
      dragStartMouseY = e.clientY;
      dragOffsetX = e.clientX - draggedIcon.getBoundingClientRect().left;
      dragOffsetY = e.clientY - draggedIcon.getBoundingClientRect().top;
      // Store original position for single drag
      iconOriginalLeft = draggedIcon.style.left;
      iconOriginalTop = draggedIcon.style.top;
      // --- Multi-drag: store initial positions of all selected icons ---
      if (selectedDesktopIcons.size > 1) {
        multiDragInitialPositions = Array.from(selectedDesktopIcons).map(icon => {
          const rect = icon.getBoundingClientRect();
          const parentRect = icon.parentElement.getBoundingClientRect();
          return {
            icon,
            left: rect.left - parentRect.left + icon.parentElement.scrollLeft,
            top: rect.top - parentRect.top + icon.parentElement.scrollTop
          };
        });
        multiDragStartMouseX = e.clientX;
        multiDragStartMouseY = e.clientY;
        // Store original positions for multi-drag
        multiDragOriginalPositions = Array.from(selectedDesktopIcons).map(icon => ({
          icon,
          left: icon.style.left,
          top: icon.style.top
        }));
      } else {
        multiDragInitialPositions = null;
        multiDragOriginalPositions = null;
      }
      document.addEventListener('mousemove', globalOnIconMouseMove);
      document.addEventListener('mouseup', globalOnIconMouseUp);
    });
  }


  function clearIconSelection() {
    if (selectedDesktopIcons) {
      selectedDesktopIcons.forEach(icon => icon.classList.remove('selected'));
      selectedDesktopIcons.clear();
    }
  }

  function isIntersecting(rect1, rect2) {
    return !(
      rect1.right < rect2.left ||
      rect1.left > rect2.right ||
      rect1.bottom < rect2.top ||
      rect1.top > rect2.bottom
    );
  }

  function updateSelectedIcons() {
    if (!dragSelector || !desktopArea) return;
    const selectorRect = dragSelector.getBoundingClientRect();
    document.querySelectorAll('.desktop-icon').forEach(icon => {
      const iconRect = icon.getBoundingClientRect();
      if (isIntersecting(selectorRect, iconRect)) {
        icon.classList.add('selected');
        selectedDesktopIcons.add(icon);
      } else {
        icon.classList.remove('selected');
        selectedDesktopIcons.delete(icon);
      }
    });
  }

  function updateSelectedFileItems(contentArea, selectorEl, itemsToSelect, selectedSet) {
    if (!selectorEl || !contentArea || !itemsToSelect || !selectedSet) {
      return;
    }
    const selectorRect = selectorEl.getBoundingClientRect();
    itemsToSelect.forEach(item => {
      const itemRect = item.getBoundingClientRect();
      if (isIntersecting(selectorRect, itemRect)) {
        item.classList.add('selected');
        selectedSet.add(item);
      } else {
        item.classList.remove('selected');
        selectedSet.delete(item);
      }
    });
  }

  function initializeDesktopIconPositions() {
    if (window.innerWidth <= 1023) {
      document.querySelectorAll('.desktop-icon').forEach(icon => {
        icon.style.position = '';
        icon.style.left = '';
        icon.style.top = '';
      });
      return;
    }
    const icons = document.querySelectorAll('.desktop-icon');
    if (!icons || icons.length === 0) {
      console.warn('[GridInit] No desktopIcons found to initialize. Return early.');
      return;
    }
    // Get desktop area and taskbar height
    const desktopArea = document.getElementById('desktop-area');
    const taskbar = document.querySelector('.taskbar');
    const desktopRect = desktopArea.getBoundingClientRect();
    const taskbarHeight = taskbar ? taskbar.offsetHeight : 0;
    const availableHeight = window.innerHeight - taskbarHeight - 50; // 30px bottom margin
    const leftOffset = GRID_GAP; // px from the left
    const topOffset = GRID_GAP; // px from the top
    const verticalGap = GRID_GAP; // Use default grid gap
    const iconHeight = GRID_CELL_HEIGHT;
    const maxRows = Math.max(1, Math.floor((availableHeight - topOffset) / (iconHeight + verticalGap)));
    const colWidth = GRID_CELL_WIDTH + GRID_GAP;
    icons.forEach((icon, index) => {
      const col = Math.floor(index / maxRows);
      const row = index % maxRows;
      const iconLeft = leftOffset + col * colWidth;
      const iconTop = topOffset + row * (iconHeight + verticalGap);
      icon.style.position = 'absolute';
      icon.style.left = iconLeft + 'px';
      icon.style.top = iconTop + 'px';
      icon.dataset.homeLeft = String(iconLeft);
      icon.dataset.homeTop = String(iconTop);
    });
  }

  // ... existing code ...


  // --- Desktop Icon Order Persistence ---
  function getDesktopIconOrder() {
    try {
      return JSON.parse(localStorage.getItem('desktopIconOrder') || '[]');
    } catch (e) { return []; }
  }
  function setDesktopIconOrder(order) {
    localStorage.setItem('desktopIconOrder', JSON.stringify(order));
  }

  function getOrderedDesktopIcons() {
    const order = getDesktopIconOrder();
    const icons = Array.from(document.querySelectorAll('.desktop-icon'));
    if (!order.length) return icons;
    // Sort icons by order, then by DOM order for new icons
    return icons.slice().sort((a, b) => {
      const aApp = a.getAttribute('data-app');
      const bApp = b.getAttribute('data-app');
      const aIdx = order.indexOf(aApp);
      const bIdx = order.indexOf(bApp);
      if (aIdx === -1 && bIdx === -1) return 0;
      if (aIdx === -1) return 1;
      if (bIdx === -1) return -1;
      return aIdx - bIdx;
    });
  }

  function saveCurrentDesktopIconOrder() {
    const icons = Array.from(document.querySelectorAll('.desktop-icon'));
    const order = icons.map(icon => icon.getAttribute('data-app'));
    setDesktopIconOrder(order);
  }



  //Switch desktop and app launcher mode functions

  function switchToAppLauncherMode() {
    if (document.getElementById('app-launcher-desktop')) return;
    const desktopArea = document.getElementById('desktop-area');
    const desktopIconsContainer = document.querySelector('.desktop-icons');
    const taskbar = document.querySelector('.taskbar');
    const widgetsScreen = document.getElementById('widgets-screen');
    const widgetsToggleBtn = document.getElementById('widgets-toggle-btn');
    const appLauncherBtn = document.getElementById('app-launcher-btn');
    // --- FIX: Do NOT hide buttons before animation ---
    // let animCount = 0, animDone = 0;
    let animCount = 0, animDone = 0;
    function onAnimEnd() { animDone++; if (animDone >= animCount) finishSwitch(); }
    // Animate desktop icons
    if (desktopIconsContainer && desktopIconsContainer.style.display !== 'none') {
      animCount++;
      desktopIconsContainer.classList.add('anim-slide-left');
      desktopIconsContainer.addEventListener('animationend', function handler() {
        desktopIconsContainer.removeEventListener('animationend', handler);
        desktopIconsContainer.classList.remove('anim-slide-left');
        desktopIconsContainer.style.display = 'none';
        desktopIconsContainer.style.pointerEvents = 'none';
        onAnimEnd();
      });
    }
    // Animate widgets ONLY if not already hidden
    if (
      widgetsScreen &&
      widgetsScreen.style.display !== 'none' &&
      !widgetsScreen.classList.contains('widgets-hidden')
    ) {
      animCount++;
      widgetsScreen.classList.add('anim-slide-right');
      widgetsScreen.addEventListener('animationend', function handler() {
        widgetsScreen.removeEventListener('animationend', handler);
        widgetsScreen.classList.remove('anim-slide-right');
        widgetsScreen.style.display = 'none';
        onAnimEnd();
      });
    }
    // Animate taskbar
    if (taskbar && taskbar.style.display !== 'none') {
      animCount++;
      taskbar.classList.add('anim-slide-down');
      taskbar.addEventListener('animationend', function handler() {
        taskbar.removeEventListener('animationend', handler);
        taskbar.classList.remove('anim-slide-down');
        taskbar.style.display = 'none';
        onAnimEnd();
      });
    }
    // --- FIX: Do NOT hide widgetsToggleBtn before animation ---
    // if (widgetsToggleBtn) widgetsToggleBtn.style.display = 'none';
    if (animCount === 0) finishSwitch();

    function finishSwitch() {
      // --- Ensure easy mode is OFF when entering app launcher mode ---
      window._easyMode = false;
      document.body.classList.remove('easy-mode');
      const desktopArea = document.getElementById('desktop-area');
      if (desktopArea) desktopArea.classList.remove('easy-mode');

      const desktopIconsContainer = document.querySelector('.desktop-icons');
      const taskbar = document.querySelector('.taskbar');
      const widgetsScreen = document.getElementById('widgets-screen');
      const widgetsToggleBtn = document.getElementById('widgets-toggle-btn');
      // Hide app-launcher-btn in app-launcher-taskbar-right
      const appLauncherBtn = document.getElementById('app-launcher-btn');
      if (appLauncherBtn) appLauncherBtn.style.display = 'none';
      if (widgetsToggleBtn) widgetsToggleBtn.style.display = 'none';
      // Hide entire desktop icons container and disable pointer events
      if (desktopIconsContainer) {
        desktopIconsContainer.style.display = 'none';
        desktopIconsContainer.style.pointerEvents = 'none';
      }
      if (taskbar) taskbar.style.display = 'none';
      // Hide widgets and toggle
      if (widgetsScreen) widgetsScreen.style.display = 'none';
      if (widgetsToggleBtn) widgetsToggleBtn.style.display = 'none';
      // Remove any previous app-launcher-desktop if present
      let launcherDesktop = document.getElementById('app-launcher-desktop');
      if (launcherDesktop) launcherDesktop.remove();
      // Remove App Launcher overlay if present
      const appLauncherOverlay = document.getElementById('app-launcher-overlay');
      if (appLauncherOverlay && appLauncherOverlay.parentNode) appLauncherOverlay.parentNode.removeChild(appLauncherOverlay);
      // Remove App Launcher desktop icon if present
      const appLauncherIcon = document.querySelector('.desktop-icon[data-app="app-launcher"]');
      if (appLauncherIcon && appLauncherIcon.parentNode) {
        window._appLauncherIconWasPresent = true;
        appLauncherIcon.parentNode.removeChild(appLauncherIcon);
      } else {
        window._appLauncherIconWasPresent = false;
      }
      // Create the app launcher desktop container
      launcherDesktop = document.createElement('div');
      launcherDesktop.id = 'app-launcher-desktop';
      launcherDesktop.style.position = 'absolute';
      launcherDesktop.style.top = '0';
      launcherDesktop.style.left = '0';
      launcherDesktop.style.width = '100%';
      launcherDesktop.style.height = '100%';
      launcherDesktop.style.display = 'flex';
      launcherDesktop.style.flexDirection = 'column';

      // --- Top Bar ---
      const topBar = createAppLauncherTopBar();
      launcherDesktop.appendChild(topBar);

      // --- App Grid ---
      const grid = document.createElement('div');
      grid.className = 'app-launcher-grid';
      grid.style.display = 'grid';
      grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(90px, 1fr))';
      grid.style.gap = '32px';
      grid.style.width = 'min(90vw, 900px)';
      grid.style.maxWidth = '100vw';
      grid.style.margin = 'auto';
      grid.style.justifyItems = 'center';
      grid.style.alignItems = 'start';
      grid.style.padding = '0 0 90px 0';
      grid.style.flex = '1 1 0';
      grid.style.alignItems = 'center';
      grid.style.justifyContent = 'center';
      grid.style.alignContent = 'center';
      // Only use startMenuApps to populate the grid
      if (startMenuApps) {
        startMenuApps.forEach(app => {
          const appItem = document.createElement('div');
          appItem.className = 'app-launcher-app';
          appItem.style.display = 'flex';
          appItem.style.flexDirection = 'column';
          appItem.style.alignItems = 'center';
          appItem.style.justifyContent = 'center';
          appItem.style.minHeight = '120px';
          appItem.style.cursor = 'pointer';
          appItem.style.userSelect = 'none';
          appItem.tabIndex = 0;
          appItem.setAttribute('data-app', app.id);
          appItem.innerHTML = `<div class="icon-container ${app.iconBgClass}" style="width:64px;height:64px;border-radius:16px;display:flex;align-items:center;justify-content:center;font-size:28px;box-shadow:0 4px 16px rgba(0,0,0,0.18);margin-bottom:10px;"><i class="fas ${app.iconClass}"></i></div><span style="font-size:14px;color:#fff;margin-top:5px;text-shadow:0 1px 4px #222;text-align:center;width:100%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:block;">${app.name}</span>`;
          // Attach click event to the entire appItem
          appItem.addEventListener('click', function (e) {
            openApp(app.id, app.name, app.iconClass, app.iconBgClass, appItem);
          });
          grid.appendChild(appItem);
        });
      }
      launcherDesktop.appendChild(grid);
      // Add to desktop area
      if (desktopArea) desktopArea.appendChild(launcherDesktop);
      // Add a class to desktopArea for mode
      if (desktopArea) desktopArea.classList.add('app-launcher-mode');
      // Add a class to body for mode
      document.body.classList.add('app-launcher-mode');
      // Attach desktop context menu to app-launcher-desktop
      if (launcherDesktop) {
        launcherDesktop.addEventListener('contextmenu', function (e) {
          // Prevent right-click context menu in app launcher mode
          e.preventDefault();
          return false;
        });
      }

      // Show and animate in the taskbar for app launcher mode
      if (taskbar) {
        taskbar.style.display = '';
        taskbar.classList.add('anim-slide-up');
        taskbar.addEventListener('animationend', function handler() {
          taskbar.removeEventListener('animationend', handler);
          taskbar.classList.remove('anim-slide-up');
        });
      }

      // --- Animate in top bar and grid ---
      // Animate in the top bar
      topBar.classList.add('anim-slide-down');
      topBar.addEventListener('animationend', function handler() {
        topBar.removeEventListener('animationend', handler);
        topBar.classList.remove('anim-slide-down');
      });
      // Animate in the app grid
      grid.classList.add('anim-zoom-in');
      grid.addEventListener('animationend', function handler() {
        grid.removeEventListener('animationend', handler);
        grid.classList.remove('anim-zoom-in');
      });
      // Ensure taskbar position is correct for app launcher mode
      updateAppLauncherTaskbarPosition();
      // --- FIX: Re-attach volume panel listeners after mode switch ---
      if (typeof setupVolumePanelListeners === 'function') setupVolumePanelListeners();
      if (typeof attachVolumeBtnHandler === 'function') attachVolumeBtnHandler();
    }
  }
  function switchToDesktopMode() {
    const desktopArea = document.getElementById('desktop-area');
    const desktopIconsContainer = document.querySelector('.desktop-icons');
    const taskbar = document.querySelector('.taskbar');
    const widgetsScreen = document.getElementById('widgets-screen');
    const widgetsToggleBtn = document.getElementById('widgets-toggle-btn');
    const appLauncherBtn = document.getElementById('app-launcher-btn');
    const launcherDesktop = document.getElementById('app-launcher-desktop');
    let animCount = 0, animDone = 0;

    function onAnimEnd() {
      animDone++;
      if (animDone >= animCount) finishRestore();
    }

    // Animate out App Launcher UI if present
    if (launcherDesktop) {
      const grid = launcherDesktop.querySelector('.app-launcher-grid');
      if (grid && grid.offsetParent !== null) {
        animCount++;
        grid.classList.add('anim-zoom-out');
        grid.addEventListener('animationend', function handler() {
          grid.removeEventListener('animationend', handler);
          grid.classList.remove('anim-zoom-out');
          grid.style.display = 'none';
          onAnimEnd();
        });
      }
      const topBar = launcherDesktop.querySelector('.app-launcher-top-bar');
      if (topBar && topBar.offsetParent !== null) {
        animCount++;
        topBar.classList.add('anim-slide-up');
        topBar.addEventListener('animationend', function handler() {
          topBar.removeEventListener('animationend', handler);
          topBar.classList.remove('anim-slide-up');
          topBar.style.display = 'none';
          onAnimEnd();
        });
      }
    }

    // ADD THIS:
    const launcherTaskbar = launcherDesktop.querySelector('.taskbar');
    if (taskbar && taskbar.style.display !== 'none') {
      animCount++;
      taskbar.classList.add('anim-slide-down');
      taskbar.addEventListener('animationend', function handler() {
        taskbar.removeEventListener('animationend', handler);
        taskbar.classList.remove('anim-slide-down');
        taskbar.style.display = 'none';
        onAnimEnd();
      });
    }

    if (animCount === 0) finishRestore();

    function finishRestore() {
      // Remove App Launcher DOM
      const launcherDesktop = document.getElementById('app-launcher-desktop');
      if (launcherDesktop) launcherDesktop.remove();


      // Remove all wrappers
      document.querySelectorAll('.app-launcher-taskbar-right, .app-launcher-taskbar-right .taskbar-right').forEach(el => el.remove());
      // Re-render the right icons
      const taskbarRight = document.querySelector('.taskbar-right');
      if (taskbarRight && typeof renderPinnedTaskbarIcons === 'function') {
        renderPinnedTaskbarIcons();
      }

      // Restore desktop icons container and pointer events
      if (desktopIconsContainer) {
        desktopIconsContainer.style.display = '';
        desktopIconsContainer.style.pointerEvents = '';
        desktopIconsContainer.classList.add('anim-slide-right');
        desktopIconsContainer.addEventListener('animationend', function handler() {
          desktopIconsContainer.removeEventListener('animationend', handler);
          desktopIconsContainer.classList.remove('anim-slide-right');
        });
      }

      // Restore taskbar
      if (taskbar) {
        taskbar.style.display = '';
        taskbar.classList.add('anim-slide-up');
        taskbar.addEventListener('animationend', function handler() {
          taskbar.removeEventListener('animationend', handler);
          taskbar.classList.remove('anim-slide-up');
        });
      }



      // Restore widgets and toggle
      if (widgetsScreen) {
        widgetsScreen.style.display = '';
        if (!widgetsScreen.classList.contains('widgets-hidden')) {
          widgetsScreen.classList.add('anim-slide-in-right');
          widgetsScreen.addEventListener('animationend', function handler() {
            widgetsScreen.removeEventListener('animationend', handler);
            widgetsScreen.classList.remove('anim-slide-in-right');
          });
        }
        window.widgetsVisible = !widgetsScreen.classList.contains('widgets-hidden');
      }

      if (widgetsScreen) {
        widgetsScreen.style.display = '';
        window.widgetsVisible = !widgetsScreen.classList.contains('widgets-hidden');
      }

      if (widgetsToggleBtn) widgetsToggleBtn.style.display = '';
      // Restore App Launcher desktop icon if missing
      if (
        desktopIconsContainer &&
        window._appLauncherIconWasPresent &&
        !document.querySelector('.desktop-icon[data-app=\"app-launcher\"]')
      ) {
        const appLauncherIcon = document.createElement('div');
        appLauncherIcon.className = 'desktop-icon';
        appLauncherIcon.setAttribute('data-app', 'app-launcher');
        appLauncherIcon.innerHTML = `
      <div class="icon-container blue-icon"><i class="fas fa-th"></i></div>
      <span>App launcher</span>
    `;
        desktopIconsContainer.appendChild(appLauncherIcon);
      }
      window._appLauncherIconWasPresent = undefined;

      // Remove mode classes
      if (desktopArea) {
        desktopArea.classList.remove('app-launcher-mode');
        desktopArea.classList.remove('easy-mode'); // FIX: Remove easy-mode
      }
      document.body.classList.remove('app-launcher-mode');
      document.body.classList.remove('easy-mode'); // FIX: Remove easy-mode
      if (appLauncherBtn) appLauncherBtn.style.display = '';
      if (widgetsToggleBtn) widgetsToggleBtn.style.display = '';
      // --- Restore window headers and size for all open windows ---
      for (const id in openWindows) {
        const winObj = openWindows[id];
        const win = winObj.element;
        if (!win) continue;
        // Restore window-header if hidden
        const header = win.querySelector('.window-header');
        if (header) header.style.display = '';
        // Restore settings-header if hidden
        const settingsHeader = win.querySelector('.settings-header');
        if (settingsHeader) settingsHeader.style.display = '';
        // Restore window-controls
        const controls = win.querySelector('.window-controls');
        if (controls) controls.style.display = '';
        // Move window-title back to header if it was in sidebar
        const sidebar = win.querySelector('.file-explorer-sidebar, .settings-sidebar, .app-store-sidebar');
        const windowTitle = sidebar && sidebar.querySelector('.easy-mode-window-title');
        if (windowTitle && header) {
          windowTitle.classList.remove('easy-mode-window-title');
          windowTitle.style = '';
          header.insertBefore(windowTitle, header.firstChild);
          const sep = sidebar.querySelector('.easy-mode-title-separator');
          if (sep) sep.remove();
        }
        // Restore window size and remove maximized/fullscreen styles
        win.classList.remove('maximized');
        win.style.borderRadius = '';
        // Add transition for smooth animation
        win.style.transition = 'width 0.32s cubic-bezier(0.4,0,0.2,1), height 0.32s cubic-bezier(0.4,0,0.2,1), left 0.32s cubic-bezier(0.4,0,0.2,1), top 0.32s cubic-bezier(0.4,0,0.2,1)';

        // Set default size
        let targetWidth, targetHeight;
        if (win.classList.contains('calculator-window')) {
          targetWidth = 530;
          targetHeight = 560;
          win.style.width = targetWidth + 'px';
          win.style.height = targetHeight + 'px';
        } else if (win.classList.contains('photoshop-window')) {
          targetWidth = Math.round(window.innerWidth * 0.9);
          targetHeight = Math.round(window.innerHeight * 0.85);
          win.style.width = targetWidth + 'px';
          win.style.height = targetHeight + 'px';
        } else {
          targetWidth = 800;
          targetHeight = 600;
          win.style.width = targetWidth + 'px';
          win.style.height = targetHeight + 'px';
        }

        // Now center the window after the size is applied
        requestAnimationFrame(() => {
          // Use the targetWidth/targetHeight for centering, not offsetWidth/offsetHeight
          const left = Math.max(0, Math.round((window.innerWidth - targetWidth) / 2));
          const top = Math.max(0, Math.round((window.innerHeight - targetHeight) / 2));
          win.style.left = left + 'px';
          win.style.top = top + 'px';
        });

        // Remove the transition after the animation completes
        win.addEventListener('transitionend', function handler(ev) {
          if (['width', 'height', 'left', 'top'].includes(ev.propertyName)) {
            win.style.transition = '';
            win.removeEventListener('transitionend', handler);
          }
        });
      }
      // Always restore widgetsToggleBtn display on desktop mode (robust fix)
      if (widgetsToggleBtn) widgetsToggleBtn.style.display = '';
      // FINAL: Always show widgets toggle button in desktop mode
      const widgetsToggleBtnFinal = document.getElementById('widgets-toggle-btn');
      if (widgetsToggleBtnFinal) widgetsToggleBtnFinal.style.display = 'flex';
      // --- FIX: Re-attach volume panel listeners after mode switch ---
      if (typeof setupVolumePanelListeners === 'function') setupVolumePanelListeners();
      if (typeof attachVolumeBtnHandler === 'function') attachVolumeBtnHandler();
    }

    // ... existing code in switchToDesktopMode ...

    // Move right icons back to the main taskbar
    const launcherTaskbarRight = document.querySelector('.app-launcher-taskbar-right .taskbar-right');
    const mainTaskbarRight = document.querySelector('.taskbar-right');
    if (launcherTaskbarRight && mainTaskbarRight) {
      Array.from(launcherTaskbarRight.children).forEach(child => {
        mainTaskbarRight.appendChild(child);
      });
    }

    // Restore taskbar right icons
    const taskbarRight = document.querySelector('.taskbar-right');
    if (taskbarRight) {
      taskbarRight.style.display = '';
      // If you have a render function, call it:
      if (typeof renderPinnedTaskbarIcons === 'function') {
        renderPinnedTaskbarIcons();
      }
      // --- FIX: Re-attach context menu listeners to right icons ---
      taskbarRight.querySelectorAll('.taskbar-icon, .taskbar-time, .taskbar-ai').forEach(attachTaskbarIconListeners);
      // --- Ensure widgets toggle button is present and correct ---
      let widgetsToggleBtn = document.getElementById('widgets-toggle-btn');
      if (!widgetsToggleBtn) {
        widgetsToggleBtn = document.createElement('button');
        widgetsToggleBtn.id = 'widgets-toggle-btn';
        widgetsToggleBtn.className = 'taskbar-icon';
        widgetsToggleBtn.innerHTML = '<span id="widgets-toggle-arrow"><i class="fas fa-chevron-right"></i></span>';
        taskbarRight.appendChild(widgetsToggleBtn);
      } else {
        // Enforce correct structure and IDs
        widgetsToggleBtn.className = 'taskbar-icon';
        widgetsToggleBtn.innerHTML = '<span id="widgets-toggle-arrow"><i class="fas fa-chevron-right"></i></span>';
      }
      attachWidgetsToggleBtnListener();
    }
    if (widgetsScreen) {
      window.widgetsVisible = !widgetsScreen.classList.contains('widgets-hidden');
    }
    // After restoring taskbar right icons, ensure widgetsToggleBtn is visible
    if (widgetsToggleBtn) widgetsToggleBtn.style.display = '';
  }









  // --- START MENU LOGIC (moved to bottom for robustness) ---

  

  function categoryLinkClickHandler(e) {
    e.preventDefault();
    console.log('Category link clicked!'); // DEBUG
    startMenuAppSortMode = (startMenuAppSortMode === 'category') ? 'alphabet' : 'category';
    populateStartMenuApps();
    // Update button text/icon
    const categoryLink = e.currentTarget;
    if (startMenuAppSortMode === 'category') {
      categoryLink.innerHTML = '<i class="fas fa-arrow-down-a-z"></i> Alphabet';
    } else {
      categoryLink.innerHTML = '<i class="fas fa-sliders-h"></i> Category';
    }
  }

  function attachCategoryLinkHandler() {
    const categoryLink = document.querySelector('.start-menu-category-link');
    if (categoryLink) {
      categoryLink.removeEventListener('click', categoryLinkClickHandler);
      categoryLink.addEventListener('click', categoryLinkClickHandler);
    }
  }

  function populateStartMenuApps() {
    console.log('populateStartMenuApps called, mode:', startMenuAppSortMode); // DEBUG
    const startMenuLeftPanel = document.querySelector('.start-menu-left-panel');
    if (!startMenuLeftPanel) return;
    const existingSections = startMenuLeftPanel.querySelectorAll('.app-grid-section');
    existingSections.forEach(section => section.remove());

    if (startMenuAppSortMode === 'alphabet') {
      // Alphabet mode: single grid, all apps sorted by name
      const allApps = [...startMenuApps].sort((a, b) => a.name.localeCompare(b.name));
      const appGridSection = document.createElement('div');
      appGridSection.className = 'app-grid-section';
      const appGrid = document.createElement('div');
      appGrid.className = 'app-grid';
      allApps.forEach(app => {
        const appItem = document.createElement('div');
        appItem.className = 'app-grid-item';
        appItem.setAttribute('data-app', app.id);
        appItem.setAttribute('data-app-name', app.name.toLowerCase());
        appItem.innerHTML = `
        <div class=\"app-icon-bg ${app.iconBgMenuClass}\">\n          <i class=\"fas ${app.iconClass}\"></i>\n        </div>\n        <span>${app.name}</span>\n      `;
        const openStartMenuApp = (e) => {
          openApp(app.id, app.name, app.iconClass, app.iconBgClass, appItem);
          closeStartMenuAnimated();
        };
        appItem.addEventListener('click', openStartMenuApp);
        appGrid.appendChild(appItem);
      });
      appGridSection.appendChild(appGrid);
      startMenuLeftPanel.appendChild(appGridSection);
    } else {
      // Category mode (default)
      const categories = {};
      startMenuApps.forEach(app => {
        if (!categories[app.category]) categories[app.category] = [];
        categories[app.category].push(app);
      });
      for (const categoryName in categories) {
        if (categories[categoryName].length > 0) {
          const appGridSection = document.createElement('div');
          appGridSection.className = 'app-grid-section';
          appGridSection.setAttribute('data-category-name', categoryName);
          const categoryHeader = document.createElement('h4');
          categoryHeader.textContent = categoryName;
          appGridSection.appendChild(categoryHeader);
          const appGrid = document.createElement('div');
          appGrid.className = 'app-grid';
          categories[categoryName].forEach(app => {
            const appItem = document.createElement('div');
            appItem.className = 'app-grid-item';
            appItem.setAttribute('data-app', app.id);
            appItem.setAttribute('data-app-name', app.name.toLowerCase());
            appItem.innerHTML = `
            <div class=\"app-icon-bg ${app.iconBgMenuClass}\">\n              <i class=\"fas ${app.iconClass}\"></i>\n            </div>\n            <span>${app.name}</span>\n          `;
            const openStartMenuApp = (e) => {
              openApp(app.id, app.name, app.iconClass, app.iconBgClass, appItem);
              closeStartMenuAnimated();
            };
            appItem.addEventListener('click', openStartMenuApp);
            appGrid.appendChild(appItem);
          });
          appGridSection.appendChild(appGrid);
          startMenuLeftPanel.appendChild(appGridSection);
        }
      }
    }
    attachCategoryLinkHandler(); // Ensure handler is always attached
  }

  function filterStartMenuApps(searchTerm) {
    const startMenuLeftPanel = document.querySelector('.start-menu-left-panel');
    if (!startMenuLeftPanel) return;
    const term = searchTerm.toLowerCase();
    const appSections = startMenuLeftPanel.querySelectorAll('.app-grid-section');
    appSections.forEach(section => {
      const appItems = [];
      startMenuApps.forEach(app => {
        // ... create appItem, add listeners, etc ...
        grid.appendChild(appItem);
        appItems.push(appItem);
      }); // <-- End of forEach

      // Now define the function here:
      function openAppFromLauncher(appItem) {
        appItems.forEach(item => item.classList.remove('selected'));
        appItem.classList.add('selected');
        openApp(
          appItem.getAttribute('data-app'),
          appItem.querySelector('span').textContent,
          appItem.querySelector('i').className.split(' ').find(cls => cls.startsWith('fa-')),
          appItem.className.split(' ').find(cls => cls.endsWith('-icon'))
        );
        closeLauncher();
      }
      let sectionHasVisibleItems = false;
      appItems.forEach(item => {
        const appName = item.getAttribute('data-app-name');
        const isVisible = appName.includes(term);
        item.style.display = isVisible ? '' : 'none';
        if (isVisible) sectionHasVisibleItems = true;
      });
      section.style.display = sectionHasVisibleItems ? '' : 'none';
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    const startMenuLeftPanel = document.querySelector('.start-menu-left-panel');
    if (startMenuLeftPanel) {
      startMenuLeftPanel.addEventListener('click', function (e) {
        const categoryLink = e.target.closest('.start-menu-category-link');
        if (categoryLink) {
          e.preventDefault();
          console.log('Category link clicked!'); // DEBUG
          startMenuAppSortMode = (startMenuAppSortMode === 'category') ? 'alphabet' : 'category';
          populateStartMenuApps();
          // Update button text/icon
          if (startMenuAppSortMode === 'category') {
            categoryLink.innerHTML = '<i class="fas fa-arrow-down-a-z"></i> Alphabet';
          } else {
            categoryLink.innerHTML = '<i class="fas fa-sliders-h"></i> Category';
          }
        }
      });
    }
    populateStartMenuApps();
    attachCategoryLinkHandler();
  });

  // --- Desktop Icon Arrangement Mode ---
  let desktopIconArrangeMode = localStorage.getItem('desktopIconArrangeMode') || 'align-grid'; // 'auto-arrange' or 'align-grid'

  // Save and load icon order
  function getDesktopIconOrder() {
    try {
      return JSON.parse(localStorage.getItem('desktopIconOrder') || '[]');
    } catch (e) { return []; }
  }
  function setDesktopIconOrder(order) {
    localStorage.setItem('desktopIconOrder', JSON.stringify(order));
  }
  function getOrderedDesktopIcons() {
    const order = getDesktopIconOrder();
    const icons = Array.from(document.querySelectorAll('.desktop-icon'));
    if (!order.length) return icons;
    return icons.slice().sort((a, b) => {
      const aApp = a.getAttribute('data-app');
      const bApp = b.getAttribute('data-app');
      const aIdx = order.indexOf(aApp);
      const bIdx = order.indexOf(bApp);
      if (aIdx === -1 && bIdx === -1) return 0;
      if (aIdx === -1) return 1;
      if (bIdx === -1) return -1;
      return aIdx - bIdx;
    });
  }













  // Patch executeContextMenuAction to handle toggling
  const _originalExecuteContextMenuAction = executeContextMenuAction;





  function updateCurrentTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    if (currentTimeEl) currentTimeEl.textContent = `${hours}:${minutes}`;
  }
  if (startButton && startMenu) {
    startButton.addEventListener('click', function () {
      if (startMenu.classList.contains('start-menu-style-app-launcher')) {
        openAppLauncherWindow(startButton);
        return;
      }
      if (startMenu.style.display === 'block') {
        // Animate close
        startMenu.classList.remove('start-menu-anim-open');
        startMenu.classList.add('start-menu-anim-close');
        startMenu.addEventListener('animationend', function handler() {
          startMenu.style.display = 'none';
          startMenu.classList.remove('start-menu-anim-close');
          startMenu.removeEventListener('animationend', handler);
        });
      } else {
        // Animate open
        startMenu.style.display = 'block';
        startMenu.classList.remove('start-menu-anim-close');
        startMenu.classList.add('start-menu-anim-open');
      }
    });
  }

  document.addEventListener('click', function (e) {
    if (startMenu && !startMenu.contains(e.target) && e.target !== startButton && !startButton.contains(e.target)) {
      if (startMenu.style.display === 'block') {
        startMenu.classList.remove('start-menu-anim-open');
        startMenu.classList.add('start-menu-anim-close');
        startMenu.addEventListener('animationend', function handler() {
          startMenu.style.display = 'none';
          startMenu.classList.remove('start-menu-anim-close');
          startMenu.removeEventListener('animationend', handler);
        });
      }
    }
    if (contextMenu && !contextMenu.classList.contains('hidden') && !contextMenu.contains(e.target)) {
      hideContextMenu();
    }
    if (e.target === desktopArea && !isDraggingSelector && !draggedIcon) {
      clearIconSelection();
    }
  });

  document.querySelectorAll('.desktop-icon').forEach(setupDesktopIcon);

  document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', function () {
      const span = this.querySelector('span');
      if (!span) {
        const itemName = this.textContent.trim();
        if (itemName === 'WEBSITE') { /* ... */ }
        else if (itemName === 'SETTINGS') { openApp('settings', 'Settings', 'fa-cog', 'green'); }
        closeStartMenuAnimated();
        return;
      }
      const appTitle = span.textContent;
      const iconElement = this.querySelector('.menu-icon i');
      const iconBgElement = this.querySelector('.menu-icon');
      if (!iconElement || !iconBgElement) return;
      const iconClass = iconElement.className.split(' ').find(cls => cls.startsWith('fa-'));
      const iconBgClass = iconBgElement.className.split(' ').find(cls => cls.endsWith('-icon') || ['orange', 'blue', 'red', 'teal', 'purple', 'gray'].includes(cls));
      let appName = appTitle.toLowerCase().replace(/\s+/g, '-');
      if (appTitle === 'Settings') appName = 'settings';
      if (appName && appTitle && iconClass && iconBgClass) {
        openApp(appName, appTitle, iconClass, iconBgClass);
        closeStartMenuAnimated();
      }
    });
  });



  function openApp(appName, appTitle, iconClassFromClick, iconBgClassFromClick, iconElementForAnim) {
    // Prevent duplicate windows for all apps except those that should allow multiples
    const allowMultiple = (appName === 'my-files'); // Add more app names if needed
    if (!allowMultiple) {
      for (const id in openWindows) {
        if (openWindows[id].name === appName && openWindows[id].element && !openWindows[id].element.classList.contains('minimized')) {
          makeWindowActive(openWindows[id].element);
          return;
        }
        if (openWindows[id].name === appName && openWindows[id].element && openWindows[id].element.classList.contains('minimized')) {
          toggleMinimizeWindow(openWindows[id].element, openWindows[id].taskbarIcon);
          makeWindowActive(openWindows[id].element);
          return;
        }
      }
    }

    // --- FIX: Remove pinned-only icon if present ---
    // --- Get pinned icon rect BEFORE removing it ---
    let iconRect = null;
    const pinnedIcon = taskbarAppIconsContainer.querySelector('.taskbar-app-icon.pinned-only[data-app="' + appName + '"]');
    if (iconElementForAnim && iconElementForAnim.getBoundingClientRect) {
      iconRect = iconElementForAnim.getBoundingClientRect();
    } else if (pinnedIcon && pinnedIcon.getBoundingClientRect) {
      iconRect = pinnedIcon.getBoundingClientRect();
    } else {
      const desktopIcon = document.querySelector(`.desktop-icon[data-app="${appName}"]`);
      if (desktopIcon) {
        iconRect = desktopIcon.getBoundingClientRect();
      }
    }
    if (pinnedIcon) pinnedIcon.remove();

    windowIdCounter++;
    const windowId = `window-${windowIdCounter}`;


    let windowElement = null;
    let isFileExplorer = false;
    let delayedContentLoader = null;
    const appDetails = getAppIconDetails(appName);
    const finalIconClass = iconClassFromClick || appDetails.iconClass;
    const finalIconBgClass = iconBgClassFromClick || appDetails.iconBgClass;



    // --- Prepare window shell only, delay content ---
    switch (appName) {
      case 'app-launcher':
        openAppLauncherWindow(iconElementForAnim);
        return;
      case 'my-files':
        windowElement = createWindowFromTemplate('file-explorer', windowId, true); // true = delay content
        appTitle = 'File Explorer';
        isFileExplorer = true;
        delayedContentLoader = () => {
          setupFileExplorerInteraction(windowElement);
          setupSidebarToggleForFileExplorer(windowElement);
        };
        break;
      case 'settings':
      case 'settings-sm':
        windowElement = createWindowFromTemplate('settings-app', windowId, true);
        appTitle = 'Settings';
        delayedContentLoader = () => setupSettingsApp(windowElement);
        break;
      case 'app-store':
      case 'app-store-sm':
        windowElement = createWindowFromTemplate('app-store', windowId, true);
        appTitle = 'AppStore';
        delayedContentLoader = () => setupFileExplorerInteraction(windowElement);
        break;
      case 'calculator':
      case 'calculator-sm':
        windowElement = createWindowFromTemplate('calculator-app', windowId, true);
        appTitle = 'Calculator';
        delayedContentLoader = () => setupCalculatorApp(windowElement);
        break;
      case 'photoshop':
      case 'photoshop-sm':
        windowElement = createWindowFromTemplate('photoshop-app', windowId, true);
        appTitle = 'Photoshop';
        // For iframe-based apps, delay iframe src injection
        delayedContentLoader = () => {
          const iframe = windowElement.querySelector('iframe');
          if (iframe && iframe.dataset.src) iframe.src = iframe.dataset.src;
        };
        break;
      default:
        const title = appTitle || appName.charAt(0).toUpperCase() + appName.slice(1).replace(/-/g, ' ');
        windowElement = createGenericWindow(title, finalIconClass, finalIconBgClass, windowId, true);
        break;
    }
    if (windowElement) {
      // --- iOS-like open from icon effect ---
      let contentInjected = false;
      if (iconRect) {
        // Instantly place window at icon's position/scale, then animate to center
        requestAnimationFrame(() => {
          // Get window's final rect (after centering)
          const winRect = windowElement.getBoundingClientRect();
          const scaleX = iconRect.width / winRect.width;
          const scaleY = iconRect.height / winRect.height;
          const iconCenterX = iconRect.left + iconRect.width / 2;
          const iconCenterY = iconRect.top + iconRect.height / 2;
          const winCenterX = winRect.left + winRect.width / 2;
          const winCenterY = winRect.top + winRect.height / 2;
          const translateX = iconCenterX - winCenterX;
          const translateY = iconCenterY - winCenterY;
          // Set initial transform (window appears at icon)
          windowElement.style.transformOrigin = 'center center';
          windowElement.style.transition = 'none';
          windowElement.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scaleX}, ${scaleY})`;
          // Next frame, animate to normal
          requestAnimationFrame(() => {
            windowElement.style.transition = 'transform 0.35s cubic-bezier(0.4,0,0.2,1)';
            windowElement.style.transform = 'translate(0,0) scale(1,1)';
            // Inject/load content for all apps now (before animation ends)
            if (delayedContentLoader && !contentInjected) {
              delayedContentLoader();
              contentInjected = true;
            }
            // Clean up after animation
            setTimeout(() => {
              windowElement.style.transition = '';
              windowElement.style.transform = '';
            }, 370);
          });
        });
      } else {
        // Fallback: use the normal open animation
        windowElement.classList.add('window-anim-open');
        windowElement.addEventListener('animationend', function handler(e) {
          if (e.animationName === 'windowOpenIOS') {
            windowElement.classList.remove('window-anim-open');
            windowElement.removeEventListener('animationend', handler);
            if (delayedContentLoader && !contentInjected) {
              delayedContentLoader();
              contentInjected = true;
            }
          }
        });
      }
      // ---
      const taskbarIcon = createTaskbarIcon(windowId, appName, finalIconClass, appTitle);
      openWindows[windowId] = {
        element: windowElement,
        taskbarIcon: taskbarIcon,
        name: appName,
        title: appTitle,
        iconClass: finalIconClass,
        iconBgClass: finalIconBgClass,
        appTitle: appTitle
      };
      makeWindowActive(windowElement);
      // --- EASY MODE: maximize and hide header ---
      if (window._easyMode && document.body.classList.contains('easy-mode')) {
        // Maximize window to fill desktop area
        windowElement.classList.add('maximized');
        windowElement.style.left = '0px';
        windowElement.style.top = '0px';
        windowElement.style.width = '100%';
        windowElement.style.height = '100%';
        windowElement.style.borderRadius = '0';
        // Hide window header
        const header = windowElement.querySelector('.window-header');
        if (header) header.style.display = 'none';
        // Also hide settings-header if present
        const settingsHeader = windowElement.querySelector('.settings-header');
        if (settingsHeader) settingsHeader.style.display = 'none';
        // Optionally hide window controls
        const controls = windowElement.querySelector('.window-controls');
        if (controls) controls.style.display = 'none';
        // --- Move window-title to sidebar ---
        const windowTitle = windowElement.querySelector('.window-title');
        const sidebar = windowElement.querySelector('.file-explorer-sidebar, .settings-sidebar, .app-store-sidebar');
        if (windowTitle && sidebar && !sidebar.querySelector('.easy-mode-window-title')) {
          // Clone or move the windowTitle (move is better to preserve events/icons)
          windowTitle.classList.add('easy-mode-window-title');
          // Remove margin/padding if any
          windowTitle.style.margin = '0';
          windowTitle.style.padding = '0 10px 2px 10px';
          windowTitle.style.display = 'flex';
          windowTitle.style.alignItems = 'center';
          windowTitle.style.gap = '4px';
          windowTitle.style.fontSize = '14px';
          windowTitle.style.fontWeight = 'bold';
          windowTitle.style.background = 'none';
          windowTitle.style.border = 'none';
          windowTitle.style.whiteSpace = 'nowrap';
          // Insert at top of sidebar
          sidebar.insertBefore(windowTitle, sidebar.firstChild);
          // Add a separator after the title
          const sep = document.createElement('div');
          sep.className = 'easy-mode-title-separator';
          sep.style.height = '1px';
          sep.style.background = 'rgba(255,255,255,0.10)';
          sep.style.margin = '8px 0 8px 0';
          sidebar.insertBefore(sep, windowTitle.nextSibling);
        }
      }
      // Do not call setupFileExplorerInteraction or other content loaders here!
    }
    // Always update the taskbar after opening an app
    renderPinnedTaskbarIcons();
  }

  function createWindowFromTemplate(templateId, windowId, delayContent) {
    const template = document.getElementById(`${templateId}-template`);
    if (!template) return null;
    const windowClone = template.content.cloneNode(true);
    if (!windowClone) return null;
    const windowElement = windowClone.querySelector('.window');
    if (!windowElement) return null;
    windowElement.id = windowId;
    setupWindowControls(windowElement);
    windowsContainer.appendChild(windowElement);
    positionWindowCenter(windowElement);
    // If delayContent, remove or hide main content for now (if needed)
    if (delayContent) {
      // For iframe-based apps, set iframe src to blank and store real src in data-src
      const iframe = windowElement.querySelector('iframe');
      if (iframe && iframe.src) {
        iframe.dataset.src = iframe.src;
        iframe.src = '';
      }
      // Optionally, hide content area if needed (not strictly necessary)
    }
    return windowElement;
  }
  function createGenericWindow(title, iconClass, iconBgClass, windowId, delayContent) {
    const windowElement = document.createElement('div');
    windowElement.className = 'window';
    windowElement.id = windowId;
    windowElement.style.width = '800px';
    windowElement.style.height = '600px';
    // If delayContent, leave content area empty for now
    windowElement.innerHTML = `
      <div class="window-header">
        <div class="window-title">
          <div class="window-icon ${iconBgClass}">
            <i class="fas ${iconClass}"></i>
          </div>
          <span>${title}</span>
        </div>
        <div class="window-controls">
          <button class="window-minimize" title="Minimize"><i class="fas fa-minus"></i></button>
          <button class="window-popout" title="Pop out"><i class="fas fa-up-right-from-square"></i></button>
          <button class="window-maximize" title="Maximize"><i class="fas fa-expand"></i></button>
          <button class="window-close" title="Close"><i class="fas fa-times"></i></button>
        </div>
      </div>
      <div class="window-content" style="display: flex; align-items: center; justify-content: center; padding: 20px;">
        ${delayContent ? '' : `<p>Content for ${title} goes here.</p>`}
      </div>
    `;
    setupWindowControls(windowElement);
    windowsContainer.appendChild(windowElement);
    positionWindowCenter(windowElement);
    return windowElement;
  }

  function positionWindowCenter(windowElement) {
    if (window.innerWidth <= MOBILE_BREAKPOINT) {
      windowElement.style.left = '0px';
      windowElement.style.top = '0px';
      windowElement.style.width = '100%';
      windowElement.style.height = '100%';
      // Ensure it doesn't have the 'maximized' class from desktop if that would cause issues
      // windowElement.classList.remove('maximized'); 
      // The CSS should handle all visual aspects of fullscreen on mobile.
      return;
    }
    if (windowElement.classList.contains('maximized')) return;

    // Use offsetWidth and offsetHeight to get actual pixel dimensions
    const width = windowElement.offsetWidth;
    const height = windowElement.offsetHeight;

    const desktopAreaRect = windowsContainer.getBoundingClientRect();
    let left = (desktopAreaRect.width - width) / 2;
    let top = (desktopAreaRect.height - height) / 2;

    const openWindowCount = Object.keys(openWindows).filter(id => openWindows[id].element && !openWindows[id].element.classList.contains('minimized')).length;
    const offsetMultiplier = openWindowCount > 0 ? openWindowCount - 1 : 0;
    const offsetAmount = (offsetMultiplier % 10) * 20; // Cascade offset

    left += offsetAmount;
    top += offsetAmount;

    // Ensure the window stays within the bounds of the windowsContainer
    const maxLeft = Math.max(0, desktopAreaRect.width - width); // Ensure maxLeft is not negative
    const maxTop = Math.max(0, desktopAreaRect.height - height); // Ensure maxTop is not negative

    windowElement.style.left = `${Math.max(0, Math.min(left, maxLeft))}px`;
    windowElement.style.top = `${Math.max(0, Math.min(top, maxTop))}px`; // Ensure top is at least 0
  }
  function setupWindowControls(windowElement) {
    if (window.innerWidth > MOBILE_BREAKPOINT) { // Only make draggable on larger screens
      makeWindowDraggable(windowElement);
    }
    const windowId = windowElement.id;
    const closeButton = windowElement.querySelector('.window-close');
    const minimizeButton = windowElement.querySelector('.window-minimize');
    const maximizeButton = windowElement.querySelector('.window-maximize');
    const header = windowElement.querySelector('.window-header') || windowElement.querySelector('.settings-header');
    if (closeButton) {
      closeButton.addEventListener('click', function (e) {
        e.stopPropagation();
        const currentTaskbarIcon = openWindows[windowId] ? openWindows[windowId].taskbarIcon : null;
        // --- Animation: close effect ---
        windowElement._isClosing = true;
        windowElement.classList.remove('window-anim-open', 'window-anim-maximize', 'window-anim-close');
        windowElement.classList.remove('maximized');
        if (maximizeButton) maximizeButton.classList.remove('window-restore');
        windowElement.classList.add('window-anim-close');
        // Remove all event listeners from controls
        if (closeButton) closeButton.replaceWith(closeButton.cloneNode(true));
        if (minimizeButton) minimizeButton.replaceWith(minimizeButton.cloneNode(true));
        if (maximizeButton) maximizeButton.replaceWith(maximizeButton.cloneNode(true));
        windowElement.addEventListener('animationend', function handler(ev) {
          windowElement.classList.remove('window-anim-open', 'window-anim-maximize', 'window-anim-close');
          if (ev.animationName === 'windowClose') {
            // Start icon out animation only for unpinned icons
            if (currentTaskbarIcon && currentTaskbarIcon.parentNode) {
              if (!currentTaskbarIcon.classList.contains('pinned-only')) {
                animateTaskbarIconOut(currentTaskbarIcon, function () {
                  // Delete openWindows entry before re-render
                  delete openWindows[windowId];
                  renderPinnedTaskbarIcons();
                });
              } else {
                // Delete openWindows entry before re-render
                delete openWindows[windowId];
                renderPinnedTaskbarIcons();
              }
            } else {
              // Delete openWindows entry before re-render
              delete openWindows[windowId];
              renderPinnedTaskbarIcons();
            }
            // Immediately do the rest of the cleanup
            if (currentTaskbarIcon) currentTaskbarIcon.classList.remove('opened-app');
            windowElement.remove();
            if (activeWindow === windowElement) activeWindow = null;
            updateTaskbarActiveState();
            windowElement._isClosing = false;
            if (typeof updateAppLauncherTaskbarPosition === 'function') updateAppLauncherTaskbarPosition();
            closeStartMenuAnimated();
          }
        }
          , { once: true });
        // ---
      });
    }
    if (minimizeButton) {
      minimizeButton.addEventListener('click', function (e) {
        e.stopPropagation();
        const currentTaskbarIcon = openWindows[windowId] ? openWindows[windowId].taskbarIcon : null;
        animateWindowToTaskbar(windowElement, currentTaskbarIcon, function () {
          windowElement.style.display = 'none';
          windowElement.classList.add('minimized');
          if (currentTaskbarIcon) {
            currentTaskbarIcon.classList.add('minimized');
            currentTaskbarIcon.classList.remove('active');
          }
          if (activeWindow === windowElement) {
            activeWindow = null;
            updateTaskbarActiveState();
          }
          if (typeof updateAppLauncherTaskbarPosition === 'function') updateAppLauncherTaskbarPosition();
        });
      });
    }
    if (maximizeButton) {
      maximizeButton.addEventListener('click', function (e) {
        e.stopPropagation();
        if (window.innerWidth <= MOBILE_BREAKPOINT) return;
        windowElement.classList.remove('window-anim-open', 'window-anim-maximize', 'window-anim-close');
        const desktopRect = windowsContainer.getBoundingClientRect();
        const maxWidth = Math.min(desktopRect.width, window.innerWidth);
        const maxHeight = Math.min(desktopRect.height, window.innerHeight);
        const isMaximized = windowElement.classList.contains('maximized');
        if (isMaximized) {
          // --- RESTORE ---
          windowElement.classList.remove('maximized');
          maximizeButton.classList.remove('window-restore');
          // Use previous size for smooth transition
          let prevWidth = windowElement.dataset.prevWidth || windowElement.style.width;
          let prevHeight = windowElement.dataset.prevHeight || windowElement.style.height;
          // Calculate centered position for the previous size
          const desktopRect = windowsContainer.getBoundingClientRect();
          const width = parseInt(prevWidth, 10) || 800;
          const height = parseInt(prevHeight, 10) || 600;
          const left = Math.round((desktopRect.width - width) / 2);
          const top = Math.round((desktopRect.height - height) / 2);
          // Set transition before changing values
          windowElement.style.transition = 'width 0.32s cubic-bezier(0.4,0,0.2,1), height 0.32s cubic-bezier(0.4,0,0.2,1), left 0.32s cubic-bezier(0.4,0,0.2,1), top 0.32s cubic-bezier(0.4,0,0.2,1)';
          windowElement.style.width = width + 'px';
          windowElement.style.height = height + 'px';
          windowElement.style.left = left + 'px';
          windowElement.style.top = top + 'px';
          windowElement.style.resize = '';
          makeWindowDraggable(windowElement);
          makeWindowActive(windowElement);
          windowElement.addEventListener('transitionend', function handler(ev) {
            if (["width", "height", "left", "top"].includes(ev.propertyName)) {
              windowElement.style.transition = '';
              windowElement.removeEventListener('transitionend', handler);
              // After restore
              if (typeof updateAppLauncherTaskbarPosition === 'function') updateAppLauncherTaskbarPosition();
            }
          });

        } else {
          // --- MAXIMIZE ---
          // Save current rect for restore
          windowElement.dataset.prevWidth = windowElement.style.width || windowElement.offsetWidth + 'px';
          windowElement.dataset.prevHeight = windowElement.style.height || windowElement.offsetHeight + 'px';
          windowElement.dataset.prevLeft = windowElement.style.left || windowElement.offsetLeft + 'px';
          windowElement.dataset.prevTop = windowElement.style.top || windowElement.offsetTop + 'px';
          windowElement.style.transition = 'width 0.32s cubic-bezier(0.4,0,0.2,1), height 0.32s cubic-bezier(0.4,0,0.2,1), left 0.32s cubic-bezier(0.4,0,0.2,1), top 0.32s cubic-bezier(0.4,0,0.2,1)';
          windowElement.style.width = `${maxWidth}px`;
          windowElement.style.height = `${maxHeight}px`;
          windowElement.style.left = '0px';
          windowElement.style.top = '0px';
          windowElement.style.resize = 'none';


          windowElement.addEventListener('transitionend', function handler(ev) {

            if (["width", "height", "left", "top"].includes(ev.propertyName)) {
              windowElement.classList.add('maximized');

              windowElement.style.transition = '';
              windowElement.removeEventListener('transitionend', handler);
              // After maximize
              if (typeof updateAppLauncherTaskbarPosition === 'function') updateAppLauncherTaskbarPosition();
            }
          });
          maximizeButton.classList.add('window-restore');
          if (header) {
            header.onmousedown = null;
            header.style.cursor = 'default';
          }
          makeWindowActive(windowElement);

        }
        // --- App Launcher Taskbar Position Logic ---
        updateAppLauncherTaskbarPosition();
      });
    }
    // Add double-click to header to toggle maximize/restore
    if (maximizeButton && header) {
      header.addEventListener('dblclick', function (e) {
        if (window.innerWidth <= MOBILE_BREAKPOINT) return; // No maximize on mobile
        maximizeButton.click();
      });
    }
    // Pop-out button logic
    const popoutButton = windowElement.querySelector('.window-popout');
    if (popoutButton) {
      popoutButton.addEventListener('click', function (e) {
        e.stopPropagation();
        // Get original window position and size
        const rect = windowElement.getBoundingClientRect();
        const screenLeft = window.screenX || window.screenLeft || 0;
        const screenTop = window.screenY || window.screenTop || 0;
        const chromeHeight = (window.outerHeight - window.innerHeight) || 0;
        const left = Math.round(screenLeft + rect.left);
        const top = Math.round(screenTop + rect.top + chromeHeight);
        const width = Math.round(rect.width);
        const height = Math.round(rect.height);
        // Open a new window with matching position and size
        const popoutWin = window.open('', '_blank', `width=${width},height=${height},left=${left},top=${top},menubar=no,toolbar=no,location=no,status=no`);
        if (!popoutWin) return;
        // --- Cross-browser: Write HTML immediately after open ---
        const doc = popoutWin.document;
        doc.open();
        doc.write(`<!DOCTYPE html><html><head><title>${windowElement.querySelector('.window-title span')?.textContent || 'App Popout'}</title>`);
        // Copy stylesheets
        Array.from(document.styleSheets).forEach(sheet => {
          if (sheet.href) doc.write(`<link rel="stylesheet" href="${sheet.href}">`);
        });
        // Inject main JS file for popout functionality
        doc.write('<script src="js/app.js"></script>');
        doc.write('</head><body style="background: var(--primary-bg); margin:0;">');
        // Write the entire window element, not just .window-content
        if (windowElement) {
          // Remove any existing inline styles that would conflict
          windowElement.style.position = '';
          windowElement.style.left = '';
          windowElement.style.top = '';
          windowElement.style.width = '';
          windowElement.style.height = '';
          // Write the .window element
          doc.write(windowElement.outerHTML);
          // Add style to make .window fill the viewport in the popout and hide the window header
          doc.write('<style>.window{position:fixed!important;top:0!important;left:0!important;width:100vw!important;height:100vh!important;max-width:none!important;max-height:none!important;min-width:0!important;min-height:0!important;z-index:1!important;} .window-header{display:none!important;}</style>');
        }
        doc.write('</body></html>');
        doc.close();
        // --- End cross-browser popout logic ---
        // Remove window from desktop and taskbar
        const currentTaskbarIcon = openWindows[windowId] ? openWindows[windowId].taskbarIcon : null;
        // --- Save icon and bg class for restore ---
        let iconClass = null, iconBgClass = null;
        const iconElem = windowElement.querySelector('.window-title .window-icon i');
        const iconBgElem = windowElement.querySelector('.window-title .window-icon');
        if (iconElem) iconClass = Array.from(iconElem.classList).find(cls => cls.startsWith('fa-'));
        if (iconBgElem) iconBgClass = Array.from(iconBgElem.classList).find(cls => cls.endsWith('-icon'));
        // --- Save appName and appTitle BEFORE removing window and openWindows ---
        let restoreAppName = (openWindows[windowId]?.name || windowElement.getAttribute('data-app') || '').trim();
        let restoreAppTitle = (openWindows[windowId]?.title || windowElement.querySelector('.window-title span')?.textContent || '').trim();
        windowElement.remove();
        if (currentTaskbarIcon) currentTaskbarIcon.remove();
        if (openWindows[windowId]) delete openWindows[windowId];
        if (activeWindow === windowElement) {
          activeWindow = null;
          updateTaskbarActiveState();
        }
        // --- Popout close behavior: restore if needed ---
        const popoutBehavior = localStorage.getItem('popoutCloseBehavior') || 'close';
        if (popoutBehavior === 'restore') {
          // Fallback to getAppIconDetails if iconClass or iconBgClass missing
          if (!iconClass || !iconBgClass) {
            const details = getAppIconDetails(restoreAppName);
            if (!iconClass) iconClass = details.iconClass;
            if (!iconBgClass) iconBgClass = details.iconBgClass;
          }
          // Pass info to the popout window so it can notify us on close
          try {
            popoutWin._poppedOutAppInfo = {
              appName: restoreAppName,
              appTitle: restoreAppTitle,
              iconClass: iconClass,
              iconBgClass: iconBgClass
            };
          } catch (e) { }
          // Listen for popout window close
          const restoreApp = () => {
            // Use appName and appTitle to reopen
            const info = popoutWin._poppedOutAppInfo;
            if (!window._loggingOut && info && info.appName) {
              openApp(info.appName, info.appTitle, info.iconClass, info.iconBgClass);
            }
          };
          // Use polling to detect close (since onbeforeunload in popout is unreliable cross-origin)
          const pollInterval = setInterval(() => {
            if (popoutWin.closed) {
              clearInterval(pollInterval);
              restoreApp();
            }
          }, 500);
        }
        // ... existing code ...
        // At the top of the file, after other globals:
        window._allPopoutWindows = window._allPopoutWindows || [];
        // ... existing code ...
        // In the popoutButton click handler, after 'if (!popoutWin) return;':
        window._allPopoutWindows.push(popoutWin);
        // ... existing code ...
        // In the logout button event handler:
        const logOutButton = document.querySelector('.start-menu-logout-button') || document.querySelector('.logout-button');
        if (logOutButton) {
          logOutButton.addEventListener('click', (e) => {
            e.preventDefault();
            handleLogout();
          });
        }
        // ... existing code ...
      });
    }
    windowElement.addEventListener('mousedown', function (e) {
      // Only activate if not clicking a control button
      if (e.target.closest('.window-controls button') || e.target.closest('.window-control-btn')) return;
      makeWindowActive(windowElement);
    });
  }
  // Helper to re-attach drag handler after restore
  function dragMouseDownWrapper(windowElement) {
    return function (e) {
      if (window.innerWidth <= MOBILE_BREAKPOINT) return;
      const header = windowElement.querySelector('.window-header') || windowElement.querySelector('.settings-header');
      if (!header) return;
      // Check if the click target is a window control button
      if (e.target.closest('.window-controls button') || e.target.closest('.settings-window-controls button')) {
        return;
      }
      e.preventDefault();
      let pos3 = e.clientX;
      let pos4 = e.clientY;
      makeWindowActive(windowElement);
      e.stopPropagation();
      let pos1 = 0, pos2 = 0;
      function elementDrag(ev) {
        ev.preventDefault();
        pos1 = pos3 - ev.clientX;
        pos2 = pos4 - ev.clientY;
        pos3 = ev.clientX;
        pos4 = ev.clientY;
        let newY = windowElement.offsetTop - pos2;
        let newX = windowElement.offsetLeft - pos1;
        newY = Math.max(0, newY);
        windowElement.style.top = newY + 'px';
        windowElement.style.left = newX + 'px';
      }
      function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
        header.style.cursor = 'grab';
      }
      document.onmouseup = closeDragElement;
      document.onmousemove = elementDrag;
      header.style.cursor = 'grabbing';
    };
  }

  function animateWindowToTaskbar(windowElement, taskbarIcon, callback) {
    if (!windowElement || !taskbarIcon) {
      if (callback) callback();
      return;
    }
    // Get window and icon positions
    const winRect = windowElement.getBoundingClientRect();
    const iconRect = taskbarIcon.getBoundingClientRect();
    // Calculate center points
    const winCenterX = winRect.left + winRect.width / 2;
    const winCenterY = winRect.top + winRect.height / 2;
    const iconCenterX = iconRect.left + iconRect.width / 2;
    const iconCenterY = iconRect.top + iconRect.height / 2;
    // Calculate translation
    const translateX = iconCenterX - winCenterX;
    const translateY = iconCenterY - winCenterY;
    // Calculate scale (shrink to icon size)
    const scale = Math.max(0.18, Math.min(iconRect.width / winRect.width, iconRect.height / winRect.height));
    // Animate transform and opacity
    windowElement.style.transition = 'transform 0.35s cubic-bezier(0.4,0,0.2,1), opacity 0.35s cubic-bezier(0.4,0,0.2,1)';
    windowElement.style.transformOrigin = 'center center';
    windowElement.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
    windowElement.style.opacity = '0';
    // After animation, hide and reset
    setTimeout(() => {
      windowElement.style.transition = '';
      windowElement.style.transform = '';
      windowElement.style.opacity = '1'; // Reset for next time
      if (callback) callback();
    }, 350);
  }

  function animateWindowFromTaskbar(windowElement, taskbarIcon, callback) {
    if (!windowElement || !taskbarIcon) {
      if (callback) callback();
      return;
    }
    // Get window and icon positions
    const winRect = windowElement.getBoundingClientRect();
    const iconRect = taskbarIcon.getBoundingClientRect();
    // Calculate center points
    const winCenterX = winRect.left + winRect.width / 2;
    const winCenterY = winRect.top + winRect.height / 2;
    const iconCenterX = iconRect.left + iconRect.width / 2;
    const iconCenterY = iconRect.top + iconRect.height / 2;
    // Calculate translation
    const translateX = iconCenterX - winCenterX;
    const translateY = iconCenterY - winCenterY;
    // Calculate scale (shrink to icon size)
    const scale = Math.max(0.18, Math.min(iconRect.width / winRect.width, iconRect.height / winRect.height));
    // Start at icon position/scale
    windowElement.style.transition = 'none';
    windowElement.style.transformOrigin = 'center center';
    windowElement.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
    // Force reflow
    void windowElement.offsetWidth;
    // Animate to normal (no opacity)
    windowElement.style.transition = 'transform 0.45s cubic-bezier(0.23, 1, 0.32, 1)';
    windowElement.style.transform = 'translate(0,0) scale(1)';
    setTimeout(() => {
      windowElement.style.transition = '';
      windowElement.style.transform = '';
      if (callback) callback();
    }, 450);
  }

  function toggleMinimizeWindow(windowElement, taskbarIcon) {
    if (windowElement.classList.contains('minimized')) {
      // --- Animate restore from taskbar ---
      windowElement.style.display = 'flex';
      windowElement.classList.remove('minimized');
      if (taskbarIcon) taskbarIcon.classList.remove('minimized');
      // Bring to front BEFORE animation
      makeWindowActive(windowElement);
      animateWindowFromTaskbar(windowElement, taskbarIcon, function () {
        // After restore
        if (typeof updateAppLauncherTaskbarPosition === 'function') updateAppLauncherTaskbarPosition();
      });
    } else {
      // --- Animate minimize to taskbar ---
      animateWindowToTaskbar(windowElement, taskbarIcon, function () {
        windowElement.style.display = 'none';
        windowElement.classList.add('minimized');
        if (taskbarIcon) {
          taskbarIcon.classList.add('minimized');
          taskbarIcon.classList.remove('active');
        }
        if (activeWindow === windowElement) {
          activeWindow = null;
          updateTaskbarActiveState();
        }
        // After minimize is complete and .minimized is added
        if (typeof updateAppLauncherTaskbarPosition === 'function') updateAppLauncherTaskbarPosition();
      });

    }

  }

  function makeWindowActive(windowElement) {
    if (!windowElement || windowElement._isClosing) return;
    if (activeWindow === windowElement && !windowElement.classList.contains('minimized')) return;
    if (activeWindow && openWindows[activeWindow.id]) {
      activeWindow.classList.remove('active');
      if (openWindows[activeWindow.id] && openWindows[activeWindow.id].taskbarIcon) {
        openWindows[activeWindow.id].taskbarIcon.classList.remove('active');
      }
    }
    windowZIndex++;
    windowElement.style.zIndex = windowZIndex;
    windowElement.classList.add('active');
    windowElement.style.display = 'flex';
    windowElement.classList.remove('minimized');
    activeWindow = windowElement;
    if (openWindows[windowElement.id] && openWindows[windowElement.id].taskbarIcon) {
      const currentTaskbarIcon = openWindows[windowElement.id].taskbarIcon;
      currentTaskbarIcon.classList.add('active');
      currentTaskbarIcon.classList.remove('minimized');
    }
    updateTaskbarActiveState();
  }

  function updateTaskbarActiveState() {
    document.querySelectorAll('.taskbar-app-icon').forEach(icon => icon.classList.remove('active'));
    if (activeWindow && openWindows[activeWindow.id] && !activeWindow.classList.contains('minimized')) {
      const activeTaskbarIcon = openWindows[activeWindow.id].taskbarIcon;
      if (activeTaskbarIcon) activeTaskbarIcon.classList.add('active');
    }
  }
  function makeWindowDraggable(windowElement) {
    if (window.innerWidth <= MOBILE_BREAKPOINT) {
      // On smaller screens, windows are fullscreen and not draggable.
      // Remove cursor style if it was set previously or by CSS for .window-header
      const header = windowElement.querySelector('.window-header') || windowElement.querySelector('.settings-header');
      if (header) {
        header.style.cursor = 'default';
      }
      return;
    }
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    const header = windowElement.querySelector('.window-header') || windowElement.querySelector('.settings-header');
    const snapOverlay = document.getElementById('snap-overlay');
    let snapHint = null;
    let snapType = null;
    let wasMaximizedBeforeDrag = false;
    let prevRect = null;
    let snapHintDelayTimer = null;

    if (header) {
      header.onmousedown = dragMouseDown;
    } else {
      // Fallback if no header, allow dragging by the whole window
      // This might be less desirable for UX, but provides a fallback.
      // windowElement.onmousedown = dragMouseDown; 
      // Decided against this for now to prevent conflicts if content is interactive.
      console.warn("Window has no .window-header or .settings-header, cannot make draggable by header.", windowElement);
      return;
    }

    function dragMouseDown(e) {
      // Check if the click target is a window control button
      if (e.target.closest('.window-controls button') || e.target.closest('.settings-window-controls button')) {
        return; // Don't start drag if a control button was clicked
      }
      e.preventDefault();
      // Always save windowed state at the start of drag
      const winRect = windowElement.getBoundingClientRect();
      const desktopRect = windowsContainer.getBoundingClientRect();
      const left = (winRect.left - desktopRect.left) + 'px';
      const top = (winRect.top - desktopRect.top) + 'px';
      windowElement._preSnapRect = {
        width: windowElement.style.width || windowElement.offsetWidth + 'px',
        height: windowElement.style.height || windowElement.offsetHeight + 'px',
        left,
        top
      };
      console.log('Setting _preSnapRect', windowElement._preSnapRect);
      pos3 = e.clientX;
      pos4 = e.clientY;
      makeWindowActive(windowElement);
      e.stopPropagation();
      document.onmouseup = closeDragElement;
      document.onmousemove = elementDrag;
      header.style.cursor = 'grabbing';
      // If maximized, restore to previous size/position for drag
      if (windowElement.classList.contains('maximized')) {

        wasMaximizedBeforeDrag = true;
        prevRect = {
          width: windowElement.dataset.prevWidth,
          height: windowElement.dataset.prevHeight,
          left: windowElement.dataset.prevLeft,
          top: windowElement.dataset.prevTop
        };
        windowElement.classList.remove('maximized');
        windowElement.style.width = prevRect.width;
        windowElement.style.height = prevRect.height;
        windowElement.style.left = prevRect.left;
        windowElement.style.top = prevRect.top;
        windowElement.style.resize = '';
        header.onmousedown = dragMouseDown;
        header.style.cursor = 'grabbing';
      } else {
        wasMaximizedBeforeDrag = false;
        prevRect = {
          width: windowElement.style.width,
          height: windowElement.style.height,
          left: windowElement.style.left,
          top: windowElement.style.top
        };
        if (typeof updateAppLauncherTaskbarPosition === 'function') updateAppLauncherTaskbarPosition();
      }

    }

    function elementDrag(e) {
      e.preventDefault();
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      let newY = windowElement.offsetTop - pos2;
      let newX = windowElement.offsetLeft - pos1;
      newY = Math.max(0, newY);
      windowElement.style.top = newY + 'px';
      windowElement.style.left = newX + 'px';
      // --- Snap logic ---
      const SNAP_EDGE = 32; // px
      const SNAP_SIDE = 64; // px
      const winW = windowElement.offsetWidth;
      const winH = windowElement.offsetHeight;
      const mouseX = e.clientX;
      const mouseY = e.clientY;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      let newSnapType = null;
      if (mouseY <= SNAP_EDGE) {
        newSnapType = 'maximize';
      } else if (mouseX <= SNAP_SIDE) {
        newSnapType = 'left';
      } else if (mouseX >= vw - SNAP_SIDE) {
        newSnapType = 'right';
      }
      // --- Snap hint delay logic ---
      if (newSnapType !== snapType) {
        // If leaving a snap zone, clear any pending timer and hide overlay
        if (snapHintDelayTimer) {
          clearTimeout(snapHintDelayTimer);
          snapHintDelayTimer = null;
        }
        if (snapOverlay) {
          snapOverlay.style.display = 'none';
          snapOverlay.innerHTML = '';
        }
        snapType = newSnapType;
        if (snapType) {
          // Start a 1s timer before showing the snap hint
          snapHintDelayTimer = setTimeout(() => {
            if (snapType === newSnapType && snapOverlay) {
              snapHint = document.createElement('div');
              snapHint.className = 'snap-hint';
              if (snapType === 'maximize') snapHint.classList.add('snap-hint-maximize');
              if (snapType === 'left') snapHint.classList.add('snap-hint-left');
              if (snapType === 'right') snapHint.classList.add('snap-hint-right');
              snapOverlay.appendChild(snapHint);
              snapOverlay.style.display = 'block';
            }
            snapHintDelayTimer = null;
          }, 400);
        }
      }
    }

    function closeDragElement(e) {
      const maximizeButton = windowElement.querySelector('.window-maximize');
      document.onmouseup = null;
      document.onmousemove = null;
      header.style.cursor = 'grab';
      if (snapOverlay) {
        snapOverlay.style.display = 'none';
        snapOverlay.innerHTML = '';
      }
      // Snap action
      if (snapType === 'maximize' || snapType === 'left' || snapType === 'right') {
        // Save current rect for restore (before snapping)
        windowElement.dataset.prevWidth = windowElement.style.width || windowElement.offsetWidth + 'px';
        windowElement.dataset.prevHeight = windowElement.style.height || windowElement.offsetHeight + 'px';
        windowElement.dataset.prevLeft = windowElement.style.left || windowElement.offsetLeft + 'px';
        windowElement.dataset.prevTop = windowElement.style.top || windowElement.offsetTop + 'px';
        // Snap with animation
        windowElement.classList.add('window-anim-snap-zoom');
        windowElement.style.transition = 'width 0.32s cubic-bezier(0.4,0,0.2,1), height 0.32s cubic-bezier(0.4,0,0.2,1), left 0.32s cubic-bezier(0.4,0,0.2,1), top 0.32s cubic-bezier(0.4,0,0.2,1)';
        let snapTarget = {};
        if (snapType === 'maximize') {
          const desktopRect = windowsContainer.getBoundingClientRect();
          snapTarget = {
            width: `${Math.min(desktopRect.width, window.innerWidth)}px`,
            height: `${Math.min(desktopRect.height, window.innerHeight)}px`,
            left: '0px',
            top: '0px'
          };
        } else if (snapType === 'left') {
          const desktopRect = windowsContainer.getBoundingClientRect();
          snapTarget = {
            width: Math.floor(window.innerWidth / 2) + 'px',
            height: desktopRect.height + 'px',
            left: '0px',
            top: '0px'
          };
        } else if (snapType === 'right') {
          const desktopRect = windowsContainer.getBoundingClientRect();
          snapTarget = {
            width: Math.floor(window.innerWidth / 2) + 'px',
            height: desktopRect.height + 'px',
            left: Math.floor(window.innerWidth / 2) + 'px',
            top: '0px'
          };
        }
        // Set snapped values (triggers transition)
        windowElement.style.width = snapTarget.width;
        windowElement.style.height = snapTarget.height;
        windowElement.style.left = snapTarget.left;
        windowElement.style.top = snapTarget.top;
        windowElement.style.resize = 'none';
        windowElement.addEventListener('animationend', function handler() {
          windowElement.classList.remove('window-anim-snap-zoom');
          windowElement.removeEventListener('animationend', handler);
        });
        windowElement.addEventListener('transitionend', function handler(ev) {
          if (["width", "height", "left", "top"].includes(ev.propertyName)) {
            windowElement.style.transition = '';
            windowElement.removeEventListener('transitionend', handler);
          }
        });
        windowElement.classList.add('maximized');
        if (maximizeButton) maximizeButton.classList.add('window-restore');
        if (header) header.onmousedown = null;
        if (header) header.style.cursor = 'default';
        saveWindowedState(windowElement);
      }
      snapType = null;
      snapHint = null;
      if (snapHintDelayTimer) {
        clearTimeout(snapHintDelayTimer);
        snapHintDelayTimer = null;
      }
      // --- App Launcher Taskbar Position Logic ---
      updateAppLauncherTaskbarPosition();
    }
  }

  function createTaskbarIcon(windowId, appName, iconClass, appTitle) {
    // Try to match the desktop icon style
    let iconBgClass = 'gray-icon';
    // Try to get the icon background class from the desktop icon
    const desktopIcon = document.querySelector(`.desktop-icon[data-app="${appName}"] .icon-container`);
    if (desktopIcon) {
      // Get the background color class (e.g. blue-icon, green-icon, etc.)
      const bgClass = Array.from(desktopIcon.classList).find(cls => cls.endsWith('-icon'));
      if (bgClass) iconBgClass = bgClass;
    }
    const iconEl = document.createElement('div');
    iconEl.className = 'taskbar-app-icon';
    iconEl.classList.add('opened-app');
    iconEl.setAttribute('data-window-id', windowId);
    iconEl.setAttribute('title', appTitle || appName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()));
    iconEl.innerHTML = `<div class="icon-container ${iconBgClass}"><i class="fas ${iconClass}"></i></div>`;
    iconEl.addEventListener('click', function () {
      const targetWindowId = this.getAttribute('data-window-id');
      const windowToFocus = openWindows[targetWindowId] ? openWindows[targetWindowId].element : null;
      if (windowToFocus) {
        if (windowToFocus.classList.contains('minimized')) {
          toggleMinimizeWindow(windowToFocus, this);
        } else if (activeWindow === windowToFocus) {
          toggleMinimizeWindow(windowToFocus, this);
        } else {
          makeWindowActive(windowToFocus);
        }
      }
    });
    return iconEl;
  }

  function filterStartMenuApps(searchTerm) {
    if (!startMenuLeftPanel) return;
    const term = searchTerm.toLowerCase();
    const appSections = startMenuLeftPanel.querySelectorAll('.app-grid-section');
    appSections.forEach(section => {
      const appItems = [];
      startMenuApps.forEach(app => {
        // ... create appItem, add listeners, etc ...
        grid.appendChild(appItem);
        appItems.push(appItem);
      }); // <-- End of forEach

      // Now define the function here:
      function openAppFromLauncher(appItem) {
        appItems.forEach(item => item.classList.remove('selected'));
        appItem.classList.add('selected');
        openApp(
          appItem.getAttribute('data-app'),
          appItem.querySelector('span').textContent,
          appItem.querySelector('i').className.split(' ').find(cls => cls.startsWith('fa-')),
          appItem.className.split(' ').find(cls => cls.endsWith('-icon'))
        );
        closeLauncher();
      }
      let sectionHasVisibleItems = false;
      appItems.forEach(item => {
        const appName = item.getAttribute('data-app');
        const isVisible = appName.includes(term);
        item.style.display = isVisible ? '' : 'none';
        if (isVisible) sectionHasVisibleItems = true;
      });
      section.style.display = sectionHasVisibleItems ? '' : 'none';
    });
  }

  if (startMenuSearchTop) {
    startMenuSearchTop.addEventListener('input', (e) => {
      filterStartMenuApps(e.target.value);
      if (startMenuSearchBottom) startMenuSearchBottom.value = e.target.value;
    });
  }
  if (startMenuSearchBottom) {
    startMenuSearchBottom.addEventListener('input', (e) => {
      filterStartMenuApps(e.target.value);
      if (startMenuSearchTop) startMenuSearchTop.value = e.target.value;
    });
  }

  // --- App Launcher Taskbar Position Logic ---
  function updateAppLauncherTaskbarPosition() {
    if (!document.body.classList.contains('app-launcher-mode')) return;
    const taskbar = document.querySelector('.taskbar');
    if (!taskbar) return;
    // Check if any window is maximized and not minimized
    const anyMaximized = Object.values(openWindows).some(w =>
      w.element &&
      document.body.contains(w.element) && // Must be in the DOM
      w.element.style.display !== 'none' && // Must be visible
      w.element.classList.contains('maximized') &&
      !w.element.classList.contains('minimized')

    );
    if (anyMaximized) {
      if (!taskbar.classList.contains('taskbar-lowered')) {
        // Remove, then add in next frame for transition
        taskbar.classList.remove('taskbar-lowered');
        requestAnimationFrame(() => {
          taskbar.classList.add('taskbar-lowered');
        });
      }
    } else {
      if (taskbar.classList.contains('taskbar-lowered')) {
        // Remove in next frame for transition
        taskbar.classList.remove('taskbar-lowered');
        // Optionally, you can use requestAnimationFrame here too if you want to ensure a transition back up
      }
    }
  }
  // Patch maximize/restore/minimize logic to call updateAppLauncherTaskbarPosition
  // 1. After maximize/restore in setupWindowControls
  // 2. After minimize/restore in toggleMinimizeWindow
  // ... existing code ...




  function setupSettingsApp(settingsWindowElement) {
    const sidebarNavLinks = settingsWindowElement.querySelectorAll('.settings-nav li a');
    const contentHeaderTitle = settingsWindowElement.querySelector('.settings-content-header h2');
    const allContentSections = settingsWindowElement.querySelectorAll('.settings-content > .settings-section-content');
    const settingsHeaderTitleElem = settingsWindowElement.querySelector('.settings-header-title');

    function setActiveSection(sectionName) {
      sidebarNavLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-section') === sectionName) {
          link.classList.add('active');
          const linkText = link.textContent.replace(/\d+$/, '').trim();
          if (contentHeaderTitle) contentHeaderTitle.textContent = linkText;
          if (settingsHeaderTitleElem) settingsHeaderTitleElem.textContent = linkText;
        }
      });
      allContentSections.forEach(section => {
        section.style.display = section.classList.contains(`${sectionName}-content`) ? 'block' : 'none';
      });
    }
    sidebarNavLinks.forEach(link => {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        setActiveSection(this.getAttribute('data-section'));
      });
    });
    setActiveSection('appearance');
    const appearanceContent = settingsWindowElement.querySelector('.appearance-content');
    if (appearanceContent) {
      const themeOptions = appearanceContent.querySelectorAll('.appearance-option');
      const appearanceOptionsContainer = appearanceContent.querySelector('.appearance-options');
      if (appearanceOptionsContainer) {
        appearanceOptionsContainer.addEventListener('click', function (e) {
          const optionEl = e.target.closest('.appearance-option');
          if (!optionEl) return;
          themeOptions.forEach(opt => opt.classList.remove('active'));
          optionEl.classList.add('active');
          const theme = optionEl.getAttribute('data-theme');
          if (theme === 'light') {
            document.body.classList.add('light-windows');
            localStorage.setItem('themeMode', 'light');
            if (window._autoThemeListener) {
              window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', window._autoThemeListener);
              window._autoThemeListener = null;
            }
          } else if (theme === 'dark') {
            document.body.classList.remove('light-windows');
            localStorage.setItem('themeMode', 'dark');
            if (window._autoThemeListener) {
              window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', window._autoThemeListener);
              window._autoThemeListener = null;
            }
          } else if (theme === 'auto') {
            localStorage.setItem('themeMode', 'auto');
            // Function to apply system theme
            function applySystemTheme(e) {
              const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
              if (isDark) {
                document.body.classList.remove('light-windows');
              } else {
                document.body.classList.add('light-windows');
              }
            }
            // Initial apply
            applySystemTheme();
            // Remove previous listener if any
            if (window._autoThemeListener) {
              window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', window._autoThemeListener);
            }
            // Save and add new listener
            window._autoThemeListener = applySystemTheme;
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applySystemTheme);
          }
        });
      }
      const accentSwatches = appearanceContent.querySelectorAll('.accent-color-options .color-swatch');
      const accentColorMap = {
        multicolor: '#ff1b6b', // fallback to default accent
        blue: '#1a73ce',
        purple: '#310671',
        pink: '#ac1c72',
        red: '#d71c07',
        orange: '#eb8a17',
        yellow: '#f89e00',
        green: '#176848',
        gray: '#435564',
      };
      function setAccentColor(colorKey) {
        let color = accentColorMap[colorKey] || accentColorMap['multicolor'];
        document.documentElement.style.setProperty('--accent-color', color);
        // Optionally update related accent variables for icons, etc.
        // document.documentElement.style.setProperty('--blue-accent', ...), etc if needed
        localStorage.setItem('accentColor', colorKey);
        // Update active border for color swatches
        accentSwatches.forEach(s => s.classList.remove('active'));
        const selectedSwatch = Array.from(accentSwatches).find(s => s.classList.contains(colorKey));
        if (selectedSwatch) selectedSwatch.classList.add('active');
        // Update selector highlights (appearance-option.active, .select-wrapper select:focus, etc) via CSS var
        // No extra JS needed if CSS uses var(--accent-color)
        // Update taskbar active icon border (uses var(--accent-color) in CSS)
        // Update menu/sidebar selected (uses var(--accent-color) in CSS)
      }
      accentSwatches.forEach(swatch => {
        swatch.addEventListener('click', function () {
          let colorKey = 'multicolor';
          for (const key in accentColorMap) {
            if (this.classList.contains(key)) { colorKey = key; break; }
          }
          setAccentColor(colorKey);
        });
      });
      // On settings app load, restore accent color
      const savedAccent = localStorage.getItem('accentColor') || 'multicolor';
      setAccentColor(savedAccent);
      // --- Popout close behavior dropdown logic ---
      const popoutCloseDropdown = appearanceContent.querySelector('#popout-close-behavior');
      if (popoutCloseDropdown) {
        // Set initial value from localStorage or default
        const savedBehavior = localStorage.getItem('popoutCloseBehavior') || 'close';
        popoutCloseDropdown.value = savedBehavior;
        popoutCloseDropdown.addEventListener('change', function () {
          localStorage.setItem('popoutCloseBehavior', this.value);
        });
      }
    }
    const closeButtonRed = settingsWindowElement.querySelector('.window-control-btn.red');
    if (closeButtonRed) {
      const windowId = settingsWindowElement.id;
      closeButtonRed.addEventListener('click', () => {
        const currentTaskbarIcon = openWindows[windowId] ? openWindows[windowId].taskbarIcon : null;
        settingsWindowElement.remove();
        if (currentTaskbarIcon) currentTaskbarIcon.remove();
        delete openWindows[windowId];
        if (activeWindow === settingsWindowElement) activeWindow = null;
        updateTaskbarActiveState();
      });
    }
    // Failsafe: Hide and remove drag selector if present in settings app
    if (window.dragSelector) {
      window.dragSelector.classList.add('hidden');
      if (window.dragSelector.parentElement) window.dragSelector.parentElement.removeChild(window.dragSelector);
    }
    // Make settings content scrollable
    const settingsContent = settingsWindowElement.querySelector('.settings-content');
    if (settingsContent) {
      settingsContent.style.overflowY = 'auto';
    }
    // Make settings content scrollable
    const fileExplorerContent = settingsWindowElement.querySelector('.file-explorer-content');
    if (fileExplorerContent) {
      fileExplorerContent.classList.add('scrollable');
    }
    // On settings app load, set theme from localStorage
    const savedTheme = localStorage.getItem('themeMode') || 'auto';
    const themeOptions = settingsWindowElement.querySelectorAll('.appearance-option');
    const initialOption = Array.from(themeOptions).find(opt => opt.getAttribute('data-theme') === savedTheme);
    if (initialOption) {
      themeOptions.forEach(opt => opt.classList.remove('active'));
      initialOption.classList.add('active');
      if (savedTheme === 'light') {
        document.body.classList.add('light-windows');
        if (window._autoThemeListener) {
          window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', window._autoThemeListener);
          window._autoThemeListener = null;
        }
      } else if (savedTheme === 'dark') {
        document.body.classList.remove('light-windows');
        if (window._autoThemeListener) {
          window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', window._autoThemeListener);
          window._autoThemeListener = null;
        }
      } else if (savedTheme === 'auto') {
        function applySystemTheme(e) {
          const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          if (isDark) {
            document.body.classList.remove('light-windows');
          } else {
            document.body.classList.add('light-windows');
          }
        }
        applySystemTheme();
        if (window._autoThemeListener) {
          window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', window._autoThemeListener);
        }
        window._autoThemeListener = applySystemTheme;
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applySystemTheme);
      }
    }
    // --- Ensure mobile sidebar logic is initialized for Settings app ---
    if (typeof setupMobileSidebarForWindow === 'function') {
      setupMobileSidebarForWindow(settingsWindowElement);
    }

    // --- iOS-style mobile navigation ---
    function isMobile() { return window.innerWidth <= 767; }
    const mobileContainer = settingsWindowElement.querySelector('.settings-mobile-container');
    const sidebar = settingsWindowElement.querySelector('.settings-mobile-sidebar');
    const panel = settingsWindowElement.querySelector('.settings-mobile-panel');
    const headerBackBtn = settingsWindowElement.querySelector('.window-header .back-btn');
    const windowTitle = settingsWindowElement.querySelector('.window-title');
    const titleChevron = windowTitle ? windowTitle.querySelector('.chevron') : null;
    const titlePanelTitle = windowTitle ? windowTitle.querySelector('.panel-title') : null;
    const windowEl = settingsWindowElement;

    if (mobileContainer && sidebar && panel && headerBackBtn && windowTitle && titleChevron && titlePanelTitle) {
      function showPanel(section, label) {
        if (typeof window.hideWalletSidebar === 'function') window.hideWalletSidebar();
        // Set panel title in header
        titlePanelTitle.textContent = label;
        windowTitle.classList.add('show-detail');
        // Fill panel options
        panel.querySelector('.settings-mobile-options').innerHTML = getSectionOptionsHTML(section);
        // Slide to panel
        mobileContainer.classList.add('show-panel');
        windowEl.classList.add('show-panel');
      }
      // Sidebar button click
      sidebar.querySelectorAll('button[data-section]').forEach(btn => {
        btn.addEventListener('click', function () {
          const section = this.getAttribute('data-section');
          let label = this.childNodes[1] ? this.childNodes[1].textContent.trim() : this.textContent.trim();
          showPanel(section, label);
        });
      });
      // Back button in window header (mobile only)
      headerBackBtn.addEventListener('click', function () {
        if (isMobile()) {
          mobileContainer.classList.remove('show-panel');
          windowEl.classList.remove('show-panel');
          windowTitle.classList.remove('show-detail');
        }
      });
      // Responsive: reset panel on resize
      window.addEventListener('resize', function () {
        if (!isMobile()) {
          mobileContainer.classList.remove('show-panel');
          windowEl.classList.remove('show-panel');
          windowTitle.classList.remove('show-detail');
        }
      });
    }

    // ...existing code...
  }

  // Returns HTML for each section's options (customize as needed)
  function getSectionOptionsHTML(section) {
    switch (section) {
      case 'wifi':
        return `
          <li><label>Wi-Fi</label><input type="checkbox" checked></li>
          <li><label>Network Name</label><span>MyWiFi</span></li>
        `;
      case 'appearance':
        return `
          <li><label>Theme</label>
            <select>
              <option>Light</option>
              <option selected>Dark</option>
              <option>Auto</option>
            </select>
          </li>
          <li><label>Accent Color</label>
            <select>
              <option>Blue</option>
              <option>Purple</option>
              <option>Pink</option>
              <option>Red</option>
              <option>Orange</option>
              <option>Yellow</option>
              <option>Green</option>
              <option>Gray</option>
            </select>
          </li>
        `;
      case 'notifications':
        return `<li><label>Allow Notifications</label><input type="checkbox" checked></li>`;
      case 'sound':
        return `<li><label>Volume</label><input type="range" min="0" max="100" value="80"></li>`;
      case 'bluetooth':
        return `<li><label>Bluetooth</label><input type="checkbox"></li>`;
      case 'network':
        return `<li><label>Network</label><span>Ethernet</span></li>`;
      case 'focus':
        return `<li><label>Focus Mode</label><input type="checkbox"></li>`;
      case 'screentime':
        return `<li><label>Screen Time</label><span>2h 30m today</span></li>`;
      case 'general':
        return `<li><label>About</label><span>Device Info</span></li>`;
      case 'family':
        return `<li><label>Family Sharing</label><input type="checkbox"></li>`;
      case 'suggestions':
        return `<li><label>Suggestions</label><span>2 new</span></li>`;
      default:
        return `<li><span>No options for this section yet.</span></li>`;
    }
  }

  function setupCalculatorApp(calculatorWindowElement) {
    const displayHistory = calculatorWindowElement.querySelector('#calc-history');
    const displayCurrentInput = calculatorWindowElement.querySelector('#calc-current-input');
    const buttons = calculatorWindowElement.querySelectorAll('.calc-btn');

    let currentOperand = '0';
    let previousOperand = '';
    let operation = null;
    let displayNeedsReset = false;
    let memoryValue = 0;

    function updateDisplay() {
      displayCurrentInput.textContent = currentOperand;
      if (operation != null) {
        displayHistory.textContent = `${previousOperand} ${getDisplayOperation(operation)}`;
      } else {
        displayHistory.textContent = '';
      }
    }

    function getDisplayOperation(op) {
      switch (op) {
        case 'add': return '+';
        case 'subtract': return '−';
        case 'multiply': return '×';
        case 'divide': return '÷';
        default: return '';
      }
    }

    function appendNumber(number) {
      if (currentOperand === '0' || displayNeedsReset) {
        currentOperand = number;
        displayNeedsReset = false;
      } else {
        if (currentOperand.length >= 16) return; // Limit input length
        currentOperand += number;
      }
    }

    function chooseOperation(selectedOperation) {
      if (currentOperand === '' && previousOperand === '') return;
      if (currentOperand === '' && previousOperand !== '') { // Allow changing operator
        operation = selectedOperation;
        updateDisplay();
        return;
      }
      if (previousOperand !== '') {
        compute();
      }
      operation = selectedOperation;
      previousOperand = currentOperand;
      currentOperand = '';
      displayNeedsReset = false; // Allow immediate input after op selection
    }

    function compute() {
      let computation;
      const prev = parseFloat(previousOperand);
      const current = parseFloat(currentOperand);
      if (isNaN(prev) || isNaN(current)) return;

      switch (operation) {
        case 'add':
          computation = prev + current;
          break;
        case 'subtract':
          computation = prev - current;
          break;
        case 'multiply':
          computation = prev * current;
          break;
        case 'divide':
          if (current === 0) {
            currentOperand = "Error"; // Division by zero
            operation = null;
            previousOperand = '';
            displayNeedsReset = true;
            return;
          }
          computation = prev / current;
          break;
        default:
          return;
      }
      currentOperand = String(computation);
      // Limit decimal places for display if necessary, e.g., to 8
      if (currentOperand.includes('.')) {
        const parts = currentOperand.split('.');
        if (parts[1] && parts[1].length > 8) {
          currentOperand = parseFloat(currentOperand).toFixed(8);
        }
      }
      if (currentOperand.length > 16) { // Handle potential overflow
        currentOperand = parseFloat(currentOperand).toExponential(8);
      }

      operation = null;
      previousOperand = '';
      displayNeedsReset = true;
    }

    function clearAll() {
      currentOperand = '0';
      previousOperand = '';
      operation = null;
      displayNeedsReset = false;
      updateDisplay();
    }

    function clearEntry() {
      currentOperand = '0';
      displayNeedsReset = false;
      updateDisplay();
    }

    function backspace() {
      if (displayNeedsReset) {
        clearAll();
        return;
      }
      if (currentOperand.length > 1) {
        currentOperand = currentOperand.slice(0, -1);
      } else {
        currentOperand = '0';
      }
    }

    function inputDecimal() {
      if (displayNeedsReset) {
        currentOperand = '0.';
        displayNeedsReset = false;
        return;
      }
      if (!currentOperand.includes('.')) {
        currentOperand += '.';
      }
    }

    function negate() {
      if (currentOperand === '0' || currentOperand === 'Error') return;
      currentOperand = String(parseFloat(currentOperand) * -1);
    }

    function percent() {
      if (currentOperand === 'Error') return;
      if (previousOperand && operation) { // Calculate percentage of previousOperand
        const prev = parseFloat(previousOperand);
        const curr = parseFloat(currentOperand);
        currentOperand = String((prev * curr) / 100);
      } else { // Calculate percentage of currentOperand itself (e.g., 50% -> 0.5)
        currentOperand = String(parseFloat(currentOperand) / 100);
      }
      displayNeedsReset = true; // Result of an operation
    }

    function inverse() { // 1/x
      if (currentOperand === 'Error') return;
      const num = parseFloat(currentOperand);
      if (num === 0) {
        currentOperand = "Error";
      } else {
        currentOperand = String(1 / num);
      }
      displayNeedsReset = true;
    }

    function square() { // x²
      if (currentOperand === 'Error') return;
      const num = parseFloat(currentOperand);
      currentOperand = String(num * num);
      displayNeedsReset = true;
    }

    function sqrt() { // √x
      if (currentOperand === 'Error') return;
      const num = parseFloat(currentOperand);
      if (num < 0) {
        currentOperand = "Error";
      } else {
        currentOperand = String(Math.sqrt(num));
      }
      displayNeedsReset = true;
    }

    // Memory functions
    function memoryClear() { memoryValue = 0; console.log("Memory Cleared"); }
    function memoryRecall() { currentOperand = String(memoryValue); displayNeedsReset = true; console.log("Memory Recalled:", memoryValue); }
    function memoryAdd() { memoryValue += parseFloat(currentOperand) || 0; console.log("Memory Add, M:", memoryValue); }
    function memorySubtract() { memoryValue -= parseFloat(currentOperand) || 0; console.log("Memory Subtract, M:", memoryValue); }
    function memoryStore() { memoryValue = parseFloat(currentOperand) || 0; console.log("Memory Store:", memoryValue); }


    buttons.forEach(button => {
      button.addEventListener('click', () => {
        const action = button.dataset.action;
        const value = button.dataset.value;

        if (action === 'decimal') {
          inputDecimal();
        } else if (action === 'negate') {
          negate();
        } else if (action === 'percent') {
          percent();
        } else if (action === 'inverse') {
          inverse();
        } else if (action === 'square') {
          square();
        } else if (action === 'sqrt') {
          sqrt();
        } else if (action === 'clear') {
          clearAll();
        } else if (action === 'clear-entry') {
          clearEntry();
        } else if (action === 'backspace') {
          backspace();
        } else if (action === 'equals') {
          compute();
        } else if (['add', 'subtract', 'multiply', 'divide'].includes(action)) {
          chooseOperation(action);
        } else if (value !== undefined) { // Number button
          appendNumber(value);
        } else if (action === 'memory-clear') {
          memoryClear();
        } else if (action === 'memory-recall') {
          memoryRecall();
        } else if (action === 'memory-add') {
          memoryAdd();
        } else if (action === 'memory-subtract') {
          memorySubtract();
        } else if (action === 'memory-store') {
          memoryStore();
        } else if (action === 'history') {
          console.log("Calculator History button clicked (not implemented)");
        }
        updateDisplay();
        // Highlight active operator
        calculatorWindowElement.querySelectorAll('.calc-btn-operator').forEach(opBtn => {
          opBtn.classList.remove('active-operator');
          if (opBtn.dataset.action === operation) {
            opBtn.classList.add('active-operator');
          }
        });

      });
    });
    clearAll(); // Initialize display
  }

  function globalOnIconMouseMove(e) {
    const desktopArea = document.getElementById('desktop-area');
    if (desktopArea && (desktopArea.classList.contains('app-launcher-mode') || document.body.classList.contains('app-launcher-mode'))) {
      // Prevent drag selector in app launcher mode
      return;
    }
    if (!draggedIcon) return;
    e.preventDefault();
    if (!isActuallyDraggingIcon) {
      const dx = Math.abs(e.clientX - dragStartMouseX);
      const dy = Math.abs(e.clientY - dragStartMouseY);
      if (dx > DRAG_THRESHOLD || dy > DRAG_THRESHOLD) {
        isActuallyDraggingIcon = true;
        originalIconTransition = draggedIcon.style.transition; // Store original transition
        draggedIcon.style.transition = 'none'; // Disable transition for smooth dragging
        draggedIcon.style.zIndex = '15';
        draggedIcon.style.cursor = 'grabbing';
      }
    }
    if (isActuallyDraggingIcon) {
      if (selectedDesktopIcons.size > 1 && multiDragInitialPositions) {
        // Multi-drag: let icons follow the mouse freely, but validate on drop
        const dx = e.clientX - multiDragStartMouseX;
        const dy = e.clientY - multiDragStartMouseY;
        // Move all icons visually during drag (no clamping)
        multiDragInitialPositions.forEach(({ icon, left, top }) => {
          icon.style.position = 'absolute';
          icon.style.left = `${left + dx}px`;
          icon.style.top = `${top + dy}px`;
          icon.style.transition = 'none';
          icon.style.zIndex = '15';
        });
      } else {
        // Single icon: let it follow the mouse freely
        const desktopIconsContainer = document.querySelector('.desktop-icons');
        if (!desktopIconsContainer) return;
        const containerRect = desktopIconsContainer.getBoundingClientRect();
        let newLeft = e.clientX - containerRect.left - dragOffsetX + desktopIconsContainer.scrollLeft;
        let newTop = e.clientY - containerRect.top - dragOffsetY + desktopIconsContainer.scrollTop;
        draggedIcon.style.left = `${newLeft}px`;
        draggedIcon.style.top = `${newTop}px`;
      }
    }
  }

  function globalOnIconMouseUp(e) {
    const desktopArea = document.getElementById('desktop-area');
    if (desktopArea && (desktopArea.classList.contains('app-launcher-mode') || document.body.classList.contains('app-launcher-mode'))) {
      // Prevent drag selector in app launcher mode
      return;
    }
    if (!draggedIcon) {
      document.removeEventListener('mousemove', globalOnIconMouseMove);
      document.removeEventListener('mouseup', globalOnIconMouseUp);
      isActuallyDraggingIcon = false;
      return;
    }
    if (isActuallyDraggingIcon) {
      if (selectedDesktopIcons.size > 1 && multiDragInitialPositions) {
        // Multi-drag: snap all selected icons to grid (no stacking, no out-of-bounds)
        const dx = e.clientX - multiDragStartMouseX;
        const dy = e.clientY - multiDragStartMouseY;
        const occupied = {};
        // Mark all current slots as occupied except the ones being moved
        document.querySelectorAll('.desktop-icon').forEach(icon => {
          if (!selectedDesktopIcons.has(icon)) {
            const left = parseInt(icon.style.left, 10);
            const top = parseInt(icon.style.top, 10);
            const col = Math.round((left - GRID_GAP) / (GRID_CELL_WIDTH + GRID_GAP));
            const row = Math.round((top - GRID_GAP) / (GRID_CELL_HEIGHT + GRID_GAP));
            occupied[`${col},${row}`] = true;
          }
        });
        // --- Pre-validate all new positions ---
        let valid = true;
        const newPositions = [];
        const iconsContainer = multiDragInitialPositions[0]?.icon?.parentElement;
        const maxCol = Math.floor((iconsContainer.clientWidth - GRID_GAP - 1) / (GRID_CELL_WIDTH + GRID_GAP));
        const maxRow = Math.floor((iconsContainer.clientHeight - GRID_GAP - 1) / (GRID_CELL_HEIGHT + GRID_GAP));
        const groupOccupied = {};
        multiDragInitialPositions.forEach(({ icon, left, top }, idx) => {
          let newLeft = left + dx;
          let newTop = top + dy;
          let targetColumn = Math.max(0, Math.round((newLeft - GRID_GAP) / (GRID_CELL_WIDTH + GRID_GAP)));
          let targetRow = Math.max(0, Math.round((newTop - GRID_GAP) / (GRID_CELL_HEIGHT + GRID_GAP)));
          // Check bounds
          if (
            targetColumn < 0 ||
            targetRow < 0 ||
            targetColumn > maxCol ||
            targetRow > maxRow
          ) {
            valid = false;
          }
          // Check overlap with other icons (including in group)
          if (occupied[`${targetColumn},${targetRow}`] || groupOccupied[`${targetColumn},${targetRow}`]) {
            valid = false;
          }
          groupOccupied[`${targetColumn},${targetRow}`] = true;
          newPositions.push({ icon, targetColumn, targetRow });
        });
        if (!valid) {
          // Snap all to original positions
          if (multiDragOriginalPositions) {
            multiDragOriginalPositions.forEach(({ icon, left, top }) => {
              icon.style.left = left;
              icon.style.top = top;
              icon.style.transition = originalIconTransition || '';
              icon.style.zIndex = '';
              icon.style.cursor = '';
            });
          }
        } else {
          // Commit all new positions
          newPositions.forEach(({ icon, targetColumn, targetRow }) => {
            let targetSnappedLeft = GRID_GAP + targetColumn * (GRID_CELL_WIDTH + GRID_GAP);
            let targetSnappedTop = GRID_GAP + targetRow * (GRID_CELL_HEIGHT + GRID_GAP);
            targetSnappedLeft = Math.max(GRID_GAP, Math.min(targetSnappedLeft, iconsContainer.clientWidth - icon.offsetWidth - GRID_GAP));
            targetSnappedTop = Math.max(GRID_GAP, Math.min(targetSnappedTop, iconsContainer.clientHeight - icon.offsetHeight - GRID_GAP));
            icon.style.left = `${targetSnappedLeft}px`;
            icon.style.top = `${targetSnappedTop}px`;
            icon.style.transition = originalIconTransition || '';
            icon.style.zIndex = '';
            icon.style.cursor = '';
          });
        }
      } else {
        // Single icon snap (no stacking)
        const currentRawLeft = parseFloat(draggedIcon.style.left);
        const currentRawTop = parseFloat(draggedIcon.style.top);
        let targetColumn = Math.max(0, Math.round((currentRawLeft - GRID_GAP) / (GRID_CELL_WIDTH + GRID_GAP)));
        let targetRow = Math.max(0, Math.round((currentRawTop - GRID_GAP) / (GRID_CELL_HEIGHT + GRID_GAP)));
        const iconsContainer = draggedIcon.parentElement;
        // Mark all current slots as occupied except the dragged icon
        const occupied = {};
        document.querySelectorAll('.desktop-icon').forEach(icon => {
          if (icon !== draggedIcon) {
            const left = parseInt(icon.style.left, 10);
            const top = parseInt(icon.style.top, 10);
            const col = Math.round((left - GRID_GAP) / (GRID_CELL_WIDTH + GRID_GAP));
            const row = Math.round((top - GRID_GAP) / (GRID_CELL_HEIGHT + GRID_GAP));
            occupied[`${col},${row}`] = true;
          }
        });
        const maxCol = Math.floor((iconsContainer.clientWidth - GRID_GAP - 1) / (GRID_CELL_WIDTH + GRID_GAP));
        const maxRow = Math.floor((iconsContainer.clientHeight - GRID_GAP - 1) / (GRID_CELL_HEIGHT + GRID_GAP));
        // If slot is occupied or out of bounds, snap back to original position
        if (
          occupied[`${targetColumn},${targetRow}`] ||
          targetColumn < 0 ||
          targetRow < 0 ||
          targetColumn > maxCol ||
          targetRow > maxRow
        ) {
          if (iconOriginalLeft !== null && iconOriginalTop !== null) {
            draggedIcon.style.left = iconOriginalLeft;
            draggedIcon.style.top = iconOriginalTop;
          }
        } else {
          let targetSnappedLeft = GRID_GAP + targetColumn * (GRID_CELL_WIDTH + GRID_GAP);
          let targetSnappedTop = GRID_GAP + targetRow * (GRID_CELL_HEIGHT + GRID_GAP);
          targetSnappedLeft = Math.max(GRID_GAP, Math.min(targetSnappedLeft, iconsContainer.clientWidth - draggedIcon.offsetWidth - GRID_GAP));
          targetSnappedTop = Math.max(GRID_GAP, Math.min(targetSnappedTop, iconsContainer.clientHeight - draggedIcon.offsetHeight - GRID_GAP));
          draggedIcon.style.left = `${targetSnappedLeft}px`;
          draggedIcon.style.top = `${targetSnappedTop}px`;
        }
        draggedIcon.style.transition = originalIconTransition || '';
        draggedIcon.style.zIndex = '';
        draggedIcon.style.cursor = '';
      }
    }
    draggedIcon = null;
    isActuallyDraggingIcon = false;
    multiDragInitialPositions = null;
    iconOriginalLeft = null;
    iconOriginalTop = null;
    multiDragOriginalPositions = null;
    document.removeEventListener('mousemove', globalOnIconMouseMove);
    document.removeEventListener('mouseup', globalOnIconMouseUp);
  }

  if (desktopArea && dragSelector) {
    desktopArea.addEventListener('mousedown', (e) => {
      // Prevent drag selector in app-launcher-mode or easy-mode
      if (
        desktopArea.classList.contains('app-launcher-mode') ||
        document.body.classList.contains('app-launcher-mode') ||
        desktopArea.classList.contains('easy-mode') ||
        document.body.classList.contains('easy-mode')
      ) return;
      // Allow both left and right click to start drag selector
      if (e.button !== 0 && e.button !== 2) return;
      // Prevent drag selector in settings app
      if (e.target.closest('.settings-app-window')) return;
      if (e.target.closest('.desktop-icon') ||
        e.target.closest('.window') ||
        e.target.closest('.taskbar') ||
        e.target.closest('.start-menu') ||
        e.target.closest('.sidebar-widgets')) {
        if (e.target.closest('.desktop-icon') && !e.target.closest('.desktop-icon.selected')) {
          clearIconSelection();
        }
        return;
      }
      desktopArea.appendChild(dragSelector);
      isDraggingSelector = true;
      dragSelector.classList.remove('hidden');
      const desktopRect = desktopArea.getBoundingClientRect();
      dragSelectorStartX = e.clientX - desktopRect.left + desktopArea.scrollLeft;
      dragSelectorStartY = e.clientY - desktopRect.top + desktopArea.scrollTop;
      dragSelector.style.left = `${dragSelectorStartX}px`;
      dragSelector.style.top = `${dragSelectorStartY}px`;
      dragSelector.style.width = '0px';
      dragSelector.style.height = '0px';
      clearIconSelection();
      // If right click, prevent context menu
      if (e.button === 2) {
        e.preventDefault();
        hideContextMenu && hideContextMenu();
      }
      e.preventDefault();
    });
    document.addEventListener('mousemove', (e) => {
      if (!isDraggingSelector) return;
      if (dragSelector.parentElement !== desktopArea) return;
      const desktopRect = desktopArea.getBoundingClientRect();
      let currentX = e.clientX - desktopRect.left + desktopArea.scrollLeft;
      let currentY = e.clientY - desktopRect.top + desktopArea.scrollTop;
      const newLeft = Math.min(currentX, dragSelectorStartX);
      const newTop = Math.min(currentY, dragSelectorStartY);
      const newWidth = Math.abs(currentX - dragSelectorStartX);
      const newHeight = Math.abs(currentY - dragSelectorStartY);
      dragSelector.style.left = `${newLeft}px`;
      dragSelector.style.top = `${newTop}px`;
      dragSelector.style.width = `${newWidth}px`;
      dragSelector.style.height = `${newHeight}px`;
      updateSelectedIcons();
    });
  }
  document.addEventListener('mouseup', (e) => {
    if (isDraggingSelector) {
      isDraggingSelector = false;
      dragSelector.classList.add('hidden');
      if (selectedDesktopIcons.size === 0) clearIconSelection();
    }
    if (isDraggingFileSelector) {
      isDraggingFileSelector = false;
      if (fileExplorerContentArea && fileExplorerContentArea.contains(dragSelector)) {
        dragSelector.classList.add('hidden');
        if (desktopArea) desktopArea.appendChild(dragSelector);
      }
    }
  });

  function setupFileExplorerInteraction(fileExplorerWindow) {
    // Prevent drag selector logic in Settings app
    if (fileExplorerWindow.classList.contains('settings-app-window') || fileExplorerWindow.querySelector('.settings-content')) {
      return;
    }
    const contentArea = fileExplorerWindow.querySelector('.file-explorer-content');
    fileExplorerContentArea = contentArea;
    currentSelectedFileItems = new Set();
    if (!contentArea) return; // Prevent error if contentArea is missing
    const fileItems = contentArea.querySelectorAll('.file-item');

    fileItems.forEach(item => {
      item.addEventListener('dblclick', function () { /* ... */ });
      item.addEventListener('mousedown', function (e) {
        if (e.button !== 0 && e.button !== 2) return;
        if (isDraggingFileSelector) return;
        if (!e.ctrlKey && !e.shiftKey) {
          currentSelectedFileItems.forEach(fi => fi.classList.remove('selected'));
          currentSelectedFileItems.clear();
          this.classList.add('selected');
          currentSelectedFileItems.add(this);
        }
        e.stopPropagation();
      });
    });
    contentArea.addEventListener('mousedown', (e) => {
      if (e.button !== 0 && e.button !== 2) return;
      isDraggingFileSelector = true;
      contentArea.appendChild(dragSelector);
      dragSelector.classList.remove('hidden');
      const contentRect = contentArea.getBoundingClientRect();
      fileSelectorStartX = e.clientX - contentRect.left + contentArea.scrollLeft;
      fileSelectorStartY = e.clientY - contentRect.top + contentArea.scrollTop;
      dragSelector.style.left = `${fileSelectorStartX}px`;
      dragSelector.style.top = `${fileSelectorStartY}px`;
      dragSelector.style.width = '0px';
      dragSelector.style.height = '0px';
      currentSelectedFileItems.forEach(fi => fi.classList.remove('selected'));
      currentSelectedFileItems.clear();
      // If right click, prevent context menu
      if (e.button === 2) {
        e.preventDefault();
        hideContextMenu && hideContextMenu();
      }
      e.preventDefault();
    });
    document.addEventListener('mousemove', (e) => {
      if (!isDraggingFileSelector) return;
      if (!fileExplorerContentArea || dragSelector.parentElement !== fileExplorerContentArea) return;
      const contentRect = fileExplorerContentArea.getBoundingClientRect();
      // Get toolbar and statusbar bounds
      const fileExplorerWindow = fileExplorerContentArea.closest('.window');
      let toolbarBottom = 0;
      let statusbarTop = fileExplorerContentArea.clientHeight;
      if (fileExplorerWindow) {
        const toolbar = fileExplorerWindow.querySelector('.window-toolbar');
        const statusbar = fileExplorerWindow.querySelector('.window-statusbar');
        if (toolbar) {
          const toolbarRect = toolbar.getBoundingClientRect();
          toolbarBottom = toolbarRect.bottom - contentRect.top;
          if (toolbarBottom < 0) toolbarBottom = 0;
        }
        if (statusbar) {
          const statusbarRect = statusbar.getBoundingClientRect();
          statusbarTop = statusbarRect.top - contentRect.top;
          if (statusbarTop > fileExplorerContentArea.clientHeight) statusbarTop = fileExplorerContentArea.clientHeight;
        }
      }
      let currentX = e.clientX - contentRect.left + fileExplorerContentArea.scrollLeft;
      let currentY = e.clientY - contentRect.top + fileExplorerContentArea.scrollTop;
      // Clamp X and Y so drag selector does not go outside fileExplorerContentArea
      currentX = Math.max(0, Math.min(currentX, fileExplorerContentArea.clientWidth));
      currentY = Math.max(toolbarBottom, Math.min(currentY, statusbarTop));
      // Clamp startX/startY as well
      fileSelectorStartX = Math.max(0, Math.min(fileSelectorStartX, fileExplorerContentArea.clientWidth));
      fileSelectorStartY = Math.max(toolbarBottom, Math.min(fileSelectorStartY, statusbarTop));
      const newLeft = Math.min(currentX, fileSelectorStartX);
      const newTop = Math.min(currentY, fileSelectorStartY);
      const newWidth = Math.abs(currentX - fileSelectorStartX);
      const newHeight = Math.abs(currentY - fileSelectorStartY);
      dragSelector.style.left = `${newLeft}px`;
      dragSelector.style.top = `${newTop}px`;
      dragSelector.style.width = `${newWidth}px`;
      dragSelector.style.height = `${newHeight}px`;
      updateSelectedFileItems(fileExplorerContentArea, dragSelector, fileItems, currentSelectedFileItems);
    });
    fileExplorerWindow.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (isDraggingFileSelector) {
          isDraggingFileSelector = false;
          if (fileExplorerContentArea && fileExplorerContentArea.contains(dragSelector)) {
            dragSelector.classList.add('hidden');
            if (desktopArea) desktopArea.appendChild(dragSelector);
          }
        }
        currentSelectedFileItems.forEach(fi => fi.classList.remove('selected'));
        currentSelectedFileItems.clear();
      }
    });
    contentArea.addEventListener('click', (e) => {
      if (!e.target.closest('.file-item') && !isDraggingFileSelector) {
        currentSelectedFileItems.forEach(fi => fi.classList.remove('selected'));
        currentSelectedFileItems.clear();
      }
    });

    // Add mobile menu toggle functionality
    const menuToggle = fileExplorerWindow.querySelector('.menu-toggle');
    const sidebar = fileExplorerWindow.querySelector('.file-explorer-sidebar');
    const overlay = fileExplorerWindow.querySelector('.sidebar-overlay');

    if (menuToggle && sidebar && overlay) {
      menuToggle.addEventListener('click', () => {
        const isShowing = !sidebar.classList.contains('show');
        sidebar.classList.toggle('show');
        overlay.classList.toggle('show');
        if (window.innerWidth <= 767) {
          if (isShowing) {
            contentArea.classList.add('sidebar-push-active');
          } else {
            contentArea.classList.remove('sidebar-push-active');
          }
        }
      });

      overlay.addEventListener('click', () => {
        sidebar.classList.remove('show');
        overlay.classList.remove('show');
        if (window.innerWidth <= 767) {
          contentArea.classList.remove('sidebar-push-active');
        }
      });

      // Close sidebar on item click for mobile
      const sidebarItems = sidebar.querySelectorAll('.sidebar-item');
      sidebarItems.forEach(item => {
        item.addEventListener('click', () => {
          if (window.innerWidth <= 767) {
            sidebar.classList.remove('show');
            overlay.classList.remove('show');
            contentArea.classList.remove('sidebar-push-active');
          }
        });
      });
    }

    // Handle window resize
    window.addEventListener('resize', () => {
      if (window.innerWidth > 767) {
        sidebar.classList.remove('show');
        overlay.classList.remove('show');
        contentArea.classList.remove('sidebar-push-active');
      }
    });


    // After creating the File Explorer window, call:
    // setupSidebarToggleForFileExplorer(fileExplorerWindow);
  }

  function hideContextMenu() {
    if (contextMenu) contextMenu.classList.add('hidden');
  }

  //Arg Right Click menu for desktop, file explorer, and taskbar and icons
  // --- Global Context Menu for Text Selection (works everywhere except desktop, file explorer, taskbar) ---
  (function () {
    // Save original executeContextMenuAction
    const _originalExecuteContextMenuAction = executeContextMenuAction;
    // Patch global contextmenu
    document.addEventListener('contextmenu', function (e) {

      const target = e.target;
      if (
        (target.tagName === 'INPUT' && !target.readOnly && !target.disabled) ||
        (target.tagName === 'TEXTAREA' && !target.readOnly && !target.disabled) ||
        (target.isContentEditable && !target.readOnly && !target.disabled)
      ) {
        // If inside .desktop-area, .file-explorer-content, .taskbar, let those handlers run
        if (target.closest && (
          target.closest('.desktop-area') ||
          target.closest('.file-explorer-content') ||
          target.closest('.widget-content') ||
          target.closest('.notification-widget') ||
          (target.closest('.taskbar') && !target.closest('.search-input'))
        )) return;
        e.preventDefault();
        hideContextMenu && hideContextMenu();
        currentContextMenuTarget = target;
        let hasSelection = false;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
          hasSelection = target.selectionStart !== target.selectionEnd;
        } else if (target.isContentEditable) {
          const sel = window.getSelection();
          hasSelection = sel && sel.rangeCount > 0 && !sel.getRangeAt(0).collapsed && target.contains(sel.anchorNode);
        }
        const menuItems = [];
        menuItems.push({ label: 'Cut', action: 'text-cut', icon: 'fa-scissors', disabled: !hasSelection });
        menuItems.push({ label: 'Copy', action: 'text-copy', icon: 'fa-copy', disabled: !hasSelection });
        menuItems.push({ label: 'Paste', action: 'text-paste', icon: 'fa-clipboard' });
        menuItems.push({ label: 'Delete', action: 'text-delete', icon: 'fa-trash', disabled: !hasSelection });
        menuItems.push({ type: 'separator' });
        menuItems.push({ label: 'Select All', action: 'text-select-all', icon: 'fa-i-cursor' });
        populateContextMenu(menuItems, e.clientX, e.clientY);
      }
    }, true);
    // Patch executeContextMenuAction
    async function tryClipboardWrite(text, target, actionType) {
      console.log('tryClipboardWrite called', text, target, actionType);
      try {
        if (typeof window.focus === 'function') window.focus();
        if (target && typeof target.focus === 'function') target.focus();
        await new Promise(resolve => setTimeout(resolve, 0));
        await navigator.clipboard.writeText(text);
        console.log('Clipboard API writeText succeeded');
        return true;
      } catch (err) {
        console.warn('Clipboard API writeText failed', err);
        // Fallback to execCommand
        try {
          if (target && typeof target.focus === 'function') target.focus();
          if (actionType === 'cut' || actionType === 'copy') {
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
              const start = target.selectionStart;
              const end = target.selectionEnd;
              if (start !== end) {
                target.setSelectionRange(start, end);
              }
            } else if (target.isContentEditable) {
              const sel = window.getSelection();
              if (sel && sel.rangeCount === 0) {
                const range = document.createRange();
                range.selectNodeContents(target);
                sel.removeAllRanges();
                sel.addRange(range);
              }
            }
            const success = document.execCommand(actionType);
            console.log('execCommand', actionType, 'result:', success);
            if (!success) throw new Error('execCommand failed');
            return true;
          }
        } catch (fallbackErr) {
          console.warn('execCommand fallback failed', fallbackErr);
          return false;
        }
        return false;
      }
    }
    async function tryClipboardRead(target) {
      try {
        if (typeof window.focus === 'function') window.focus();
        if (target && typeof target.focus === 'function') target.focus();
        await new Promise(resolve => setTimeout(resolve, 0));
        return await navigator.clipboard.readText();
      } catch (err) {
        // Fallback to execCommand (paste)
        try {
          if (target && typeof target.focus === 'function') target.focus();
          const success = document.execCommand('paste');
          if (!success) throw new Error('execCommand paste failed');
          // For security, browsers may not return pasted text
          // User may need to use Ctrl+V
          return '';
        } catch (fallbackErr) {
          alert('Clipboard access is not available. Please use Ctrl+V.');
          return '';
        }
      }
    }
    window.executeContextMenuAction = async function (action) {
      // --- OPEN APP HANDLER ---
      if (action === 'open-app') {
        // For pinned-only taskbar icon
        if (currentContextMenuTarget && currentContextMenuTarget.classList.contains('taskbar-app-icon') && currentContextMenuTarget.classList.contains('pinned-only')) {
          const appName = currentContextMenuTarget.getAttribute('data-app');
          const details = getAppIconDetails(appName);
          // Try to focus/restore if already open
          const openWin = Object.values(openWindows).find(w => w.name === appName && w.element);
          if (openWin && openWin.element) {
            if (openWin.element.classList.contains('minimized')) {
              if (typeof toggleMinimizeWindow === 'function') toggleMinimizeWindow(openWin.element, openWin.taskbarIcon);
            } else {
              if (typeof makeWindowActive === 'function') makeWindowActive(openWin.element);
            }
          } else {
            if (typeof openApp === 'function') openApp(appName, appName.charAt(0).toUpperCase() + appName.slice(1).replace(/-/g, ' '), details.iconClass, details.iconBgClass);
          }
          hideContextMenu();
          return;
        }

        // For app-grid-item (start menu/app launcher)
        if (currentContextMenuTarget && currentContextMenuTarget.classList.contains('app-grid-item')) {
          const appName = currentContextMenuTarget.getAttribute('data-app');
          const appTitle = currentContextMenuTarget.getAttribute('data-app-title') || currentContextMenuTarget.querySelector('span')?.textContent || appName;
          const details = getAppIconDetails(appName);

          // Try to focus/restore if already open
          const openWin = Object.values(openWindows).find(w => w.name === appName && w.element);
          if (openWin && openWin.element) {
            if (openWin.element.classList.contains('minimized')) {
              if (typeof toggleMinimizeWindow === 'function') toggleMinimizeWindow(openWin.element, openWin.taskbarIcon);
            } else {
              if (typeof makeWindowActive === 'function') makeWindowActive(openWin.element);
            }
          } else {
            if (typeof openApp === 'function') openApp(appName, appTitle, details.iconClass, details.iconBgClass, this);
          }
          if (typeof hideContextMenu === 'function') hideContextMenu();
          // Optionally close the start menu if you want:
          if (typeof startMenu !== 'undefined' && startMenu) startMenu.style.display = 'none';
          return;
        }
      }

      // --- UNIVERSAL PIN/UNPIN HANDLER ---
      if (action === 'pin-to-taskbar' || action === 'unpin-taskbar') {
        let appName = null;
        if (currentContextMenuTarget) {
          appName = currentContextMenuTarget.getAttribute('data-app');
          // If taskbar icon, try data-window-id to get app name from openWindows
          if (!appName && currentContextMenuTarget.classList.contains('taskbar-app-icon')) {
            const winId = currentContextMenuTarget.getAttribute('data-window-id');
            if (winId && openWindows[winId]) appName = openWindows[winId].name;
          }
          // If still not found, try data-app-name on pinned-only icon
          if (!appName && currentContextMenuTarget.classList.contains('pinned-only')) {
            appName = currentContextMenuTarget.getAttribute('data-app');
          }
        }
        if (appName) {
          if (action === 'pin-to-taskbar') {
            pinAppToTaskbar(appName);
            if (typeof showShortTopNotification === 'function') showShortTopNotification('Pinned to Taskbar');
          } else {
            unpinAppFromTaskbar(appName);
            if (typeof showShortTopNotification === 'function') showShortTopNotification('Unpinned from Taskbar');
          }
        }
        if (typeof hideContextMenu === 'function') hideContextMenu();
        return;
      }

      console.log('[Patched] executeContextMenuAction called with:', action);
      try {
        console.log('Action:', action, 'Target:', currentContextMenuTarget);
        if (!currentContextMenuTarget) {
          console.warn('No currentContextMenuTarget!');
          return _originalExecuteContextMenuAction.call(this, action);
        }
        const target = currentContextMenuTarget;
        if (typeof target.focus === 'function') target.focus();
        if (document.activeElement !== target) target.focus();
        window.focus && window.focus();

        // --- ADD THIS ARRAY AT THE TOP OF THE FUNCTION ---
        const allStartMenuStyles = [
          'start-menu-style-default',
          'start-menu-style-default-apps-only',
          'start-menu-style-windows11',
          'start-menu-list-style',
          'start-menu-apps-only',
          'start-menu-style-apps-list-only',
          'start-menu-style-app-launcher'
        ];
        switch (action) {
          case 'text-cut': {
            console.log('[ContextMenu] text-cut triggered');
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
              const start = target.selectionStart;
              const end = target.selectionEnd;
              console.log('start:', start, 'end:', end, 'typeof start:', typeof start, 'typeof end:', typeof end);
              if (start !== end) {
                const selectedText = target.value.slice(start, end);
                console.log('About to call tryClipboardWrite with:', selectedText, target, 'cut');
                const ok = await tryClipboardWrite(selectedText, target, 'cut');
                if (ok) {
                  target.value = target.value.slice(0, start) + target.value.slice(end);
                  target.setSelectionRange(start, start);
                  showShortTopNotification('Cutted');
                } else {
                  alert('Cut failed: Clipboard could not be updated.');
                }
              }
            } else if (target.isContentEditable) {
              const sel = window.getSelection();
              if (sel && !sel.isCollapsed) {
                const selectedText = sel.toString();
                console.log('About to call tryClipboardWrite with:', selectedText, target, 'cut');
                const ok = await tryClipboardWrite(selectedText, target, 'cut');
                if (ok) {
                  sel.deleteFromDocument();
                  showShortTopNotification('Cutted');
                } else alert('Cut failed: Clipboard could not be updated.');
              }
            }
            break;
          }
          case 'text-copy': {
            console.log('[ContextMenu] text-copy triggered');
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
              const start = target.selectionStart;
              const end = target.selectionEnd;
              console.log('start:', start, 'end:', end, 'typeof start:', typeof start, 'typeof end:', typeof end);
              if (start !== end) {
                const selectedText = target.value.slice(start, end);
                console.log('About to call tryClipboardWrite with:', selectedText, target, 'copy');
                const ok = await tryClipboardWrite(selectedText, target, 'copy');
                if (ok) showShortTopNotification('Copiated');
                else alert('Copy failed: Clipboard could not be updated.');
              }
            } else if (target.isContentEditable) {
              const sel = window.getSelection();
              if (sel && !sel.isCollapsed) {
                const selectedText = sel.toString();
                console.log('About to call tryClipboardWrite with:', selectedText, target, 'copy');
                const ok = await tryClipboardWrite(selectedText, target, 'copy');
                if (ok) showShortTopNotification('Copiated');
                else alert('Copy failed: Clipboard could not be updated.');
              }
            }
            break;
          }
          case 'text-paste': {
            console.log('[ContextMenu] text-paste triggered');
            if (navigator.clipboard && navigator.clipboard.readText) {
              try {
                const text = await navigator.clipboard.readText();
                console.log('Clipboard readText:', text);
                if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
                  const start = target.selectionStart;
                  const end = target.selectionEnd;
                  const val = target.value;
                  target.value = val.slice(0, start) + text + val.slice(end);
                  target.setSelectionRange(start + text.length, start + text.length);
                } else if (target.isContentEditable) {
                  document.execCommand('insertText', false, text);
                }
              } catch (err) {
                console.error('Paste failed:', err);
                alert('Paste failed: Clipboard could not be read.');
              }
            } else {
              alert('Paste failed: Clipboard could not be read.');
            }
            break;
          }
          case 'text-delete': {
            console.log('[ContextMenu] text-delete triggered');
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
              const start = target.selectionStart;
              const end = target.selectionEnd;
              console.log('start:', start, 'end:', end, 'typeof start:', typeof start, 'typeof end:', typeof end);
              if (start !== end) {
                const val = target.value;
                target.value = val.slice(0, start) + val.slice(end);
                target.setSelectionRange(start, start);
              }
            } else if (target.isContentEditable) {
              const sel = window.getSelection();
              if (sel && !sel.isCollapsed) sel.deleteFromDocument();
            }
            break;
          }
          case 'text-select-all': {
            console.log('[ContextMenu] text-select-all triggered');
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
              target.focus();
              target.select();
              console.log('After select():', target.selectionStart, target.selectionEnd, target.value.length);
            } else if (target.isContentEditable) {
              const range = document.createRange();
              range.selectNodeContents(target);
              const sel = window.getSelection();
              sel.removeAllRanges();
              sel.addRange(range);
              console.log('After selectNodeContents:', sel.toString());
            }
            break;
          }
          case 'open-music-player': {
            const volumePanel = document.getElementById('volume-panel');
            if (volumePanel) {
              const musicPanel = volumePanel.querySelector('.music-panel-box');
              if (window._playlistPanelRemoveTimeout) {
                clearTimeout(window._playlistPanelRemoveTimeout);
                window._playlistPanelRemoveTimeout = null;
              }
              // Remove all playlist panels immediately
              const playlistPanels = volumePanel.querySelectorAll('.playlist-panel-slide');
              const isMusicVisible = musicPanel && getComputedStyle(musicPanel).display !== 'none';
              const isPlaylistVisible = playlistPanels.length > 0;
              if (isMusicVisible || isPlaylistVisible) {
                // Hide both
                playlistPanels.forEach(panel => {
                  if (panel.parentNode) panel.parentNode.removeChild(panel);
                });
                if (musicPanel) musicPanel.style.display = 'none';
              } else {
                // Both are hidden, show music player
                if (musicPanel) musicPanel.style.display = '';
              }
            }
            break;
          }
          case 'taskbar-mute': {
            // Toggle mute state
            const volumeBtn = document.getElementById('volume-btn');
            const volumeSlider = document.getElementById('browser-volume-slider');
            if (volumeBtn && volumeSlider) {
              if (!isMuted) {
                // Muting
                previousVolume = volumeSlider.value;
                volumeSlider.value = 0;
                volumeSlider.dispatchEvent(new Event('input', { bubbles: true }));
                updateVolumeUI(0);
              } else {
                // Unmuting
                volumeSlider.value = previousVolume;
                volumeSlider.dispatchEvent(new Event('input', { bubbles: true }));
                updateVolumeUI(parseInt(previousVolume, 10));
              }
            }
            break;
          }
          case 'mute-notifications': {
            // Toggle notifications mute state
            isNotificationsMuted = !isNotificationsMuted;
            // Update notifications button icon
            const notificationsBtn = document.getElementById('notifications-btn');
            if (notificationsBtn) {
              const icon = notificationsBtn.querySelector('i');
              if (icon) {
                if (isNotificationsMuted) {
                  icon.classList.remove('fa-bell');
                  icon.classList.add('fa-bell-slash');
                } else {
                  icon.classList.remove('fa-bell-slash');
                  icon.classList.add('fa-bell');
                }
              }
            }
            // Optionally, you can show a toast or feedback here
            break;
          }
          case 'show-only-1-notification':
            desktopNotificationMode = 'one';
            showShortTopNotification('Desktop notifications: Only 1');
            break;
          case 'show-only-3-notifications':
            desktopNotificationMode = 'three';
            showShortTopNotification('Desktop notifications: Only 3');
            break;
          case 'show-all-notifications':
            desktopNotificationMode = 'all';
            showShortTopNotification('Desktop notifications: All');
            break;
          case 'clear-all-notifications': {
            clearAllNotifications();
            break;
          }
          case 'show-wallet-icon':
            window.walletDisplayMode = 'icon';
            window.updateWalletBtnDisplay && window.updateWalletBtnDisplay();
            break;
          case 'show-account-balance':
            window.walletDisplayMode = 'balance';
            window.updateWalletBtnDisplay && window.updateWalletBtnDisplay();
            break;
          // --- START MENU STYLE CASES: REPLACE ANY OLD/NESTED ONES WITH THESE ---
          case 'start-menu-style-default':
            if (startMenu) {
              startMenu.classList.remove(...allStartMenuStyles);
              startMenu.classList.add('start-menu-style-default');
              startMenuAppSortMode = 'category';
              populateStartMenuApps();
              startMenu.style.display = 'block';
            }
            break;
          case 'start-menu-style-default-apps-only':
            if (startMenu) {
              startMenu.classList.remove(...allStartMenuStyles);
              startMenu.classList.add('start-menu-style-default-apps-only');
              startMenuAppSortMode = 'category';
              populateStartMenuApps();
              startMenu.style.display = 'block';
            }
            break;
          case 'start-menu-style-windows11':
            if (startMenu) {
              startMenu.classList.remove(...allStartMenuStyles);
              startMenu.classList.add('start-menu-style-windows11');
              startMenuAppSortMode = 'alphabet';
              populateStartMenuApps();
              startMenu.style.display = 'block';
            }
            break;
          case 'start-menu-style-apps-list-with-sidebar':
            if (startMenu) {
              startMenu.classList.remove(...allStartMenuStyles);
              startMenu.classList.add('start-menu-list-style');
              startMenuAppSortMode = 'category';
              populateStartMenuApps();
              startMenu.style.display = 'block';
            }
            break;
          case 'start-menu-style-apps-list-only':
            if (startMenu) {
              startMenu.classList.remove(...allStartMenuStyles);
              startMenu.classList.add('start-menu-style-apps-list-only');
              startMenuAppSortMode = 'category';
              populateStartMenuApps();
              startMenu.style.display = 'block';
            }
            break;
          case 'start-menu-style-app-launcher':
            if (startMenu) {
              startMenu.classList.remove(...allStartMenuStyles);
              startMenu.classList.add('start-menu-style-app-launcher');
              closeStartMenuAnimated();
            }

            if (startMenu) {
              startMenu.className = startMenu.className
                .split(' ')
                .filter(cls => !cls.startsWith('start-menu-style-') && cls !== 'start-menu-apps-only' && cls !== 'start-menu-list-style')
                .join(' ');
              startMenu.classList.add('start-menu-style-app-launcher');
              closeStartMenuAnimated();
            }
            break;
          case 'open-settings':
            openApp('settings', 'Settings', 'fa-cog', 'green');
            break;
            case 'uninstall-app': {
              if (
                currentContextMenuTarget &&
                (currentContextMenuTarget.classList.contains('app-grid-item') ||
                 currentContextMenuTarget.classList.contains('app-launcher-app'))
              ) {
                const appName = currentContextMenuTarget.getAttribute('data-app');
                const appTitle = currentContextMenuTarget.getAttribute('data-app-title') || currentContextMenuTarget.querySelector('span')?.textContent || appName;
                showConfirmDialog({
                  title: 'Uninstall App',
                  message: `Are you sure you want to uninstall <b>${appTitle}</b>? This cannot be undone!`,
                  iconClass: 'fa-trash',
                  okText: 'Uninstall',
                  cancelText: 'Cancel',
                  style: 'desktop'
                }).then(confirmed => {
                  if (confirmed) {
                    // Remove from startMenuApps array
                    if (typeof startMenuApps !== 'undefined') {
                      const idx = startMenuApps.findIndex(a => a.id === appName || a.name === appName || (a.name && a.name.toLowerCase().replace(/\\s+/g, '-') === appName));
                      if (idx !== -1) {
                        startMenuApps.splice(idx, 1);
                      }
                    }
                    // Remove from DOM if present
                    if (currentContextMenuTarget && currentContextMenuTarget.parentElement) {
                      currentContextMenuTarget.parentElement.removeChild(currentContextMenuTarget);
                    }
                    // Remove from desktop if present
                    const desktopIcon = document.querySelector('.desktop-icon[data-app=\"' + appName + '\"]');
                    if (desktopIcon && desktopIcon.parentElement) {
                      desktopIcon.parentElement.removeChild(desktopIcon);
                    }
                    // Remove from taskbar if pinned
                    unpinAppFromTaskbar(appName);
                    // Refresh start menu UI
                    if (typeof populateStartMenuApps === 'function') populateStartMenuApps();
                    if (typeof showShortTopNotification === 'function') showShortTopNotification('App uninstalled');
                  }
                  if (typeof hideContextMenu === 'function') hideContextMenu();
                });
              }
              break;
            }
          case 'sort-name': {
            // Only handle if desktop area is context
            const desktopIconsContainer = document.querySelector('.desktop-icons');
            if (desktopIconsContainer && (currentContextMenuTarget === desktopIconsContainer || currentContextMenuTarget.classList.contains('desktop-icons'))) {
              const icons = Array.from(desktopIconsContainer.querySelectorAll('.desktop-icon'));
              icons.sort((a, b) => {
                const aName = a.querySelector('span')?.textContent?.toLowerCase() || '';
                const bName = b.querySelector('span')?.textContent?.toLowerCase() || '';
                return aName.localeCompare(bName);
              });
              icons.forEach(icon => desktopIconsContainer.appendChild(icon));
              saveCurrentDesktopIconOrder();
              if (typeof showShortTopNotification === 'function') showShortTopNotification('Sorted by name');
              initializeDesktopIconPositions(); // Always re-layout
            } else {
              _originalExecuteContextMenuAction.call(this, action);
            }
            break;
          }
          case 'sort-date': {
            const desktopIconsContainer = document.querySelector('.desktop-icons');
            if (desktopIconsContainer && (currentContextMenuTarget === desktopIconsContainer || currentContextMenuTarget.classList.contains('desktop-icons'))) {
              const icons = Array.from(desktopIconsContainer.querySelectorAll('.desktop-icon'));
              icons.sort((a, b) => {
                // Use data-created attribute if present, else fallback to DOM order
                const aDate = a.getAttribute('data-created') || a.dataset.created || '';
                const bDate = b.getAttribute('data-created') || b.dataset.created || '';
                if (aDate && bDate) return aDate.localeCompare(bDate);
                return 0; // fallback: keep DOM order
              });
              icons.forEach(icon => desktopIconsContainer.appendChild(icon));
              saveCurrentDesktopIconOrder();
              if (typeof showShortTopNotification === 'function') showShortTopNotification('Sorted by date');
              initializeDesktopIconPositions(); // Always re-layout
            } else {
              _originalExecuteContextMenuAction.call(this, action);
            }
            break;
          }
          case 'sort-type': {
            const desktopIconsContainer = document.querySelector('.desktop-icons');
            if (desktopIconsContainer && (currentContextMenuTarget === desktopIconsContainer || currentContextMenuTarget.classList.contains('desktop-icons'))) {
              // Get app ids from startMenuApps
              const appIds = (window.startMenuApps || []).map(app => app.id);
              const icons = Array.from(desktopIconsContainer.querySelectorAll('.desktop-icon'));
              // Apps first, then files, both alphabetically
              const isApp = icon => appIds.includes(icon.getAttribute('data-app'));
              icons.sort((a, b) => {
                const aIsApp = isApp(a);
                const bIsApp = isApp(b);
                if (aIsApp && !bIsApp) return -1;
                if (!aIsApp && bIsApp) return 1;
                // Both same type, sort by name
                const aName = a.querySelector('span')?.textContent?.toLowerCase() || '';
                const bName = b.querySelector('span')?.textContent?.toLowerCase() || '';
                return aName.localeCompare(bName);
              });
              icons.forEach(icon => desktopIconsContainer.appendChild(icon));
              saveCurrentDesktopIconOrder();
              if (typeof showShortTopNotification === 'function') showShortTopNotification('Sorted by type (apps first)');
              initializeDesktopIconPositions(); // Always re-layout
            } else {
              _originalExecuteContextMenuAction.call(this, action);
            }
            break;
          }
          case 'add-to-desktop':
            if (currentContextMenuTarget && currentContextMenuTarget.classList.contains('app-grid-item')) {
              const appName = currentContextMenuTarget.getAttribute('data-app');
              const appTitle = currentContextMenuTarget.getAttribute('data-app-title') || currentContextMenuTarget.querySelector('span')?.textContent || appName;
              // Get icon details from startMenuApps, fallback to getAppIconDetails
              let details = { iconClass: 'fa-window-maximize', iconBgClass: 'gray-icon' };
              if (typeof startMenuApps !== 'undefined') {
                const appObj = startMenuApps.find(a =>
                  a.id === appName ||
                  a.name === appName ||
                  (a.name && a.name.toLowerCase().replace(/\s+/g, '-') === appName)
                );
                if (appObj) {
                  details.iconClass = appObj.iconClass || details.iconClass;
                  details.iconBgClass = appObj.iconBgClass || details.iconBgClass;
                } else {
                  details = getAppIconDetails(appName);
                }
              } else {
                details = getAppIconDetails(appName);
              }
              const desktopIconsContainer = document.querySelector('.desktop-icons');
              if (!desktopIconsContainer) {
                if (typeof showShortTopNotification === 'function') showShortTopNotification('Desktop not found');
                break;
              }
              // Robust check: if already on desktop, do not add
              if (desktopIconsContainer.querySelector('.desktop-icon[data-app="' + appName + '"]')) {
                if (typeof showShortTopNotification === 'function') showShortTopNotification('Already on Desktop');
                break;
              }
              const icon = document.createElement('div');
              icon.className = 'desktop-icon';
              icon.setAttribute('data-app', appName);
              icon.setAttribute('data-created', new Date().toISOString()); // Set creation date
              icon.innerHTML = `
              <div class="icon-container ${details.iconBgClass}"><i class="fas ${details.iconClass}"></i></div>
              <span>${appTitle}</span>
            `;
              // --- Find first available grid slot ---
              if (window.innerWidth > 1023) {
                // Use grid logic
                const leftOffset = GRID_GAP;
                const topOffset = GRID_GAP;
                const colWidth = GRID_CELL_WIDTH + GRID_GAP;
                const iconHeight = GRID_CELL_HEIGHT;
                const verticalGap = GRID_GAP;
                const taskbar = document.querySelector('.taskbar');
                const taskbarHeight = taskbar ? taskbar.offsetHeight : 0;
                const availableHeight = window.innerHeight - taskbarHeight - 50; // 30px bottom margin
                const maxRows = Math.max(1, Math.floor((availableHeight - topOffset) / (iconHeight + verticalGap)));
                const maxCols = Math.max(1, Math.floor((desktopIconsContainer.clientWidth - leftOffset) / colWidth));
                // Mark occupied slots
                const occupied = {};
                desktopIconsContainer.querySelectorAll('.desktop-icon').forEach(existingIcon => {
                  const left = parseInt(existingIcon.style.left, 10);
                  const top = parseInt(existingIcon.style.top, 10);
                  if (!isNaN(left) && !isNaN(top)) {
                    const col = Math.round((left - leftOffset) / colWidth);
                    const row = Math.round((top - topOffset) / (iconHeight + verticalGap));
                    occupied[`${col},${row}`] = true;
                  }
                });
                // Find first free slot (column by column, then row)
                let found = false;
                let targetCol = 0, targetRow = 0;
                outer: for (let col = 0; col < maxCols; col++) {
                  for (let row = 0; row < maxRows; row++) {
                    if (!occupied[`${col},${row}`]) {
                      targetCol = col;
                      targetRow = row;
                      found = true;
                      break outer;
                    }
                  }
                }
                // Place icon at found slot
                const iconLeft = leftOffset + targetCol * colWidth;
                const iconTop = topOffset + targetRow * (iconHeight + verticalGap);
                icon.style.position = 'absolute';
                icon.style.left = iconLeft + 'px';
                icon.style.top = iconTop + 'px';
                icon.setAttribute('data-absolute', 'true');
              }
              desktopIconsContainer.appendChild(icon);
              setupDesktopIcon(icon);
              if (typeof showShortTopNotification === 'function') showShortTopNotification('Added to Desktop');
              // Save positions if using absolute
              if (window.innerWidth > 1023 && saveDesktopIconPositions && saveDesktopIconPositions());
            }
            break;
          case 'remove-from-desktop':
            if (currentContextMenuTarget && currentContextMenuTarget.classList.contains('desktop-icon')) {
              const appName = currentContextMenuTarget.getAttribute('data-app');
              // Remove the icon from the DOM
              const parent = currentContextMenuTarget.parentElement;
              if (parent) {
                parent.removeChild(currentContextMenuTarget);
                // Update icon order and positions
                saveCurrentDesktopIconOrder && saveCurrentDesktopIconOrder();
                if (window.innerWidth > 1023 && typeof saveDesktopIconPositions === 'function') saveDesktopIconPositions();
                if (typeof showShortTopNotification === 'function') showShortTopNotification('Removed from Desktop');
              }
              if (typeof hideContextMenu === 'function') hideContextMenu();
            }
            break;
          case 'desktop-app-launcher-mode':
            switchToAppLauncherMode();
            return;
          // --- EASY MODE ---
          case 'app-launcher-easy-mode':
          case 'single-task-mode': {
            // Animate out desktop icons, widgets, and taskbar before switching
            const desktopIconsContainer = document.querySelector('.desktop-icons');
            const widgetsScreen = document.getElementById('widgets-screen');
            const taskbar = document.querySelector('.taskbar');

            let animCount = 0, animDone = 0;
            function onAnimEnd() { animDone++; if (animDone >= animCount) finishSwitchToEasyMode(); }

            if (desktopIconsContainer && desktopIconsContainer.style.display !== 'none') {
              animCount++;
              desktopIconsContainer.classList.add('anim-slide-left');
              desktopIconsContainer.addEventListener('animationend', function handler() {
                desktopIconsContainer.removeEventListener('animationend', handler);
                desktopIconsContainer.classList.remove('anim-slide-left');
                onAnimEnd();
              });
            }
            if (widgetsScreen && widgetsScreen.style.display !== 'none') {
              animCount++;
              widgetsScreen.classList.add('anim-slide-right');
              widgetsScreen.addEventListener('animationend', function handler() {
                widgetsScreen.removeEventListener('animationend', handler);
                widgetsScreen.classList.remove('anim-slide-right');
                onAnimEnd();
              });
            }
            if (taskbar && taskbar.style.display !== 'none') {
              animCount++;
              taskbar.classList.add('anim-slide-down');
              taskbar.addEventListener('animationend', function handler() {
                taskbar.removeEventListener('animationend', handler);
                taskbar.classList.remove('anim-slide-down');
                onAnimEnd();
              });
            }

            // If nothing to animate, switch immediately
            if (animCount === 0) finishSwitchToEasyMode();

            // Move your existing easy mode switch code into this function:
            function finishSwitchToEasyMode() {
              // Prevent duplicate overlays
              if (document.getElementById('app-launcher-desktop')) return;
              // Set easy mode flag
              window._easyMode = true;
              // Switch to Easy Mode (like app launcher, but no taskbar, apps maximized, no min/max icons)
              const desktopArea = document.getElementById('desktop-area');
              const desktopIconsContainer = document.querySelector('.desktop-icons');
              const taskbar = document.querySelector('.taskbar');
              const widgetsScreen = document.getElementById('widgets-screen');
              const widgetsToggleBtn = document.getElementById('widgets-toggle-btn');
              const appLauncherBtn = document.getElementById('app-launcher-btn');
              if (appLauncherBtn) appLauncherBtn.style.display = 'none';
              if (desktopIconsContainer) {
                desktopIconsContainer.style.display = 'none';
                desktopIconsContainer.style.pointerEvents = 'none';
              }
              if (taskbar) taskbar.style.display = 'none';
              if (widgetsScreen) widgetsScreen.style.display = 'none';
              if (widgetsToggleBtn) widgetsToggleBtn.style.display = 'none';
              // Remove any previous app-launcher-desktop if present
              let launcherDesktop = document.getElementById('app-launcher-desktop');
              if (launcherDesktop) launcherDesktop.remove();
              // Remove App Launcher overlay if present
              const appLauncherOverlay = document.getElementById('app-launcher-overlay');
              if (appLauncherOverlay && appLauncherOverlay.parentNode) appLauncherOverlay.parentNode.removeChild(appLauncherOverlay);
              // Remove App Launcher desktop icon if present
              const appLauncherIcon = document.querySelector('.desktop-icon[data-app="app-launcher"]');
              if (appLauncherIcon && appLauncherIcon.parentNode) {
                window._appLauncherIconWasPresent = true;
                appLauncherIcon.parentNode.removeChild(appLauncherIcon);
              } else {
                window._appLauncherIconWasPresent = false;
              }
              // Create the easy mode desktop container
              launcherDesktop = document.createElement('div');
              launcherDesktop.id = 'app-launcher-desktop';
              launcherDesktop.style.position = 'absolute';
              launcherDesktop.style.top = '0';
              launcherDesktop.style.left = '0';
              launcherDesktop.style.width = '100%';
              launcherDesktop.style.height = '100%';
              launcherDesktop.style.display = 'flex';
              launcherDesktop.style.flexDirection = 'column';
              // --- Top Bar ---
              const topBar = createAppLauncherTopBar();
              launcherDesktop.appendChild(topBar);



              // --- App Grid ---
              const grid = document.createElement('div');
              grid.className = 'app-launcher-grid';
              grid.style.display = 'grid';
              grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(90px, 1fr))';
              grid.style.gap = '32px';
              grid.style.width = 'min(90vw, 900px)';
              grid.style.maxWidth = '100vw';
              grid.style.margin = 'auto';
              grid.style.justifyItems = 'center';
              grid.style.alignItems = 'start';
              grid.style.padding = '32px 0 0 0';
              grid.style.flex = '1 1 0';
              if (startMenuApps) {
                startMenuApps.forEach(app => {
                  const appItem = document.createElement('div');
                  appItem.className = 'app-launcher-app';
                  appItem.style.display = 'flex';
                  appItem.style.flexDirection = 'column';
                  appItem.style.alignItems = 'center';
                  appItem.style.justifyContent = 'center';
                  appItem.style.minHeight = '120px';
                  appItem.style.cursor = 'pointer';
                  appItem.style.userSelect = 'none';
                  appItem.tabIndex = 0;
                  appItem.setAttribute('data-app', app.id);
                  appItem.innerHTML = `<div class="icon-container ${app.iconBgClass}" style="width:64px;height:64px;border-radius:16px;display:flex;align-items:center;justify-content:center;font-size:28px;box-shadow:0 4px 16px rgba(0,0,0,0.18);margin-bottom:10px;"><i class="fas ${app.iconClass}"></i></div><span style="font-size:14px;color:#fff;margin-top:5px;text-shadow:0 1px 4px #222;text-align:center;width:100%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:block;">${app.name}</span>`;
                  appItem.addEventListener('click', function (e) {
                    openApp(app.id, app.name, app.iconClass, app.iconBgClass, appItem);
                  });
                  grid.appendChild(appItem);
                });
              }
              launcherDesktop.appendChild(grid);
              if (desktopArea) desktopArea.appendChild(launcherDesktop);
              if (desktopArea) desktopArea.classList.add('easy-mode');
              document.body.classList.add('easy-mode');
              if (launcherDesktop) {
                launcherDesktop.addEventListener('contextmenu', function (e) {
                  e.preventDefault();
                  return false;
                });
              }
              // Animate in top bar and grid
              topBar.classList.add('anim-slide-down');
              topBar.addEventListener('animationend', function handler() {
                topBar.removeEventListener('animationend', handler);
                topBar.classList.remove('anim-slide-down');
              });
              grid.classList.add('anim-zoom-in');
              grid.addEventListener('animationend', function handler() {
                grid.removeEventListener('animationend', handler);
                grid.classList.remove('anim-zoom-in');
              });
              // --- FIX: Re-attach volume panel listeners after mode switch ---
              if (typeof setupVolumePanelListeners === 'function') setupVolumePanelListeners();
              if (typeof attachVolumeBtnHandler === 'function') attachVolumeBtnHandler();
            }
            break;
          }

          case 'close-app': {
            // Close the window associated with the taskbar icon
            if (currentContextMenuTarget && currentContextMenuTarget.classList.contains('taskbar-app-icon')) {
              const winId = currentContextMenuTarget.getAttribute('data-window-id');
              if (winId && openWindows[winId] && openWindows[winId].element) {
                const windowElement = openWindows[winId].element;
                // If minimized, restore it first so close animation and logic work
                if (windowElement.classList.contains('minimized')) {
                  windowElement.classList.remove('minimized');
                  windowElement.style.display = 'flex';
                  if (openWindows[winId].taskbarIcon) openWindows[winId].taskbarIcon.classList.remove('minimized');
                }
                // Simulate click on the close button if present
                const closeButton = windowElement.querySelector('.window-close');
                if (closeButton) {
                  closeButton.click();
                } else {
                  // Fallback: remove window directly
                  windowElement.remove();
                  if (openWindows[winId].taskbarIcon) openWindows[winId].taskbarIcon.remove();
                  delete openWindows[winId];
                  updateTaskbarActiveState && updateTaskbarActiveState();
                }
                if (typeof hideContextMenu === 'function') hideContextMenu();
                return;
              }
            }
            break;
          }
          case 'minimize-app': {
            // Minimize the window associated with the taskbar icon
            if (currentContextMenuTarget && currentContextMenuTarget.classList.contains('taskbar-app-icon')) {
              const winId = currentContextMenuTarget.getAttribute('data-window-id');
              if (winId && openWindows[winId] && openWindows[winId].element) {
                const windowElement = openWindows[winId].element;
                const taskbarIcon = openWindows[winId].taskbarIcon;
                if (typeof toggleMinimizeWindow === 'function') {
                  toggleMinimizeWindow(windowElement, taskbarIcon);
                } else {
                  windowElement.style.display = 'none';
                  windowElement.classList.add('minimized');
                  if (taskbarIcon) {
                    taskbarIcon.classList.add('minimized');
                    taskbarIcon.classList.remove('active');
                  }
                }
                if (typeof hideContextMenu === 'function') hideContextMenu();
                return;
              }
            }
            break;
          }

          case 'hide-app-launcher-taskbar-right': {
            // Toggle the App Launcher button in the taskbar
            const appLauncherBtn = document.getElementById('app-launcher-btn');
            if (appLauncherBtn) {
              const isHidden = appLauncherBtn.style.display === 'none';
              appLauncherBtn.style.display = isHidden ? '' : 'none';
              // Update the context menu label
              // Find the context menu item and update its label
              const menuItem = currentContextMenuTarget.closest('.context-menu-item');
              if (menuItem) {
                const span = menuItem.querySelector('span');
                if (span) {
                  span.textContent = isHidden ? 'Show App Launcher' : 'Hide App Launcher';
                }
              }
              if (typeof showShortTopNotification === 'function') {
                showShortTopNotification(isHidden ? 'App Launcher shown' : 'App Launcher hidden');
              }
            }
            if (typeof hideContextMenu === 'function') hideContextMenu();
            break;
          }

          case 'hide-search-icon-taskbar-right': {
            // Toggle the visibility of the global search icon in the right taskbar
            const searchIconBtn = document.getElementById('global-search-btn');
            if (searchIconBtn) {
              const isHidden = searchIconBtn.style.display === 'none';
              // Toggle display
              searchIconBtn.style.display = isHidden ? '' : 'none';
              // Update the context menu label (label should reflect the NEXT action)
              const menuItem = currentContextMenuTarget.closest('.context-menu-item');
              if (menuItem) {
                const span = menuItem.querySelector('span');
                if (span) {
                  span.textContent = isHidden ? 'Show Search icon' : 'Hide Search icon';
                }
              }
              if (typeof showShortTopNotification === 'function') {
                showShortTopNotification(isHidden ? 'Search icon shown' : 'Search icon hidden');
              }
            }
            if (typeof hideContextMenu === 'function') hideContextMenu();
            break;
          }

          case 'hide-volume-taskbar-right': {
            // Toggle the visibility of the volume button in the right taskbar
            const volumeBtn = document.getElementById('volume-btn');
            if (volumeBtn) {
              const isHidden = volumeBtn.style.display === 'none';
              volumeBtn.style.display = isHidden ? '' : 'none';
              // Update the context menu label
              const menuItem = currentContextMenuTarget.closest('.context-menu-item');
              if (menuItem) {
                const span = menuItem.querySelector('span');
                if (span) {
                  span.textContent = isHidden ? 'Show Volume' : 'Hide Volume';
                }
              }
              if (typeof showShortTopNotification === 'function') {
                showShortTopNotification(isHidden ? 'Volume button shown' : 'Volume button hidden');
              }
            }
            if (typeof hideContextMenu === 'function') hideContextMenu();
            break;
          }

          case 'hide-wallet-taskbar-right': {
            // Toggle the visibility of the wallet button in the right taskbar
            const walletBtn = document.getElementById('wallet-btn');
            if (walletBtn) {
              const isHidden = walletBtn.style.display === 'none';
              walletBtn.style.display = isHidden ? '' : 'none';
              // Update the context menu label
              const menuItem = currentContextMenuTarget.closest('.context-menu-item');
              if (menuItem) {
                const span = menuItem.querySelector('span');
                if (span) {
                  span.textContent = isHidden ? 'Show Wallet' : 'Hide Wallet';
                }
              }
              if (typeof showShortTopNotification === 'function') {
                showShortTopNotification(isHidden ? 'Wallet button shown' : 'Wallet button hidden');
              }
            }
            if (typeof hideContextMenu === 'function') hideContextMenu();
            break;
          }

          case 'hide-full-screen-taskbar-right': {
            // Toggle the visibility of the full screen button in the right taskbar
            const fullscreenBtn = document.getElementById('fullscreen-btn');
            if (fullscreenBtn) {
              const isHidden = fullscreenBtn.style.display === 'none';
              fullscreenBtn.style.display = isHidden ? '' : 'none';
              // Update the context menu label
              const menuItem = currentContextMenuTarget.closest('.context-menu-item');
              if (menuItem) {
                const span = menuItem.querySelector('span');
                if (span) {
                  span.textContent = isHidden ? 'Show Full Screen' : 'Hide Full Screen';
                }
              }
              if (typeof showShortTopNotification === 'function') {
                showShortTopNotification(isHidden ? 'Full screen button shown' : 'Full screen button hidden');
              }
            }
            if (typeof hideContextMenu === 'function') hideContextMenu();
            break;
          }

          case 'show-desktop': {
            // Minimize all open windows
            if (typeof openWindows === 'object' && typeof toggleMinimizeWindow === 'function') {
              Object.values(openWindows).forEach(winObj => {
                if (winObj.element && !winObj.element.classList.contains('minimized')) {
                  toggleMinimizeWindow(winObj.element, winObj.taskbarIcon);
                }
              });
              if (typeof showShortTopNotification === 'function') {
                showShortTopNotification('All windows minimized');
              }
            }
            if (typeof hideContextMenu === 'function') hideContextMenu();
            break;
          }

          default:
            _originalExecuteContextMenuAction.call(this, action);
        }
      } catch (err) {
        console.error('Context menu action error:', err);
      }
    };
    console.log('Patched executeContextMenuAction installed');
  })();

  if (desktopArea) {
    desktopArea.addEventListener('contextmenu', function (e) {
      // Custom context menu for pinned-only taskbar icons
      if (e.target.closest('.taskbar-app-icon.pinned-only')) {
        currentContextMenuTarget = e.target.closest('.taskbar-app-icon.pinned-only');
        const appName = currentContextMenuTarget.getAttribute('data-app');
        const details = getAppIconDetails(appName);
        const openWin = Object.values(openWindows).find(w => w.name === appName && w.element);
        let menuItems;
        if (openWin && openWin.element) {
          if (openWin.element.classList.contains('minimized')) {
            menuItems = [
              { label: 'Open', action: 'open-app', icon: details.iconClass },
              { label: 'Unpin from Taskbar', action: 'unpin-taskbar', icon: 'fa-thumbtack' },
              { type: 'separator' },
              { label: 'Close Window', action: 'close-app', icon: 'fa-xmark' }
            ];
          } else {
            menuItems = [
              { label: 'Minimize Window', action: 'minimize-app', icon: 'fa-window-minimize' },
              { label: 'Unpin from Taskbar', action: 'unpin-taskbar', icon: 'fa-thumbtack' },
              { type: 'separator' },
              { label: 'Close Window', action: 'close-app', icon: 'fa-xmark' }
            ];
          }
        } else {
          menuItems = [
            { label: 'Open', action: 'open-app', icon: details.iconClass },
            { label: 'Unpin from Taskbar', action: 'unpin-taskbar', icon: 'fa-thumbtack' }
          ];
        }
        populateContextMenu(menuItems, e.clientX, e.clientY);
        e.preventDefault();
        return;
      }




      

      // Skip if right-clicking the search input
      if (e.target.classList && e.target.classList.contains('search-input')) return;
      e.preventDefault();
      hideContextMenu(); // Hide any previous before showing new
      currentContextMenuTarget = e.target;
      const menuItems = [];
      if (e.target.closest('.taskbar .taskbar-app-icon.minimized')) {
        currentContextMenuTarget = e.target.closest('.taskbar-app-icon.minimized');
        menuItems.push({ label: 'Open', action: 'open-taskbar-icon', icon: 'fa-folder-open' });
        menuItems.push({ label: 'Pin To Taskbar', action: 'pin-to-taskbar', icon: 'fa-thumbtack' });
        menuItems.push({ type: 'separator' });
        menuItems.push({ label: 'Close Window', action: 'close-app', icon: 'fa-xmark' });
      } else if (e.target.closest('.trash-item ')) {
        currentContextMenuTarget = e.target.closest('.trash-item');
        menuItems.push({ label: 'Open', action: 'open-file', icon: 'fa-folder-open' });
        menuItems.push({ type: 'separator' });
        menuItems.push({ label: 'Empty Trash', action: 'empty-trash', icon: 'fa-trash-alt' });
        menuItems.push({ type: 'separator' });
        menuItems.push({ label: 'Get info', action: 'get-info', icon: 'fa-info-circle' });
      } else if (e.target.closest('.taskbar .taskbar-app-icon')) {
        currentContextMenuTarget = e.target.closest('.taskbar-app-icon');
        menuItems.push({ label: 'Minimize Window', action: 'minimize-app', icon: 'fa-window-minimize' });
        menuItems.push({ label: 'Pin To Taskbar', action: 'pin-to-taskbar', icon: 'fa-thumbtack' });
        menuItems.push({ type: 'separator' });
        menuItems.push({ label: 'Close Window', action: 'close-app', icon: 'fa-xmark' });
      } else if (e.target.closest('.taskbar .taskbar-app-icons')) {
        currentContextMenuTarget = e.target.closest('.taskbar-app-icons');
        // Determine if search bar is currently visible
        const searchBar = document.querySelector('.taskbar .search-container');
        const searchBarVisible = searchBar && searchBar.style.display !== 'none';
        // Determine if the right search icon is currently visible
        const searchIconBtn = document.getElementById('global-search-btn');
        const searchIconVisible = searchIconBtn && searchIconBtn.style.display !== 'none';
        // Determine if the App Launcher button is currently visible
        const appLauncherBtn = document.getElementById('app-launcher-btn');
        const appLauncherVisible = appLauncherBtn && appLauncherBtn.style.display !== 'none';
        menuItems.push({
          label: searchBarVisible ? 'Hide search bar' : 'Show search bar',
          action: 'toggle-search-taskbar',
          icon: 'fa-search'
        });
        menuItems.push({
          label: 'Show / Hide Icons', action: 'show-hide-icons-taskbar-right', icon: 'fa-eye', subItems: [
            { label: searchIconVisible ? 'Hide Search icon' : 'Show Search icon', action: 'hide-search-icon-taskbar-right', icon: 'fa-search' },
            { label: appLauncherVisible ? 'Hide App Launcher' : 'Show App Launcher', action: 'hide-app-launcher-taskbar-right', icon: 'fa-th' },
            // Use volume button visibility for label
            (() => {
              const volumeBtn = document.getElementById('volume-btn');
              const volumeVisible = volumeBtn && volumeBtn.style.display !== 'none';
              return { label: volumeVisible ? 'Hide Volume' : 'Show Volume', action: 'hide-volume-taskbar-right', icon: 'fa-volume-high' };
            })(),
            (() => {
              const walletBtn = document.getElementById('wallet-btn');
              const walletVisible = walletBtn && walletBtn.style.display !== 'none';
              return { label: walletVisible ? 'Hide Wallet' : 'Show Wallet', action: 'hide-wallet-taskbar-right', icon: 'fa-wallet' };
            })(),
            { type: 'separator' },
            (() => {
              const fullscreenBtn = document.getElementById('fullscreen-btn');
              const fullscreenVisible = fullscreenBtn && fullscreenBtn.style.display !== 'none';
              return { label: fullscreenVisible ? 'Hide Full Screen' : 'Show Full Screen', action: 'hide-full-screen-taskbar-right', icon: 'fa-expand' };
            })(),
          ]
        });
        menuItems.push({ type: 'separator' });
        menuItems.push({ label: 'Customize Widgets', action: 'customize-widgets', icon: 'fa-server' });
        menuItems.push({ label: 'Show desktop', action: 'show-desktop', icon: 'fa-display' });
        menuItems.push({ type: 'separator' });
        menuItems.push({
          label: 'Customize Taskbar', action: 'customize-all-taskbar', icon: 'fa-cog', subItems: [
            { label: 'Default', action: 'taskbar-icons-middle-alignment', icon: 'fa-ellipsis' },
            { label: 'Windows 11 Style', action: 'taskbar-windows11-alignment', icon: 'fa-ellipsis-h' },
            { label: 'Icons - Left alignment', action: 'taskbar-icons-left-alignment', icon: 'fa-server' },
            { label: 'Icons and Text', action: 'taskbar-icons-and-text-apps', icon: 'fa-server' },

          ]
        });
      } else if (e.target.closest('.app-launcher-mode .app-launcher-app')) {
        currentContextMenuTarget = e.target.closest('.app-launcher-app');
        const appName = currentContextMenuTarget.getAttribute('data-app');
        const appTitle = currentContextMenuTarget.getAttribute('data-app-title') || currentContextMenuTarget.querySelector('span')?.textContent || appName;
        const details = getAppIconDetails(appName);
        // Determine if system app
        let isSystemApp = false;
        if (typeof startMenuApps !== 'undefined') {
          const appObj = startMenuApps.find(a =>
            a.id === appName ||
            a.name === appName ||
            (a.name && a.name.toLowerCase().replace(/\s+/g, '-') === appName)
          );
          if (appObj && appObj.category && appObj.category.toUpperCase().includes('SYSTEM')) isSystemApp = true;
        }
        const menuItems = [
          { label: 'Open', action: 'open-app', icon: details.iconClass },
          { label: isAppPinned(appName) ? 'Unpin from Taskbar' : 'Pin to Taskbar', action: isAppPinned(appName) ? 'unpin-taskbar' : 'pin-to-taskbar', icon: 'fa-thumbtack' },
          { type: 'separator' },
          isSystemApp
            ? { label: 'Uninstall App', action: 'uninstall-app', icon: 'fa-trash', disabled: true }
            : { label: 'Uninstall App', action: 'uninstall-app', icon: 'fa-trash' }
        ];
        populateContextMenu(menuItems, e.clientX, e.clientY);
        e.preventDefault();
        return;
      } else if (e.target.closest('.desktop-icon')) {
        currentContextMenuTarget = e.target.closest('.desktop-icon');
        menuItems.push({ label: 'Open', action: 'open-app', icon: 'fa-folder-open' });
        menuItems.push({ label: 'Pin To Taskbar', action: 'pin-to-taskbar', icon: 'fa-thumbtack' });
        menuItems.push({ type: 'separator' });
        menuItems.push({ label: 'Remove from Desktop', action: 'remove-from-desktop', icon: 'fa-trash' });
      } else if (e.target.closest('.start-button')) {
        currentContextMenuTarget = e.target.closest('.start-button');
        menuItems.push({ label: 'My Profile', action: 'my-profile-settings', icon: 'fa-user' });
        menuItems.push({ label: 'Appearance', action: 'appearance-settings', icon: 'fa-paint-brush' });
        menuItems.push({ label: 'Notifications', action: 'notifications-settings', icon: 'fa-bell' });
        menuItems.push({ label: 'Privacy', action: 'privacy-settings', icon: 'fa-user-shield' });
        menuItems.push({ label: 'Security', action: 'security-settings', icon: 'fa-lock' });
        menuItems.push({ label: 'Integrations', action: 'integrations-settings', icon: 'fa-plug' });
        menuItems.push({ label: 'Active Services', action: 'active-services', icon: 'fa-cogs' });
        menuItems.push({ type: 'separator' });
        menuItems.push({ label: 'My Website', action: 'my-website', icon: 'fa-globe' });
        menuItems.push({ label: 'Products', action: 'products-settings', icon: 'fa-box-open' });
        menuItems.push({ label: 'Payments', action: 'payments-settings', icon: 'fa-credit-card' });
        menuItems.push({ label: 'Shipping', action: 'shipping-settings', icon: 'fa-shipping-fast' });
        menuItems.push({ label: 'Customers & Privacy', action: 'customers-privacy-settings', icon: 'fa-users' });
        menuItems.push({ label: 'Emails', action: 'emails-settings', icon: 'fa-envelope' });
        menuItems.push({ label: 'Billing', action: 'billing-settings', icon: 'fa-file-invoice-dollar' });
        menuItems.push({ type: 'separator' });
        menuItems.push({ label: 'Open Settings', action: 'open-settings', icon: 'fa-cog' });
        menuItems.push({ type: 'separator' });
        menuItems.push({
          label: 'Start menu style',
          action: 'start-menu-style',
          icon: 'fa-rocket',
          subItems: [
            {
              label: 'Default',
              action: 'start-menu-style-default',
              icon: 'fa-columns',
              checked: startMenu && startMenu.classList.contains('start-menu-style-default')
            },
            {
              label: 'Default Apps only',
              action: 'start-menu-style-default-apps-only',
              icon: 'fa-grip',
              checked: startMenu && startMenu.classList.contains('start-menu-style-default-apps-only')
            },
            {
              label: 'Windows 11 Style',
              action: 'start-menu-style-windows11',
              icon: 'fa-square-poll-horizontal',
              checked: startMenu && startMenu.classList.contains('start-menu-style-windows11')
            },
            {
              label: 'List with sidebar',
              action: 'start-menu-style-apps-list-with-sidebar',
              icon: 'fa-book-open',
              checked: startMenu && startMenu.classList.contains('start-menu-list-style') && !startMenu.classList.contains('start-menu-style-apps-list-only')
            },
            {
              label: 'List Apps only',
              action: 'start-menu-style-apps-list-only',
              icon: 'fa-table-list',
              checked: startMenu && startMenu.classList.contains('start-menu-style-apps-list-only')
            },
            { type: 'separator' },
            {
              label: 'App Launcher',
              action: 'start-menu-style-app-launcher',
              icon: 'fa-table-cells',
              checked: startMenu && startMenu.classList.contains('start-menu-style-app-launcher')
            }
          ]
        });
      } else if (e.target.closest('.file-explorer-content .file-item')) {
        currentContextMenuTarget = e.target.closest('.file-item');
        menuItems.push({ label: 'Open', action: 'open-file', icon: 'fa-folder-open' });
        menuItems.push({ label: 'Open in new window', action: 'open-in-new-window', icon: 'fa-window-restore' });
        menuItems.push({ label: 'Download', action: 'download', icon: 'fa-download' });
        menuItems.push({ label: 'Preview', action: 'preview', icon: 'fa-eye' });
        menuItems.push({ label: 'Upload files in this folder', action: 'upload-files', icon: 'fa-upload' });
        menuItems.push({ type: 'separator' });
        menuItems.push({ label: 'Copy', action: 'copy-file', icon: 'fa-copy' });
        menuItems.push({ label: 'Cut', action: 'cut-file', icon: 'fa-scissors' });
        menuItems.push({ label: 'Duplicate', action: 'duplicate-file', icon: 'fa-clone' });
        menuItems.push({ label: 'Move Into New Folder', action: 'into-new-folder', icon: 'fa-folder-plus' });
        menuItems.push({ type: 'separator' });
        menuItems.push({ label: 'Delete file', action: 'into-trash', icon: 'fa-trash' });
        menuItems.push({ label: 'Rename', action: 'rename', icon: 'fa-i-cursor' });
        menuItems.push({
          label: 'Create archive', action: 'create-archive', icon: 'fa-file-archive', subItems: [
            { label: 'ZIP', action: 'archive-zip', icon: 'fa-file-archive' },
            { label: 'TAR', action: 'archive-tar', icon: 'fa-file-archive' }
          ]
        });
        menuItems.push({ type: 'separator' });
        menuItems.push({ label: 'Share with...', action: 'share-with-others', icon: 'fa-random' });
        menuItems.push({ type: 'separator' });
        menuItems.push({ label: 'Add to Favorites', action: 'add-folder-to-favorites', icon: 'fa-share-square' });
        menuItems.push({ label: 'Get info', action: 'get-info', icon: 'fa-info-circle' });
      } else if (e.target.closest('.file-explorer-sidebar .sidebar-section.drives-section .sidebar-item ')) {
        currentContextMenuTarget = e.target.closest('.sidebar-item');
        menuItems.push({ label: 'Open', action: 'open-file', icon: 'fa-folder-open' });
        menuItems.push({ label: 'Open in new window', action: 'open-in-new-window', icon: 'fa-window-restore' });
        menuItems.push({ type: 'separator' });
        menuItems.push({ label: 'Connect / Disconnect', action: 'connect-disconnect', icon: 'fa-info-circle' });
      } else if (e.target.closest('.file-explorer-sidebar .sidebar-section.shared-section .sidebar-item ')) {
        currentContextMenuTarget = e.target.closest('.sidebar-item');
        menuItems.push({ label: 'Open', action: 'open-file', icon: 'fa-folder-open' });
        menuItems.push({ label: 'Open in new window', action: 'open-in-new-window', icon: 'fa-window-restore' });
        menuItems.push({ type: 'separator' });
        menuItems.push({ label: 'Get info', action: 'get-info', icon: 'fa-info-circle' });
      } else if (e.target.closest('.file-explorer-sidebar .sidebar-section .sidebar-item ')) {
        currentContextMenuTarget = e.target.closest('.sidebar-item');
        menuItems.push({ label: 'Open', action: 'open-file', icon: 'fa-folder-open' });
        menuItems.push({ label: 'Open in new window', action: 'open-in-new-window', icon: 'fa-window-restore' });
        menuItems.push({ type: 'separator' });
        menuItems.push({ label: 'Get info', action: 'get-info', icon: 'fa-info-circle' });

      } else if (e.target.closest('.file-explorer-content .file-explorer-elements')) {
        currentContextMenuTarget = e.target.closest('.file-explorer-elements');
        menuItems.push({
          label: 'View', action: 'list-view', icon: 'fa-eye', subItems: [
            { label: 'Icons', action: 'view-icons', icon: 'fa-th-large' },
            { label: 'List', action: 'view-list', icon: 'fa-list' }
          ]
        });
        menuItems.push({
          label: 'Sort', action: 'sort', icon: 'fa-sort', subItems: [
            { label: 'Name', action: 'sort-name', icon: 'fa-sort-alpha-down' },
            { label: 'Date', action: 'sort-date', icon: 'fa-calendar-alt' },
            { label: 'Type', action: 'sort-type', icon: 'fa-file' },
            { label: 'Size', action: 'sort-size', icon: 'fa-file' },
            { type: 'separator' },
            { label: 'Permissions', action: 'sort-permissions', icon: 'fa-file' },
            { type: 'separator' },
            { label: 'Folder first', action: 'folder-first', icon: 'fa-file' },
          ]
        });
        menuItems.push({ label: 'Refresh', action: 'reload', icon: 'fa-rotate-right', checked: true });
        menuItems.push({ type: 'separator' });
        menuItems.push({ label: 'Paste', action: 'paste', icon: 'fa-paste', disabled: true });
        menuItems.push({ label: 'Upload files', action: 'upload-files', icon: 'fa-upload' });
        menuItems.push({ label: 'New folder', action: 'new-folder', icon: 'fa-folder-plus' });
        menuItems.push({
          label: 'New file', action: 'new-file', icon: 'fa-file-medical', subItems: [
            { label: 'Text file', action: 'new-text-file', icon: 'fa-file-alt' },
            { label: 'Spreadsheet', action: 'new-spreadsheet', icon: 'fa-file-excel' },
            { label: 'Presentation', action: 'new-presentation', icon: 'fa-file-powerpoint' }
          ]
        });

        menuItems.push({ type: 'separator' });
        menuItems.push({ label: 'Share with...', action: 'share-with-others', icon: 'fa-random' });
        menuItems.push({ type: 'separator' });
        menuItems.push({ label: 'Select all', action: 'select-all', icon: 'fa-check-square' });
        menuItems.push({ label: 'Add folder to Favorites', action: 'add-folder-to-favorites', icon: 'fa-share-square' });
        menuItems.push({ label: 'Preferences', action: 'preferences', icon: 'fa-cog' });
        menuItems.push({ label: 'Get info', action: 'get-info', icon: 'fa-info-circle' });
      } else if (e.target.closest('.taskbar-icon #notifications-btn')) {
        currentContextMenuTarget = e.target.closest('#notifications-btn');
        menuItems.push({ label: 'Clear all notifications', action: 'clear-all-notifications', icon: 'fa-broom' });
        menuItems.push({ type: 'separator' });
        menuItems.push({ label: 'Customize notifications', action: 'customize-notifications', icon: 'fa-gear' });
        menuItems.push({
          label: 'Desktop notifications', action: 'new-file', icon: 'fa-comments', subItems: [
            { label: 'Only 1 notification', action: 'show-only-1-notification', checked: desktopNotificationMode === 'one' },
            { label: 'Only 3 Notifications', action: 'show-only-3-notifications', checked: desktopNotificationMode === 'three' },
            { label: 'All notifications', action: 'show-all-notifications', checked: desktopNotificationMode === 'all' }
          ]
        });
        menuItems.push({ type: 'separator' });
        menuItems.push({ label: isNotificationsMuted ? 'Unmute Notifications' : 'Mute Notifications', action: 'mute-notifications', icon: isNotificationsMuted ? 'fa-bell' : 'fa-bell-slash' });
      } else if (e.target.closest('.taskbar-icon #wallet-btn')) {
        currentContextMenuTarget = e.target.closest('#wallet-btn');
        menuItems.push({ label: 'Open Wallet Panel', action: 'taskbar-open-wallet', icon: 'fa-wallet' });
        menuItems.push({ label: 'Open Wallet App', action: 'taskbar-open-wallet-app', icon: 'fa-money-check-dollar' });
        menuItems.push({ type: 'separator' });
        menuItems.push({
          label: 'Display Settings', action: 'new-file', icon: 'fa-comments', subItems: [
            { label: 'Show icon', action: 'show-wallet-icon', icon: 'fa-file-alt', checked: window.walletDisplayMode === 'icon' },
            { label: 'Show account balance', action: 'show-account-balance', icon: 'fa-file-excel', checked: window.walletDisplayMode === 'balance' },
          ]
        });
      } else if (e.target.closest('.taskbar-right #volume-btn')) {
        currentContextMenuTarget = e.target.closest('#volume-btn');
        menuItems.push({ label: 'Open Volume', action: 'taskbar-open-volume', icon: 'fa-volume-high' });
        menuItems.push({ label: 'Microphone', action: 'taskbar-open-calendar', icon: 'fa-microphone' });
        // Dynamically set Show/Hide music player label
        const volumePanel = document.getElementById('volume-panel');
        let musicPanelVisible = true;
        if (volumePanel) {
          const musicPanel = volumePanel.querySelector('.music-panel-box');
          if (musicPanel && (musicPanel.style.display === 'none' || getComputedStyle(musicPanel).display === 'none')) {
            musicPanelVisible = false;
          }
        }
        menuItems.push({ label: musicPanelVisible ? 'Hide music player' : 'Show music player', action: 'open-music-player', icon: 'fa-music' });
        menuItems.push({ type: 'separator' });
        menuItems.push({ label: 'Open sound settings', action: 'open-sound-settings', icon: 'fa-gear' });
        menuItems.push({ label: isMuted ? 'Unmute' : 'Mute', action: 'taskbar-mute', icon: isMuted ? 'fa-volume-up' : 'fa-volume-mute' });
      } else if (e.target.closest('.taskbar-right .taskbar-time')) {
        currentContextMenuTarget = e.target.closest('.taskbar-time');
        menuItems.push({ label: 'Open Calendar', action: 'taskbar-open-calendar', icon: 'fa-calendar-days' });
        menuItems.push({ type: 'separator' });
        menuItems.push({ label: 'Date and Time Settings', action: 'taskbar-date-time-settings', icon: 'fa-gear' });
        menuItems.push({
          label: 'Time & Date visibility', action: 'show-hide-time-date', icon: 'fa-eye', subItems: [
            { label: 'Show time & date', action: 'always-show-time-date', icon: 'fa-eye' },
            { label: 'Hide time & date', action: 'always-hide-time-date', icon: 'fa-eye-slash' },
            { type: 'separator' },
            { label: 'Show only in full screen', action: 'show-only-in-full-screen', icon: 'fa-chalkboard' },
          ]
        });
      } else if (e.target.closest('.taskbar-right #ai-chat-btn')) {
        currentContextMenuTarget = e.target.closest('#ai-chat-btn');
        menuItems.push({ label: 'Open AI Chat', action: 'taskbar-open-ai-chat', icon: 'fa-comment-dots' });
        menuItems.push({ label: 'Open New Chat', action: 'taskbar-new-chat', icon: 'fa-plus' });
        menuItems.push({ type: 'separator' });
        menuItems.push({ label: 'Chat Settings', action: 'taskbar-ai-chat-settings', icon: 'fa-gear' });
        menuItems.push({ label: 'Chat history', action: 'taskbar-chat-history', icon: 'fa-history' });
        menuItems.push({ label: 'Clear chat', action: 'taskbar-clear-chat', icon: 'fa-broom' });

      } else if (e.target.closest('.taskbar-right #widgets-toggle-btn')) {
        currentContextMenuTarget = e.target.closest('#widgets-toggle-btn');
        menuItems.push({ label: 'Always show widgets', action: 'always-show-widgets', icon: 'fa-folder-open' });
        menuItems.push({ label: 'Disable widgets', action: 'disable-widgets', icon: 'fa-copy' });
        menuItems.push({ type: 'separator' });
        menuItems.push({ label: 'Customize widgets', action: 'customize-widgets', icon: 'fa-gear' });

      } else if (
        e.target === desktopArea ||
        (e.target.classList && e.target.classList.contains('desktop-icons'))
      ) {
        menuItems.push({
          label: 'View', icon: 'fa-eye', subItems: [
            { label: 'Desktop mode', action: 'desktop-mode', icon: 'fa-desktop' },
            { label: 'App launcher mode', action: 'desktop-app-launcher-mode', icon: 'fa-grip' },
            { label: 'Easy Mode', action: 'app-launcher-easy-mode', icon: 'fa-chalkboard' },
            { type: 'separator' },
            { label: 'Widgets Mode', action: 'widgets-mode', icon: 'fa-shapes' },


          ]
        });
        menuItems.push({
          label: 'Sort by', icon: 'fa-sort', subItems: [
            { label: 'Name', action: 'sort-name', icon: 'fa-sort-alpha-down' },
            { label: 'Date', action: 'sort-date', icon: 'fa-arrow-down-1-9' },
            { label: 'Type', action: 'sort-type', icon: 'fa-arrow-down-wide-short' },
          ]
        });
        menuItems.push({ label: 'Refresh', action: 'refresh', icon: 'fa-arrows-rotate' });
        menuItems.push({ type: 'separator' });
        menuItems.push({ label: 'Paste', action: 'paste', icon: 'fa-paste', disabled: true });
        menuItems.push({ label: 'Upload files', action: 'upload-files', icon: 'fa-upload' });
        menuItems.push({
          label: 'New', action: 'create-new', icon: 'fa-file-medical', subItems: [
            { label: 'Folder', action: 'new-folder', icon: 'fa-folder-plus' },
            { type: 'separator' },
            { label: 'File', action: 'new-file', icon: 'fa-file-medical' },
            { label: 'Text file', action: 'new-text-file', icon: 'fa-file-alt' },
            { label: 'Spreadsheet', action: 'new-spreadsheet', icon: 'fa-file-excel' },
            { label: 'Presentation', action: 'new-presentation', icon: 'fa-file-powerpoint' }

          ]
        });

        menuItems.push({ type: 'separator' });
        menuItems.push({ label: 'Help & Support', action: 'help-and-support', icon: 'fa-question-circle' });
        menuItems.push({ label: 'Personalize', action: 'personalize', icon: 'fa-paint-brush' });

      }

      // After all menuItems are pushed, but before calling populateContextMenu:
      for (const item of menuItems) {
        if (item.action === 'pin-to-taskbar') {
          let appName = null;
          if (currentContextMenuTarget) {
            appName = currentContextMenuTarget.getAttribute('data-app');
            // If taskbar icon, try data-window-id to get app name from openWindows
            if (!appName && currentContextMenuTarget.classList.contains('taskbar-app-icon')) {
              const winId = currentContextMenuTarget.getAttribute('data-window-id');
              if (winId && openWindows[winId]) appName = openWindows[winId].name;
            }
            if (!appName && currentContextMenuTarget.classList.contains('pinned-only')) {
              appName = currentContextMenuTarget.getAttribute('data-app');
            }
          }
          if (appName && isAppPinned(appName)) {
            item.label = 'Unpin from Taskbar';
            item.action = 'unpin-taskbar';
          } else {
            item.label = 'Pin To Taskbar';
            item.action = 'pin-to-taskbar';
          }
        }
      }

      if (menuItems.length > 0) populateContextMenu(menuItems, e.clientX, e.clientY);
    });
  }



  function populateContextMenu(menuItems, x, y) {
    if (!contextMenu) return;
    contextMenu.innerHTML = '';
    let submenuEl = null;
    let submenuHideTimeout = null;
    menuItems.forEach(item => {
      const menuItemEl = document.createElement('div');
      menuItemEl.className = 'context-menu-item';
      if (item.type === 'separator') {
        menuItemEl.className = 'context-menu-separator';
      } else {
        menuItemEl.innerHTML = (item.icon ? `<i class=\"fas ${item.icon}\"></i>` : '') + `<span>${item.label}</span>`;
        if (item.disabled) menuItemEl.classList.add('disabled');
        // Only add .has-submenu and chevron if this is a top-level item with a submenu
        if (Array.isArray(item.subItems) && item.subItems.length > 0) {
          menuItemEl.classList.add('has-submenu');
          const chevron = document.createElement('i');
          chevron.className = 'fas fa-chevron-right context-menu-chevron';
          menuItemEl.appendChild(chevron); // Always last for flex
        }
        menuItemEl.addEventListener('click', async (e) => {
          if (!item.disabled && !(Array.isArray(item.subItems) && item.subItems.length > 0)) {

            console.log('Clicked menu item:', item.label, item.action);
            // Detailed logging for clipboard actions
            if (item.action && item.action.startsWith('text-')) {
              console.log('Active element:', document.activeElement);
              console.log('CurrentContextMenuTarget:', currentContextMenuTarget);
              if (currentContextMenuTarget) {
                console.log('Selection:', currentContextMenuTarget.selectionStart, currentContextMenuTarget.selectionEnd);
                console.log('Is contenteditable:', currentContextMenuTarget.isContentEditable);
              }
            }
            try {
              console.log('About to call window.executeContextMenuAction:', item.action, typeof window.executeContextMenuAction, window.executeContextMenuAction);
              await window.executeContextMenuAction(item.action);
            } catch (err) {
              console.error('Context menu action error:', err);
            }
            hideContextMenu();
          }
          e.stopPropagation();
        });
        // Submenu logic
        if (Array.isArray(item.subItems) && item.subItems.length > 0) {
          menuItemEl.addEventListener('mouseenter', function (e) {
            if (submenuHideTimeout) clearTimeout(submenuHideTimeout);
            if (submenuEl && submenuEl.parentNode) submenuEl.parentNode.removeChild(submenuEl);
            submenuEl = document.createElement('div');
            submenuEl.className = 'context-menu submenu';
            submenuEl.style.position = 'fixed';
            submenuEl.style.zIndex = '1000001';
            submenuEl.style.visibility = 'hidden';
            submenuEl.classList.remove('hidden');
            submenuEl.innerHTML = '';
            item.subItems.forEach(subItem => {
              if (subItem.type === 'separator') {
                const subSep = document.createElement('div');
                subSep.className = 'context-menu-separator';
                submenuEl.appendChild(subSep);
                return;
              }
              const subItemEl = document.createElement('div');
              subItemEl.className = 'context-menu-item context-menu-submenu-item';
              // Add check mark if this is the selected notification mode or wallet display mode
              let showCheck = false;
              if (
                subItem.checked || // NEW: Check the item's checked property
                (subItem.action === 'show-only-1-notification' && desktopNotificationMode === 'one') ||
                (subItem.action === 'show-only-3-notifications' && desktopNotificationMode === 'three') ||
                (subItem.action === 'show-all-notifications' && desktopNotificationMode === 'all') ||
                (subItem.action === 'show-wallet-icon' && window.walletDisplayMode === 'icon') ||
                (subItem.action === 'show-account-balance' && window.walletDisplayMode === 'balance')
              ) {
                showCheck = true;
              }
              // Render icon for submenu item if present
              subItemEl.innerHTML = (subItem.icon ? `<i class=\"fas ${subItem.icon}\"></i>` : '') + `<span>${subItem.label}</span>` + (showCheck ? '<i class="fas fa-check context-menu-checkmark"></i>' : '');
              if (subItem.disabled) subItemEl.classList.add('disabled');
              // Never add chevron or .has-submenu to submenu items
              subItemEl.addEventListener('click', (ev) => {
                if (!subItem.disabled) {
                  window.executeContextMenuAction(subItem.action);
                  hideContextMenu();
                  // Remove submenu if present
                  if (submenuEl && submenuEl.parentNode) {
                    submenuEl.parentNode.removeChild(submenuEl);
                    submenuEl = null;
                  }
                }
                ev.stopPropagation();
              });
              submenuEl.appendChild(subItemEl);
            });
            document.body.appendChild(submenuEl);
            // Position submenu to the right of the parent item
            const parentRect = menuItemEl.getBoundingClientRect();
            const menuRect = contextMenu.getBoundingClientRect();
            submenuEl.style.left = (parentRect.right) + 'px';
            submenuEl.style.top = (parentRect.top) + 'px';
            // Measure submenu size
            submenuEl.style.visibility = 'hidden';
            submenuEl.classList.remove('hidden');
            const subW = submenuEl.offsetWidth;
            const subH = submenuEl.offsetHeight;
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            let subX = parentRect.right;
            let subY = parentRect.top;
            // Flip left if overflow right
            if (subX + subW > viewportWidth) {
              subX = parentRect.left - subW;
              if (subX < 5) subX = viewportWidth - subW - 5;
            }
            // Flip up if overflow bottom
            if (subY + subH > viewportHeight) {
              subY = parentRect.bottom - subH;
              if (subY < 5) subY = viewportHeight - subH - 5;
            }
            // Clamp
            if (subX < 5) subX = 5;
            if (subY < 5) subY = 5;
            submenuEl.style.left = subX + 'px';
            submenuEl.style.top = subY + 'px';
            submenuEl.style.visibility = '';
            submenuEl.classList.remove('hidden');
            // Keep submenu open as long as parent or submenu is hovered
            function keepSubmenuOpen(ev) {
              if (!submenuEl) return;
              if (submenuEl.matches(':hover') || menuItemEl.matches(':hover')) {
                if (submenuHideTimeout) clearTimeout(submenuHideTimeout);
                submenuHideTimeout = null;
              } else {
                if (!submenuHideTimeout) {
                  submenuHideTimeout = setTimeout(() => {
                    if (submenuEl && submenuEl.parentNode) submenuEl.parentNode.removeChild(submenuEl);
                    submenuEl = null;
                  }, 60);
                }
              }
            }
            menuItemEl.addEventListener('mouseleave', keepSubmenuOpen);
            submenuEl.addEventListener('mouseleave', keepSubmenuOpen);
            submenuEl.addEventListener('mouseenter', function () {
              if (submenuHideTimeout) clearTimeout(submenuHideTimeout);
              submenuHideTimeout = null;
            });
          });
          // Remove submenu immediately if mouse leaves both parent and submenu
          menuItemEl.addEventListener('mouseleave', function (e) {
            if (!submenuEl) return;
            if (submenuHideTimeout) clearTimeout(submenuHideTimeout);
            submenuHideTimeout = setTimeout(() => {
              if (submenuEl && submenuEl.parentNode) submenuEl.parentNode.removeChild(submenuEl);
              submenuEl = null;
            }, 60);
          });
        }
      }
      contextMenu.appendChild(menuItemEl);
    });
    // After building, forcibly remove any chevron not a direct child of a .context-menu-item.has-submenu
    setTimeout(() => {
      document.querySelectorAll('.context-menu-chevron').forEach(chev => {
        if (!chev.parentElement || !chev.parentElement.classList.contains('has-submenu')) {
          chev.remove();
        }
      });
    }, 0);
    // Temporarily show to measure size
    contextMenu.style.visibility = 'hidden';
    contextMenu.classList.remove('hidden');
    contextMenu.style.left = '0px';
    contextMenu.style.top = '0px';
    const menuWidth = contextMenu.offsetWidth;
    const menuHeight = contextMenu.offsetHeight;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    let finalX = x;
    let finalY = y;
    // Flip horizontally if near right edge
    if (x + menuWidth > viewportWidth) {
      finalX = x - menuWidth;
      if (finalX < 5) finalX = viewportWidth - menuWidth - 5;
    }
    // Flip vertically if near bottom edge
    if (y + menuHeight > viewportHeight) {
      finalY = y - menuHeight;
      if (finalY < 5) finalY = viewportHeight - menuHeight - 5;
    }
    // Clamp to left/top edge
    if (finalX < 5) finalX = 5;
    if (finalY < 5) finalY = 5;
    contextMenu.style.left = `${finalX}px`;
    contextMenu.style.top = `${finalY}px`;
    contextMenu.style.visibility = '';
    contextMenu.classList.remove('hidden');
    // macOS-like pop animation from mouse location
    // Set transform-origin to mouse position relative to menu
    const originX = x - finalX;
    const originY = y - finalY;
    contextMenu.style.transformOrigin = `${originX}px ${originY}px`;
    contextMenu.classList.remove('context-menu-anim-pop');
    void contextMenu.offsetWidth; // force reflow
    contextMenu.classList.add('context-menu-anim-pop');
    contextMenu.addEventListener('animationend', function handler() {
      contextMenu.classList.remove('context-menu-anim-pop');
      contextMenu.removeEventListener('animationend', handler);
    });
  }
  function executeContextMenuAction(action) {
    if (!currentContextMenuTarget) return;
    switch (action) {
      case 'open-app':
        if (currentContextMenuTarget.matches('.desktop-icon')) {
          if (window.innerWidth <= MOBILE_BREAKPOINT) {
            // On mobile, trigger a single click
            currentContextMenuTarget.dispatchEvent(new MouseEvent('click', { bubbles: true, button: 0 }));
          } else {
            // On desktop, trigger a double click
            currentContextMenuTarget.dispatchEvent(new MouseEvent('dblclick', { bubbles: true, button: 0 }));
          }
        }
        break;
      case 'open-taskbar-icon': {
        // Restore a minimized window from the taskbar context menu
        if (currentContextMenuTarget && currentContextMenuTarget.classList.contains('taskbar-app-icon')) {
          const winId = currentContextMenuTarget.getAttribute('data-window-id');
          if (winId && openWindows[winId] && openWindows[winId].element) {
            const windowElement = openWindows[winId].element;
            const taskbarIcon = openWindows[winId].taskbarIcon;
            if (windowElement.classList.contains('minimized')) {
              if (typeof toggleMinimizeWindow === 'function') toggleMinimizeWindow(windowElement, taskbarIcon);
            }
            if (typeof makeWindowActive === 'function') makeWindowActive(windowElement);
            if (typeof hideContextMenu === 'function') hideContextMenu();
          }
        }
        break;
      }
      case 'add-to-desktop':
        if (currentContextMenuTarget && currentContextMenuTarget.classList.contains('app-grid-item')) {
          const appName = currentContextMenuTarget.getAttribute('data-app');
          const appTitle = currentContextMenuTarget.getAttribute('data-app-title') || currentContextMenuTarget.querySelector('span')?.textContent || appName;
          // Get icon details from startMenuApps, fallback to getAppIconDetails
          let details = { iconClass: 'fa-window-maximize', iconBgClass: 'gray-icon' };
          if (typeof startMenuApps !== 'undefined') {
            const appObj = startMenuApps.find(a =>
              a.id === appName
            );
            if (appObj) {
              details.iconClass = appObj.iconClass || details.iconClass;
              details.iconBgClass = appObj.iconBgClass || details.iconBgClass;
            } else {
              details = getAppIconDetails(appName);
            }
          } else {
            details = getAppIconDetails(appName);
          }
          const desktopIconsContainer = document.querySelector('.desktop-icons');
          if (!desktopIconsContainer) {
            if (typeof showShortTopNotification === 'function') showShortTopNotification('Desktop not found');
            break;
          }
          // Robust check: if already on desktop, do not add
          if (desktopIconsContainer.querySelector('.desktop-icon[data-app="' + appName + '"]')) {
            if (typeof showShortTopNotification === 'function') showShortTopNotification('Already on Desktop');
            break;
          }
          const icon = document.createElement('div');
          icon.className = 'desktop-icon';
          icon.setAttribute('data-app', appName);
          icon.setAttribute('data-created', new Date().toISOString()); // Set creation date
          icon.innerHTML = `
            <div class="icon-container ${details.iconBgClass}"><i class="fas ${details.iconClass}"></i></div>
            <span>${appTitle}</span>
          `;
          // --- Find first available grid slot ---
          if (window.innerWidth > 1023) {
            // Use grid logic
            const leftOffset = GRID_GAP;
            const topOffset = GRID_GAP;
            const colWidth = GRID_CELL_WIDTH + GRID_GAP;
            const iconHeight = GRID_CELL_HEIGHT;
            const verticalGap = GRID_GAP;
            const taskbar = document.querySelector('.taskbar');
            const taskbarHeight = taskbar ? taskbar.offsetHeight : 0;
            const availableHeight = window.innerHeight - taskbarHeight - 50; // 30px bottom margin
            const maxRows = Math.max(1, Math.floor((availableHeight - topOffset) / (iconHeight + verticalGap)));
            const maxCols = Math.max(1, Math.floor((desktopIconsContainer.clientWidth - leftOffset) / colWidth));
            // Mark occupied slots
            const occupied = {};
            desktopIconsContainer.querySelectorAll('.desktop-icon').forEach(existingIcon => {
              const left = parseInt(existingIcon.style.left, 10);
              const top = parseInt(existingIcon.style.top, 10);
              if (!isNaN(left) && !isNaN(top)) {
                const col = Math.round((left - leftOffset) / colWidth);
                const row = Math.round((top - topOffset) / (iconHeight + verticalGap));
                occupied[`${col},${row}`] = true;
              }
            });
            // Find first free slot (column by column, then row)
            let found = false;
            let targetCol = 0, targetRow = 0;
            outer: for (let col = 0; col < maxCols; col++) {
              for (let row = 0; row < maxRows; row++) {
                if (!occupied[`${col},${row}`]) {
                  targetCol = col;
                  targetRow = row;
                  found = true;
                  break outer;
                }
              }
            }
            // Place icon at found slot
            const iconLeft = leftOffset + targetCol * colWidth;
            const iconTop = topOffset + targetRow * (iconHeight + verticalGap);
            icon.style.position = 'absolute';
            icon.style.left = iconLeft + 'px';
            icon.style.top = iconTop + 'px';
            icon.setAttribute('data-absolute', 'true');
          }
          desktopIconsContainer.appendChild(icon);
          setupDesktopIcon(icon);
          if (typeof showShortTopNotification === 'function') showShortTopNotification('Added to Desktop');
          // Save positions if using absolute
          if (window.innerWidth > 1023 && saveDesktopIconPositions && saveDesktopIconPositions());
        }
        break;
      case 'open-settings':
        openApp('settings', 'Settings', 'fa-cog', 'green');
        break;
      case 'sort-name': {
        // Only handle if desktop area is context
        const desktopIconsContainer = document.querySelector('.desktop-icons');
        if (desktopIconsContainer && (currentContextMenuTarget === desktopIconsContainer || currentContextMenuTarget.classList.contains('desktop-icons'))) {
          const icons = Array.from(desktopIconsContainer.querySelectorAll('.desktop-icon'));
          icons.sort((a, b) => {
            const aName = a.querySelector('span')?.textContent?.toLowerCase() || '';
            const bName = b.querySelector('span')?.textContent?.toLowerCase() || '';
            return aName.localeCompare(bName);
          });
          icons.forEach(icon => desktopIconsContainer.appendChild(icon));
          saveCurrentDesktopIconOrder();
          if (typeof showShortTopNotification === 'function') showShortTopNotification('Sorted by name');
          initializeDesktopIconPositions(); // Always re-layout
        } else {
          _originalExecuteContextMenuAction.call(this, action);
        }
        break;
      }
      case 'sort-date': {
        const desktopIconsContainer = document.querySelector('.desktop-icons');
        if (desktopIconsContainer && (currentContextMenuTarget === desktopIconsContainer || currentContextMenuTarget.classList.contains('desktop-icons'))) {
          const icons = Array.from(desktopIconsContainer.querySelectorAll('.desktop-icon'));
          icons.sort((a, b) => {
            // Use data-created attribute if present, else fallback to DOM order
            const aDate = a.getAttribute('data-created') || a.dataset.created || '';
            const bDate = b.getAttribute('data-created') || b.dataset.created || '';
            if (aDate && bDate) return aDate.localeCompare(bDate);
            return 0; // fallback: keep DOM order
          });
          icons.forEach(icon => desktopIconsContainer.appendChild(icon));
          saveCurrentDesktopIconOrder();
          if (typeof showShortTopNotification === 'function') showShortTopNotification('Sorted by date');
          initializeDesktopIconPositions(); // Always re-layout
        } else {
          _originalExecuteContextMenuAction.call(this, action);
        }
        break;
      }
      case 'sort-type': {
        const desktopIconsContainer = document.querySelector('.desktop-icons');
        if (desktopIconsContainer && (currentContextMenuTarget === desktopIconsContainer || currentContextMenuTarget.classList.contains('desktop-icons'))) {
          // Get app ids from startMenuApps
          const appIds = (window.startMenuApps || []).map(app => app.id);
          const icons = Array.from(desktopIconsContainer.querySelectorAll('.desktop-icon'));
          // Apps first, then files, both alphabetically
          const isApp = icon => appIds.includes(icon.getAttribute('data-app'));
          icons.sort((a, b) => {
            const aIsApp = isApp(a);
            const bIsApp = isApp(b);
            if (aIsApp && !bIsApp) return -1;
            if (!aIsApp && bIsApp) return 1;
            // Both same type, sort by name
            const aName = a.querySelector('span')?.textContent?.toLowerCase() || '';
            const bName = b.querySelector('span')?.textContent?.toLowerCase() || '';
            return aName.localeCompare(bName);
          });
          icons.forEach(icon => desktopIconsContainer.appendChild(icon));
          saveCurrentDesktopIconOrder();
          if (typeof showShortTopNotification === 'function') showShortTopNotification('Sorted by type (apps first)');
          initializeDesktopIconPositions(); // Always re-layout
        } else {
          _originalExecuteContextMenuAction.call(this, action);
        }
        break;
      }
      case 'remove-from-desktop':
        if (currentContextMenuTarget && currentContextMenuTarget.classList.contains('desktop-icon')) {
          const appName = currentContextMenuTarget.getAttribute('data-app');
          // Remove the icon from the DOM
          const parent = currentContextMenuTarget.parentElement;
          if (parent) {
            parent.removeChild(currentContextMenuTarget);
            // Update icon order and positions
            saveCurrentDesktopIconOrder && saveCurrentDesktopIconOrder();
            if (window.innerWidth > 1023 && typeof saveDesktopIconPositions === 'function') saveDesktopIconPositions();
            if (typeof showShortTopNotification === 'function') showShortTopNotification('Removed from Desktop');
          }
          if (typeof hideContextMenu === 'function') hideContextMenu();
        }
        break;

      case 'app-launcher-easy-mode':
      case 'single-task-mode':
        switchToEasyMode();
        return;
      case 'desktop-mode':
        switchToDesktopMode();
        return;
      case 'toggle-search-taskbar':
        const searchBar = document.querySelector('.taskbar .search-container');
        if (searchBar) {
          const searchBarVisible = searchBar.style.display !== 'none';
          searchBar.style.display = searchBarVisible ? 'none' : 'flex';
          // Update the context menu label
          const searchMenuItem = currentContextMenuTarget.closest('.context-menu-item');
          if (searchMenuItem) {
            searchMenuItem.querySelector('span').textContent = searchBarVisible ? 'Show search bar' : 'Hide search bar';
          }
        }
        break;
      case 'show-desktop': {
        // Minimize all open windows
        if (typeof openWindows === 'object' && typeof toggleMinimizeWindow === 'function') {
          Object.values(openWindows).forEach(winObj => {
            if (winObj.element && !winObj.element.classList.contains('minimized')) {
              toggleMinimizeWindow(winObj.element, winObj.taskbarIcon);
            }
          });
          if (typeof showShortTopNotification === 'function') {
            showShortTopNotification('All windows minimized');
          }
        }
        if (typeof hideContextMenu === 'function') hideContextMenu();
        break;
      }
      case 'clear-all-notifications':
        clearAllNotifications();
        break;
    }
  }

  // Widgets scroll handle logic
  const widgetsScrollHandle = document.getElementById('widgets-scroll-handle');
  const widgetsScreen = document.getElementById('widgets-screen');
  if (widgetsScrollHandle && widgetsScreen) {
    widgetsScrollHandle.addEventListener('wheel', function (e) {
      // Forward the scroll to the widgets panel
      widgetsScreen.scrollTop += e.deltaY;
      e.preventDefault();
    }, { passive: false });

    // Enhanced widget scroll handle interaction
    initWidgetsInteraction();
  }

  function initWidgetsInteraction() {
    if (!widgetsScrollHandle || !widgetsScreen) return;

    // Remove previous listeners to avoid duplicates
    widgetsScrollHandle.onmouseenter = null;
    widgetsScreen.onmouseenter = null;
    widgetsScrollHandle.onmouseleave = null;
    widgetsScreen.onmouseleave = null;

    if (window.innerWidth <= 1023) {
      // Mobile/tablet: always allow scroll and pointer events for touch
      widgetsScreen.style.overflowY = 'auto';
      widgetsScreen.style.pointerEvents = 'auto';
      widgetsScrollHandle.style.cursor = 'pointer';
    } else {
      // Desktop: always allow scroll, but do NOT set pointer-events (let CSS z-index handle stacking)
      widgetsScreen.style.overflowY = 'auto';
      // widgetsScreen.style.pointerEvents = 'auto'; // REMOVE THIS LINE
    }
  }

  // Add a wheel event listener to main-content-area to scroll widgetsScreen if mouse is over its area
  const mainContentArea = document.querySelector('.main-content-area');
  if (mainContentArea && widgetsScreen) {
    mainContentArea.addEventListener('wheel', function (e) {
      if (window.innerWidth >= 1024) {
        const rect = widgetsScreen.getBoundingClientRect();
        if (
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom
        ) {
          widgetsScreen.scrollTop += e.deltaY;
        }
      }
    }, { passive: true });
  }

  updateCurrentTime();
  setInterval(updateCurrentTime, 60000);
  if (typeof populateStartMenuApps === 'function') populateStartMenuApps();
  else console.error('populateStartMenuApps is not defined or not a function');

  initializeDesktopIconPositions();

  // Add snap overlay for snap hints if not present
  if (!document.getElementById('snap-overlay')) {
    const snapOverlay = document.createElement('div');
    snapOverlay.id = 'snap-overlay';
    snapOverlay.style.position = 'fixed';
    snapOverlay.style.top = '0';
    snapOverlay.style.left = '0';
    snapOverlay.style.width = '100vw';
    snapOverlay.style.height = '100vh';
    snapOverlay.style.pointerEvents = 'none';
    snapOverlay.style.zIndex = '99999';
    snapOverlay.style.display = 'none';
    document.body.appendChild(snapOverlay);
  }

  // Helper to check if the window is truly windowed (not maximized, not snapped)
  function isTrulyWindowed(windowElement) {
    if (!windowElement.classList.contains('maximized')) return true;
    // If maximized but not full screen (i.e., snapped), treat as not windowed
    const left = windowElement.style.left;
    const width = windowElement.style.width;
    // Snap left
    if (left === '0px' && width === Math.floor(window.innerWidth / 2) + 'px') return false;
    // Snap right
    if (left === Math.floor(window.innerWidth / 2) + 'px' && width === Math.floor(window.innerWidth / 2) + 'px') return false;
    // Maximized (full screen)
    if (left === '0px' && width === window.innerWidth + 'px') return false;
    return false;
  }

  // Helper to save the last windowed (not maximized/snapped) state
  function saveWindowedState(windowElement) {
    if (isTrulyWindowed(windowElement)) {
      windowElement.dataset.prevWidth = windowElement.style.width || windowElement.offsetWidth + 'px';
      windowElement.dataset.prevHeight = windowElement.style.height || windowElement.offsetHeight + 'px';
      windowElement.dataset.prevLeft = windowElement.style.left || windowElement.offsetLeft + 'px';
      windowElement.dataset.prevTop = windowElement.style.top || windowElement.offsetTop + 'px';
    }
  }

  // Add App launcher desktop icon if not present
  document.addEventListener('DOMContentLoaded', function () {
    // ... existing code ...
    // Add App launcher icon to desktop
    if (desktopIconsContainer && !document.querySelector('.desktop-icon[data-app="app-launcher"]')) {
      const appLauncherIcon = document.createElement('div');
      appLauncherIcon.className = 'desktop-icon';
      appLauncherIcon.setAttribute('data-app', 'app-launcher');
      appLauncherIcon.innerHTML = `
        <div class="icon-container blue-icon"><i class="fas fa-th"></i></div>
        <span>App launcher</span>
      `;
      desktopIconsContainer.appendChild(appLauncherIcon);
    }
    // ... existing code ...
  });
  // --- App launcher window logic and event listener ---
  function openAppLauncherWindow(iconElementForAnim) {
    if (typeof window.hideWalletSidebar === 'function') window.hideWalletSidebar();
    // Prevent multiple launchers
    if (document.getElementById('app-launcher-overlay')) {
      return;
    }
    // Create fullscreen overlay
    const overlay = document.createElement('div');
    overlay.id = 'app-launcher-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    //overlay.style.background = '#050217d0';
    overlay.style.zIndex = '5000';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.flexDirection = 'column'; // Stack search bar above grid
    overlay.style.backdropFilter = 'blur(70px)';
    overlay.style.transition = 'opacity 0.3s';
    overlay.style.opacity = '0';
    overlay.tabIndex = 0;
    overlay.style.background = 'radial-gradient(circle, #050217a6 40%, #050217a6 100%)';

    // --- macOS-style search bar ---
    const searchBarContainer = document.createElement('div');
    searchBarContainer.className = 'search-bar-container';

    searchBarContainer.style.maxWidth = '100vw;';
    searchBarContainer.style.margin = '40px auto 0 auto';
    searchBarContainer.style.display = 'flex';
    searchBarContainer.style.justifyContent = 'center';
    searchBarContainer.style.alignItems = 'center';
    searchBarContainer.style.position = 'sticky';
    searchBarContainer.style.top = '0';
    searchBarContainer.style.zIndex = '10';
    searchBarContainer.style.height = '44px'; // Match input height
    searchBarContainer.style.marginBottom = '24px'; // Add spacing below the whole bar
    searchBarContainer.style.background = 'transparent';

    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Start typing...';
    searchInput.style.width = '100%';
    searchInput.style.height = '44px';
    searchInput.style.borderRadius = '0px';
    searchInput.style.border = 'none';
    searchInput.style.background = 'transparent';
    searchInput.style.color = '#fff';
    searchInput.style.fontSize = '20px';
    searchInput.style.outline = 'none';
    //searchInput.style.marginBottom = '24px'; // Remove this line
    searchInput.style.fontFamily = 'inherit';
    searchInput.style.letterSpacing = '0.01em';
    searchInput.autofocus = true;
    searchInput.style.display = 'block';
    searchInput.style.position = 'relative';
    searchInput.style.textAlign = 'center';
    // Add a search icon (macOS style)
    const searchIcon = document.createElement('i');
    searchIcon.className = 'fas fa-search';
    searchIcon.style.position = 'absolute';
    searchIcon.style.left = '18px';
    searchIcon.style.top = '0';
    searchIcon.style.height = '44px';
    searchIcon.style.display = 'flex';
    searchIcon.style.alignItems = 'center';
    searchIcon.style.color = 'rgba(255,255,255,0.6)';
    searchIcon.style.fontSize = '20px';
    searchIcon.style.pointerEvents = 'none';
    searchIcon.style.display = 'none';

    searchBarContainer.appendChild(searchInput);
    searchBarContainer.appendChild(searchIcon);
    overlay.appendChild(searchBarContainer);

    // App grid container
    const gridOuter = document.createElement('div');
    gridOuter.style.display = 'flex';
    gridOuter.style.justifyContent = 'center';
    gridOuter.style.alignItems = 'center';
    gridOuter.style.width = '100%';
    gridOuter.style.height = '100%';
    gridOuter.style.flex = '1 1 0';
    gridOuter.style.overflowY = 'auto';

    const grid = document.createElement('div');
    grid.className = 'app-launcher-grid';
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(90px, 1fr))';
    grid.style.gap = '32px';
    grid.style.width = 'min(90vw, 900px)';
    grid.style.maxWidth = '100vw';
    grid.style.margin = 'auto';
    grid.style.justifyItems = 'center';
    grid.style.alignItems = 'start'; // Prevent vertical shifting
    grid.style.padding = '24px 0 0 0'; // Less top padding since search bar is sticky
    grid.style.transition = 'opacity 0.2s';
    grid.style.overflowY = 'visible';

    // Add all start menu apps to the grid
    const appItems = [];
    startMenuApps.forEach(app => {
      if (app.id === 'app-launcher') return; // Don't show launcher in itself
      const appItem = document.createElement('div');
      appItem.className = 'app-launcher-app';
      appItem.style.display = 'flex';
      appItem.style.flexDirection = 'column';
      appItem.style.alignItems = 'center';
      appItem.style.justifyContent = 'center';
      appItem.style.minHeight = '120px'; // Slightly less for macOS look
      appItem.style.cursor = 'pointer';
      appItem.style.userSelect = 'none';
      appItem.style.transition = 'transform 0.18s cubic-bezier(0.4,0,0.2,1), box-shadow 0.18s cubic-bezier(0.4,0,0.2,1)';
      appItem.tabIndex = 0;
      appItem.setAttribute('data-app', app.id);
      // Icon container style
      const iconContainerStyle = `width: 64px; height: 64px; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 28px; box-shadow: 0 4px 16px rgba(0,0,0,0.18); margin-bottom: 10px;`;
      appItem.innerHTML = `
        <div class=\"icon-container ${app.iconBgClass}\" style=\"${iconContainerStyle}\">
          <i class=\"fas ${app.iconClass}\"></i>
        </div>
        <span style=\"font-size: 14px; color: #fff; margin-top: 5px; text-shadow: 0 1px 4px #222; text-align: center; width: 100%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block;\">${app.name}</span>
      `;
      // Ensure the app name is always centered
      const appSpan = appItem.querySelector('span');
      if (appSpan) {
        appSpan.style.textAlign = 'center';
        appSpan.style.width = '100%';
        appSpan.style.display = 'block';
        appSpan.style.whiteSpace = 'nowrap';
        appSpan.style.overflow = 'hidden';
        appSpan.style.textOverflow = 'ellipsis';
        appSpan.style.marginTop = '5px';
      }
      // Add hover effect for macOS style
      const iconContainer = appItem.querySelector('.icon-container');
      appItem.addEventListener('mouseenter', function () {
        appItem.style.transform = 'scale(1.10)';
        if (iconContainer) iconContainer.style.boxShadow = '0 8px 32px rgba(0,0,0,0.22)';
      });
      appItem.addEventListener('mouseleave', function () {
        appItem.style.transform = '';
        if (iconContainer) iconContainer.style.boxShadow = '0 4px 16px rgba(0,0,0,0.18)';
      });

      appItem.addEventListener('mousedown', e => e.stopPropagation());
      grid.appendChild(appItem);
      appItems.push(appItem);

    });
    // Add the "no apps found" message element
    const noAppsMsg = document.createElement('div');
    noAppsMsg.textContent = 'No app found, check appstore for more apps';
    noAppsMsg.style.display = 'none';
    noAppsMsg.style.color = '#fff';
    noAppsMsg.style.fontSize = '18px';
    noAppsMsg.style.textAlign = 'center';
    noAppsMsg.style.gridColumn = '1 / -1';
    noAppsMsg.style.margin = '40px 0';
    grid.appendChild(noAppsMsg);
    gridOuter.appendChild(grid);
    overlay.appendChild(gridOuter);
    document.body.appendChild(overlay);
    setTimeout(() => { overlay.style.opacity = '1'; }, 10);

    // --- Add footer with My Profile and Logout buttons ---
    const footer = document.createElement('div');
    footer.className = 'app-launcher-footer';
    footer.style.display = 'flex';
    footer.style.justifyContent = 'center';
    footer.style.alignItems = 'center';
    footer.style.width = '100%';
    footer.style.maxWidth = 'min(90vw, 900px)';
    footer.style.margin = '24px auto 32px auto';


    footer.style.borderRadius = '18px';

    footer.style.position = 'relative';
    footer.style.bottom = '0';
    footer.style.zIndex = '20';



    const logoutBtn = document.createElement('button');
    logoutBtn.className = 'app-launcher-logout-btn';
    logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt" style="margin-right:8px;"></i>Logout';
    logoutBtn.style.background = 'rgb(255 255 255 / 15%)';
    logoutBtn.style.color = '#fff';
    logoutBtn.style.border = 'none';
    logoutBtn.style.borderRadius = '10px';
    logoutBtn.style.padding = '10px 22px';
    logoutBtn.style.fontSize = '15px';
    logoutBtn.style.cursor = 'pointer';
    logoutBtn.style.display = 'flex';
    logoutBtn.style.alignItems = 'center';
    logoutBtn.style.transition = 'background 0.18s';
    logoutBtn.addEventListener('mouseenter', () => { logoutBtn.style.background = 'var(--accent-color)' });
    logoutBtn.addEventListener('mouseleave', () => { logoutBtn.style.background = 'rgb(255 255 255 / 15%)' });
    logoutBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      handleLogout();
    });


    footer.appendChild(logoutBtn);
    overlay.appendChild(footer);

  // ... existing code ...
    // Keyboard navigation state
    let selectedAppIndex = 0;

    function updateAppSelection(newIndex) {
      const visibleApps = appItems.filter(item => item.style.display !== 'none');
      appItems.forEach(item => item.classList.remove('selected'));
      if (visibleApps.length > 0) {
        selectedAppIndex = ((newIndex % visibleApps.length) + visibleApps.length) % visibleApps.length; // wrap
        visibleApps[selectedAppIndex].classList.add('selected');
        // Optionally scroll into view
        visibleApps[selectedAppIndex].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      } else {
        selectedAppIndex = 0;
      }
    }

    // --- Fix: Define openAppFromLauncher in this scope ---
    function openAppFromLauncher(appItem) {
      appItems.forEach(item => item.classList.remove('selected'));
      appItem.classList.add('selected');
      openApp(
        appItem.getAttribute('data-app'),
        appItem.querySelector('span').textContent,
        appItem.querySelector('i').className.split(' ').find(cls => cls.startsWith('fa-')),
        appItem.className.split(' ').find(cls => cls.endsWith('-icon'))
      );
      closeLauncher();
    }
    // --- End fix ---

    // --- Search/filter logic ---
    searchInput.addEventListener('input', function () {
      const term = this.value.trim().toLowerCase();
      let visibleCount = 0;
      appItems.forEach(item => {
        const appName = item.getAttribute('data-app');
        const isVisible = (!term || appName.includes(term));
        item.style.display = isVisible ? '' : 'none';
        if (isVisible) visibleCount++;
      });
      // Show/hide the no apps found message
      if (visibleCount === 0) {
        noAppsMsg.style.display = 'block';
      } else {
        noAppsMsg.style.display = 'none';
      }
      // Only highlight first visible app if user has typed something
      if (term.length > 0 && visibleCount > 0) updateAppSelection(0);
      else appItems.forEach(item => item.classList.remove('selected'));
    });

    // On arrow keys and Enter, move selection or open
    searchInput.addEventListener('keydown', function (e) {
      const visibleApps = appItems.filter(item => item.style.display !== 'none');
      let arrowPressed = false;
      let selectedVisibleIndex = visibleApps.findIndex(item => item.classList.contains('selected'));
      if (selectedVisibleIndex === -1) selectedVisibleIndex = 0;
      let newIndex = selectedVisibleIndex;
      if (e.key === 'ArrowRight') {
        newIndex = selectedVisibleIndex + 1;
        if (newIndex >= visibleApps.length) newIndex = 0;
        updateAppSelection(newIndex);
        e.preventDefault();
        arrowPressed = true;
      } else if (e.key === 'ArrowLeft') {
        newIndex = selectedVisibleIndex - 1;
        if (newIndex < 0) newIndex = visibleApps.length - 1;
        updateAppSelection(newIndex);
        e.preventDefault();
        arrowPressed = true;
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        // Use DOM positions for robust navigation
        const currentItem = visibleApps[selectedVisibleIndex];
        const currentRect = currentItem.getBoundingClientRect();
        const currentTop = currentRect.top;
        const currentLeft = currentRect.left;
        // Find all items in the next/previous row
        let candidates = visibleApps.filter((item, idx) => {
          const rect = item.getBoundingClientRect();
          if (e.key === 'ArrowDown') return rect.top > currentTop;
          else return rect.top < currentTop;
        });
        if (candidates.length === 0) {
          e.preventDefault();
          return;
        }
        // Find the closest row (by top distance)
        let targetRowTop = null;
        let minRowDelta = Infinity;
        candidates.forEach(item => {
          const rect = item.getBoundingClientRect();
          const rowDelta = Math.abs(rect.top - currentTop);
          if (rowDelta < minRowDelta) {
            minRowDelta = rowDelta;
            targetRowTop = rect.top;
          }
        });
        // Only consider items in the closest row
        let rowItems = candidates.filter(item => {
          const rect = item.getBoundingClientRect();
          return rect.top === targetRowTop;
        });
        // Find the item in that row with the closest left value
        let minDelta = Infinity;
        let bestIndex = selectedVisibleIndex;
        rowItems.forEach(item => {
          const rect = item.getBoundingClientRect();
          const delta = Math.abs(rect.left - currentLeft);
          if (delta < minDelta) {
            minDelta = delta;
            bestIndex = visibleApps.indexOf(item);
          }
        });
        updateAppSelection(bestIndex);
        e.preventDefault();
        arrowPressed = true;
      } else if (e.key === 'Enter') {
        e.stopPropagation();
        if (visibleApps.length > 0) {
          // Add hover effect
          const selected = visibleApps[selectedAppIndex];
          const iconContainer = selected.querySelector('.icon-container');
          selected.style.transform = 'scale(1.10)';
          if (iconContainer) iconContainer.style.boxShadow = '0 8px 32px rgba(0,0,0,0.22)';
          setTimeout(() => {
            openAppFromLauncher(selected);
            // Remove hover effect after click
            selected.style.transform = '';
            if (iconContainer) iconContainer.style.boxShadow = '0 4px 16px rgba(0,0,0,0.18)';
          }, 120);
          e.preventDefault();
        }
      }
      // If user pressed an arrow key and nothing is selected, select the first visible app
      if (arrowPressed && visibleApps.length > 0 && !visibleApps.some(item => item.classList.contains('selected'))) {
        updateAppSelection(0);
      }
    });

    // On open, do NOT select any app
    setTimeout(() => { searchInput.focus(); /* do not call updateAppSelection(0) here */ }, 100);

    // On click, set .selected to the clicked app
    appItems.forEach(appItem => {
      appItem.addEventListener('click', (e) => {
        e.stopPropagation();
        openAppFromLauncher(appItem);
      });
    });

    // --- Add robust close logic for App Launcher ---
    function closeLauncher() {
      overlay.style.opacity = '0';
      setTimeout(() => {
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      }, 300);
      document.removeEventListener('keydown', onKeyDown);
      overlay.removeEventListener('click', onOverlayClick);
    }
    function onKeyDown(e) {
      if (e.key === 'Escape') closeLauncher();
    }
    function onOverlayClick(e) {
      // Only keep launcher open if click is inside search bar or on an app icon/title
      if (
        e.target.closest('.search-bar-container') ||
        e.target.closest('.app-launcher-app')
      ) {
        return;
      }
      closeLauncher();
    }
    document.addEventListener('keydown', onKeyDown);
    overlay.addEventListener('click', onOverlayClick);
  }

  const appLauncherBtn = document.getElementById('app-launcher-btn');
  if (appLauncherBtn) {
    appLauncherBtn.addEventListener('click', function () {
      const appLauncherIcon = document.querySelector('.desktop-icon[data-app="app-launcher"]');
      openAppLauncherWindow(appLauncherIcon);
    });
  }

// ... existing code ...

  // --- Bulletproof: Attach ResizeObserver to all .window elements ---
  function attachSidebarResizeObserver(win) {
    if (!win || win._sidebarResizeObserver) return;
    const ro = new ResizeObserver(() => {
      updateSidebarForWindow(win);
    });
    ro.observe(win);
    win._sidebarResizeObserver = ro;
    // Initial call
    updateSidebarForWindow(win);
  }
  // Attach to all current windows
  document.querySelectorAll('.window').forEach(attachSidebarResizeObserver);

  // Patch window creation functions
  if (typeof createWindowFromTemplate === 'function') {
    const _originalCreateWindowFromTemplate = createWindowFromTemplate;
    createWindowFromTemplate = function () {
      const win = _originalCreateWindowFromTemplate.apply(this, arguments);
      attachSidebarResizeObserver(win);
      return win;
    };
  }
  if (typeof createGenericWindow === 'function') {
    const _originalCreateGenericWindow = createGenericWindow;
    createGenericWindow = function () {
      const win = _originalCreateGenericWindow.apply(this, arguments);
      attachSidebarResizeObserver(win);
      return win;
    };
  }
});
// ... existing code ...

// --- Global keyboard shortcut for App Launcher: Ctrl + Alt + Space ---
document.addEventListener('keydown', function (e) {
  // Ignore if focus is in an input, textarea, or contenteditable
  const active = document.activeElement;
  if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable)) return;
  // Ctrl + Alt + Space
  if (e.ctrlKey && e.altKey && !e.metaKey && !e.shiftKey && (e.code === 'Space' || e.key === ' ')) {
    e.preventDefault();
    // Only open if not already open
    if (!document.getElementById('app-launcher-overlay')) {
      // Try to find the desktop icon for animation, else pass null
      const appLauncherIcon = document.querySelector('.desktop-icon[data-app="app-launcher"]');
      openAppLauncherWindow(appLauncherIcon);
    }
  }
});

// ... existing code ...
// --- DESKTOP WIDGETS TOGGLE BUTTON ---
function attachWidgetsToggleBtnListener() {
  const widgetsToggleBtn = document.getElementById('widgets-toggle-btn');
  const widgetsToggleArrow = document.getElementById('widgets-toggle-arrow');
  const widgetsScreen = document.getElementById('widgets-screen');
  if (widgetsToggleBtn && widgetsToggleArrow && widgetsScreen) {
    // Remove previous listeners by replacing with a clone
    const newBtn = widgetsToggleBtn.cloneNode(true);
    widgetsToggleBtn.parentNode.replaceChild(newBtn, widgetsToggleBtn);
    const arrowIcon = newBtn.querySelector('i');
    function setChevronIcon(visible) {
      if (!arrowIcon) return;
      arrowIcon.classList.remove('fa-chevron-right', 'fa-chevron-left');
      arrowIcon.classList.add(visible ? 'fa-chevron-right' : 'fa-chevron-left');
    }
    // --- FIX: Sync state ---
    window.widgetsVisible = !widgetsScreen.classList.contains('widgets-hidden');
    // Set initial icon
    setChevronIcon(window.widgetsVisible);
    newBtn.addEventListener('click', function () {
      if (window.innerWidth <= 1023) return; // Only on desktop
      window.widgetsVisible = !window.widgetsVisible;
      if (!window.widgetsVisible) {
        widgetsScreen.classList.add('widgets-hidden');
        setChevronIcon(false);
      } else {
        widgetsScreen.classList.remove('widgets-hidden');
        widgetsScreen.style.display = '';
        setChevronIcon(true);
      }
    });
    // On resize, always show widgets if switching to mobile
    window.addEventListener('resize', function resizeHandler() {
      if (window.innerWidth <= 1023) {
        widgetsScreen.classList.remove('widgets-hidden');
        widgetsScreen.style.display = '';
        window.widgetsVisible = true;
        setChevronIcon(true);
      }
    }, { once: true });
  }
}

document.addEventListener('DOMContentLoaded', function () {
  attachWidgetsToggleBtnListener();
  // ... existing code ...
});
// ... existing code ...

document.addEventListener('DOMContentLoaded', function () {
  // ... existing code ...
  const aiChatBtn = document.getElementById('ai-chat-btn');
  const aiChatWindow = document.getElementById('ai-chat-window');
  let aiChatVisible = false;
  if (aiChatBtn && aiChatWindow) {
    aiChatBtn.addEventListener('click', function () {
      if (window.innerWidth <= 1023) return;
      if (typeof window.hideWalletSidebar === 'function') window.hideWalletSidebar();
      aiChatVisible = !aiChatVisible;
      if (aiChatVisible) {
        aiChatWindow.style.display = 'flex';
        setTimeout(() => aiChatWindow.classList.add('ai-chat-visible'), 10);
      } else {
        aiChatWindow.classList.remove('ai-chat-visible');
        aiChatWindow.addEventListener('transitionend', function handler() {
          if (!aiChatVisible) aiChatWindow.style.display = 'none';
          aiChatWindow.removeEventListener('transitionend', handler);
        });
      }
    });
  }
  const aiChatCloseBtn = document.getElementById('ai-chat-close-btn');
  if (aiChatCloseBtn) {
    aiChatCloseBtn.addEventListener('click', function () {
      if (!aiChatVisible) return;
      aiChatVisible = false;
      aiChatWindow.classList.remove('ai-chat-visible');
      aiChatWindow.addEventListener('transitionend', function handler() {
        if (!aiChatVisible) aiChatWindow.style.display = 'none';
        aiChatWindow.removeEventListener('transitionend', handler);
      });
    });
  }
});
// ... existing code ...



document.addEventListener('DOMContentLoaded', function () {
  // ... existing code ...
  // GLOBAL SEARCH OVERLAY LOGIC
  const globalSearchBtn = document.getElementById('global-search-btn');
  const globalSearchOverlay = document.getElementById('global-search-overlay');
  const globalSearchInput = document.getElementById('global-search-input');
  const globalSearchDropdownBtn = document.getElementById('global-search-dropdown-btn');
  const globalSearchDropdownList = document.getElementById('global-search-dropdown-list');
  const globalSearchSelected = document.getElementById('global-search-selected');
  let globalSearchDropdownOpen = false;
  function showGlobalSearch() {
    if (typeof window.hideWalletSidebar === 'function') window.hideWalletSidebar();
    if (window.innerWidth <= 1023) return;
    globalSearchOverlay.style.display = 'flex';
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        globalSearchOverlay.style.opacity = '1';
        globalSearchOverlay.style.visibility = 'visible';
        if (globalSearchInput) {
          // Force input to be focusable and reset focus state
          globalSearchInput.tabIndex = -1;
          globalSearchInput.blur();
          globalSearchInput.tabIndex = 0;
          globalSearchInput.focus();
          globalSearchInput.select();
        }
        document.body.style.overflow = 'hidden';
      });
    });
  }
  function hideGlobalSearch() {
    globalSearchOverlay.style.opacity = '0';
    globalSearchOverlay.style.visibility = 'hidden';
    setTimeout(() => {
      globalSearchOverlay.style.display = 'none';
      document.body.style.overflow = '';
    }, 300);
    closeDropdown();
  }
  function openDropdown() {
    globalSearchDropdownList.style.display = 'flex';
    globalSearchDropdownOpen = true;
  }
  function closeDropdown() {
    globalSearchDropdownList.style.display = 'none';
    globalSearchDropdownOpen = false;
  }
  if (globalSearchBtn && globalSearchOverlay) {
    globalSearchBtn.addEventListener('click', function () {
      if (window.innerWidth <= 1023) return;
      if (globalSearchOverlay.style.display !== 'flex') {
        globalSearchOverlay.style.display = 'flex';
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            globalSearchOverlay.style.opacity = '1';
            globalSearchOverlay.style.visibility = 'visible';
            if (globalSearchInput) {
              // Remove and re-append input for bulletproof focus
              const parent = globalSearchInput.parentNode;
              const next = globalSearchInput.nextSibling;
              parent.removeChild(globalSearchInput);
              if (next) parent.insertBefore(globalSearchInput, next);
              else parent.appendChild(globalSearchInput);
              setTimeout(() => {
                globalSearchInput.focus();
                globalSearchInput.setSelectionRange(0, globalSearchInput.value.length);
              }, 30);
            }
            document.body.style.overflow = 'hidden';
          });
        });
      } else {
        if (globalSearchInput) {
          // Remove and re-append input for bulletproof focus
          const parent = globalSearchInput.parentNode;
          const next = globalSearchInput.nextSibling;
          parent.removeChild(globalSearchInput);
          if (next) parent.insertBefore(globalSearchInput, next);
          else parent.appendChild(globalSearchInput);
          setTimeout(() => {
            globalSearchInput.focus();
            globalSearchInput.setSelectionRange(0, globalSearchInput.value.length);
          }, 30);
        }
      }
    });
    globalSearchInput && globalSearchInput.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') hideGlobalSearch();
    });
    document.addEventListener('keydown', function (e) {
      if (globalSearchOverlay.style.display !== 'none' && e.key === 'Escape') hideGlobalSearch();
    });
    globalSearchOverlay.addEventListener('mousedown', function (e) {
      if (e.target === globalSearchOverlay) hideGlobalSearch();
    });
    // Dropdown logic
    if (globalSearchDropdownBtn && globalSearchDropdownList) {
      globalSearchDropdownBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        if (globalSearchDropdownOpen) closeDropdown();
        else openDropdown();
      });
      globalSearchDropdownList.addEventListener('mousedown', function (e) {
        e.stopPropagation();
      });
      document.addEventListener('mousedown', function (e) {
        if (globalSearchDropdownOpen && !globalSearchDropdownList.contains(e.target) && e.target !== globalSearchDropdownBtn) {
          closeDropdown();
        }
      });
      Array.from(globalSearchDropdownList.querySelectorAll('.dropdown-item')).forEach(item => {
        item.addEventListener('click', function () {
          globalSearchDropdownList.querySelectorAll('.dropdown-item').forEach(i => i.classList.remove('selected'));
          item.classList.add('selected');
          // Set icon and text in the selected button
          globalSearchSelected.innerHTML = item.innerHTML;
          closeDropdown();
        });
      });
      // On page load, set the default selected icon+text
      const initiallySelected = globalSearchDropdownList.querySelector('.dropdown-item.selected');
      if (initiallySelected) {
        globalSearchSelected.innerHTML = initiallySelected.innerHTML;
      }
    }
  }
});
// ... existing code ...


document.addEventListener('DOMContentLoaded', function () {
  // ... existing code ...
  const notificationsBtn = document.getElementById('notifications-btn');
  const notificationsPanel = document.getElementById('notifications-panel');
  let notificationsVisible = false;
  if (notificationsPanel && notificationsBtn) {
    // Remove static HTML and render dynamically
    notificationsPanel.innerHTML = '';
    // Optionally, initialize with default notifications
    if (notifications.length === 0) {
      notifications.push(
        {
          title: 'New sale',
          desc: 'New sale from Andrei Caramitru',
          meta: '1m',
          iconClass: 'fa-shopping-cart',
          iconBgClass: 'notif-bg-blue',
          avatar: 'img/avatar.png',
          unread: true
        },
        {
          title: 'Andrei Caramitru made a new <b>sale</b>',
          desc: 'in total of <b>4500 lei</b>',
          meta: '20m',
          iconClass: 'fa-bolt',
          iconBgClass: 'notif-bg-indigo',
          avatar: 'img/avatar.png',
          unread: true
        },
        {
          title: 'Andrei Caramitru made a new sale',
          desc: 'in total of 4500 lei',
          meta: '40m',
          iconClass: 'fa-shopping-bag',
          iconBgClass: 'notif-bg-orange',
          avatar: 'img/avatar.png',
          unread: false
        },
        {
          title: 'Andrei Caramitru posted a <b>review</b>',
          desc: 'on <b>Blugi de blana imblaniti misto</b>',
          meta: '1h ago',
          iconClass: 'fa-star',
          iconBgClass: 'notif-bg-green',
          avatar: 'img/avatar.png',
          unread: false
        }
      );
    }
    renderNotificationsPanel();
    // Add event delegation for delete buttons (already present, keep as is)
    notificationsPanel.addEventListener('click', function (e) {
      if (e.target.classList.contains('notif-clear')) {
        clearAllNotifications();
        return;
      }
      if (e.target.classList.contains('notif-delete-btn')) {
        const notifCard = e.target.closest('.notif-card');
        if (notifCard) {
          const notifList = notifCard.parentElement;
          const notificationsPanel = document.getElementById('notifications-panel');
          // FLIP: measure positions before removal
          const prevCards = notificationsPanel.querySelectorAll('.notif-card');
          let prevPositions = [];
          let prevIds = [];
          prevCards.forEach(card => {
            prevPositions.push(card.getBoundingClientRect().top);
            prevIds.push(card.dataset.notifId);
          });
          // Animate the card out to the right
          notifCard.style.transition = 'transform 0.3s cubic-bezier(0.4,0,0.2,1), opacity 0.3s cubic-bezier(0.4,0,0.2,1)';
          notifCard.style.transform = 'translateX(120%)';
          notifCard.style.opacity = '0';
          setTimeout(() => {
            // Remove from notifications array
            const idx = Array.from(notifList.children).indexOf(notifCard);
            let removedId = notifCard.dataset.notifId;
            if (idx > -1) notifications.splice(idx, 1);
            renderNotificationsPanel();
            // FLIP: animate remaining cards up
            const newCards = notificationsPanel.querySelectorAll('.notif-card');
            newCards.forEach(card => {
              const notifId = card.dataset.notifId;
              const prevIdx = prevIds.indexOf(notifId);
              if (prevIdx !== -1) {
                const oldTop = prevPositions[prevIdx];
                const newTop = card.getBoundingClientRect().top;
                const dy = oldTop - newTop;
                if (dy !== 0) {
                  card.style.transition = 'none';
                  card.style.transform = `translateY(${dy}px)`;
                  requestAnimationFrame(() => {
                    card.style.transition = 'transform 0.35s cubic-bezier(0.4,0,0.2,1)';
                    card.style.transform = '';
                  });
                  card.addEventListener('transitionend', function handler() {
                    card.style.transition = '';
                    card.removeEventListener('transitionend', handler);
                  });
                }
              }
            });
            if (typeof updateNotificationsBadge === 'function') updateNotificationsBadge();
          }, 300);
        }
      }
    });

    notificationsBtn.addEventListener('click', function (e) {
      notificationsVisible = !notificationsVisible;
      if (notificationsVisible) {
        // Hide wallet sidebar if visible
        if (typeof window.hideWalletSidebar === 'function') {
          const walletSidebar = document.getElementById('wallet-sidebar');
          if (walletSidebar && walletSidebar.classList.contains('wallet-sidebar-visible')) {
            window.hideWalletSidebar();
          }
        }
        // Hide ai-chat panel if visible
        const aiChatWindow = document.getElementById('ai-chat-window');
        if (aiChatWindow && aiChatWindow.classList.contains('ai-chat-visible')) {
          aiChatWindow.classList.remove('ai-chat-visible');
          aiChatWindow.addEventListener('transitionend', function handler(e) {
            if (e.propertyName === 'transform') {
              aiChatWindow.style.display = 'none';
              aiChatWindow.removeEventListener('transitionend', handler);
            }
          });
        }
        notificationsPanel.style.display = 'flex';
        setTimeout(() => notificationsPanel.classList.add('notifications-visible'), 10);
      } else {
        notificationsPanel.classList.remove('notifications-visible');
        notificationsPanel.addEventListener('transitionend', function handler() {
          if (!notificationsVisible) notificationsPanel.style.display = 'none';
          notificationsPanel.removeEventListener('transitionend', handler);
        });
      }
    });

    // Click-outside-to-close logic
    document.addEventListener('mousedown', function (e) {
      if (notificationsVisible && notificationsPanel.style.display === 'flex') {
        if (!notificationsPanel.contains(e.target) && !notificationsBtn.contains(e.target)) {
          notificationsVisible = false;
          notificationsPanel.classList.remove('notifications-visible');
          notificationsPanel.addEventListener('transitionend', function handler() {
            if (!notificationsVisible) notificationsPanel.style.display = 'none';
            notificationsPanel.removeEventListener('transitionend', handler);
          });
        }
      }
    });
  }
  // ... existing code ...
});


// ... existing code ...

document.addEventListener('DOMContentLoaded', function () {
  // ... existing code ...
  const fullscreenBtn = document.getElementById('fullscreen-btn');
  if (fullscreenBtn) {
    const fullscreenIcon = fullscreenBtn.querySelector('i');
    function isFullscreen() {
      return document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
    }
    function requestFullscreen(elem) {
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
      } else if (elem.mozRequestFullScreen) {
        elem.mozRequestFullScreen();
      } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
      }
    }
    function exitFullscreen() {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
    function updateFullscreenIcon() {
      if (isFullscreen()) {
        fullscreenIcon.classList.remove('fa-expand');
        fullscreenIcon.classList.add('fa-compress');
      } else {
        fullscreenIcon.classList.remove('fa-compress');
        fullscreenIcon.classList.add('fa-expand');
      }
    }
    fullscreenBtn.addEventListener('click', function () {
      if (isFullscreen()) {
        exitFullscreen();
      } else {
        requestFullscreen(document.documentElement);
      }
    });
    document.addEventListener('fullscreenchange', updateFullscreenIcon);
    document.addEventListener('webkitfullscreenchange', updateFullscreenIcon);
    document.addEventListener('mozfullscreenchange', updateFullscreenIcon);
    document.addEventListener('MSFullscreenChange', updateFullscreenIcon);
    updateFullscreenIcon();
  }
});
// ... existing code ...

document.addEventListener('DOMContentLoaded', function () {
  // ... existing code ...
  const widgetsScreen = document.getElementById('widgets-screen');
  function enableWidgetsScreenScroll() {
    if (!widgetsScreen) return;
    if (window.innerWidth >= 1024) {
      widgetsScreen.addEventListener('wheel', function (e) {
        widgetsScreen.scrollTop += e.deltaY;
        // Do not preventDefault, so scroll bubbles if at top/bottom
      }, { passive: true });
    }
  }
  enableWidgetsScreenScroll();
  window.addEventListener('resize', enableWidgetsScreenScroll);
  // ... existing code ...
});
// ... existing code ...


// ... existing code ...



// --- Desktop Icon Arrangement Persistence ---
function saveDesktopIconPositions() {
  if (window.innerWidth <= 1023) return; // Only on desktop
  const icons = document.querySelectorAll('.desktop-icon');
  const positions = Array.from(icons).map(icon => ({
    app: icon.getAttribute('data-app'),
    left: icon.style.left,
    top: icon.style.top
  }));
  localStorage.setItem('desktopIconPositions', JSON.stringify(positions));
}

function restoreDesktopIconPositions() {
  if (window.innerWidth <= 1023) return false; // Only on desktop
  const positions = JSON.parse(localStorage.getItem('desktopIconPositions') || '[]');
  const desktopIconsContainer = document.querySelector('.desktop-icons');
  if (!positions.length || !desktopIconsContainer) {
    if (desktopIconsContainer) {
      desktopIconsContainer.removeAttribute('data-absolute');
      document.querySelectorAll('.desktop-icon').forEach(icon => {
        icon.removeAttribute('data-absolute');
      });
    }
    return false;
  }
  const icons = document.querySelectorAll('.desktop-icon');
  let restored = false;
  positions.forEach(pos => {
    const icon = Array.from(icons).find(i => i.getAttribute('data-app') === pos.app);
    if (icon && pos.left && pos.top) {
      icon.style.position = 'absolute';
      icon.style.left = pos.left;
      icon.style.top = pos.top;
      icon.setAttribute('data-absolute', 'true');
      restored = true;
    }
  });
  if (restored) {
    desktopIconsContainer.setAttribute('data-absolute', 'true');
  } else {
    desktopIconsContainer.removeAttribute('data-absolute');
    icons.forEach(icon => icon.removeAttribute('data-absolute'));
  }
  return restored;
}

// Patch initializeDesktopIconPositions to restore positions if available, otherwise use grid
const _originalInitDesktopIconPositions = window.initializeDesktopIconPositions;
window.initializeDesktopIconPositions = function() {
  const desktopIconsContainer = document.querySelector('.desktop-icons');
  const icons = document.querySelectorAll('.desktop-icon');
  if (window.innerWidth > 1023) {
    // Try to restore, if not, use grid
    const restored = restoreDesktopIconPositions();
    if (!restored) {
      if (desktopIconsContainer) desktopIconsContainer.removeAttribute('data-absolute');
      icons.forEach(icon => icon.removeAttribute('data-absolute'));
      _originalInitDesktopIconPositions();
    }
  } else {
    if (desktopIconsContainer) desktopIconsContainer.removeAttribute('data-absolute');
    icons.forEach(icon => icon.removeAttribute('data-absolute'));
    _originalInitDesktopIconPositions();
  }
};

// Patch globalOnIconMouseUp to save positions after drag
const _originalGlobalOnIconMouseUp = window.globalOnIconMouseUp;
window.globalOnIconMouseUp = function (e) {
  _originalGlobalOnIconMouseUp(e);
  if (window.innerWidth > 1023) saveDesktopIconPositions();
};

window.addEventListener('resize', function () {
  if (window.innerWidth > 1023) {
    // On resize, try to restore, if not, use grid
    const restored = restoreDesktopIconPositions();
    if (!restored) {
      if (typeof _originalInitDesktopIconPositions === 'function') {
        _originalInitDesktopIconPositions();
      }
    }
  }
});
// ... existing code ...


// --- WINDOW POPOUT ---
function setupWindowPopout(windowElement, windowId) {
  const popoutButton = windowElement.querySelector('.window-popout');
  if (popoutButton) {
    popoutButton.addEventListener('click', function (e) {
    e.stopPropagation();
    // Get original window position and size
    const rect = windowElement.getBoundingClientRect();
    const screenLeft = window.screenX || window.screenLeft || 0;
    const screenTop = window.screenY || window.screenTop || 0;
    const chromeHeight = (window.outerHeight - window.innerHeight) || 0;
    const left = Math.round(screenLeft + rect.left);
    const top = Math.round(screenTop + rect.top + chromeHeight);
    const width = Math.round(rect.width);
    const height = Math.round(rect.height);
    // Open a new window with matching position and size
    const popoutWin = window.open('', '_blank', `width=${width},height=${height},left=${left},top=${top},menubar=no,toolbar=no,location=no,status=no`);
    if (!popoutWin) return;
    // --- Cross-browser: Write HTML immediately after open ---
    const doc = popoutWin.document;
    doc.open();
    doc.write(`<!DOCTYPE html><html><head><title>${windowElement.querySelector('.window-title span')?.textContent || 'App Popout'}</title>`);
    // Copy stylesheets
    Array.from(document.styleSheets).forEach(sheet => {
      if (sheet.href) doc.write(`<link rel="stylesheet" href="${sheet.href}">`);
    });
    // Inject main JS file for popout functionality
    doc.write('<script src="js/app.js"></script>');
    doc.write('</head><body style="background: var(--primary-bg); margin:0;">');
    // Write the entire window element, not just .window-content
    if (windowElement) {
      // Remove any existing inline styles that would conflict
      windowElement.style.position = '';
      windowElement.style.left = '';
      windowElement.style.top = '';
      windowElement.style.width = '';
      windowElement.style.height = '';
      // Write the .window element
      doc.write(windowElement.outerHTML);
      // Add style to make .window fill the viewport in the popout and hide the window header
      doc.write('<style>.window{position:fixed!important;top:0!important;left:0!important;width:100vw!important;height:100vh!important;max-width:none!important;max-height:none!important;min-width:0!important;min-height:0!important;z-index:1!important;} .window-header{display:none!important;}</style>');
    }
    doc.write('</body></html>');
    doc.close();
    // --- End cross-browser popout logic ---
    // Remove window from desktop and taskbar
    const currentTaskbarIcon = openWindows[windowId] ? openWindows[windowId].taskbarIcon : null;
    // --- Save icon and bg class for restore ---
    let iconClass = null, iconBgClass = null;
    const iconElem = windowElement.querySelector('.window-title .window-icon i');
    const iconBgElem = windowElement.querySelector('.window-title .window-icon');
    if (iconElem) iconClass = Array.from(iconElem.classList).find(cls => cls.startsWith('fa-'));
    if (iconBgElem) iconBgClass = Array.from(iconBgElem.classList).find(cls => cls.endsWith('-icon'));
    // --- Save appName and appTitle BEFORE removing window and openWindows ---
    let restoreAppName = (openWindows[windowId]?.name || windowElement.getAttribute('data-app') || '').trim();
    let restoreAppTitle = (openWindows[windowId]?.title || windowElement.querySelector('.window-title span')?.textContent || '').trim();
    windowElement.remove();
    if (currentTaskbarIcon) currentTaskbarIcon.remove();
    if (openWindows[windowId]) delete openWindows[windowId];
    if (activeWindow === windowElement) {
      activeWindow = null;
      updateTaskbarActiveState();
    }
    // --- Popout close behavior: restore if needed ---
    const popoutBehavior = localStorage.getItem('popoutCloseBehavior') || 'close';
    if (popoutBehavior === 'restore') {
      // Fallback to getAppIconDetails if iconClass or iconBgClass missing
      if (!iconClass || !iconBgClass) {
        const details = getAppIconDetails(restoreAppName);
        if (!iconClass) iconClass = details.iconClass;
        if (!iconBgClass) iconBgClass = details.iconBgClass;
      }
      // Pass info to the popout window so it can notify us on close
      try {
        popoutWin._poppedOutAppInfo = {
          appName: restoreAppName,
          appTitle: restoreAppTitle,
          iconClass: iconClass,
          iconBgClass: iconBgClass
        };
      } catch (e) { }
      // Listen for popout window close
      const restoreApp = () => {
        // Use appName and appTitle to reopen
        const info = popoutWin._poppedOutAppInfo;
        if (!window._loggingOut && info && info.appName) {
          openApp(info.appName, info.appTitle, info.iconClass, info.iconBgClass);
        }
      };
      // Use polling to detect close (since onbeforeunload in popout is unreliable cross-origin)
      const pollInterval = setInterval(() => {
        if (popoutWin.closed) {
          clearInterval(pollInterval);
          restoreApp();
        }
      }, 500);
    }
    // ... existing code ...
    // At the top of the file, after other globals:
    window._allPopoutWindows = window._allPopoutWindows || [];
    // ... existing code ...
    // In the popoutButton click handler, after 'if (!popoutWin) return;':
    window._allPopoutWindows.push(popoutWin);
    // ... existing code ...
    // In the logout button event handler:
    const logOutButton = document.querySelector('.start-menu-logout-button') || document.querySelector('.logout-button');
    if (logOutButton) {
      logOutButton.addEventListener('click', (e) => {
        e.preventDefault();
        handleLogout();
      });
    }
    // ... existing code ...
  });
}
}
// ... existing code ...


// --- SWIPE TO DELETE FOR NOTIFICATIONS ---
function enableNotificationSwipeToDelete() {
  const notifCards = document.querySelectorAll('.notif-card');
  notifCards.forEach(card => {
    let startX = 0;
    let currentX = 0;
    let translateX = 0;
    let swiping = false;
    const threshold = 80; // px to trigger delete

    // Create a background for delete if not present
    let swipeBg = card.querySelector('.notif-swipe-bg');
    if (!swipeBg) {
      swipeBg = document.createElement('div');
      swipeBg.className = 'notif-swipe-bg';
      swipeBg.innerHTML = '<i class="fas fa-trash"></i>';
      card.insertBefore(swipeBg, card.firstChild);
    }

    card.addEventListener('touchstart', function (e) {
      if (e.touches.length !== 1) return;
      startX = e.touches[0].clientX;
      swiping = true;
      card.style.transition = 'none';
    });

    card.addEventListener('touchmove', function (e) {
      if (!swiping) return;
      currentX = e.touches[0].clientX;
      translateX = Math.max(0, currentX - startX); // Only allow right swipe
      card.style.transform = `translateX(${translateX}px)`;
      swipeBg.style.opacity = Math.min(1, Math.abs(translateX) / threshold);
    });

    card.addEventListener('touchend', function (e) {
      if (!swiping) return;
      swiping = false;
      card.style.transition = 'transform 0.2s';
      if (translateX > threshold) { // Only if swiped right enough
        card.style.transform = `translateX(120%)`;
        card.classList.add('notif-card-removing');
        card.addEventListener('transitionend', function handler() {
          card.removeEventListener('transitionend', handler);
          const notifList = card.parentElement;
          card.remove();

          // Check if this was the last notification in the section
          if (notifList && notifList.classList.contains('notif-list') && notifList.querySelectorAll('.notif-card').length === 0) {
            const sectionLabel = notifList.previousElementSibling;
            if (sectionLabel && sectionLabel.classList.contains('notif-section-label')) {
              fadeOutSectionLabel(sectionLabel);
              // Remove the empty list after animation
              setTimeout(() => notifList.remove(), 400);
            }
          }

          // Check if all notifications are gone
          setTimeout(checkNoNotifications, 400);
        });
      } else {
        // Snap back
        card.style.transform = '';
        swipeBg.style.opacity = 0;
      }
    });
  });
}
// ... existing code ...

// --- WINDOWS 11 STYLE TOAST NOTIFICATION ---
function showToastNotification(opts = {}) {
  if (isNotificationsMuted) return;
  // Toast content (allow override for test/dev)
  const notifContent = opts.content || `
    <button class="notif-delete-btn" title="Dismiss notification">&times;</button>
    <div class="notif-icon-bg notif-bg-blue"><i class="fas fa-shopping-cart"></i></div>
    <div class="notif-content">
      <div class="notif-main-row">
        <span class="notif-main-title">New incoming notification1</span>

      </div>
      <div class="notif-desc">This is a test notification</div>
      <div class="notif-meta">now</div>
    </div>
    <img class="notif-avatar" src="img/avatar.png" />
  `;
  // Toast stacking container
  let container = document.getElementById('os-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'os-toast-container';
    container.style.position = 'fixed';
    container.style.top = '32px';
    container.style.right = '32px';
    container.style.width = '340px';
    container.style.zIndex = '999999';
    container.style.pointerEvents = 'none';
    container.style.height = 'auto';
    document.body.appendChild(container);
  }
  // Remove all if mode is 'one'
  if (desktopNotificationMode === 'one') {
    Array.from(container.children).forEach(child => child.remove());
  }
  // Create toast
  const toast = document.createElement('div');
  toast.className = 'notif-card unread os-toast-notification';
  toast.style.position = 'absolute';
  toast.style.right = '0';
  toast.style.left = 'auto';
  toast.style.margin = '0';
  toast.style.width = '340px';
  toast.style.maxWidth = '90vw';
  toast.style.pointerEvents = 'auto';
  toast.innerHTML = notifContent;
  // Insert at top (index 0)
  container.insertBefore(toast, container.firstChild);
  // Animate in
  toast.style.transform = 'translateX(120%)';
  toast.style.opacity = '0.7';
  setTimeout(() => {
    toast.style.transition = 'top 0.35s cubic-bezier(0.4,0,0.2,1), transform 0.45s cubic-bezier(0.4,0,0.2,1), opacity 0.45s cubic-bezier(0.4,0,0.2,1)';
    toast.style.transform = 'translateX(0)';
    toast.style.opacity = '1';
  }, 10);
  // Dismiss logic
  let dismissTimer;
  let dismissed = false;
  function dismissToast() {
    if (dismissed) return;
    dismissed = true;
    toast.style.opacity = '0.7';
    toast.style.transform = 'translateX(120%)';
    setTimeout(() => {
      toast.remove();
      updateToastStackPositions();
    }, 500);
  }
  function startTimer() {
    dismissTimer = setTimeout(dismissToast, 4000);
  }
  function clearTimer() {
    if (dismissTimer) clearTimeout(dismissTimer);
  }
  toast.addEventListener('mouseenter', clearTimer);
  toast.addEventListener('mouseleave', startTimer);
  const delBtn = toast.querySelector('.notif-delete-btn');
  if (delBtn) delBtn.onclick = dismissToast;
  startTimer();
  // Stacking limit logic
  let maxToasts = 1;
  if (desktopNotificationMode === 'three') maxToasts = 3;
  if (desktopNotificationMode === 'all') {
    // Calculate how many fit in viewport
    const taskbarHeight = 60; // px (adjust if needed)
    const margin = 20; // px
    const toastHeight = 80; // px (approximate, adjust if needed)
    const available = window.innerHeight - taskbarHeight - margin - 32; // 32px top
    maxToasts = Math.floor(available / (toastHeight + 14));
  }
  // Remove excess toasts (from bottom)
  while (container.children.length > maxToasts) {
    container.lastChild.remove();
  }
  // Update positions for all toasts
  updateToastStackPositions();
}

function updateToastStackPositions() {
  const container = document.getElementById('os-toast-container');
  if (!container) return;
  const margin = 14; // px
  const toastHeight = 80; // px (should match above)
  Array.from(container.children).forEach((toast, idx) => {
    toast.style.position = 'absolute';
    toast.style.right = '0';
    toast.style.left = 'auto';
    toast.style.marginTop = '50px';
    toast.style.marginRight = '10px';
    toast.style.transition = 'top 0.35s cubic-bezier(0.4,0,0.2,1), transform 0.45s cubic-bezier(0.4,0,0.2,1), opacity 0.45s cubic-bezier(0.4,0,0.2,1)'; // Smooth move
    toast.style.top = (idx * (toastHeight + margin)) + 'px';
    toast.style.zIndex = 999999 - idx;
  });
  // Adjust container height
  container.style.height = (container.children.length * (toastHeight + margin) - margin) + 'px';
}
// ... existing code ...


// --- Shared Mobile Sidebar Logic for All Windows with Sidebar ---
function setupMobileSidebarForWindow(windowElement) {
  // Try all possible sidebar and content class combos for robustness
  let sidebar = windowElement.querySelector('.file-explorer-sidebar, .settings-sidebar, .app-store-sidebar');
  let overlay = windowElement.querySelector('.sidebar-overlay');
  const windowContent = windowElement.querySelector('.window-content');
  if (windowContent && overlay && windowContent.firstElementChild !== overlay) {
    windowContent.insertBefore(overlay, windowContent.firstElementChild);
  }
  if (!overlay && windowContent) overlay = windowContent.querySelector('.sidebar-overlay');
  const menuToggle = windowElement.querySelector('.menu-toggle');
  // Try all possible content area classes
  let contentArea = windowElement.querySelector('.file-explorer-content, .settings-content, .app-store-main-content');
  // If not found, try direct child of window-content
  if (!contentArea && windowContent) {
    contentArea = windowContent.querySelector('.file-explorer-content, .settings-content, .app-store-main-content');
  }
  // If still not found, fallback to windowContent itself
  if (!contentArea && windowContent) contentArea = windowContent;
  // Debug log for diagnosis


  if (!sidebar || !overlay || !menuToggle || !contentArea) return;

  // Remove previous listeners to avoid duplicates
  menuToggle.onclick = null;
  overlay.onclick = null;
  sidebar.querySelectorAll('.sidebar-item').forEach(item => { item.onclick = null; });

  function setBlockInteraction(active) {
    if (active) {
      windowElement.classList.add('sidebar-block-interaction');
    } else {
      windowElement.classList.remove('sidebar-block-interaction');
    }
  }

  menuToggle.addEventListener('click', () => {
    const isShowing = !sidebar.classList.contains('show');
    sidebar.classList.toggle('show');
    overlay.classList.toggle('show');
    if (window.innerWidth <= 767) {
      setBlockInteraction(isShowing);
      if (isShowing) {
        contentArea.classList.add('sidebar-push-active');
      } else {
        contentArea.classList.remove('sidebar-push-active');
      }
    }
  });

  overlay.addEventListener('click', () => {
    sidebar.classList.remove('show');
    overlay.classList.remove('show');
    setBlockInteraction(false);
    if (window.innerWidth <= 767) {
      contentArea.classList.remove('sidebar-push-active');
    }
  });

  // Close sidebar on item click for mobile
  const sidebarItems = sidebar.querySelectorAll('.sidebar-item');
  sidebarItems.forEach(item => {
    item.addEventListener('click', () => {
      if (window.innerWidth <= 767) {
        sidebar.classList.remove('show');
        overlay.classList.remove('show');
        setBlockInteraction(false);
        contentArea.classList.remove('sidebar-push-active');
      }
    });
  });

  // Handle window resize
  window.addEventListener('resize', () => {
    if (window.innerWidth > 767) {
      sidebar.classList.remove('show');
      overlay.classList.remove('show');
      setBlockInteraction(false);
      contentArea.classList.remove('sidebar-push-active');
    }
  });
}
// ... existing code ...

// Patch updateSidebarForWindow to respect data-user-collapsed
const _originalUpdateSidebarForWindow = updateSidebarForWindow;
window.updateSidebarForWindow = function (windowEl) {
  if (!windowEl) return;
  if (windowEl._isClosing) return;
  const sidebars = windowEl.querySelectorAll('.file-explorer-sidebar, .settings-sidebar, .app-store-sidebar, .start-menu-right-sidebar');
  const width = windowEl.offsetWidth;
  const isMobile = window.innerWidth <= 767;
  sidebars.forEach(sb => {
    // On mobile, do NOT touch sidebar classes/styles; let CSS and .show handle everything
    if (isMobile) {
      sb.removeAttribute('data-user-collapsed');
      return;
    }
    // User override
    if (sb.hasAttribute('data-user-collapsed')) {
      if (sb.getAttribute('data-user-collapsed') === 'true') {
        sb.classList.add('sidebar-collapsed');
      } else {
        sb.classList.remove('sidebar-collapsed');
      }
      // If window is very small or very large, remove user override
      if (width < 200 || width > 700) {
        sb.removeAttribute('data-user-collapsed');
      }
      return;
    }
    // Otherwise, original logic
    const content = sb.parentElement && sb.parentElement.querySelector('.file-explorer-content, .settings-content, .app-store-main-content');
    if (content) {
      content.style.transform = '';
      content.style.width = '';
    }
    if (width >= 200 && width < 500) {
      sb.classList.add('sidebar-collapsed');
      sb._hoverEnter = function () {
        const originalWidth = content ? content.offsetWidth : null;
        sb.classList.add('sidebar-hovered');
        sb.style.position = 'absolute';
        sb.style.left = '0';
        sb.style.top = '0';
        sb.style.height = '100vh'; // PATCH: always full viewport height
        sb.style.zIndex = '20';
        sb.style.width = '220px';
        sb.style.overflowY = 'hidden';
        if (content && originalWidth) {
          content.style.width = originalWidth + 'px';
          content.style.transition = 'transform 0.25s cubic-bezier(0.4,0,0.2,1)';
          content.style.transform = 'translateX(220px)';
        }
      };
      sb._hoverLeave = function () {
        sb.classList.remove('sidebar-hovered');
        sb.style.position = '';
        sb.style.left = '';
        sb.style.top = '';
        sb.style.height = '';
        sb.style.overflowY = '';
        sb.style.zIndex = '';
        sb.style.width = '';
        if (content) {
          content.style.transition = 'transform 0.25s cubic-bezier(0.4,0,0.2,1)';
          content.style.transform = '';
          content.addEventListener('transitionend', function handler(e) {
            if (e.propertyName === 'transform') {
              content.style.transition = '';
              content.style.width = '';
              content.removeEventListener('transitionend', handler);
            }
          });
        }
      };
      sb.addEventListener('mouseenter', sb._hoverEnter);
      sb.addEventListener('mouseleave', sb._hoverLeave);
    } else {
      sb.classList.remove('sidebar-collapsed', 'sidebar-hovered', 'sidebar-mobile');
    }
  });
}
  // ... existing code ...

  (function () {
    console.log('[Swipe] Swipe logic running');
    // --- SWIPE CONTAINER LOGIC (universal: desktop + mobile) ---
    if (!document.getElementById('swipe-container')) {
      const swipeContainer = document.createElement('div');
      swipeContainer.id = 'swipe-container';
      swipeContainer.style.position = 'fixed';
      swipeContainer.style.left = '0';
      swipeContainer.style.top = '0';
      swipeContainer.style.width = '100vw';
      swipeContainer.style.height = '100vh';
      swipeContainer.style.overflow = 'hidden';
      swipeContainer.style.zIndex = '2147483647';
      swipeContainer.style.display = 'flex';
      swipeContainer.style.flexDirection = 'row';
      swipeContainer.style.transition = 'transform 0.35s cubic-bezier(0.4,0,0.2,1)';
      swipeContainer.style.background = '#111';

      // --- DO NOT HIDE ALL BODY CHILDREN ---
      // Instead, move the real app content into the swipe screens

      // Left screen (Notifications)
      const leftScreen = document.createElement('div');
      leftScreen.className = 'swipe-screen-left';
      leftScreen.style.width = '100vw';
      leftScreen.style.height = '100vh';
      leftScreen.style.flexShrink = '0';
      leftScreen.style.display = 'flex';
      leftScreen.style.flexDirection = 'column';
      leftScreen.style.overflow = 'auto';
      // Move notifications panel if it exists
      const notificationsPanel = document.getElementById('notifications-panel');
      if (notificationsPanel) {
        leftScreen.appendChild(notificationsPanel);
        notificationsPanel.style.display = 'flex';
        notificationsPanel.style.position = 'static';
        notificationsPanel.style.height = '100%';
        notificationsPanel.style.width = '100%';
        console.log('[Swipe] Forced notifications panel visible:', notificationsPanel, getComputedStyle(notificationsPanel).display);
      } else {
        leftScreen.innerHTML = '<div style="color:#fff;font-size:2rem;">Notifications</div>';
      }

      // Home screen (middle, Desktop only - CLONE)
      const homeScreen = document.createElement('div');
      homeScreen.className = 'swipe-screen-home';
      homeScreen.style.width = '100vw';
      homeScreen.style.height = '100vh';
      homeScreen.style.flexShrink = '0';
      homeScreen.style.display = 'flex';
      homeScreen.style.flexDirection = 'column';
      homeScreen.style.overflow = 'auto';
      // Clone the desktop area
      const desktopArea = document.querySelector('.desktop-area');
      if (desktopArea) {
        const desktopClone = desktopArea.cloneNode(true);
        desktopClone.classList.add('in-swipe');
        desktopClone.removeAttribute('id'); // Remove duplicate ID
        homeScreen.appendChild(desktopClone);
        desktopClone.style.display = 'flex';
        desktopClone.style.height = '100%';
        desktopClone.style.width = '100%';
      } else {
        homeScreen.innerHTML = '<div style="color:#fff;font-size:2rem;margin-bottom:80px;">Home Screen</div>';
      }

      // Right screen (Widgets only - CLONE)
      const rightScreen = document.createElement('div');
      rightScreen.className = 'swipe-screen-right';
      rightScreen.style.width = '100vw';
      rightScreen.style.height = '100vh';
      rightScreen.style.flexShrink = '0';
      rightScreen.style.display = 'flex';
      rightScreen.style.flexDirection = 'column';
      rightScreen.style.overflow = 'auto';
      // Clone the widgets screen
      const widgetsScreen = document.getElementById('widgets-screen');
      if (widgetsScreen) {
        const widgetsClone = widgetsScreen.cloneNode(true);
        widgetsClone.classList.add('in-swipe');
        widgetsClone.removeAttribute('id'); // Remove duplicate ID
        rightScreen.appendChild(widgetsClone);
        widgetsClone.style.display = 'flex';
        widgetsClone.style.position = 'static';
        widgetsClone.style.height = '100%';
        widgetsClone.style.width = '100%';
      } else {
        rightScreen.innerHTML = '<div style="color:#fff;font-size:2rem;">Widgets</div>';
      }

      swipeContainer.appendChild(leftScreen);
      swipeContainer.appendChild(homeScreen);
      swipeContainer.appendChild(rightScreen);
      document.body.appendChild(swipeContainer);
      console.log('[Swipe] Swipe container appended to body');
    }

    // --- 2. SWIPE/DRAG LOGIC ---
    const swipeContainer = document.getElementById('swipe-container');
    let currentScreen = 1; // 0 = left, 1 = home, 2 = right
    let isDragging = false;
    let dragStartX = 0;
    let dragCurrentX = 0;
    let dragStartTransform = 0;

    function setScreen(index, animate = true) {
      currentScreen = Math.max(0, Math.min(2, index));
      if (!animate) swipeContainer.style.transition = 'none';
      swipeContainer.style.transform = `translateX(${-100 * currentScreen}vw)`;
      if (!animate) setTimeout(() => { swipeContainer.style.transition = 'transform 0.35s cubic-bezier(0.4,0,0.2,1)'; }, 30);
    }

    // Touch events (mobile)
    swipeContainer.addEventListener('touchstart', function (e) {
      if (e.touches.length !== 1) return;
      isDragging = true;
      dragStartX = e.touches[0].clientX;
      dragCurrentX = dragStartX;
      dragStartTransform = -100 * currentScreen;
      swipeContainer.style.transition = 'none';
    }, { passive: true });
    swipeContainer.addEventListener('touchmove', function (e) {
      if (!isDragging) return;
      dragCurrentX = e.touches[0].clientX;
      const dx = dragCurrentX - dragStartX;
      swipeContainer.style.transform = `translateX(${dragStartTransform + (dx / window.innerWidth) * 100}vw)`;
      e.preventDefault();
    }, { passive: false });
    swipeContainer.addEventListener('touchend', function (e) {
      if (!isDragging) return;
      isDragging = false;
      const dx = dragCurrentX - dragStartX;
      if (Math.abs(dx) > 60) {
        if (dx < 0 && currentScreen < 2) setScreen(currentScreen + 1);
        else if (dx > 0 && currentScreen > 0) setScreen(currentScreen - 1);
        else setScreen(currentScreen);
      } else {
        setScreen(currentScreen);
      }
    }, { passive: true });

    // Mouse events (desktop)
    swipeContainer.addEventListener('mousedown', function (e) {
      if (e.button !== 0) return;
      isDragging = true;
      dragStartX = e.clientX;
      dragCurrentX = dragStartX;
      dragStartTransform = -100 * currentScreen;
      swipeContainer.style.transition = 'none';
      document.body.style.userSelect = 'none';
    });
    window.addEventListener('mousemove', function (e) {
      if (!isDragging) return;
      dragCurrentX = e.clientX;
      const dx = dragCurrentX - dragStartX;
      swipeContainer.style.transform = `translateX(${dragStartTransform + (dx / window.innerWidth) * 100}vw)`;
    });
    window.addEventListener('mouseup', function (e) {
      if (!isDragging) return;
      isDragging = false;
      document.body.style.userSelect = '';
      const dx = dragCurrentX - dragStartX;
      if (Math.abs(dx) > 60) {
        if (dx < 0 && currentScreen < 2) setScreen(currentScreen + 1);
        else if (dx > 0 && currentScreen > 0) setScreen(currentScreen - 1);
        else setScreen(currentScreen);
      } else {
        setScreen(currentScreen);
      }
    });
    // --- 3. Initial state ---
    setScreen(1, false); // Home by default

  })();
// ... existing code ...

// Show a short notification in the top middle of the screen
function showShortTopNotification(message) {
  let existing = document.getElementById('os-short-top-notification');
  if (existing) existing.remove();
  const notif = document.createElement('div');
  notif.id = 'os-short-top-notification';
  notif.textContent = message;
  notif.style.position = 'fixed';
  notif.style.top = '32px';
  notif.style.left = '50%';
  notif.style.transform = 'translateX(-50%)';
  notif.style.background = 'var(--widget-bg)';
  notif.style.backdropFilter = 'blur(30px)';
  notif.style.color = '#fff';
  notif.style.fontSize = '16px';
  notif.style.fontWeight = '400';
  notif.style.padding = '10px 26px';
  notif.style.borderRadius = '16px';
  notif.style.zIndex = '999999';
  notif.style.boxShadow = '0 4px 24px rgba(0,0,0,0.18)';
  notif.style.opacity = '0';
  notif.style.transition = 'opacity 0.25s';
  document.body.appendChild(notif);
  setTimeout(() => { notif.style.opacity = '1'; }, 10);
  setTimeout(() => {
    notif.style.opacity = '0';
    setTimeout(() => notif.remove(), 400);
  }, 1200);
}

// Set notifications button opacity based on whether there are notifications
function setNotificationsBtnOpacity() {
  const notificationsBtn = document.getElementById('notifications-btn');
  const notificationsPanel = document.getElementById('notifications-panel');
  if (!notificationsBtn || !notificationsPanel) return;
  const notifPanelContent = notificationsPanel.querySelector('.notifications-panel-content');
  if (notifPanelContent && notifPanelContent.querySelector('.no-notifications-msg')) {
    notificationsBtn.style.opacity = '0.5';
  } else {
    notificationsBtn.style.opacity = '1';
  }
}

// Also call setNotificationsBtnOpacity on DOMContentLoaded to initialize.
document.addEventListener('DOMContentLoaded', function () {
  // ... existing code ...
  setNotificationsBtnOpacity();
});
// ... existing code ...

function updateNotificationsBadge() {
  const notificationsBtn = document.getElementById('notifications-btn');
  if (!notificationsBtn) return;
  let notifCount = 0;
  const notificationsPanel = document.getElementById('notifications-panel');
  if (notificationsPanel) {
    const notifPanelContent = notificationsPanel.querySelector('.notifications-panel-content');
    if (notifPanelContent) {
      notifCount = notifPanelContent.querySelectorAll('.notif-card').length;
    }
  }
  let badge = notificationsBtn.querySelector('.notif-badge');
  if (!badge) {
    badge = document.createElement('span');
    badge.className = 'notif-badge';
    notificationsBtn.appendChild(badge);
  }
  if (notifCount > 0) {
    badge.textContent = notifCount > 99 ? '99+' : notifCount;
    badge.style.display = '';
  } else {
    badge.style.display = 'none';
  }
}
// ... existing code ...
// After every setNotificationsBtnOpacity(); add:
setNotificationsBtnOpacity();
updateNotificationsBadge();
// ...
// On DOMContentLoaded, call updateNotificationsBadge to initialize
// ...
document.addEventListener('DOMContentLoaded', function () {
  setNotificationsBtnOpacity();
  updateNotificationsBadge();
});
// ...
// After adding a notification card:
todayList.appendChild(card);
updateNotificationsBadge();
// ...
// After removing a notification card or clearing notifications, also call updateNotificationsBadge() after setNotificationsBtnOpacity().


// --- In-app Window-aware Sidebar Adaptation ---
function updateSidebarForWindow(windowEl) {
  if (!windowEl) return;
  if (windowEl._isClosing) return;
  const sidebars = windowEl.querySelectorAll('.file-explorer-sidebar, .settings-sidebar, .app-store-sidebar, .start-menu-right-sidebar');
  const width = windowEl.offsetWidth;
  const isMobile = window.innerWidth <= 767;
  sidebars.forEach(sb => {
    if (isMobile) return;
    // Remove previous listeners
    if (sb._hoverEnter) sb.removeEventListener('mouseenter', sb._hoverEnter);
    if (sb._hoverLeave) sb.removeEventListener('mouseleave', sb._hoverLeave);
    delete sb._hoverEnter;
    delete sb._hoverLeave;
    sb.classList.remove('sidebar-hovered', 'sidebar-mobile');
    sb.style.position = '';
    sb.style.left = '';
    sb.style.top = '';
    sb.style.height = '';
    sb.style.zIndex = '';
    sb.style.width = '';
    const content = sb.parentElement && sb.parentElement.querySelector('.file-explorer-content, .settings-content, .app-store-main-content');
    if (content) {
      content.style.transform = '';
      content.style.width = '';
    }
    // Only allow hover-to-expand if sidebar is collapsed and user wants it (toggle ON)
    const userCollapsed = sb.getAttribute('data-user-collapsed') === 'true';
    if (width >= 200 && width < 510) {
      sb.classList.add('sidebar-collapsed');
      if (userCollapsed) {
        sb._hoverEnter = function () {
          const originalWidth = content ? content.offsetWidth : null;
          sb.classList.add('sidebar-hovered');
          sb.style.position = 'absolute';
          sb.style.left = '0';
          sb.style.top = '0';
          sb.style.height = '100%';
          sb.style.zIndex = '20';
          sb.style.width = '220px';
          sb.style.overflowY = 'hidden';
          if (content && originalWidth) {
            content.style.width = originalWidth + 'px';
            content.style.transition = 'transform 0.25s cubic-bezier(0.4,0,0.2,1)';
            content.style.transform = 'translateX(220px)';
          }
        };
        sb._hoverLeave = function () {
          sb.classList.remove('sidebar-hovered');
          sb.style.position = '';
          sb.style.left = '';
          sb.style.top = '';
          sb.style.height = '';
          sb.style.zIndex = '';
          sb.style.width = '';
          if (content) {
            content.style.transition = 'transform 0.25s cubic-bezier(0.4,0,0.2,1)';
            content.style.transform = '';
            content.addEventListener('transitionend', function handler(e) {
              if (e.propertyName === 'transform') {
                content.style.transition = '';
                content.style.width = '';
                content.removeEventListener('transitionend', handler);
              }
            });
          }
        };
        sb.addEventListener('mouseenter', sb._hoverEnter);
        sb.addEventListener('mouseleave', sb._hoverLeave);
      }
    } else {
      // For width >= 500, only collapse if user wants it
      if (userCollapsed) {
        sb.classList.add('sidebar-collapsed');
        sb._hoverEnter = function () {
          const originalWidth = content ? content.offsetWidth : null;
          sb.classList.add('sidebar-hovered');
          sb.style.position = 'absolute';
          sb.style.left = '0';
          sb.style.top = '0';
          sb.style.height = '100%';
          sb.style.zIndex = '20';
          sb.style.width = '220px';
          sb.style.overflowY = 'auto';
          if (content && originalWidth) {
            content.style.width = originalWidth + 'px';
            content.style.transition = 'transform 0.25s cubic-bezier(0.4,0,0.2,1)';
            content.style.transform = 'translateX(220px)';
          }
        };
        sb._hoverLeave = function () {
          sb.classList.remove('sidebar-hovered');
          sb.style.position = '';
          sb.style.left = '';
          sb.style.top = '';
          sb.style.height = '';
          sb.style.zIndex = '';
          sb.style.width = '';
          if (content) {
            content.style.transition = 'transform 0.25s cubic-bezier(0.4,0,0.2,1)';
            content.style.transform = '';
            content.addEventListener('transitionend', function handler(e) {
              if (e.propertyName === 'transform') {
                content.style.transition = '';
                content.style.width = '';
                content.removeEventListener('transitionend', handler);
              }
            });
          }
        };
        sb.addEventListener('mouseenter', sb._hoverEnter);
        sb.addEventListener('mouseleave', sb._hoverLeave);
      } else {
        sb.classList.remove('sidebar-collapsed', 'sidebar-hovered', 'sidebar-mobile');
      }
    }
  });
}
// Remove all other sidebar hover/push logic and listeners below this point

// --- Bulletproof: Attach ResizeObserver to all .window elements (guaranteed) ---
(function () {
  function attachSidebarResizeObserver(win) {
    if (!win || win._sidebarResizeObserver) return;
    const ro = new ResizeObserver(() => {
      updateSidebarForWindow(win);
    });
    ro.observe(win);
    win._sidebarResizeObserver = ro;
    // Initial call
    updateSidebarForWindow(win);
  }
  if (typeof document !== 'undefined') {
    document.querySelectorAll('.window').forEach(attachSidebarResizeObserver);
  }
  if (typeof createWindowFromTemplate === 'function') {
    const _originalCreateWindowFromTemplate = createWindowFromTemplate;
    createWindowFromTemplate = function () {
      const win = _originalCreateWindowFromTemplate.apply(this, arguments);
      attachSidebarResizeObserver(win);
      return win;
    };
  }
  if (typeof createGenericWindow === 'function') {
    const _originalCreateGenericWindow = createGenericWindow;
    createGenericWindow = function () {
      const win = _originalCreateGenericWindow.apply(this, arguments);
      attachSidebarResizeObserver(win);
      return win;
    };
  }
})();


// --- Alert Confirmation Dialog ---
function showConfirmDialog({ title, message, iconClass, okText = "OK", cancelText = "Cancel", style = "logout" }) {
  return new Promise((resolve) => {
    let existing = document.getElementById('os-alert-overlay');
    if (existing) existing.remove();
    const overlay = document.createElement('div');
    overlay.id = 'os-alert-overlay';
    if (style === 'desktop') {
      overlay.className = 'alert-overlay desktop-alert-overlay';
      overlay.innerHTML = `
        <div class="alert-dialog desktop-alert-dialog">
          <div class="alert-icon"><i class="fas ${iconClass || 'fa-question-circle'}"></i></div>
          <div class="alert-title">${title || ''}</div>
          <div class="alert-message">${message || ''}</div>
          <div class="alert-actions">
            <button class="alert-btn alert-cancel desktop-alert-cancel">${cancelText}</button>
            <button class="alert-btn alert-ok desktop-alert-ok">${okText}</button>
          </div>
        </div>
      `;
    } else {
      overlay.className = 'alert-overlay';
      overlay.innerHTML = `
        <div class="alert-dialog">
          <div class="alert-icon"><i class="fas ${iconClass || 'fa-question-circle'}"></i></div>
          <div class="alert-title">${title || ''}</div>
          <div class="alert-message">${message || ''}</div>
          <div class="alert-actions">
            <button class="alert-btn alert-cancel">${cancelText}</button>
            <button class="alert-btn alert-ok">${okText}</button>
          </div>
        </div>
      `;
    }
    document.body.appendChild(overlay);
    setTimeout(() => overlay.classList.add('alert-overlay-bg-visible'), 10);
    setTimeout(() => overlay.querySelector('.alert-ok').focus(), 10);
    function fadeOutAndRemove(result) {
      overlay.classList.add('alert-overlay-fadeout');
      setTimeout(() => { overlay.remove(); resolve(result); }, 400);
    }
    overlay.querySelector('.alert-cancel').onclick = () => fadeOutAndRemove(false);
    overlay.querySelector('.alert-ok').onclick = () => { overlay.remove(); resolve(true); };
    overlay.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { fadeOutAndRemove(false); }
    });
  });
}





