// OS Dashboard App - Cross-browser (Chrome, Firefox, Edge, Safari)
// This app is now tested and compatible with all major browsers. If you find a browser-specific bug, please report it.
// [ ... other globally defined functions or variables if any ... ]

document.addEventListener('keydown', function(e) {
  const active = document.activeElement;
  if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable)) return;
  if (e.key === 'n' || e.key === 'N') {
    console.log('N key pressed for notification');
    const notificationsPanel = document.getElementById('notifications-panel');
    if (!notificationsPanel) { console.log('No notificationsPanel'); return; }
    const notifList = notificationsPanel.querySelector('.notif-list');
    if (!notifList) { console.log('No notifList'); return; }
    console.log('notifList found, inserting notification');
    // Add to list (always)
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
    // If panel is closed, show toast
    if (notificationsPanel.style.display !== 'flex') {
      showToastNotification();
    }
  }
});

// Function to toggle the widgets screen
function toggleWidgetsScreen() {
  const widgetsScreen = document.getElementById('widgets-screen');
  if (widgetsScreen) {
    widgetsScreen.classList.toggle('active');
  }
}
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
  // Allow custom right-click on notification bell
  const bell = document.getElementById('notifications-btn');
  if (bell && (event.target === bell || bell.contains(event.target))) {
    // Let the bell's own handler run, do NOT preventDefault here
    return;
  }
  event.preventDefault(); // This disables the browser's context menu elsewhere
});

