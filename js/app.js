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

if (volumeBtn && volumePanel) {
  // Set initial state
  volumePanel.style.display = 'none';
  
  volumeBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (volumePanel.classList.contains('visible')) {
      volumePanel.classList.remove('visible');
      setTimeout(() => {
        volumePanel.style.display = 'none';
      }, 350);
    } else {
      volumePanel.style.display = 'flex';
      requestAnimationFrame(() => {
        volumePanel.classList.add('visible');
      });
    }
  });
  
  // Setup close button
  const closeBtn = volumePanel.querySelector('#close-volume-panel');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      volumePanel.classList.remove('visible');
      setTimeout(() => {
        volumePanel.style.display = 'none';
      }, 350);
    });
  }
  
  // Setup volume slider
  const browserVolumeSlider = volumePanel.querySelector('#browser-volume-slider');
  if (browserVolumeSlider) {
    browserVolumeSlider.addEventListener('input', (e) => {
      const value = parseInt(e.target.value, 10);
      const icon = volumeBtn.querySelector('i');
      if (value === 0) {
        isMuted = true;
        if (icon) {
          icon.classList.remove('fa-volume-up');
          icon.classList.add('fa-volume-mute');
        }
      } else {
        if (isMuted) {
          // Only update previousVolume if coming from muted state
          previousVolume = value;
        }
        isMuted = false;
        if (icon) {
          icon.classList.remove('fa-volume-mute');
          icon.classList.add('fa-volume-up');
        }
      }
    });

    // Playlist panel logic
    const musicPanel = volumePanel.querySelector('.music-panel-box');
    const playlistBtn = musicPanel ? musicPanel.querySelector('.music-btn[title="Playlist"]') : null;
    let playlistPanel = null;
    if (playlistBtn && musicPanel) {
      playlistBtn.addEventListener('click', () => {
        if (!playlistPanel) {
          // Create the playlist panel
          playlistPanel = document.createElement('div');
          playlistPanel.className = 'music-panel-box playlist-panel-slide';
          playlistPanel.style.position = 'absolute';
          playlistPanel.style.left = '0';
          playlistPanel.style.right = '0';
          playlistPanel.style.bottom = '100%';
          playlistPanel.style.margin = '0 auto 28px auto';
          playlistPanel.style.transition = 'transform 0.35s cubic-bezier(0.4,0,0.2,1)';
          playlistPanel.style.transform = 'translateY(100%)';
          playlistPanel.innerHTML = '<div style="padding: 18px 18px 10px 18px; color: #fff; font-size: 1.1rem; font-weight: 600;">Playlist (placeholder)</div>';
          musicPanel.style.position = 'relative';
          musicPanel.parentNode.insertBefore(playlistPanel, musicPanel);
          // Animate in
          setTimeout(() => {
            playlistPanel.style.transform = 'translateY(0)';
          }, 10);
        } else {
          // Animate out and remove
          playlistPanel.style.transform = 'translateY(100%)';
          setTimeout(() => {
            if (playlistPanel && playlistPanel.parentNode) {
              playlistPanel.parentNode.removeChild(playlistPanel);
              playlistPanel = null;
            }
          }, 350);
        }
      });
    }
  }
  
  // Close panel when clicking outside
  document.addEventListener('click', (e) => {
    if (volumePanel.classList.contains('visible') && 
        !volumePanel.contains(e.target) && 
        !volumeBtn.contains(e.target)) {
      volumePanel.classList.remove('visible');
      setTimeout(() => {
        volumePanel.style.display = 'none';
      }, 350);
    }
  });
}



// Volume Panel: Live percentage and volume control
function setupVolumePanel() {
  const volumeSlider = document.getElementById('browser-volume-slider');
  const volumePercent = document.getElementById('volume-percentage');
  // Try to find a global <audio> element (if you have one)
  const audio = document.querySelector('audio');

  if (volumeSlider && volumePercent) {
    const updateVolume = () => {
      const value = parseInt(volumeSlider.value, 10);
      volumePercent.textContent = value + '%';
      if (audio) {
        audio.volume = value / 100;
      }
    };
    volumeSlider.addEventListener('input', updateVolume);
    // Set initial value
    updateVolume();
  }
}

document.addEventListener('DOMContentLoaded', function() {
  // ... existing code ...
  setupVolumePanel();
  setNotificationsBtnOpacity();
});
// ... existing code ...




// --- Wallet Sidebar Toggle Logic ---
(function() {
  const walletBtn = document.getElementById('wallet-btn');
  const walletSidebar = document.getElementById('wallet-sidebar');
  const walletCloseBtn = walletSidebar ? walletSidebar.querySelector('.wallet-close-btn') : null;
  let walletVisible = false;

  // --- Wallet display mode state ---
  window.walletDisplayMode = window.walletDisplayMode || 'icon';
  window.walletAccountBalance = '$ 254.00';

  function updateWalletBtnDisplay() {
    if (!walletBtn) return;
    if (window.walletDisplayMode === 'icon') {
      walletBtn.innerHTML = '<i class="fas fa-wallet"></i>';
    } else if (window.walletDisplayMode === 'balance') {
      walletBtn.innerHTML = `<span style="font-weight:600;font-size:15px;">${window.walletAccountBalance}</span>`;
    }
  }

  function showWalletSidebar() {
    if (!walletSidebar) return;
    walletSidebar.style.display = 'flex';
    setTimeout(() => walletSidebar.classList.add('wallet-sidebar-visible'), 10);
    walletVisible = true;
  }
  function hideWalletSidebar() {
    if (!walletSidebar) return;
    walletSidebar.classList.remove('wallet-sidebar-visible');
    // Remove any previous transitionend handlers to avoid duplicates
    walletSidebar.removeEventListener('transitionend', walletSidebar._onTransitionEnd);
    walletSidebar._onTransitionEnd = function(e) {
      if (e.propertyName === 'transform' && !walletSidebar.classList.contains('wallet-sidebar-visible')) {
        walletSidebar.style.display = 'none';
        walletSidebar.removeEventListener('transitionend', walletSidebar._onTransitionEnd);
      }
    };
    walletSidebar.addEventListener('transitionend', walletSidebar._onTransitionEnd);
    walletVisible = false;
  }

  document.addEventListener('DOMContentLoaded', function() {
    updateWalletBtnDisplay();
    if (walletBtn && walletSidebar) {
      walletBtn.addEventListener('click', function() {
        if (window.innerWidth <= 1023) return;
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
        if (!walletVisible) {
          showWalletSidebar();
        } else {
          hideWalletSidebar();
        }
      });
    }
    if (walletCloseBtn) {
      walletCloseBtn.addEventListener('click', function() {
        if (!walletVisible) return;
        hideWalletSidebar();
      });
    }
    document.addEventListener('mousedown', function(e) {
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
  toggle.addEventListener('change', function() {
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


document.addEventListener('keydown', function(e) {
  const active = document.activeElement;
  if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable)) return;
  if (e.key === 'n' || e.key === 'N') {
    const notificationsPanel = document.getElementById('notifications-panel');
    if (!notificationsPanel) return;
    
    // Get or create the Today section
    let todaySection = notificationsPanel.querySelector('.notifications-panel-content');
    if (!todaySection) {
      todaySection = document.createElement('div');
      todaySection.className = 'notifications-panel-content';
      notificationsPanel.appendChild(todaySection);
    }
    
    // Check if we need to create the header
    if (!todaySection.querySelector('.notif-header-row')) {
      const headerRow = document.createElement('div');
      headerRow.className = 'notif-header-row';
      headerRow.innerHTML = `
        <span class="notif-title">Notifications</span>
        <div class="notif-tabs">
          <button class="notif-tab notif-tab-active">All</button>
          <button class="notif-tab">Unread</button>
        </div>
      `;
      todaySection.insertBefore(headerRow, todaySection.firstChild);
    }
    
    // Check if we need to create the Today section label and list
    let todayList = todaySection.querySelector('.notif-list');
    if (!todayList) {
      // Remove any "no notifications" message if it exists
      const emptyMsg = todaySection.querySelector('.no-notifications-msg');
      if (emptyMsg) emptyMsg.remove();
      setNotificationsBtnOpacity();

      
      // Add the Today section label
      const sectionLabel = document.createElement('div');
      sectionLabel.className = 'notif-section-label';
      sectionLabel.innerHTML = 'Today <span class="notif-clear">Clear all</span>';
      todaySection.appendChild(sectionLabel);
      
      // Add the notification list
      todayList = document.createElement('div');
      todayList.className = 'notif-list';
      todaySection.appendChild(todayList);
    }
    
    // Create and add the new notification
    const card = document.createElement('div');
    card.className = 'notif-card unread';
    card.style.transform = 'translateX(120%)';
    card.style.opacity = '0';
    card.innerHTML = `
      <button class="notif-delete-btn" title="Delete notification">&times;</button>
      <div class="notif-icon-bg notif-bg-blue"><i class="fas fa-shopping-cart"></i></div>
      <div class="notif-content">
        <div class="notif-main-row">
          <span class="notif-main-title">New incoming notification</span>
          <span class="notif-dot"></span>
        </div>
        <div class="notif-desc">This is a test notification</div>
        <div class="notif-meta">now</div>
      </div>
      <img class="notif-avatar" src="img/avatar.png" />
    `;
    
    todayList.insertBefore(card, todayList.firstChild);
    
    // Animate the card in
    requestAnimationFrame(() => {
      card.style.transition = 'all 0.3s ease-out';
      card.style.transform = 'translateX(0)';
      card.style.opacity = '1';
      updateNotificationsBadge();
    });
    
    // Enable swipe-to-delete for the new card
    if (typeof enableNotificationSwipeToDelete === 'function') {
      enableNotificationSwipeToDelete();
    }
    
    // Show toast if panel is closed
    if (notificationsPanel.style.display !== 'flex') {
      showToastNotification();
    }
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
  console.log('contextmenu event:', event.target, event.target.className, event.target.tagName);
  // Allow custom right-click on notification bell
  const bell = document.getElementById('notifications-btn');
  if (bell && (event.target === bell || bell.contains(event.target))) {
    // Let the bell's own handler run, do NOT preventDefault here
    return;
  }
  event.preventDefault(); // This disables the browser's context menu elsewhere
});

document.addEventListener('DOMContentLoaded', function() {

  // DOM Elements
  const startButton = document.getElementById('start-button');
  const startMenu = document.getElementById('start-menu');
  const desktopIcons = document.querySelectorAll('.desktop-icon');
  const windowsContainer = document.getElementById('windows-container');
  const currentTimeEl = document.getElementById('current-time');
  const taskbarAppIconsContainer = document.getElementById('taskbar-app-icons');
  const startMenuLeftPanel = document.querySelector('.start-menu-left-panel');
  const startMenuSearchTop = document.getElementById('start-menu-search-top');
  const startMenuSearchBottom = document.getElementById('start-menu-search-bottom');
  const contextMenu = document.getElementById('context-menu');
  const dragSelector = document.getElementById('drag-selector');
  const desktopArea = document.getElementById('desktop-area'); 
  const desktopIconsContainer = document.querySelector('.desktop-icons');
  

  
  // Templates
  const fileExplorerTemplate = document.getElementById('file-explorer-template');
  
  // State
  let activeWindow = null;
  let windowZIndex = 100;
  let openWindows = {};
  let windowIdCounter = 0;
  let currentContextMenuTarget = null;
  let selectedDesktopIcons = new Set();
  let isDraggingSelector = false;
  let dragSelectorStartX, dragSelectorStartY;
  let isDraggingFileSelector = false;
  let fileSelectorStartX, fileSelectorStartY;
  let fileExplorerContentArea = null;
  let currentSelectedFileItems = new Set();
  
  const GRID_CELL_WIDTH = 80;
  const GRID_CELL_HEIGHT = 100;
  const GRID_GAP = 20;
  
  let draggedIcon = null;
  let isActuallyDraggingIcon = false;
  let dragStartMouseX, dragStartMouseY;
  let dragOffsetX, dragOffsetY;
  const DRAG_THRESHOLD = 5;
  let originalIconTransition = ''; // Variable to store original transition
  const MOBILE_BREAKPOINT = 1023; // Max width for tablet/mobile behavior

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
    desktopIcons.forEach(icon => {
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
    if (!desktopIconsContainer) {
      console.error('[GridInit] .desktop-icons container not found! Return early.');
      return;
    }
    if (!desktopIcons || desktopIcons.length === 0) {
      console.warn('[GridInit] No desktopIcons found to initialize. Return early.');
      return;
    }
    console.log('[GridInit] Initializing desktop icon positions...');
    try {
      const containerWidth = desktopIconsContainer.clientWidth - (GRID_GAP);
      const maxCols = Math.max(1, Math.floor(containerWidth / (GRID_CELL_WIDTH + GRID_GAP)));
      const occupied = {};
      desktopIcons.forEach((icon, index) => {
        let col = index % maxCols;
        let row = Math.floor(index / maxCols);
        // Find next available slot
        while (occupied[`${col},${row}`]) {
          col++;
          if (col >= maxCols) {
            col = 0;
            row++;
          }
        }
        const iconLeft = GRID_GAP + col * (GRID_CELL_WIDTH + GRID_GAP);
        const iconTop = GRID_GAP + row * (GRID_CELL_HEIGHT + GRID_GAP);
        icon.style.position = 'absolute';
        icon.style.left = iconLeft + 'px';
        icon.style.top = iconTop + 'px';
        icon.dataset.homeLeft = String(iconLeft);
        icon.dataset.homeTop = String(iconTop);
        occupied[`${col},${row}`] = true;
      });
    } catch (mainError) {
      console.error('[GridInit] CRITICAL ERROR during main part of initializeDesktopIconPositions:', mainError);
    }
  }

  const startMenuApps = [
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
    { id: 'app-launcher', name: 'App launcher', iconClass: 'fa-th', iconBgClass: 'blue-icon', iconBgMenuClass: 'blue-bg', category: 'SYSTEM APPS' }
  ];
  
  function updateCurrentTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    if(currentTimeEl) currentTimeEl.textContent = `${hours}:${minutes}`;
  }
  
  if(startButton && startMenu) {
    startButton.addEventListener('click', function() {
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
  
  document.addEventListener('click', function(e) {
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
  
  if (desktopIcons.length > 0) {
    desktopIcons.forEach(icon => {
      // Function to handle app opening
      const openAppFromIcon = function(e) {
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
      icon.addEventListener('dblclick', function(e) {
        if (window.innerWidth > MOBILE_BREAKPOINT) {
          openAppFromIcon.call(this, e);
        }
      });

      // Mobile: Single tap to open
      icon.addEventListener('click', function(e) {
        if (window.innerWidth <= MOBILE_BREAKPOINT) {
          openAppFromIcon.call(this, e);
        }
      });

      icon.addEventListener('mousedown', function(e) {
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
    });
  } else {
    console.warn('[Init] No desktop icons found to attach listeners.');
  }

  document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', function() {
      const span = this.querySelector('span');
      if (!span) {
        const itemName = this.textContent.trim();
        if (itemName === 'WEBSITE') { /* ... */ }
        else if (itemName === 'SETTINGS') { openApp('settings', 'Settings', 'fa-cog', 'green'); }
        if(startMenu) startMenu.style.display = 'none';
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
        if(startMenu) startMenu.style.display = 'none';
      }
    });
  });

  function getAppIconDetails(appName) {
    let iconClass = 'fa-window-maximize'; 
    let iconBgClass = 'gray-icon'; 
    const desktopIcon = document.querySelector(`.desktop-icon[data-app="${appName}"]`);
    if (desktopIcon) {
        const iElem = desktopIcon.querySelector('i');
        const cElem = desktopIcon.querySelector('.icon-container');
        if(iElem) iconClass = iElem.className.split(' ').find(cls => cls.startsWith('fa-')) || iconClass;
        if(cElem) iconBgClass = cElem.className.split(' ').find(cls => cls.endsWith('-icon')) || iconBgClass;
    }
    return { iconClass, iconBgClass };
  }

  function openApp(appName, appTitle, iconClassFromClick, iconBgClassFromClick, iconElementForAnim) {
    // Allow multiple windows only for 'my-files'
    if (appName !== 'my-files') {
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
    windowIdCounter++;
    const windowId = `window-${windowIdCounter}`;
    let windowElement = null;
    let isFileExplorer = false;
    let delayedContentLoader = null;
    const appDetails = getAppIconDetails(appName);
    const finalIconClass = iconClassFromClick || appDetails.iconClass;
    const finalIconBgClass = iconBgClassFromClick || appDetails.iconBgClass;

    // --- Use the passed icon element for animation if available ---
    let iconRect = null;
    if (iconElementForAnim && iconElementForAnim.getBoundingClientRect) {
      iconRect = iconElementForAnim.getBoundingClientRect();
    } else {
      const desktopIcon = document.querySelector(`.desktop-icon[data-app="${appName}"]`);
      if (desktopIcon) {
        iconRect = desktopIcon.getBoundingClientRect();
      }
    }

    // --- Prepare window shell only, delay content ---
    switch(appName) {
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
      openWindows[windowId] = { element: windowElement, taskbarIcon: taskbarIcon, name: appName, title: appTitle };
      makeWindowActive(windowElement);
      // Do not call setupFileExplorerInteraction or other content loaders here!
    } 
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
      closeButton.addEventListener('click', function(e) { 
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
            // Remove taskbar icon
            if (currentTaskbarIcon && currentTaskbarIcon.parentNode) currentTaskbarIcon.parentNode.removeChild(currentTaskbarIcon);
            // Remove window from openWindows
            delete openWindows[windowId];
            windowElement.remove();
            if (activeWindow === windowElement) activeWindow = null;
            updateTaskbarActiveState(); 
            windowElement._isClosing = false;
          }
        }, { once: true });
        // ---
      });
    }
    if (minimizeButton) {
      minimizeButton.addEventListener('click', function(e) { 
        e.stopPropagation(); 
        const currentTaskbarIcon = openWindows[windowId] ? openWindows[windowId].taskbarIcon : null;
        animateWindowToTaskbar(windowElement, currentTaskbarIcon, function() {
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
        });
      });
    }    
    if (maximizeButton) {
      maximizeButton.addEventListener('click', function(e) {
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
            if (["width","height","left","top"].includes(ev.propertyName)) {
              windowElement.style.transition = '';
              windowElement.removeEventListener('transitionend', handler);
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
            if (["width","height","left","top"].includes(ev.propertyName)) {
              windowElement.classList.add('maximized');
              windowElement.style.transition = '';
              windowElement.removeEventListener('transitionend', handler);
            }
          });
          maximizeButton.classList.add('window-restore');
          if (header) {
            header.onmousedown = null;
            header.style.cursor = 'default';
          }
          makeWindowActive(windowElement);
        }
      });
    } 
    // Add double-click to header to toggle maximize/restore
    if (maximizeButton && header) {
      header.addEventListener('dblclick', function(e) {
        if (window.innerWidth <= MOBILE_BREAKPOINT) return; // No maximize on mobile
        maximizeButton.click();
      });
    }
    // Pop-out button logic
    const popoutButton = windowElement.querySelector('.window-popout');
    if (popoutButton) {
      popoutButton.addEventListener('click', function(e) {
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
          } catch (e) {}
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
          logOutButton.addEventListener('click', () => {
            if(startMenu) startMenu.style.display = 'none';
            // Set a global flag to indicate logout in progress
            window._loggingOut = true;
            // Close all popout windows
            if (window._allPopoutWindows && Array.isArray(window._allPopoutWindows)) {
              window._allPopoutWindows = window._allPopoutWindows.filter(win => {
                if (win && !win.closed) {
                  try { win.close(); } catch (e) {}
                  return false;
                }
                return false;
              });
            }
            // Optionally, clear the flag after a short delay
            setTimeout(() => { window._loggingOut = false; }, 2000);
          });
        }
        // ... existing code ...
      });
    }
    windowElement.addEventListener('mousedown', function(e) {
      // Only activate if not clicking a control button
      if (e.target.closest('.window-controls button') || e.target.closest('.window-control-btn')) return;
      makeWindowActive(windowElement);
    });
  }

  // Helper to re-attach drag handler after restore
  function dragMouseDownWrapper(windowElement) {
    return function(e) {
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
        animateWindowFromTaskbar(windowElement, taskbarIcon, function() {
        });
    } else {
        // --- Animate minimize to taskbar ---
        animateWindowToTaskbar(windowElement, taskbarIcon, function() {
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
          if (["width","height","left","top"].includes(ev.propertyName)) {
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
    iconEl.setAttribute('data-window-id', windowId);
    iconEl.setAttribute('title', appTitle || appName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()));
    iconEl.innerHTML = `<div class="icon-container ${iconBgClass}"><i class="fas ${iconClass}"></i></div>`;
    iconEl.addEventListener('click', function() {
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
    taskbarAppIconsContainer.appendChild(iconEl);
    return iconEl;
  }

  function populateStartMenuApps() {
    if (!startMenuLeftPanel) return;
    const existingSections = startMenuLeftPanel.querySelectorAll('.app-grid-section');
    existingSections.forEach(section => section.remove());
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
          appItem.setAttribute('data-app-id', app.id);
          appItem.setAttribute('data-app-name', app.name.toLowerCase()); 
          appItem.innerHTML = `
            <div class="app-icon-bg ${app.iconBgMenuClass}">
              <i class="fas ${app.iconClass}"></i>
            </div>
            <span>${app.name}</span>
          `;
          // Function to handle app opening
          const openStartMenuApp = (e) => {
            openApp(app.id, app.name, app.iconClass, app.iconBgClass, appItem);
            if(startMenu) startMenu.style.display = 'none';
          };

          // Use click event for both mobile and desktop
          appItem.addEventListener('click', openStartMenuApp);

          appGrid.appendChild(appItem);
        });
        appGridSection.appendChild(appGrid);
        startMenuLeftPanel.appendChild(appGridSection);
      }
    }
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
          appItem.getAttribute('data-app-id') || appItem.getAttribute('data-app-name'),
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

  if (startMenuSearchTop) {
    startMenuSearchTop.addEventListener('input', (e) => {
      filterStartMenuApps(e.target.value);
      if(startMenuSearchBottom) startMenuSearchBottom.value = e.target.value;
    });
  }
  if (startMenuSearchBottom) {
    startMenuSearchBottom.addEventListener('input', (e) => {
      filterStartMenuApps(e.target.value);
      if(startMenuSearchTop) startMenuSearchTop.value = e.target.value;
    });
  }

  const logOutButton = document.querySelector('.start-menu-logout-button') || document.querySelector('.logout-button');
  if (logOutButton) {
    logOutButton.addEventListener('click', () => {
      if(startMenu) startMenu.style.display = 'none';
      // Set a global flag to indicate logout in progress
      window._loggingOut = true;
      // Close all popout windows
      if (window._allPopoutWindows && Array.isArray(window._allPopoutWindows)) {
        window._allPopoutWindows = window._allPopoutWindows.filter(win => {
          if (win && !win.closed) {
            try { win.close(); } catch (e) {}
            return false;
          }
          return false;
        });
      }
      // Optionally, clear the flag after a short delay
      setTimeout(() => { window._loggingOut = false; }, 2000);
    });
  }
  
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
      link.addEventListener('click', function(e) {
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
        appearanceOptionsContainer.addEventListener('click', function(e) {
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
        swatch.addEventListener('click', function() {
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
        popoutCloseDropdown.addEventListener('change', function() {
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
        btn.addEventListener('click', function() {
          const section = this.getAttribute('data-section');
          let label = this.childNodes[1] ? this.childNodes[1].textContent.trim() : this.textContent.trim();
          showPanel(section, label);
        });
      });
      // Back button in window header (mobile only)
      headerBackBtn.addEventListener('click', function() {
        if (isMobile()) {
          mobileContainer.classList.remove('show-panel');
          windowEl.classList.remove('show-panel');
          windowTitle.classList.remove('show-detail');
        }
      });
      // Responsive: reset panel on resize
      window.addEventListener('resize', function() {
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
        switch(op) {
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
        multiDragInitialPositions.forEach(({icon, left, top}) => {
          icon.style.position = 'absolute';
          icon.style.left = `${left + dx}px`;
          icon.style.top = `${top + dy}px`;
          icon.style.transition = 'none';
          icon.style.zIndex = '15';
        });
      } else {
        // Single icon: let it follow the mouse freely
        const containerRect = desktopIconsContainer.getBoundingClientRect();
        let newLeft = e.clientX - containerRect.left - dragOffsetX + desktopIconsContainer.scrollLeft;
        let newTop = e.clientY - containerRect.top - dragOffsetY + desktopIconsContainer.scrollTop;
        draggedIcon.style.left = `${newLeft}px`;
        draggedIcon.style.top = `${newTop}px`;
      }
    }
  }

  function globalOnIconMouseUp(e) {
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
        desktopIcons.forEach(icon => {
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
        multiDragInitialPositions.forEach(({icon, left, top}, idx) => {
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
          newPositions.push({icon, targetColumn, targetRow});
        });
        if (!valid) {
          // Snap all to original positions
          if (multiDragOriginalPositions) {
            multiDragOriginalPositions.forEach(({icon, left, top}) => {
              icon.style.left = left;
              icon.style.top = top;
              icon.style.transition = originalIconTransition || '';
              icon.style.zIndex = '';
              icon.style.cursor = '';
            });
          }
        } else {
          // Commit all new positions
          newPositions.forEach(({icon, targetColumn, targetRow}) => {
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
        desktopIcons.forEach(icon => {
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
        // Allow both left and right click to start drag selector
        if (e.button !== 0 && e.button !== 2) return;
        // Prevent drag selector in settings app
        if (e.target.closest('.settings-app-window')) return;
        if (e.target.closest('.desktop-icon') || 
            e.target.closest('.window') || 
            e.target.closest('.taskbar') || 
            e.target.closest('.start-menu') || 
            e.target.closest('.sidebar-widgets')) {
            if (e.target.closest('.desktop-icon') && !e.target.closest('.desktop-icon.selected')){
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
                if(desktopArea) desktopArea.appendChild(dragSelector);
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
      item.addEventListener('dblclick', function() { /* ... */ });
      item.addEventListener('mousedown', function(e) {
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
        if (e.target.closest('.file-item')) return; 
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
                    if(desktopArea) desktopArea.appendChild(dragSelector);
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
    if(contextMenu) contextMenu.classList.add('hidden');
  }

  //Arg Right Click menu for desktop, file explorer, and taskbar and icons

  // --- Global Context Menu for Text Selection (works everywhere except desktop, file explorer, taskbar) ---
(function() {
  // Save original executeContextMenuAction
  const _originalExecuteContextMenuAction = executeContextMenuAction;
  // Patch global contextmenu
  document.addEventListener('contextmenu', function(e) {
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
  window.executeContextMenuAction = async function(action) {
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
      switch(action) {
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
          // Show/hide the music player inside the volume panel
          const volumePanel = document.getElementById('volume-panel');
          if (volumePanel) {
            const musicPanel = volumePanel.querySelector('.music-panel-box');
            if (musicPanel) {
              if (musicPanel.style.display === 'none') {
                musicPanel.style.display = '';
              } else {
                musicPanel.style.display = 'none';
              }
            }
          }
          break;
        }
        case 'taskbar-mute': {
          // Toggle mute state
          const volumeBtn = document.getElementById('volume-btn');
          if (volumeBtn) {
            const icon = volumeBtn.querySelector('i');
            const volumeSlider = document.getElementById('browser-volume-slider');
            if (!isMuted) {
              // Muting
              if (volumeSlider) {
                previousVolume = volumeSlider.value;
                volumeSlider.value = 0;
                // Trigger input event to update UI/volume
                volumeSlider.dispatchEvent(new Event('input', { bubbles: true }));
              }
              if (icon) {
                icon.classList.remove('fa-volume-up');
                icon.classList.add('fa-volume-mute');
              }
              isMuted = true;
            } else {
              // Unmuting
              if (volumeSlider) {
                volumeSlider.value = previousVolume;
                volumeSlider.dispatchEvent(new Event('input', { bubbles: true }));
              }
              if (icon) {
                icon.classList.remove('fa-volume-mute');
                icon.classList.add('fa-volume-up');
              }
              isMuted = false;
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
          // Remove all notification cards from the panel
          const notificationsPanel = document.getElementById('notifications-panel');
          if (notificationsPanel) {
            const notifPanelContent = notificationsPanel.querySelector('.notifications-panel-content');
            if (notifPanelContent) {
              notifPanelContent.querySelectorAll('.notif-card').forEach(card => card.remove());
              notifPanelContent.querySelectorAll('.notif-section-label').forEach(label => label.remove());
              notifPanelContent.querySelectorAll('.notif-list').forEach(list => list.remove());
              // Show empty state
              const headerRow = notifPanelContent.querySelector('.notif-header-row');
              const tempHeader = headerRow ? headerRow.cloneNode(true) : null;
              notifPanelContent.innerHTML = '';
              if (tempHeader) notifPanelContent.appendChild(tempHeader);
              const emptyMsg = document.createElement('div');
              emptyMsg.className = 'no-notifications-msg';
              emptyMsg.textContent = 'No new notifications';
              emptyMsg.style.cssText = 'display: flex; align-items: center; justify-content: center; height: 100%; color: #888; font-size: 1.15rem; font-weight: 500; text-align: center; margin-top: 60px;';
              notifPanelContent.appendChild(emptyMsg);
              setNotificationsBtnOpacity();
              updateNotificationsBadge();
            }
          }
          // Remove all desktop toast notifications
          const toastContainer = document.getElementById('os-toast-container');
          if (toastContainer) {
            Array.from(toastContainer.children).forEach(child => child.remove());
          }
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
    desktopArea.addEventListener('contextmenu', function(e) {
      // Skip if right-clicking the search input
      if (e.target.classList && e.target.classList.contains('search-input')) return;
      e.preventDefault();
      hideContextMenu(); // Hide any previous before showing new
      currentContextMenuTarget = e.target;
      const menuItems = [];
      if (e.target.closest('.taskbar .taskbar-app-icon.minimized')) {
        currentContextMenuTarget = e.target.closest('.taskbar-app-icon.minimized');
        menuItems.push({ label: 'Open', action: 'open-taskbar-icon', icon: 'fa-folder-open'});
        menuItems.push({ label: 'Pin To Taskbar', action: 'pin-to-taskbar', icon: 'fa-thumbtack' }); 
        menuItems.push({ type: 'separator' });
        menuItems.push({ label: 'Close Window', action: 'close-app', icon: 'fa-xmark'});
      } else if (e.target.closest('.trash-item ')) {
        currentContextMenuTarget = e.target.closest('.trash-item');
        menuItems.push({ label: 'Open', action: 'open-file', icon: 'fa-folder-open'});
        menuItems.push({ label: 'Open in new window', action: 'open-in-new-window', icon: 'fa-window-restore'});
        menuItems.push({ type: 'separator' });
        menuItems.push({ label: 'Empty Trash', action: 'empty-trash', icon: 'fa-trash-alt'});
        menuItems.push({ type: 'separator' });
        menuItems.push({ label: 'Get info', action: 'get-info', icon: 'fa-info-circle'});
      } else if (e.target.closest('.taskbar .taskbar-app-icon')) {
        currentContextMenuTarget = e.target.closest('.taskbar-app-icon');
        menuItems.push({ label: 'Minimize Window', action: 'minimize-app', icon: 'fa-window-minimize'});
        menuItems.push({ label: 'Pin To Taskbar', action: 'pin-to-taskbar', icon: 'fa-thumbtack' }); 
        menuItems.push({ type: 'separator' });
        menuItems.push({ label: 'Close Window', action: 'close-app', icon: 'fa-xmark'});
        } else if (e.target.closest('.taskbar .taskbar-app-icons')) {
          currentContextMenuTarget = e.target.closest('.taskbar-app-icons');
          menuItems.push({ label: 'Show search bar', action: 'show-search-taskbar', icon: 'fa-search'});
          menuItems.push({ label: 'Customize Widgets', action: 'customize-widgets', icon: 'fa-server' });
          menuItems.push({ label: 'Show desktop', action: 'show-desktop', icon: 'fa-display' });
          menuItems.push({ type: 'separator' });
          menuItems.push({ label: 'Customize Taskbar', action: 'customize-taskbar', icon: 'fa-cog' });
        } else if (e.target.closest('.desktop-icon')) {
          currentContextMenuTarget = e.target.closest('.desktop-icon');
          menuItems.push({ label: 'Open', action: 'open-app', icon: 'fa-folder-open' });
          menuItems.push({ label: 'Pin To Taskbar', action: 'pin-to-taskbar', icon: 'fa-thumbtack' }); 
          menuItems.push({ type: 'separator' });
          menuItems.push({ label: 'Delete', action: 'delete-icon', icon: 'fa-trash' });
        } else if (e.target.closest('.start-button')) {
          currentContextMenuTarget = e.target.closest('.start-button');
          menuItems.push({ label: 'My Profile', action: 'my-profile-settings', icon: 'fa-folder-open' });
          menuItems.push({ label: 'Appearance', action: 'appearance-settings', icon: 'fa-thumbtack' });
          menuItems.push({ label: 'Notifications', action: 'notifications-settings', icon: 'fa-bell' });
          menuItems.push({ label: 'Privacy', action: 'privacy-settings', icon: 'fa-user-secret' });
          menuItems.push({ label: 'Security', action: 'security-settings', icon: 'fa-shield-alt' });
          menuItems.push({ label: 'Integrations', action: 'integrations-settings', icon: 'fa-hdd' });
          menuItems.push({ label: 'Active Services', action: 'active-services', icon: 'fa-info-circle' });
          menuItems.push({ type: 'separator' });
          menuItems.push({ label: 'My Website', action: 'my-website', icon: 'fa-globe' });
          menuItems.push({ label: 'Products', action: 'products-settings', icon: 'fa-folder-open' });
          menuItems.push({ label: 'Payments', action: 'payments-settings', icon: 'fa-folder-open' });
          menuItems.push({ label: 'Shipping', action: 'shipping-settings', icon: 'fa-folder-open' });
          menuItems.push({ label: 'Customers & Privacy', action: 'customers-privacy-settings', icon: 'fa-folder-open' });
          menuItems.push({ label: 'Emails', action: 'emails-settings', icon: 'fa-folder-open' });
          menuItems.push({ label: 'Billing', action: 'billing-settings', icon: 'fa-folder-open' });
          menuItems.push({ type: 'separator' });
          menuItems.push({ label: 'Open Settings', action: 'open-settings', icon: 'fa-cog' });
        } else if (e.target.closest('.file-explorer-content .file-item')) {
          currentContextMenuTarget = e.target.closest('.file-item');
          menuItems.push({ label: 'Open', action: 'open-file', icon: 'fa-folder-open'});
          menuItems.push({ label: 'Open in new window', action: 'open-in-new-window', icon: 'fa-window-restore'});
          menuItems.push({ label: 'Download', action: 'download', icon: 'fa-download'});
        menuItems.push({ label: 'Preview', action: 'preview', icon: 'fa-eye'});
        menuItems.push({ label: 'Upload files in this folder', action: 'upload-files', icon: 'fa-upload'});
        menuItems.push({ type: 'separator' });
        menuItems.push({ label: 'Copy', action: 'copy-file', icon: 'fa-copy'});
        menuItems.push({ label: 'Cut', action: 'cut-file', icon: 'fa-scissors'});
        menuItems.push({ label: 'Duplicate', action: 'duplicate-file', icon: 'fa-clone'});
        menuItems.push({ label: 'Move Into New Folder', action: 'into-new-folder', icon: 'fa-folder-plus'});
        menuItems.push({ type: 'separator' });
        menuItems.push({ label: 'Delete file', action: 'into-trash', icon: 'fa-trash'});
        menuItems.push({ label: 'Rename', action: 'rename', icon: 'fa-i-cursor'});
        menuItems.push({ label: 'Create archive', action: 'create-archive', icon: 'fa-file-archive', subItems: [
          { label: 'ZIP', action: 'archive-zip', icon: 'fa-file-archive' },
          { label: 'TAR', action: 'archive-tar', icon: 'fa-file-archive' }
        ]});
        menuItems.push({ type: 'separator' });
        menuItems.push({ label: 'Share with...', action: 'share-with-others', icon: 'fa-random'});
        menuItems.push({ type: 'separator' });
        menuItems.push({ label: 'Add to Favorites', action: 'add-folder-to-favorites', icon: 'fa-share-square'});
        menuItems.push({ label: 'Get info', action: 'get-info', icon: 'fa-info-circle'});
      } else if (e.target.closest('.file-explorer-sidebar .sidebar-section.drives-section .sidebar-item ')) {
        currentContextMenuTarget = e.target.closest('.sidebar-item');
        menuItems.push({ label: 'Open', action: 'open-file', icon: 'fa-folder-open'});
        menuItems.push({ label: 'Open in new window', action: 'open-in-new-window', icon: 'fa-window-restore'});
        menuItems.push({ type: 'separator' });
        menuItems.push({ label: 'Connect / Disconnect', action: 'connect-disconnect', icon: 'fa-info-circle'});
      } else if (e.target.closest('.file-explorer-sidebar .sidebar-section.shared-section .sidebar-item ')) {
        currentContextMenuTarget = e.target.closest('.sidebar-item');
        menuItems.push({ label: 'Open', action: 'open-file', icon: 'fa-folder-open'});
        menuItems.push({ label: 'Open in new window', action: 'open-in-new-window', icon: 'fa-window-restore'});
        menuItems.push({ type: 'separator' });
        menuItems.push({ label: 'Get info', action: 'get-info', icon: 'fa-info-circle'});
      } else if (e.target.closest('.file-explorer-sidebar .sidebar-section .sidebar-item ')) {
        currentContextMenuTarget = e.target.closest('.sidebar-item');
        menuItems.push({ label: 'Open', action: 'open-file', icon: 'fa-folder-open'});
        menuItems.push({ label: 'Open in new window', action: 'open-in-new-window', icon: 'fa-window-restore'});
        menuItems.push({ type: 'separator' });
        menuItems.push({ label: 'Get info', action: 'get-info', icon: 'fa-info-circle'});

      } else if (e.target.closest('.file-explorer-content .file-explorer-elements')) {
        currentContextMenuTarget = e.target.closest('.file-explorer-elements');
        menuItems.push({ label: 'View', action: 'list-view', icon: 'fa-eye', subItems: [
          { label: 'Icons', action: 'view-icons', icon: 'fa-th-large' },
          { label: 'List', action: 'view-list', icon: 'fa-list' }
        ]});
        menuItems.push({ label: 'Sort', action: 'sort', icon: 'fa-sort', subItems: [
          { label: 'Name', action: 'sort-name', icon: 'fa-sort-alpha-down' },
          { label: 'Date', action: 'sort-date', icon: 'fa-calendar-alt' },
          { label: 'Type', action: 'sort-type', icon: 'fa-file' },
          { label: 'Size', action: 'sort-size', icon: 'fa-file' },
          { type: 'separator' },
          { label: 'Permissions', action: 'sort-permissions', icon: 'fa-file' },
          { type: 'separator' },
          { label: 'Folder first', action: 'folder-first', icon: 'fa-file' },
        ]});
        menuItems.push({ label: 'Refresh', action: 'reload', icon: 'fa-rotate-right', checked: true });
        menuItems.push({ type: 'separator' });
        menuItems.push({ label: 'Paste', action: 'paste', icon: 'fa-paste', disabled: true});
        menuItems.push({ label: 'Upload files', action: 'upload-files', icon: 'fa-upload' });
        menuItems.push({ label: 'New folder', action: 'new-folder', icon: 'fa-folder-plus' });
        menuItems.push({ label: 'New file', action: 'new-file', icon: 'fa-file-medical', subItems: [
          { label: 'Text file', action: 'new-text-file', icon: 'fa-file-alt' },
          { label: 'Spreadsheet', action: 'new-spreadsheet', icon: 'fa-file-excel' },
          { label: 'Presentation', action: 'new-presentation', icon: 'fa-file-powerpoint' }
        ]});
       
        menuItems.push({ type: 'separator' });
        menuItems.push({ label: 'Share with...', action: 'share-with-others', icon: 'fa-random'});
        menuItems.push({ type: 'separator' });
        menuItems.push({ label: 'Select all', action: 'select-all', icon: 'fa-check-square' });
        menuItems.push({ label: 'Add folder to Favorites', action: 'add-folder-to-favorites', icon: 'fa-share-square' });
        menuItems.push({ label: 'Preferences', action: 'preferences', icon: 'fa-cog' });
        menuItems.push({ label: 'Get info', action: 'get-info', icon: 'fa-info-circle' });
      } else if (e.target.closest('.taskbar-icon #notifications-btn')) {
        currentContextMenuTarget = e.target.closest('#notifications-btn');
        menuItems.push({ label: 'Clear all notifications', action: 'clear-all-notifications', icon: 'fa-broom'});
        menuItems.push({ type: 'separator' });
        menuItems.push({ label: 'Customize notifications', action: 'customize-notifications', icon: 'fa-gear'});
        menuItems.push({ label: 'Desktop notifications', action: 'new-file', icon: 'fa-comments', subItems: [
          { label: 'Only 1 notification', action: 'show-only-1-notification', icon: 'fa-file-alt' },
          { label: 'Only 3 Notifications', action: 'show-only-3-notifications', icon: 'fa-file-excel' },
          { label: 'All notifications', action: 'show-all-notifications', icon: 'fa-file-powerpoint' }
        ]});
        menuItems.push({ type: 'separator' });
        menuItems.push({ label: isNotificationsMuted ? 'Unmute Notifications' : 'Mute Notifications', action: 'mute-notifications', icon: isNotificationsMuted ? 'fa-bell' : 'fa-bell-slash'});
          } else if (e.target.closest('.taskbar-icon #wallet-btn')) {
            currentContextMenuTarget = e.target.closest('#wallet-btn');
            menuItems.push({ label: 'Open Wallet Panel', action: 'taskbar-open-wallet', icon: 'fa-wallet'});
            menuItems.push({ label: 'Open Wallet App', action: 'taskbar-open-wallet-app', icon: 'fa-money-check-dollar'});
            menuItems.push({ type: 'separator' });
            menuItems.push({ label: 'Display Settings', action: 'new-file', icon: 'fa-comments', subItems: [
              { label: 'Show icon', action: 'show-wallet-icon', icon: 'fa-file-alt', checked: window.walletDisplayMode === 'icon' },
              { label: 'Show account balance', action: 'show-account-balance', icon: 'fa-file-excel', checked: window.walletDisplayMode === 'balance' },
            ]});
          } else if (e.target.closest('.taskbar-right #volume-btn')) {
            currentContextMenuTarget = e.target.closest('#volume-btn');
            menuItems.push({ label: 'Open Volume', action: 'taskbar-open-volume', icon: 'fa-volume-high'});
            menuItems.push({ label: 'Microphone', action: 'taskbar-open-calendar', icon: 'fa-microphone'});
            // Dynamically set Show/Hide music player label
            const volumePanel = document.getElementById('volume-panel');
            let musicPanelVisible = true;
            if (volumePanel) {
              const musicPanel = volumePanel.querySelector('.music-panel-box');
              if (musicPanel && (musicPanel.style.display === 'none' || getComputedStyle(musicPanel).display === 'none')) {
                musicPanelVisible = false;
              }
            }
            menuItems.push({ label: musicPanelVisible ? 'Hide music player' : 'Show music player', action: 'open-music-player', icon: 'fa-music'});
            menuItems.push({ type: 'separator' });
            menuItems.push({ label: 'Open sound settings', action: 'open-sound-settings', icon: 'fa-gear'});
            menuItems.push({ label: isMuted ? 'Unmute' : 'Mute', action: 'taskbar-mute', icon: isMuted ? 'fa-volume-up' : 'fa-volume-mute'});
          } else if (e.target.closest('.taskbar-right .taskbar-time')) {
            currentContextMenuTarget = e.target.closest('.taskbar-time');
            menuItems.push({ label: 'Date and Time Settings', action: 'taskbar-date-time-settings', icon: 'fa-gear'});
            menuItems.push({ type: 'separator' });
            menuItems.push({ label: 'Open Calendar', action: 'taskbar-open-calendar', icon: 'fa-calendar-days'});
            menuItems.push({ label: 'Open Clock', action: 'taskbar-open-clock', icon: 'fa-clock'});
          } else if (e.target.closest('.taskbar-right #ai-chat-btn')) {
            currentContextMenuTarget = e.target.closest('#ai-chat-btn');
            menuItems.push({ label: 'Open AI Chat', action: 'taskbar-open-ai-chat', icon: 'fa-comment-dots'});
            menuItems.push({ label: 'Open New Chat', action: 'taskbar-new-chat', icon: 'fa-plus'});
            menuItems.push({ type: 'separator' });
            menuItems.push({ label: 'Chat Settings', action: 'taskbar-ai-chat-settings', icon: 'fa-gear'});
            menuItems.push({ label: 'Chat history', action: 'taskbar-chat-history', icon: 'fa-history'});
            menuItems.push({ label: 'Clear chat', action: 'taskbar-clear-chat', icon: 'fa-broom'});

          } else if (e.target.closest('.taskbar-right #widgets-toggle-btn')) {
            currentContextMenuTarget = e.target.closest('#widgets-toggle-btn');
            menuItems.push({ label: 'Always show widgets', action: 'always-show-widgets', icon: 'fa-folder-open'});
            menuItems.push({ label: 'Disable widgets', action: 'disable-widgets', icon: 'fa-copy'});
            menuItems.push({ type: 'separator' });
            menuItems.push({ label: 'Customize widgets', action: 'customize-widgets', icon: 'fa-gear'});

          } else if (
            e.target === desktopArea ||
            (e.target.classList && e.target.classList.contains('desktop-icons'))
          ) {
                menuItems.push({ label: 'View', icon: 'fa-eye', subItems: [
              { label: 'Large icons', action: 'view-large' },
              { label: 'Medium icons', action: 'view-medium' },
              { label: 'Small icons', action: 'view-small' },
              { type: 'separator' },
              { label: 'Auto arrange icons', action: 'auto-arrange-icons' },
              { label: 'Align icons to grid', action: 'align-icons-grid' },
              { type: 'separator' },
              { label: 'Hide desktop icons', action: 'show-desktop-icons' }
          ]});
          menuItems.push({ label: 'Sort by', icon: 'fa-sort', subItems: [
            { label: 'Name', action: 'sort-name' },
            { label: 'Date', action: 'sort-date' },
            { label: 'Type', action: 'sort-type' }
                    ]});
                    menuItems.push({ label: 'Refresh', action: 'refresh', icon: 'fa-arrows-rotate' });
          menuItems.push({ type: 'separator' });
          menuItems.push({ label: 'New Folder', action: 'new-folder', icon: 'fa-folder-plus' });
          menuItems.push({ type: 'separator' });
          menuItems.push({ label: 'Personalize', action: 'personalize', icon: 'fa-paint-brush' });
          menuItems.push({ label: 'Display Settings', action: 'display-settings', icon: 'fa-desktop' });
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
        menuItemEl.innerHTML = `<i class=\"fas ${item.icon || 'fa-question-circle'}\"></i><span>${item.label}</span>`;
        if (item.disabled) menuItemEl.classList.add('disabled');
        // Only add .has-submenu and chevron if this is a top-level item with a submenu
        if (Array.isArray(item.subItems) && item.subItems.length > 0) {
          menuItemEl.classList.add('has-submenu');
          const chevron = document.createElement('i');
          chevron.className = 'fas fa-chevron-right context-menu-chevron';
          menuItemEl.appendChild(chevron); // Always last for flex
        }
        menuItemEl.addEventListener('click', async (e) => {
          if (!item.disabled) {
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
          menuItemEl.addEventListener('mouseenter', function(e) {
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
              subItemEl.className = 'context-menu-item';
              // Add check mark if this is the selected notification mode or wallet display mode
              let showCheck = false;
              if (
                (subItem.action === 'show-only-1-notification' && desktopNotificationMode === 'one') ||
                (subItem.action === 'show-only-3-notifications' && desktopNotificationMode === 'three') ||
                (subItem.action === 'show-all-notifications' && desktopNotificationMode === 'all') ||
                (subItem.action === 'show-wallet-icon' && window.walletDisplayMode === 'icon') ||
                (subItem.action === 'show-account-balance' && window.walletDisplayMode === 'balance')
              ) {
                showCheck = true;
              }
              subItemEl.innerHTML = `<span>${subItem.label}</span>` + (showCheck ? '<i class="fas fa-check context-menu-checkmark"></i>' : '');
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
            submenuEl.addEventListener('mouseenter', function() {
              if (submenuHideTimeout) clearTimeout(submenuHideTimeout);
              submenuHideTimeout = null;
            });
          });
          // Remove submenu immediately if mouse leaves both parent and submenu
          menuItemEl.addEventListener('mouseleave', function(e) {
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
    switch(action) {
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
        // Add other actions here
    }
  }

  // Widgets scroll handle logic
  const widgetsScrollHandle = document.getElementById('widgets-scroll-handle');
  const widgetsScreen = document.getElementById('widgets-screen');
  if (widgetsScrollHandle && widgetsScreen) {
    widgetsScrollHandle.addEventListener('wheel', function(e) {
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
    mainContentArea.addEventListener('wheel', function(e) {
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
  document.addEventListener('DOMContentLoaded', function() {
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

    // --- macOS-style search bar ---
    const searchBarContainer = document.createElement('div');
    searchBarContainer.className = 'search-bar-container';
    searchBarContainer.style.width = 'min(90vw, 900px)';
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
    searchInput.placeholder = 'Search';
    searchInput.style.width = '100%';
    searchInput.style.height = '44px';
    searchInput.style.borderRadius = '0px';
    searchInput.style.border = 'none';
    searchInput.style.background = 'transparent';
    searchInput.style.borderBottom = '1px solid rgba(255,255,255,0.1)';
    searchInput.style.color = '#fff';
    searchInput.style.fontSize = '20px';
    searchInput.style.padding = '0 48px 0 20px';
    searchInput.style.outline = 'none';
    //searchInput.style.marginBottom = '24px'; // Remove this line
    searchInput.style.backdropFilter = 'blur(8px)';
    searchInput.style.fontFamily = 'inherit';
    searchInput.style.letterSpacing = '0.01em';
    searchInput.autofocus = true;
    searchInput.style.display = 'block';
    searchInput.style.position = 'relative';

    // Add a search icon (macOS style)
    const searchIcon = document.createElement('i');
    searchIcon.className = 'fas fa-search';
    searchIcon.style.position = 'absolute';
    searchIcon.style.right = '18px';
    searchIcon.style.top = '0';
    searchIcon.style.height = '44px';
    searchIcon.style.display = 'flex';
    searchIcon.style.alignItems = 'center';
    searchIcon.style.color = 'rgba(255,255,255,0.6)';
    searchIcon.style.fontSize = '20px';
    searchIcon.style.pointerEvents = 'none';

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
      appItem.setAttribute('data-app-name', app.name.toLowerCase());
      // Icon container style
      const iconContainerStyle = `width: 64px; height: 64px; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 28px; box-shadow: 0 4px 16px rgba(0,0,0,0.18); margin-bottom: 10px;`;
      appItem.innerHTML = `
        <div class=\"icon-container ${app.iconBgClass}\" style=\"${iconContainerStyle}\">
          <i class=\"fas ${app.iconClass}\"></i>
        </div>
        <span style=\"font-size: 15px; color: #fff; text-shadow: 0 1px 4px #222; text-align: center; width: 100%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 10px; display: block;\">${app.name}</span>
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
        appSpan.style.marginTop = '10px';
      }
      // Add hover effect for macOS style
      const iconContainer = appItem.querySelector('.icon-container');
      appItem.addEventListener('mouseenter', function() {
        appItem.style.transform = 'scale(1.10)';
        if (iconContainer) iconContainer.style.boxShadow = '0 8px 32px rgba(0,0,0,0.22)';
      });
      appItem.addEventListener('mouseleave', function() {
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
        appItem.getAttribute('data-app-id') || appItem.getAttribute('data-app-name'),
        appItem.querySelector('span').textContent,
        appItem.querySelector('i').className.split(' ').find(cls => cls.startsWith('fa-')),
        appItem.className.split(' ').find(cls => cls.endsWith('-icon'))
      );
      closeLauncher();
    }
    // --- End fix ---

    // --- Search/filter logic ---
    searchInput.addEventListener('input', function() {
      const term = this.value.trim().toLowerCase();
      let visibleCount = 0;
      appItems.forEach(item => {
        const appName = item.getAttribute('data-app-name');
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
    searchInput.addEventListener('keydown', function(e) {
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
    appLauncherBtn.addEventListener('click', function() {
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
    createWindowFromTemplate = function() {
      const win = _originalCreateWindowFromTemplate.apply(this, arguments);
      attachSidebarResizeObserver(win);
      return win;
    };
  }
  if (typeof createGenericWindow === 'function') {
    const _originalCreateGenericWindow = createGenericWindow;
    createGenericWindow = function() {
      const win = _originalCreateGenericWindow.apply(this, arguments);
      attachSidebarResizeObserver(win);
      return win;
    };
  }
});
// ... existing code ...

// --- Global keyboard shortcut for App Launcher: Ctrl + Alt + Space ---
document.addEventListener('keydown', function(e) {
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
document.addEventListener('DOMContentLoaded', function() {
  const widgetsToggleBtn = document.getElementById('widgets-toggle-btn');
  const widgetsToggleArrow = document.getElementById('widgets-toggle-arrow');
  const widgetsScreen = document.getElementById('widgets-screen');
  let widgetsVisible = true;
  if (widgetsToggleBtn && widgetsToggleArrow && widgetsScreen) {
    const arrowIcon = widgetsToggleArrow.querySelector('i');
    function setChevronIcon(visible) {
      if (!arrowIcon) return;
      arrowIcon.classList.remove('fa-chevron-right', 'fa-chevron-left');
      arrowIcon.classList.add(visible ? 'fa-chevron-right' : 'fa-chevron-left');
    }
    widgetsToggleBtn.addEventListener('click', function() {
      if (window.innerWidth <= 1023) return; // Only on desktop
      widgetsVisible = !widgetsVisible;
      if (!widgetsVisible) {
        widgetsScreen.classList.add('widgets-hidden');
        setChevronIcon(false);
      } else {
        widgetsScreen.classList.remove('widgets-hidden');
        setChevronIcon(true);
      }
    });
    // On resize, always show widgets if switching to mobile
    window.addEventListener('resize', function() {
      if (window.innerWidth <= 1023) {
        widgetsScreen.classList.remove('widgets-hidden');
        widgetsVisible = true;
        setChevronIcon(true);
      }
    });
    // Set initial icon
    setChevronIcon(true);
  }
});
// ... existing code ...

document.addEventListener('DOMContentLoaded', function() {
  // ... existing code ...
  const aiChatBtn = document.getElementById('ai-chat-btn');
  const aiChatWindow = document.getElementById('ai-chat-window');
  let aiChatVisible = false;
  if (aiChatBtn && aiChatWindow) {
    aiChatBtn.addEventListener('click', function() {
      if (window.innerWidth <= 1023) return;
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
    aiChatCloseBtn.addEventListener('click', function() {
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

document.addEventListener('DOMContentLoaded', function() {
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
    globalSearchBtn.addEventListener('click', function() {
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
    globalSearchInput && globalSearchInput.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') hideGlobalSearch();
    });
    document.addEventListener('keydown', function(e) {
      if (globalSearchOverlay.style.display !== 'none' && e.key === 'Escape') hideGlobalSearch();
    });
    globalSearchOverlay.addEventListener('mousedown', function(e) {
      if (e.target === globalSearchOverlay) hideGlobalSearch();
    });
    // Dropdown logic
    if (globalSearchDropdownBtn && globalSearchDropdownList) {
      globalSearchDropdownBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        if (globalSearchDropdownOpen) closeDropdown();
        else openDropdown();
      });
      globalSearchDropdownList.addEventListener('mousedown', function(e) {
        e.stopPropagation();
      });
      document.addEventListener('mousedown', function(e) {
        if (globalSearchDropdownOpen && !globalSearchDropdownList.contains(e.target) && e.target !== globalSearchDropdownBtn) {
          closeDropdown();
        }
      });
      Array.from(globalSearchDropdownList.querySelectorAll('.dropdown-item')).forEach(item => {
        item.addEventListener('click', function() {
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

document.addEventListener('DOMContentLoaded', function() {
  // ... existing code ...
  const notificationsBtn = document.getElementById('notifications-btn');
  const notificationsPanel = document.getElementById('notifications-panel');
  let notificationsVisible = false;
  if (notificationsPanel && notificationsBtn) {
    // Add placeholder content if empty
    if (!notificationsPanel.innerHTML.trim()) {
      notificationsPanel.innerHTML = `
        <div class="notifications-panel-content">
          <div class="notif-header-row">
            <span class="notif-title">Notifications</span>
            <div class="notif-tabs">
              <button class="notif-tab notif-tab-active">All</button>
              <button class="notif-tab">Unread</button>
            </div>
          </div>
          <div class="notif-section-label">Today <span class="notif-clear">Clear all</span></div>
          <div class="notif-list">
            <div class="notif-card unread">
              <button class="notif-delete-btn" title="Delete notification">&times;</button>
              <div class="notif-icon-bg notif-bg-blue"><i class="fas fa-shopping-cart"></i></div>
              <div class="notif-content">
                <div class="notif-main-row">
                  <span class="notif-main-title">New sale</span>
                
                </div>
                <div class="notif-desc">New sale from Andrei Caramitru</div>
                <div class="notif-meta">1m</div>
              </div>
              <img class="notif-avatar" src="img/avatar.png" />
            </div>
            <div class="notif-card unread">
              <button class="notif-delete-btn" title="Delete notification">&times;</button>
              <div class="notif-icon-bg notif-bg-indigo"><i class="fas fa-bolt"></i></div>
              <div class="notif-content">
                <div class="notif-main-row">
                  <span class="notif-main-title">Andrei Caramitru made a new <b>sale</b></span>
                 
                </div>
                <div class="notif-desc">in total of <b>4500 lei</b></div>
                <div class="notif-meta">20m</div>
              </div>
              <img class="notif-avatar" src="img/avatar.png" />
            </div>
            <div class="notif-card">
              <button class="notif-delete-btn" title="Delete notification">&times;</button>
              <div class="notif-icon-bg notif-bg-orange"><i class="fas fa-shopping-bag"></i></div>
              <div class="notif-content">
                <div class="notif-main-row">
                  <span class="notif-main-title">Andrei Caramitru made a new sale</span>
                </div>
                <div class="notif-desc">in total of 4500 lei</div>
                <div class="notif-meta">40m</div>
              </div>
              <img class="notif-avatar" src="img/avatar.png" />
            </div>
            <div class="notif-card">
              <button class="notif-delete-btn" title="Delete notification">&times;</button>
              <div class="notif-icon-bg notif-bg-green"><i class="fas fa-star"></i></div>
              <div class="notif-content">
                <div class="notif-main-row">
                  <span class="notif-main-title">Andrei Caramitru posted a <b>review</b></span>
                </div>
                <div class="notif-desc">on <b>Blugi de blana imblaniti misto</b></div>
                <div class="notif-meta">1h ago</div>
              </div>
              <img class="notif-avatar" src="img/avatar.png" />
            </div>
          </div>
          <div class="notif-section-label">Yesterday <span class="notif-clear">Clear all</span></div>
          <div class="notif-list">
            <div class="notif-card unread">
              <button class="notif-delete-btn" title="Delete notification">&times;</button>
              <div class="notif-icon-bg notif-bg-blue"><i class="fas fa-shopping-cart"></i></div>
              <div class="notif-content">
                <div class="notif-main-row">
                  <span class="notif-main-title">New sale</span>
                 
                </div>
                <div class="notif-desc">New sale from Andrei Caramitru</div>
                <div class="notif-meta">1m</div>
              </div>
              <img class="notif-avatar" src="img/avatar.png" />
            </div>
            <div class="notif-card unread">
              <button class="notif-delete-btn" title="Delete notification">&times;</button>
              <div class="notif-icon-bg notif-bg-indigo"><i class="fas fa-bolt"></i></div>
              <div class="notif-content">
                <div class="notif-main-row">
                  <span class="notif-main-title">Andrei Caramitru made a new <b>sale</b></span>
                  <span class="notif-dot"></span>
                </div>
                <div class="notif-desc">in total of <b>4500 lei</b></div>
                <div class="notif-meta">20m</div>
              </div>
              <img class="notif-avatar" src="img/avatar.png" />
            </div>
            <div class="notif-card">
              <button class="notif-delete-btn" title="Delete notification">&times;</button>
              <div class="notif-icon-bg notif-bg-orange"><i class="fas fa-shopping-bag"></i></div>
              <div class="notif-content">
                <div class="notif-main-row">
                  <span class="notif-main-title">Andrei Caramitru made a new sale</span>
                </div>
                <div class="notif-desc">in total of 4500 lei</div>
                <div class="notif-meta">40m</div>
              </div>
              <img class="notif-avatar" src="img/avatar.png" />
            </div>
            <div class="notif-card">
              <button class="notif-delete-btn" title="Delete notification">&times;</button>
              <div class="notif-icon-bg notif-bg-green"><i class="fas fa-star"></i></div>
              <div class="notif-content">
                <div class="notif-main-row">
                  <span class="notif-main-title">Andrei Caramitru posted a <b>review</b></span>
                </div>
                <div class="notif-desc">on <b>Blugi de blana imblaniti misto</b></div>
                <div class="notif-meta">1h ago</div>
              </div>
              <img class="notif-avatar" src="img/avatar.png" />
            </div>
          </div>
        </div>
      `;
      // Enable swipe-to-delete after notifications are rendered
      enableNotificationSwipeToDelete();
      updateNotificationsBadge();
    }
    // Add event delegation for delete buttons
    notificationsPanel.addEventListener('click', function(e) {
      if (e.target.classList.contains('notif-delete-btn')) {
        const notifCard = e.target.closest('.notif-card');
        if (notifCard) {
          const notifList = notifCard.parentElement;
          
          // First slide out
          notifCard.classList.add('notif-card-removing');
          notifCard.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
          notifCard.style.transform = 'translateX(120%)';
          notifCard.style.opacity = '0';
          
          setTimeout(() => {
            // Prepare for height animation
            notifCard.style.overflow = 'hidden';
            notifCard.style.height = notifCard.offsetHeight + 'px';
            notifCard.style.transition = 'all 0.3s ease-out';
            
            // Trigger height collapse
            requestAnimationFrame(() => {
              notifCard.style.height = '0';
              notifCard.style.marginTop = '0';
              notifCard.style.marginBottom = '0';
              notifCard.style.padding = '0';
            });
            
            // Remove after animations
            setTimeout(() => {
              notifCard.remove();
              updateNotificationsBadge();
              // If this was the last notification in the list, animate out section label and list
              if (notifList && notifList.classList.contains('notif-list') && notifList.querySelectorAll('.notif-card').length === 0) {
                const sectionLabel = notifList.previousElementSibling;
                if (sectionLabel && sectionLabel.classList.contains('notif-section-label')) {
                  fadeOutSectionLabel(sectionLabel);
                  
                  // Animate list collapse
                  notifList.style.height = notifList.offsetHeight + 'px';
                  notifList.style.overflow = 'hidden';
                  notifList.style.transition = 'all 0.3s ease-out';
                  
                  requestAnimationFrame(() => {
                    notifList.style.height = '0';
                    notifList.style.marginTop = '0';
                    notifList.style.marginBottom = '0';
                    
                    setTimeout(() => {
                      notifList.remove();
                      updateNotificationsBadge();
                      // Check if we need to show empty state
                      const notifPanelContent = notificationsPanel.querySelector('.notifications-panel-content');
                      if (notifPanelContent && !notifPanelContent.querySelector('.notif-card')) {
                        const headerRow = notifPanelContent.querySelector('.notif-header-row');
                        const tempHeader = headerRow ? headerRow.cloneNode(true) : null;
                        notifPanelContent.innerHTML = '';
                        if (tempHeader) notifPanelContent.appendChild(tempHeader);
                        
                        const emptyMsg = document.createElement('div');
                        emptyMsg.className = 'no-notifications-msg';
                        emptyMsg.textContent = 'No new notifications';
                        emptyMsg.style.cssText = 'display: flex; align-items: center; justify-content: center; height: 100%; color: #888; font-size: 15px; font-weight: 400; text-align: center; margin-top: 60px; opacity: 0;';
                        notifPanelContent.appendChild(emptyMsg);
                        setNotificationsBtnOpacity();
                        
                        requestAnimationFrame(() => {
                          emptyMsg.style.transition = 'opacity 0.3s ease-out';
                          emptyMsg.style.opacity = '1';
                        });
                      }
                    }, 300);
                  });
                }
              }
            }, 300);
          }, 300);
          
          
        }
      }
      // Handle Clear all
      if (e.target.classList.contains('notif-clear')) {
        // Find the notif-list after the section label
        const sectionLabel = e.target.closest('.notif-section-label');
        if (sectionLabel) {
          let notifList = sectionLabel.nextElementSibling;
          if (notifList && notifList.classList.contains('notif-list')) {
            // Animate out all notifications with stagger
            const notifCards = Array.from(notifList.querySelectorAll('.notif-card'));
            notifCards.forEach((card, index) => {
              setTimeout(() => {
                // Slide out animation
                card.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
                card.style.transform = 'translateX(120%)';
                card.style.opacity = '0';
                
                // Height collapse animation
                setTimeout(() => {
                  card.style.overflow = 'hidden';
                  card.style.height = card.offsetHeight + 'px';
                  card.style.transition = 'all 0.3s ease-out';
                  
                  requestAnimationFrame(() => {
                    card.style.height = '0';
                    card.style.marginTop = '0';
                    card.style.marginBottom = '0';
                    card.style.padding = '0';
                  });
                  
                  // Remove after animations
                  setTimeout(() => {
                    card.remove();
                    updateNotificationsBadge();
                    // If this was the last card, animate out the section
                    if (index === notifCards.length - 1) {
                      fadeOutSectionLabel(sectionLabel);
                      
                      // Animate list collapse
                      notifList.style.height = notifList.offsetHeight + 'px';
                      notifList.style.overflow = 'hidden';
                      notifList.style.transition = 'all 0.3s ease-out';
                      
                      requestAnimationFrame(() => {
                        notifList.style.height = '0';
                        notifList.style.marginTop = '0';
                        notifList.style.marginBottom = '0';
                        
                        setTimeout(() => {
                          notifList.remove();
                          updateNotificationsBadge();
                          // Check if we need to show empty state
                          const notifPanelContent = notificationsPanel.querySelector('.notifications-panel-content');
                          if (notifPanelContent && !notifPanelContent.querySelector('.notif-card')) {
                            const headerRow = notifPanelContent.querySelector('.notif-header-row');
                            const tempHeader = headerRow ? headerRow.cloneNode(true) : null;
                            notifPanelContent.innerHTML = '';
                            if (tempHeader) notifPanelContent.appendChild(tempHeader);
                            
                            const emptyMsg = document.createElement('div');
                            emptyMsg.className = 'no-notifications-msg';
                            emptyMsg.textContent = 'No new notifications';
                            emptyMsg.style.cssText = 'display: flex; align-items: center; justify-content: center; height: 100%; color: #888; font-size: 1.15rem; font-weight: 500; text-align: center; margin-top: 60px; opacity: 0;';
                            notifPanelContent.appendChild(emptyMsg);
                            setNotificationsBtnOpacity();
                            
                            requestAnimationFrame(() => {
                              emptyMsg.style.transition = 'opacity 0.3s ease-out';
                              emptyMsg.style.opacity = '1';
                            });
                          }
                        }, 300);
                      });
                    }
                  }, 300);
                }, 300);
              }, index * 50); // Stagger each card's animation
            });
            
            // Check if all notifications are gone
            const notifPanelContent = notificationsPanel.querySelector('.notifications-panel-content');
            if (notifPanelContent && !notifPanelContent.querySelector('.notif-card')) {
              // Remove any remaining section labels and lists
              const remainingLabels = notifPanelContent.querySelectorAll('.notif-section-label');
              remainingLabels.forEach(label => {
                fadeOutSectionLabel(label);
                const nextList = label.nextElementSibling;
                if (nextList && nextList.classList.contains('notif-list')) {
                  nextList.remove();
                }
              });
              
              // Clear content and show empty message
              const headerRow = notifPanelContent.querySelector('.notif-header-row');
              const tempHeader = headerRow ? headerRow.cloneNode(true) : null;
              notifPanelContent.innerHTML = '';
              if (tempHeader) notifPanelContent.appendChild(tempHeader);
              
              const emptyMsg = document.createElement('div');
              emptyMsg.className = 'no-notifications-msg';
              emptyMsg.textContent = 'No new notifications';
              emptyMsg.style.cssText = 'display: flex; align-items: center; justify-content: center; height: 100%; color: #888; font-size: 1.15rem; font-weight: 500; text-align: center; margin-top: 60px;';
              notifPanelContent.appendChild(emptyMsg);
              setNotificationsBtnOpacity();
              updateNotificationsBadge();
            }
          }
        }
      }
      // Also check after deleting a single notification
      if (e.target.classList.contains('notif-delete-btn')) {
        setTimeout(checkNoNotifications, 400);
      }
      function checkNoNotifications() {
        const notifPanelContent = notificationsPanel.querySelector('.notifications-panel-content');
        if (!notifPanelContent) return;
        
        // Check each notification section
        const notifLists = notifPanelContent.querySelectorAll('.notif-list');
        notifLists.forEach(list => {
          if (!list.querySelector('.notif-card')) {
            const sectionLabel = list.previousElementSibling;
            if (sectionLabel && sectionLabel.classList.contains('notif-section-label')) {
              fadeOutSectionLabel(sectionLabel);
              // Remove the empty list after animation
              setTimeout(() => list.remove(), 400);
            }
          }
        });

        // Check if there are any notifications at all
        const anyNotif = notifPanelContent.querySelector('.notif-card');
        let emptyMsg = notifPanelContent.querySelector('.no-notifications-msg');
        
        if (!anyNotif) {
          // Remove any remaining section labels first
          const remainingLabels = notifPanelContent.querySelectorAll('.notif-section-label');
          remainingLabels.forEach(label => {
            if (!label.classList.contains('fading-out')) {
              fadeOutSectionLabel(label);
            }
          });

          // Clear everything except header row and add empty message
          setTimeout(() => {
            if (!notifPanelContent.querySelector('.notif-card')) {  // Double check no new notifications appeared
              const headerRow = notifPanelContent.querySelector('.notif-header-row');
              const tempHeader = headerRow ? headerRow.cloneNode(true) : null;
              notifPanelContent.innerHTML = '';
              if (tempHeader) notifPanelContent.appendChild(tempHeader);

              emptyMsg = document.createElement('div');
              emptyMsg.className = 'no-notifications-msg';
              emptyMsg.textContent = 'No new notifications';
              emptyMsg.style.cssText = 'display: flex; align-items: center; justify-content: center; height: 100%; color: #888; font-size: 1.15rem; font-weight: 500; text-align: center; margin-top: 60px;';
              notifPanelContent.appendChild(emptyMsg);
              setNotificationsBtnOpacity();
              updateNotificationsBadge();
            }
          }, 400);  // Wait for fade out animations to complete
        } else {
          if (emptyMsg) emptyMsg.remove();
          setNotificationsBtnOpacity();
          updateNotificationsBadge();
        }
      }
    });
    let notificationBtnLock = false;
    notificationsBtn.addEventListener('click', function(e) {
      // Do not stop propagation; let global click handler work
      if (notificationBtnLock) return;
      notificationBtnLock = true;
      setTimeout(() => { notificationBtnLock = false; }, 350);
      // Hide AI chat if open
      const aiChatWindow = document.getElementById('ai-chat-window');
      if (aiChatWindow && aiChatWindow.classList.contains('ai-chat-visible')) {
        aiChatWindow.classList.remove('ai-chat-visible');
        aiChatWindow.style.display = 'none';
      }
      notificationsVisible = !notificationsVisible;
      if (notificationsVisible) {
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
    // Click outside to close
    document.addEventListener('mousedown', function(e) {
      if (notificationsVisible && notificationsPanel.style.display === 'flex') {
        const btn = notificationsBtn;
        if (!notificationsPanel.contains(e.target) && !btn.contains(e.target)) {
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
});
// ... existing code ...

document.addEventListener('DOMContentLoaded', function() {
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
    fullscreenBtn.addEventListener('click', function() {
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

document.addEventListener('DOMContentLoaded', function() {
  // ... existing code ...
  const appLauncherBtn = document.getElementById('app-launcher-btn');
  if (appLauncherBtn) {
    appLauncherBtn.addEventListener('click', function() {
      // Try to find the desktop icon for animation, else pass null
      const appLauncherIcon = document.querySelector('.desktop-icon[data-app="app-launcher"]');
      openAppLauncherWindow(appLauncherIcon);
    });
  }
});
// ... existing code ...

window.openAppLauncherWindow = openAppLauncherWindow;

document.addEventListener('DOMContentLoaded', function() {
  // ... existing code ...
  const widgetsScreen = document.getElementById('widgets-screen');
  function enableWidgetsScreenScroll() {
    if (!widgetsScreen) return;
    if (window.innerWidth >= 1024) {
      widgetsScreen.addEventListener('wheel', function(e) {
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
const _originalInitDesktopIconPositions = initializeDesktopIconPositions;
initializeDesktopIconPositions = function() {
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
const _originalGlobalOnIconMouseUp = globalOnIconMouseUp;
globalOnIconMouseUp = function(e) {
  _originalGlobalOnIconMouseUp(e);
  if (window.innerWidth > 1023) saveDesktopIconPositions();
};

window.addEventListener('resize', function() {
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
    const popoutButton = windowElement.querySelector('.window-popout');
    if (popoutButton) {
      popoutButton.addEventListener('click', function(e) {
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
          } catch (e) {}
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
          logOutButton.addEventListener('click', () => {
            if(startMenu) startMenu.style.display = 'none';
            // Set a global flag to indicate logout in progress
            window._loggingOut = true;
            // Close all popout windows
            if (window._allPopoutWindows && Array.isArray(window._allPopoutWindows)) {
              window._allPopoutWindows = window._allPopoutWindows.filter(win => {
                if (win && !win.closed) {
                  try { win.close(); } catch (e) {}
                  return false;
                }
                return false;
              });
            }
            // Optionally, clear the flag after a short delay
            setTimeout(() => { window._loggingOut = false; }, 2000);
          });
        }
        // ... existing code ...
      });
    }
// ... existing code ...

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

    card.addEventListener('touchstart', function(e) {
      if (e.touches.length !== 1) return;
      startX = e.touches[0].clientX;
      swiping = true;
      card.style.transition = 'none';
    });

    card.addEventListener('touchmove', function(e) {
      if (!swiping) return;
      currentX = e.touches[0].clientX;
      translateX = Math.max(0, currentX - startX); // Only allow right swipe
      card.style.transform = `translateX(${translateX}px)`;
      swipeBg.style.opacity = Math.min(1, Math.abs(translateX) / threshold);
    });

    card.addEventListener('touchend', function(e) {
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

// ... existing code ...
// --- GLOBAL SHORTCUT: Press 'N' to show a notification (OS-style) ---
document.addEventListener('keydown', function(e) {
  // Ignore if focus is in an input, textarea, or contenteditable
  const active = document.activeElement;
  if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable)) return;
  if (e.key === 'n' || e.key === 'N') {
    const notificationsPanel = document.getElementById('notifications-panel');
    if (!notificationsPanel) return;
    if (notificationsPanel.style.display !== 'flex') {
      notificationsPanel.style.display = 'flex';
      setTimeout(() => notificationsPanel.classList.add('notifications-visible'), 10);
    }
    setTimeout(() => {
      const notifList = notificationsPanel.querySelector('.notif-list');
      if (!notifList) return;
      const card = document.createElement('div');
      card.className = 'notif-card unread';
      card.style.transform = 'translateX(120%)';
      card.style.opacity = '0.7';
      card.innerHTML = `
        <button class="notif-delete-btn" title="Delete notification">&times;</button>
        <div class="notif-icon-bg notif-bg-blue"><i class="fas fa-shopping-cart"></i></div>
        <div class="notif-content">
          <div class="notif-main-row">
            <span class="notif-main-title">New incoming notification</span>
            <span class="notif-dot"></span>
          </div>
          <div class="notif-desc">This is a test notification</div>
          <div class="notif-meta">now</div>
        </div>
        <img class="notif-avatar" src="img/avatar.png" />
      `;
      notifList.insertBefore(card, notifList.firstChild);
      setTimeout(() => {
        card.style.transition = 'transform 0.45s cubic-bezier(0.4,0,0.2,1), opacity 0.45s cubic-bezier(0.4,0,0.2,1)';
        card.style.transform = 'translateX(0)';
        card.style.opacity = '1';
      }, 10);
      if (typeof enableNotificationSwipeToDelete === 'function') {
        enableNotificationSwipeToDelete();
      }
    }, 100);
  }
});
// ... existing code ...
// (Remove all right-click-to-notify logic for the bell)

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
        <span class="notif-main-title">New incoming notification</span>
        <span class="notif-dot"></span>
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
    toast.style.margin = '20px';
    toast.style.transition = 'top 0.35s cubic-bezier(0.4,0,0.2,1), transform 0.45s cubic-bezier(0.4,0,0.2,1), opacity 0.45s cubic-bezier(0.4,0,0.2,1)'; // Smooth move
    toast.style.top = (idx * (toastHeight + margin)) + 'px';
    toast.style.zIndex = 999999 - idx;
  });
  // Adjust container height
  container.style.height = (container.children.length * (toastHeight + margin) - margin) + 'px';
}
// ... existing code ...

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
window.updateSidebarForWindow = function(windowEl) {
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
      sb._hoverEnter = function() {
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
      sb._hoverLeave = function() {
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

(function() {
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
  swipeContainer.addEventListener('touchstart', function(e) {
    if (e.touches.length !== 1) return;
    isDragging = true;
    dragStartX = e.touches[0].clientX;
    dragCurrentX = dragStartX;
    dragStartTransform = -100 * currentScreen;
    swipeContainer.style.transition = 'none';
  }, { passive: true });
  swipeContainer.addEventListener('touchmove', function(e) {
    if (!isDragging) return;
    dragCurrentX = e.touches[0].clientX;
    const dx = dragCurrentX - dragStartX;
    swipeContainer.style.transform = `translateX(${dragStartTransform + (dx / window.innerWidth) * 100}vw)`;
    e.preventDefault();
  }, { passive: false });
  swipeContainer.addEventListener('touchend', function(e) {
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
  swipeContainer.addEventListener('mousedown', function(e) {
    if (e.button !== 0) return;
    isDragging = true;
    dragStartX = e.clientX;
    dragCurrentX = dragStartX;
    dragStartTransform = -100 * currentScreen;
    swipeContainer.style.transition = 'none';
    document.body.style.userSelect = 'none';
  });
  window.addEventListener('mousemove', function(e) {
    if (!isDragging) return;
    dragCurrentX = e.clientX;
    const dx = dragCurrentX - dragStartX;
    swipeContainer.style.transform = `translateX(${dragStartTransform + (dx / window.innerWidth) * 100}vw)`;
  });
  window.addEventListener('mouseup', function(e) {
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
  notif.style.background = 'rgba(50,50,70,0.97)';
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
document.addEventListener('DOMContentLoaded', function() {
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
document.addEventListener('DOMContentLoaded', function() {
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
        sb._hoverEnter = function() {
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
        sb._hoverLeave = function() {
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
        sb._hoverEnter = function() {
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
        sb._hoverLeave = function() {
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
(function() {
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
    createWindowFromTemplate = function() {
      const win = _originalCreateWindowFromTemplate.apply(this, arguments);
      attachSidebarResizeObserver(win);
      return win;
    };
  }
  if (typeof createGenericWindow === 'function') {
    const _originalCreateGenericWindow = createGenericWindow;
    createGenericWindow = function() {
      const win = _originalCreateGenericWindow.apply(this, arguments);
      attachSidebarResizeObserver(win);
      return win;
    };
  }
})();