document.addEventListener('DOMContentLoaded', function() {
  console.log('SCRIPT EXECUTION: DOMContentLoaded START');

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
  
  console.log('[Init]DOMContentLoaded - Script Start (Restored Version)');
  console.log('[Init] desktopIconsContainer element selected:', desktopIconsContainer);
  if (!desktopIconsContainer) console.error('[Init] CRITICAL: .desktop-icons container NOT FOUND!');
  console.log('[Init] desktopArea element selected:', desktopArea);
  if (!desktopArea) console.error('[Init] CRITICAL: #desktop-area NOT FOUND!');
  console.log('[Init] Number of .desktop-icon elements found:', desktopIcons.length);
  
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
        delayedContentLoader = () => setupFileExplorerInteraction(windowElement);
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
        windowElement.classList.add('window-anim-close');
        windowElement.addEventListener('animationend', function handler(ev) {
          if (ev.animationName === 'windowClose') {
            windowElement.remove();
            if (currentTaskbarIcon) currentTaskbarIcon.remove();
            delete openWindows[windowId];
            if (activeWindow === windowElement) activeWindow = null;
            updateTaskbarActiveState(); 
            windowElement.removeEventListener('animationend', handler);
          }
        });
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

        const desktopRect = windowsContainer.getBoundingClientRect();
        const maxWidth = Math.min(desktopRect.width, window.innerWidth);
        const maxHeight = Math.min(desktopRect.height, window.innerHeight);

        const isMaximized = windowElement.classList.contains('maximized');

        if (isMaximized) {
          // RESTORE to previous windowed size/position
          windowElement.classList.remove('maximized');
          maximizeButton.classList.remove('window-restore');
          // Also ensure no snap state remains
          // (No extra snap class, but this is where you'd clear it if you had one)
          if (windowElement._preSnapRect) {
            console.log('Restoring, clearing _preSnapRect', windowElement._preSnapRect);
            windowElement.style.width = windowElement._preSnapRect.width;
            windowElement.style.height = windowElement._preSnapRect.height;
            windowElement.style.left = windowElement._preSnapRect.left;
            windowElement.style.top = windowElement._preSnapRect.top;
            windowElement._preSnapRect = null;
          } else if (windowElement.dataset.prevWidth && windowElement.dataset.prevHeight && windowElement.dataset.prevLeft && windowElement.dataset.prevTop) {
            windowElement.style.width = windowElement.dataset.prevWidth;
            windowElement.style.height = windowElement.dataset.prevHeight;
            windowElement.style.left = windowElement.dataset.prevLeft;
            windowElement.style.top = windowElement.dataset.prevTop;
          } else {
            positionWindowCenter(windowElement);
          }
          windowElement.style.resize = '';
          makeWindowDraggable(windowElement);
          makeWindowActive(windowElement);
        } else {
          // Only save windowed state if not maximized
          saveWindowedState(windowElement);
          windowElement.style.width = `${maxWidth}px`;
          windowElement.style.height = `${maxHeight}px`;
          windowElement.style.left = '0px';
          windowElement.style.top = '0px';
          windowElement.classList.add('window-anim-maximize');
          windowElement.addEventListener('animationend', function handler(ev) {
            if (ev.animationName === 'windowMaximize') {
              windowElement.classList.remove('window-anim-maximize');
              windowElement.removeEventListener('animationend', handler);
            }
          });
          windowElement.style.resize = 'none';
          windowElement.classList.add('maximized');
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
        doc.write('<!DOCTYPE html><html><head><title>App Popout</title>');
        // Copy stylesheets
        Array.from(document.styleSheets).forEach(sheet => {
          if (sheet.href) doc.write(`<link rel="stylesheet" href="${sheet.href}">`);
        });
        doc.write('</head><body style="background: var(--primary-bg); margin:0;">');
        // Only window-content (NO window-header)
        const content = windowElement.querySelector('.window-content') || windowElement.querySelector('.calculator-body') || windowElement.querySelector('.photoshop-content');
        if (content) {
          // Clone and adjust style for full size
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = content.outerHTML;
          const mainContent = tempDiv.firstElementChild;
          if (mainContent) {
            mainContent.style.width = '100vw';
            mainContent.style.height = '100vh';
            mainContent.style.boxSizing = 'border-box';
            doc.write(mainContent.outerHTML);
          }
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
            if (info && info.appName) {
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
      if (newSnapType !== snapType) {
        snapType = newSnapType;
        if (snapOverlay) {
          snapOverlay.innerHTML = '';
          if (snapType) {
            snapHint = document.createElement('div');
            snapHint.className = 'snap-hint';
            if (snapType === 'maximize') snapHint.classList.add('snap-hint-maximize');
            if (snapType === 'left') snapHint.classList.add('snap-hint-left');
            if (snapType === 'right') snapHint.classList.add('snap-hint-right');
            snapOverlay.appendChild(snapHint);
            snapOverlay.style.display = 'block';
          } else {
            snapOverlay.style.display = 'none';
          }
        }
      }
    }

    function closeDragElement(e) {
      document.onmouseup = null;
      document.onmousemove = null;
      header.style.cursor = 'grab';
      if (snapOverlay) {
        snapOverlay.style.display = 'none';
        snapOverlay.innerHTML = '';
      }
      // Snap action
      if (snapType === 'maximize') {
        // Maximize
        const desktopRect = windowsContainer.getBoundingClientRect();
        const maxWidth = Math.min(desktopRect.width, window.innerWidth);
        const maxHeight = Math.min(desktopRect.height, window.innerHeight);
        saveWindowedState(windowElement);
        windowElement.style.width = `${maxWidth}px`;
        windowElement.style.height = `${maxHeight}px`;
        windowElement.style.left = '0px';
        windowElement.style.top = '0px';
        windowElement.style.resize = 'none';
        windowElement.classList.add('maximized');
        const maximizeButton = windowElement.querySelector('.window-maximize');
        if (maximizeButton) maximizeButton.classList.add('window-restore');
        if (header) header.onmousedown = null;
        if (header) header.style.cursor = 'default';
      } else if (snapType === 'left') {
        saveWindowedState(windowElement);
        // Snap to left, height stops at taskbar
        const taskbar = document.querySelector('.taskbar');
        const desktopRect = windowsContainer.getBoundingClientRect();
        windowElement.style.width = Math.floor(window.innerWidth / 2) + 'px';
        windowElement.style.height = desktopRect.height + 'px';
        windowElement.style.left = '0px';
        windowElement.style.top = '0px';
        windowElement.style.resize = 'none';
        windowElement.classList.add('maximized');
        const maximizeButton = windowElement.querySelector('.window-maximize');
        if (maximizeButton) maximizeButton.classList.add('window-restore');
        if (header) header.onmousedown = null;
        if (header) header.style.cursor = 'default';
      } else if (snapType === 'right') {
        saveWindowedState(windowElement);
        // Snap to right, height stops at taskbar
        const taskbar = document.querySelector('.taskbar');
        const desktopRect = windowsContainer.getBoundingClientRect();
        windowElement.style.width = Math.floor(window.innerWidth / 2) + 'px';
        windowElement.style.height = desktopRect.height + 'px';
        windowElement.style.left = Math.floor(window.innerWidth / 2) + 'px';
        windowElement.style.top = '0px';
        windowElement.style.resize = 'none';
        windowElement.classList.add('maximized');
        const maximizeButton = windowElement.querySelector('.window-maximize');
        if (maximizeButton) maximizeButton.classList.add('window-restore');
        if (header) header.onmousedown = null;
        if (header) header.style.cursor = 'default';
      } else {
        // Not snapped, restore drag state if needed
        windowElement.classList.remove('maximized');
        if (maximizeButton) maximizeButton.classList.remove('window-restore');
        if (wasMaximizedBeforeDrag) {
          windowElement.style.width = prevRect.width;
          windowElement.style.height = prevRect.height;
          windowElement.style.left = prevRect.left;
          windowElement.style.top = prevRect.top;
          windowElement.style.resize = '';
          if (header) header.onmousedown = dragMouseDown;
          if (header) header.style.cursor = 'grab';
        }
      }
      snapType = null;
      snapHint = null;
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
        let currentX = e.clientX - contentRect.left + fileExplorerContentArea.scrollLeft;
        let currentY = e.clientY - contentRect.top + fileExplorerContentArea.scrollTop;
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
        sidebar.classList.toggle('show');
        overlay.classList.toggle('show');
      });

      overlay.addEventListener('click', () => {
        sidebar.classList.remove('show');
        overlay.classList.remove('show');
      });

      // Close sidebar on item click for mobile
      const sidebarItems = sidebar.querySelectorAll('.sidebar-item');
      sidebarItems.forEach(item => {
        item.addEventListener('click', () => {
          if (window.innerWidth <= 767) {
            sidebar.classList.remove('show');
            overlay.classList.remove('show');
          }
        });
      });
    }

    // Handle window resize
    window.addEventListener('resize', () => {
      if (window.innerWidth > 767) {
        sidebar.classList.remove('show');
        overlay.classList.remove('show');
      }
    });
  }

  function hideContextMenu() {
    if(contextMenu) contextMenu.classList.add('hidden');
  }

  if (desktopArea) {
    desktopArea.addEventListener('contextmenu', function(e) {
      e.preventDefault();
      hideContextMenu(); // Hide any previous before showing new
      currentContextMenuTarget = e.target;
      const menuItems = [];
      if (e.target.closest('.desktop-icon')) {
          currentContextMenuTarget = e.target.closest('.desktop-icon');
          menuItems.push({ label: 'Open', action: 'open-app', icon: 'fa-folder-open' });
          menuItems.push({ label: 'Pin to Start', action: 'pin-to-start', icon: 'fa-thumbtack' });
          menuItems.push({ type: 'separator' });
          menuItems.push({ label: 'Delete', action: 'delete-icon', icon: 'fa-trash' });
      } else if (e.target.closest('.file-explorer-content .file-item')) {
          currentContextMenuTarget = e.target.closest('.file-item');
          menuItems.push({ label: 'Open', action: 'open-file', icon: 'fa-folder-open'});
          menuItems.push({ label: 'Copy', action: 'copy-file', icon: 'fa-copy'});
          menuItems.push({ label: 'Paste', action: 'paste-file', icon: 'fa-paste', disabled: true }); 
          menuItems.push({ type: 'separator' });
          menuItems.push({ label: 'Delete', action: 'delete-file', icon: 'fa-trash'});
      } else { // Desktop background
          menuItems.push({ label: 'View', icon: 'fa-eye', subItems: [
              { label: 'Large icons', action: 'view-large' },
              { label: 'Medium icons', action: 'view-medium' },
              { label: 'Small icons', action: 'view-small' }
          ]});
          menuItems.push({ label: 'Sort by', icon: 'fa-sort', subItems: [
            { label: 'Name', action: 'sort-name' },
            { label: 'Date', action: 'sort-date' },
            { label: 'Type', action: 'sort-type' }
        ]});
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
        menuItemEl.addEventListener('click', (e) => {
          if (!item.disabled) {
            executeContextMenuAction(item.action);
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
              const subItemEl = document.createElement('div');
              subItemEl.className = 'context-menu-item';
              subItemEl.innerHTML = `<span>${subItem.label}</span>`;
              if (subItem.disabled) subItemEl.classList.add('disabled');
              // Never add chevron or .has-submenu to submenu items
              subItemEl.addEventListener('click', (ev) => {
                if (!subItem.disabled) {
                  executeContextMenuAction(subItem.action);
                  hideContextMenu();
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
  console.log('SCRIPT EXECUTION: DOMContentLoaded END');

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
    overlay.style.zIndex = '999999';
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
                  <span class="notif-dot"></span>
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
          <div class="notif-section-label">Yesterday <span class="notif-clear">Clear all</span></div>
          <div class="notif-list">
            <div class="notif-card unread">
              <button class="notif-delete-btn" title="Delete notification">&times;</button>
              <div class="notif-icon-bg notif-bg-blue"><i class="fas fa-shopping-cart"></i></div>
              <div class="notif-content">
                <div class="notif-main-row">
                  <span class="notif-main-title">New sale</span>
                  <span class="notif-dot"></span>
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
    }
    // Add event delegation for delete buttons
    notificationsPanel.addEventListener('click', function(e) {
      if (e.target.classList.contains('notif-delete-btn')) {
        const notifCard = e.target.closest('.notif-card');
        if (notifCard) {
          const notifList = notifCard.parentElement;
          notifCard.classList.add('notif-card-removing');
          notifCard.addEventListener('animationend', function handler() {
            notifCard.removeEventListener('animationend', handler);
            notifCard.classList.remove('notif-card-removing');
            // Hide the card immediately after slide-out
            notifCard.style.display = 'none';
            // Set height inline for smooth collapse (but it's hidden)
            notifCard.style.height = notifCard.offsetHeight + 'px';
            void notifCard.offsetHeight;
            notifCard.classList.add('notif-card-collapsing');
            notifCard.style.height = '0px';
            notifCard.addEventListener('transitionend', function collapseHandler(e) {
              if (e.propertyName === 'height') {
                notifCard.removeEventListener('transitionend', collapseHandler);
                notifCard.remove();
                // If this was the last notification in the list, hide the section label
                if (notifList && notifList.classList.contains('notif-list') && notifList.querySelectorAll('.notif-card').length === 0) {
                  const sectionLabel = notifList.previousElementSibling;
                  if (sectionLabel && sectionLabel.classList.contains('notif-section-label')) {
                    sectionLabel.style.display = 'none';
                  }
                }
              }
            });
          });
        }
        setTimeout(checkNoNotifications, 400);
      }
      // Handle Clear all
      if (e.target.classList.contains('notif-clear')) {
        // Find the notif-list after the section label
        const sectionLabel = e.target.closest('.notif-section-label');
        if (sectionLabel) {
          let notifList = sectionLabel.nextElementSibling;
          if (notifList && notifList.classList.contains('notif-list')) {
            // Animate and remove all notif-card children with a staggered delay
            const notifCards = Array.from(notifList.querySelectorAll('.notif-card'));
            let remaining = notifCards.length;
            if (remaining === 0) {
              sectionLabel.style.display = 'none';
              // Check if all notifications are gone
              setTimeout(checkNoNotifications, 400);
              return;
            }
            notifCards.forEach((card, idx) => {
              setTimeout(() => {
                card.classList.add('notif-card-removing');
                card.addEventListener('animationend', function handler() {
                  card.removeEventListener('animationend', handler);
                  card.classList.remove('notif-card-removing');
                  card.style.display = 'none';
                  card.style.height = card.offsetHeight + 'px';
                  void card.offsetHeight;
                  card.classList.add('notif-card-collapsing');
                  card.style.height = '0px';
                  card.addEventListener('transitionend', function collapseHandler(e) {
                    if (e.propertyName === 'height') {
                      card.removeEventListener('transitionend', collapseHandler);
                      card.remove();
                      remaining--;
                      if (remaining === 0) {
                        sectionLabel.style.display = 'none';
                        setTimeout(checkNoNotifications, 100);
                      }
                    }
                  });
                });
              }, idx * 60); // 60ms stagger between each
            });
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
        const anyNotif = notifPanelContent.querySelector('.notif-card');
        let emptyMsg = notifPanelContent.querySelector('.no-notifications-msg');
        if (!anyNotif) {
          if (!emptyMsg) {
            emptyMsg = document.createElement('div');
            emptyMsg.className = 'no-notifications-msg';
            emptyMsg.textContent = 'No new notifications';
            emptyMsg.style.cssText = 'display: flex; align-items: center; justify-content: center; height: 220px; color: #888; font-size: 1.15rem; font-weight: 500; text-align: center;';
            notifPanelContent.appendChild(emptyMsg);
          }
        } else {
          if (emptyMsg) emptyMsg.remove();
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

document.addEventListener('DOMContentLoaded', function() {
  // ... existing code ...
  const mainContentArea = document.querySelector('.main-content-area');
  const desktopArea = document.querySelector('.desktop-area');
  const taskbar = document.querySelector('.taskbar');
  let mobileScreenIndex = 0; // 0 = icons, 1 = widgets
  let touchStartX = 0;
  let touchCurrentX = 0;
  let isSwiping = false;
  let swipeThreshold = 60; // px
  let swipeEnabled = false;

  // --- Move taskbar inside desktop-area on mobile, outside on desktop ---
  function updateTaskbarPlacement() {
    const mainContentArea = document.querySelector('.main-content-area');
    const desktopArea = document.querySelector('.desktop-area');
    const taskbar = document.querySelector('.taskbar');
    if (!taskbar || !desktopArea || !mainContentArea) return;
    if (window.innerWidth <= 1023) {
      // On mobile, always move taskbar as last child of desktop-area
      if (desktopArea.lastElementChild !== taskbar) {
        desktopArea.appendChild(taskbar);
      }
    } else {
      // On desktop, always move taskbar after main-content-area
      if (mainContentArea.nextElementSibling !== taskbar) {
        mainContentArea.parentElement.insertBefore(taskbar, mainContentArea.nextElementSibling);
      }
    }
  }
  window.addEventListener('resize', updateTaskbarPlacement);
  document.addEventListener('DOMContentLoaded', updateTaskbarPlacement);
  // ... existing code ...
});
// ... existing code ...

// ... existing code ...
// --- MOBILE SWIPE LOGIC FOR MAIN CONTENT AREA ---
(function() {
  const MOBILE_BREAKPOINT = 1023;
  let mobileScreenIndex = 0; // 0 = icons, 1 = widgets
  let touchStartX = 0;
  let touchStartY = 0;
  let touchCurrentX = 0;
  let touchCurrentY = 0;
  let isSwiping = false;
  let swipeStartedInWidgets = false;
  const swipeThreshold = 60; // px
  let mainContentArea = null;
  let mainContentParent = null;

  function setMobileScreen(index) {
    mainContentArea = document.querySelector('.main-content-area');
    mainContentParent = mainContentArea ? mainContentArea.parentElement : null;
    mobileScreenIndex = Math.max(0, Math.min(1, index));
    if (!mainContentArea) return;
    if (mobileScreenIndex === 0) {
      mainContentArea.classList.add('mobile-icons-active');
      mainContentArea.classList.remove('mobile-widgets-active');
    } else {
      mainContentArea.classList.remove('mobile-icons-active');
      mainContentArea.classList.add('mobile-widgets-active');
    }
  }

  function onTouchStart(e) {
    if (window.innerWidth > MOBILE_BREAKPOINT) return;
    if (e.touches.length !== 1) return;
    isSwiping = true;
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    touchCurrentX = touchStartX;
    touchCurrentY = touchStartY;
    const widgetsScreen = document.getElementById('widgets-screen');
    swipeStartedInWidgets = widgetsScreen && widgetsScreen.contains(e.target);
  }
  function onTouchMove(e) {
    if (!isSwiping || window.innerWidth > MOBILE_BREAKPOINT) return;
    touchCurrentX = e.touches[0].clientX;
    touchCurrentY = e.touches[0].clientY;
    const dx = touchCurrentX - touchStartX;
    const dy = touchCurrentY - touchStartY;
    if (swipeStartedInWidgets && Math.abs(dy) > Math.abs(dx)) {
      return;
    }
    if (Math.abs(dx) > Math.abs(dy)) {
      e.preventDefault();
    }
  }
  function onTouchEnd(e) {
    if (!isSwiping || window.innerWidth > MOBILE_BREAKPOINT) return;
    isSwiping = false;
    const dx = touchCurrentX - touchStartX;
    const dy = touchCurrentY - touchStartY;
    if (swipeStartedInWidgets && Math.abs(dy) > Math.abs(dx)) {
      return;
    }
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > swipeThreshold) {
      if (dx < 0 && mobileScreenIndex === 0) {
        setMobileScreen(1);
      } else if (dx > 0 && mobileScreenIndex === 1) {
        setMobileScreen(0);
      }
    }
  }
  function enableMobileSwipe() {
    mainContentArea = document.querySelector('.main-content-area');
    if (!mainContentArea || window.innerWidth > MOBILE_BREAKPOINT) return;
    mainContentArea.addEventListener('touchstart', onTouchStart, { passive: true });
    mainContentArea.addEventListener('touchmove', onTouchMove, { passive: false });
    mainContentArea.addEventListener('touchend', onTouchEnd, { passive: true });
    setMobileScreen(mobileScreenIndex);
  }
  function disableMobileSwipe() {
    mainContentArea = document.querySelector('.main-content-area');
    if (!mainContentArea) return;
    mainContentArea.removeEventListener('touchstart', onTouchStart);
    mainContentArea.removeEventListener('touchmove', onTouchMove);
    mainContentArea.removeEventListener('touchend', onTouchEnd);
  }
  function handleResize() {
    if (window.innerWidth <= MOBILE_BREAKPOINT) {
      enableMobileSwipe();
      setMobileScreen(mobileScreenIndex);
    } else {
      disableMobileSwipe();
      mobileScreenIndex = 0;
    }
  }
  window.addEventListener('resize', handleResize);
  document.addEventListener('DOMContentLoaded', handleResize);
})();
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
        doc.write('<!DOCTYPE html><html><head><title>App Popout</title>');
        // Copy stylesheets
        Array.from(document.styleSheets).forEach(sheet => {
          if (sheet.href) doc.write(`<link rel="stylesheet" href="${sheet.href}">`);
        });
        doc.write('</head><body style="background: var(--primary-bg); margin:0;">');
        // Only window-content (NO window-header)
        const content = windowElement.querySelector('.window-content') || windowElement.querySelector('.calculator-body') || windowElement.querySelector('.photoshop-content');
        if (content) {
          // Clone and adjust style for full size
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = content.outerHTML;
          const mainContent = tempDiv.firstElementChild;
          if (mainContent) {
            mainContent.style.width = '100vw';
            mainContent.style.height = '100vh';
            mainContent.style.boxSizing = 'border-box';
            doc.write(mainContent.outerHTML);
          }
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
            if (info && info.appName) {
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
        setTimeout(() => {
          card.remove();
          // Optionally: call checkNoNotifications() if you want to show "No notifications" message
        }, 200);
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
    console.log('N key pressed for notification'); // Debug log
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
function showToastNotification() {
  // Remove any existing toast
  let existing = document.getElementById('os-toast-notification');
  if (existing) existing.remove();
  // Create toast element
  const toast = document.createElement('div');
  toast.id = 'os-toast-notification';
  toast.className = 'notif-card unread os-toast-notification';
  toast.style.position = 'fixed';
  toast.style.right = '-400px';
  toast.style.top = '32px';
  toast.style.zIndex = '999999';
  toast.style.width = '340px';
  toast.style.maxWidth = '90vw';
  toast.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.14)';
  toast.style.transition = 'right 0.5s cubic-bezier(0.4,0,0.2,1), opacity 0.4s';
  toast.style.opacity = '1';
  toast.innerHTML = `
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
  document.body.appendChild(toast);
  setTimeout(() => { toast.style.right = '32px'; }, 10);

  let dismissTimer;
  let dismissed = false;
  function dismissToast() {
    if (dismissed) return;
    dismissed = true;
    toast.style.right = '-400px';
    toast.style.opacity = '0.7';
    setTimeout(() => toast.remove(), 500);
  }
  function startTimer() {
    dismissTimer = setTimeout(dismissToast, 4000);
  }
  function clearTimer() {
    if (dismissTimer) clearTimeout(dismissTimer);
  }
  toast.addEventListener('mouseenter', clearTimer);
  toast.addEventListener('mouseleave', startTimer);
  toast.querySelector('.notif-delete-btn').onclick = dismissToast;
  startTimer();
}

// --- GLOBAL SHORTCUT: Press 'N' to show a notification (OS-style) ---
document.addEventListener('keydown', function(e) {
  // Ignore if focus is in an input, textarea, or contenteditable
  const active = document.activeElement;
  if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable)) return;
  if (e.key === 'n' || e.key === 'N') {
    console.log('N key pressed for notification');
    const notificationsPanel = document.getElementById('notifications-panel');
    if (!notificationsPanel) { console.log('No notificationsPanel'); return; }
    const notifList = notificationsPanel.querySelector('.notif-list');
    if (!notifList) { console.log('No notifList'); return; }
    console.log('notifList found, inserting notification');
    // Add to list (always)
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
    // If panel is closed, show toast
    if (notificationsPanel.style.display !== 'flex') {
      showToastNotification();
    }
  }
});
// ... existing code ...
