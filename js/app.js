// [ ... other globally defined functions or variables if any ... ]

// Function to toggle the widgets screen
function toggleWidgetsScreen() {
  const widgetsScreen = document.getElementById('widgets-screen');
  if (widgetsScreen) {
    widgetsScreen.classList.toggle('active');
  }
}
// To test, call from console: toggleWidgetsScreen()

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
        console.log(`[GridInit] Container clientWidth: ${desktopIconsContainer.clientWidth}, GRID_GAP: ${GRID_GAP}, CELL_WIDTH: ${GRID_CELL_WIDTH}`);
        console.log(`[GridInit] Usable width for columns: ${containerWidth}, Max columns: ${maxCols}`);

        desktopIcons.forEach((icon, index) => {
          try {
            const col = index % maxCols;
            const row = Math.floor(index / maxCols);
            const iconLeft = GRID_GAP + col * (GRID_CELL_WIDTH + GRID_GAP);
            const iconTop = GRID_GAP + row * (GRID_CELL_HEIGHT + GRID_GAP);
            icon.style.position = 'absolute';
            icon.style.left = iconLeft + 'px';
            icon.style.top = iconTop + 'px';
            icon.dataset.homeLeft = String(iconLeft);
            icon.dataset.homeTop = String(iconTop);
            const iconNameSpan = icon.querySelector('span');
            const iconNameText = iconNameSpan ? iconNameSpan.textContent : '[Unknown Icon]';
            console.log(`[GridInit] Icon '${iconNameText}' at Col: ${col},R: ${row} -> L:${iconLeft},T:${iconTop}`);
          } catch (iconError) {
            console.error('[GridInit] Error processing one icon during initialization:', icon, iconError);
          }
        });
    } catch (mainError) {
        console.error('[GridInit] CRITICAL ERROR during main part of initializeDesktopIconPositions:', mainError);
    }
  }

  const startMenuApps = [
    { id: 'this-pc', name: 'This PC', iconClass: 'fa-desktop', iconBgClass: 'pink', category: 'SYSTEM APPS' },
    { id: 'web-files', name: 'Web Files', iconClass: 'fa-folder-open', iconBgClass: 'green', category: 'SYSTEM APPS' },
    { id: 'trash-sm', name: 'Trash', iconClass: 'fa-trash', iconBgClass: 'purple', category: 'SYSTEM APPS' },
    { id: 'settings-sm', name: 'Settings', iconClass: 'fa-cog', iconBgClass: 'pink', category: 'SYSTEM APPS' }, 
    { id: 'site-builder-sm', name: 'Site Builder', iconClass: 'fa-globe', iconBgClass: 'pink', category: 'CUSTOMISE' },
    { id: 'app-store-sm', name: 'AppStore', iconClass: 'fa-store', iconBgClass: 'green', category: 'CUSTOMISE' },
    { id: 'social-master', name: 'Social Master', iconClass: 'fa-users', iconBgClass: 'purple', category: 'CUSTOMISE' },
    { id: 'personalize', name: 'Personalize', iconClass: 'fa-cog', iconBgClass: 'pink', category: 'CUSTOMISE' },
    { id: 'word-doc', name: 'Word doc', iconClass: 'fa-file-word', iconBgClass: 'pink', category: 'DOCS' },
    { id: 'excel-numbers', name: 'Excel Numbers', iconClass: 'fa-file-excel', iconBgClass: 'green', category: 'DOCS' },
    { id: 'notepad', name: 'Notepad', iconClass: 'fa-sticky-note', iconBgClass: 'purple', category: 'DOCS' },
    { id: 'wordpad', name: 'Wordpad', iconClass: 'fa-file-alt', iconBgClass: 'pink', category: 'DOCS' },
    { id: 'calculator-sm', name: 'Calculator', iconClass: 'fa-calculator', iconBgClass: 'gray', category: 'PRODUCTIVITY' },
    { id: 'photoshop-sm', name: 'Photoshop', iconClass: 'fa-palette', iconBgClass: 'blue', category: 'PRODUCTIVITY' },
    { id: 'calendar-sm', name: 'Calendar', iconClass: 'fa-calendar-alt', iconBgClass: 'purple', category: 'PRODUCTIVITY' },
    { id: 'notes', name: 'Notes', iconClass: 'far fa-clipboard', iconBgClass: 'pink', category: 'PRODUCTIVITY' }
  ];
  
  function updateCurrentTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    if(currentTimeEl) currentTimeEl.textContent = `${hours}:${minutes}`;
  }
  
  if(startButton && startMenu) {
    startButton.addEventListener('click', function() {
      startMenu.style.display = startMenu.style.display === 'block' ? 'none' : 'block';
    });
  }
  
  document.addEventListener('click', function(e) {
    if (startMenu && !startMenu.contains(e.target) && e.target !== startButton && !startButton.contains(e.target)) {
      startMenu.style.display = 'none';
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
      icon.addEventListener('dblclick', function(e) {
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
        openApp(appName, appTitle, iconClass, iconBgClass);
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

  function openApp(appName, appTitle, iconClassFromClick, iconBgClassFromClick) {
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
    const appDetails = getAppIconDetails(appName);
    const finalIconClass = iconClassFromClick || appDetails.iconClass;
    const finalIconBgClass = iconBgClassFromClick || appDetails.iconBgClass;

    switch(appName) {
      case 'my-files':
        windowElement = createWindowFromTemplate('file-explorer', windowId);
        appTitle = 'File Explorer';
        isFileExplorer = true;
        break;
      case 'settings': 
      case 'settings-sm':
        windowElement = createWindowFromTemplate('settings-app', windowId);
        appTitle = 'Settings';
        if (windowElement) setupSettingsApp(windowElement);
        break;
      case 'app-store':
      case 'app-store-sm':
        windowElement = createWindowFromTemplate('app-store', windowId);
        appTitle = 'AppStore';
        break;
      case 'calculator':
      case 'calculator-sm':
        windowElement = createWindowFromTemplate('calculator-app', windowId);
        appTitle = 'Calculator';
        if (windowElement) setupCalculatorApp(windowElement);
        break;
      case 'photoshop':
      case 'photoshop-sm':
        windowElement = createWindowFromTemplate('photoshop-app', windowId);
        appTitle = 'Photoshop';
        break;
      default:
        const title = appTitle || appName.charAt(0).toUpperCase() + appName.slice(1).replace(/-/g, ' ');
        windowElement = createGenericWindow(title, finalIconClass, finalIconBgClass, windowId);
        break;
    }
    if (windowElement) {
      const taskbarIcon = createTaskbarIcon(windowId, appName, finalIconClass, appTitle);
      openWindows[windowId] = { element: windowElement, taskbarIcon: taskbarIcon, name: appName, title: appTitle };
      makeWindowActive(windowElement);
      if (isFileExplorer) setupFileExplorerInteraction(windowElement);
    } 
  }
  
  function createWindowFromTemplate(templateId, windowId) {
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
    return windowElement;
  }
  
  function createGenericWindow(title, iconClass, iconBgClass, windowId) {
    const windowElement = document.createElement('div');
    windowElement.className = 'window';
    windowElement.id = windowId;
    windowElement.style.width = '800px';
    windowElement.style.height = '600px';
    windowElement.innerHTML = `
      <div class="window-header">
        <div class="window-title">
          <div class="window-icon ${iconBgClass}">
            <i class="fas ${iconClass}"></i>
          </div>
          <span>${title}</span>
        </div>
        <div class="window-controls">
          <button class="window-minimize" title="Minimize"></button>
          <button class="window-maximize" title="Maximize"></button>
          <button class="window-close" title="Close"></button>
        </div>
      </div>
      <div class="window-content" style="display: flex; align-items: center; justify-content: center; padding: 20px;">
        <p>Content for ${title} goes here.</p>
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
    if (closeButton) {
      closeButton.addEventListener('click', function(e) { 
        e.stopPropagation();
        const currentTaskbarIcon = openWindows[windowId] ? openWindows[windowId].taskbarIcon : null;
        windowElement.remove();
        if (currentTaskbarIcon) currentTaskbarIcon.remove();
        delete openWindows[windowId];
        if (activeWindow === windowElement) activeWindow = null;
        updateTaskbarActiveState(); 
      });
    }
    const minimizeButton = windowElement.querySelector('.window-minimize');
    if (minimizeButton) {
      minimizeButton.addEventListener('click', function(e) { 
        e.stopPropagation(); 
        const currentTaskbarIcon = openWindows[windowId] ? openWindows[windowId].taskbarIcon : null;
        toggleMinimizeWindow(windowElement, currentTaskbarIcon);
      });
    }    
    const maximizeButton = windowElement.querySelector('.window-maximize');
    if (maximizeButton) {
      maximizeButton.addEventListener('click', function(e) { 
        e.stopPropagation(); 
        if (window.innerWidth <= MOBILE_BREAKPOINT) return; // No maximize/restore on small screens

        const desktopRect = windowsContainer.getBoundingClientRect(); 
        if (windowElement.classList.contains('maximized')) {
          windowElement.classList.remove('maximized');
          maximizeButton.classList.remove('window-restore');
          if (windowElement.dataset.prevWidth && windowElement.dataset.prevHeight && windowElement.dataset.prevLeft && windowElement.dataset.prevTop) {
            windowElement.style.width = windowElement.dataset.prevWidth;
            windowElement.style.height = windowElement.dataset.prevHeight;
            windowElement.style.left = windowElement.dataset.prevLeft;
            windowElement.style.top = windowElement.dataset.prevTop;
          } else {
            positionWindowCenter(windowElement); 
          }
        } else {
          windowElement.dataset.prevWidth = windowElement.style.width || windowElement.offsetWidth + 'px';
          windowElement.dataset.prevHeight = windowElement.style.height || windowElement.offsetHeight + 'px';
          windowElement.dataset.prevLeft = windowElement.style.left || windowElement.offsetLeft + 'px';
          windowElement.dataset.prevTop = windowElement.style.top || windowElement.offsetTop + 'px';
          windowElement.classList.add('maximized');
          maximizeButton.classList.add('window-restore');
          windowElement.style.width = `${desktopRect.width}px`;
          windowElement.style.height = `${desktopRect.height}px`;
          windowElement.style.left = '0px';
          windowElement.style.top = '0px'; 
        }
      });
    } 
    windowElement.addEventListener('mousedown', function() {
      makeWindowActive(windowElement); 
    });
  }

  function toggleMinimizeWindow(windowElement, taskbarIcon) {
    if (windowElement.classList.contains('minimized')) {
        windowElement.style.display = 'flex';
        windowElement.classList.remove('minimized');
        if (taskbarIcon) taskbarIcon.classList.remove('minimized');
        makeWindowActive(windowElement);
    } else {
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
        // console.log("DragMouseDown: Clicked on a control button, not starting drag.");
        return; // Don't start drag if a control button was clicked
      }

      e.preventDefault(); // Prevent text selection, etc.
      pos3 = e.clientX;
      pos4 = e.clientY;
      makeWindowActive(windowElement);
      
      // Add stopPropagation here AFTER checking for control buttons.
      // This prevents desktop drag selector from activating when dragging a window.
      e.stopPropagation(); 

      document.onmouseup = closeDragElement;
      document.onmousemove = elementDrag;
      header.style.cursor = 'grabbing';
    }

    function elementDrag(e) {
      e.preventDefault();
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;

      let newY = windowElement.offsetTop - pos2;
      let newX = windowElement.offsetLeft - pos1;

      // Constrain movement only at the top of the screen
      newY = Math.max(0, newY);

      // Removed other constraints for dragging off-screen
      // const parentRect = windowsContainer.getBoundingClientRect();
      // const windowRect = windowElement.getBoundingClientRect(); // Get current size, important for resize
      // newX = Math.max(0, Math.min(newX, parentRect.width - windowRect.width));
      // newY = Math.min(newY, parentRect.height - windowRect.height); // Old bottom constraint removed

      windowElement.style.top = newY + 'px';
      windowElement.style.left = newX + 'px';
    }

    function closeDragElement() {
      document.onmouseup = null;
      document.onmousemove = null;
      header.style.cursor = 'grab';
    }
  }

  function createTaskbarIcon(windowId, appName, iconClass, appTitle) {
    const iconEl = document.createElement('div');
    iconEl.className = 'taskbar-app-icon';
    iconEl.setAttribute('data-window-id', windowId);
    iconEl.setAttribute('title', appTitle || appName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()));
    iconEl.innerHTML = `<i class="fas ${iconClass}"></i>`;
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
            <div class="app-icon-bg ${app.iconBgClass}-bg">
              <i class="fas ${app.iconClass}"></i>
            </div>
            <span>${app.name}</span>
          `;
          appItem.addEventListener('click', () => {
            openApp(app.id, app.name, app.iconClass, app.iconBgClass);
            if(startMenu) startMenu.style.display = 'none';
          });
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
      const appItems = section.querySelectorAll('.app-grid-item');
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
      themeOptions.forEach(option => {
        option.addEventListener('click', function() {
          themeOptions.forEach(opt => opt.classList.remove('active'));
          this.classList.add('active');
        });
      });
      const accentSwatches = appearanceContent.querySelectorAll('.accent-color-options .color-swatch');
      accentSwatches.forEach(swatch => {
        swatch.addEventListener('click', function() {
          accentSwatches.forEach(s => s.classList.remove('active'));
          this.classList.add('active');
        });
      });
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
        if (!desktopIconsContainer) return;
        const containerRect = desktopIconsContainer.getBoundingClientRect();
        let newLeft = e.clientX - containerRect.left - dragOffsetX + desktopIconsContainer.scrollLeft;
        let newTop = e.clientY - containerRect.top - dragOffsetY + desktopIconsContainer.scrollTop;
        draggedIcon.style.left = `${newLeft}px`;
        draggedIcon.style.top = `${newTop}px`;
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
        const currentRawLeft = parseFloat(draggedIcon.style.left);
        const currentRawTop = parseFloat(draggedIcon.style.top);
        const targetColumn = Math.max(0, Math.round((currentRawLeft - GRID_GAP) / (GRID_CELL_WIDTH + GRID_GAP)));
        const targetRow = Math.max(0, Math.round((currentRawTop - GRID_GAP) / (GRID_CELL_HEIGHT + GRID_GAP)));
        let targetSnappedLeft = GRID_GAP + targetColumn * (GRID_CELL_WIDTH + GRID_GAP);
        let targetSnappedTop = GRID_GAP + targetRow * (GRID_CELL_HEIGHT + GRID_GAP);
        const iconsContainer = draggedIcon.parentElement;
        const containerRect = iconsContainer.getBoundingClientRect();
        targetSnappedLeft = Math.max(GRID_GAP, Math.min(targetSnappedLeft, iconsContainer.clientWidth - draggedIcon.offsetWidth - GRID_GAP));
        targetSnappedTop = Math.max(GRID_GAP, Math.min(targetSnappedTop, iconsContainer.clientHeight - draggedIcon.offsetHeight - GRID_GAP));
        let slotAvailable = true;
        const draggedIconTargetRect = {
            left: containerRect.left + targetSnappedLeft,
            top: containerRect.top + targetSnappedTop,
            right: containerRect.left + targetSnappedLeft + draggedIcon.offsetWidth,
            bottom: containerRect.top + targetSnappedTop + draggedIcon.offsetHeight
        };
        for (const otherIcon of desktopIcons) {
            if (otherIcon === draggedIcon) continue;
            const otherIconRect = otherIcon.getBoundingClientRect();
            if (isIntersecting(draggedIconTargetRect, otherIconRect)) {
                slotAvailable = false;
                break;
            }
        }
        if (slotAvailable) {
            draggedIcon.style.left = `${targetSnappedLeft}px`;
            draggedIcon.style.top = `${targetSnappedTop}px`;
            draggedIcon.dataset.homeLeft = String(targetSnappedLeft);
            draggedIcon.dataset.homeTop = String(targetSnappedTop);
        } else {
            const homeLeft = parseFloat(draggedIcon.dataset.homeLeft);
            const homeTop = parseFloat(draggedIcon.dataset.homeTop);
            draggedIcon.style.left = `${homeLeft}px`;
            draggedIcon.style.top = `${homeTop}px`;
        }
    } 
    draggedIcon.style.transition = originalIconTransition; // Restore original transition
    document.removeEventListener('mousemove', globalOnIconMouseMove);
    document.removeEventListener('mouseup', globalOnIconMouseUp);
    if (draggedIcon) draggedIcon.style.cursor = 'pointer';
    draggedIcon = null;
    isActuallyDraggingIcon = false;
    originalIconTransition = ''; // Reset for next drag
  }

  if (desktopArea && dragSelector) {
    desktopArea.addEventListener('mousedown', (e) => {
        if (e.button === 2) return;
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
    const contentArea = fileExplorerWindow.querySelector('.file-explorer-content');
    fileExplorerContentArea = contentArea; 
    currentSelectedFileItems = new Set(); 
    const fileItems = contentArea.querySelectorAll('.file-item');

    fileItems.forEach(item => {
      item.addEventListener('dblclick', function() { /* ... */ });
      item.addEventListener('mousedown', function(e) {
        if (e.button === 2) return; 
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
        if (e.button === 2) return; 
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
    menuItems.forEach(item => {
      const menuItemEl = document.createElement('div');
      menuItemEl.className = 'context-menu-item';
      if (item.type === 'separator') {
        menuItemEl.className = 'context-menu-separator';
      } else {
        menuItemEl.innerHTML = `<i class="fas ${item.icon || 'fa-question-circle'}"></i><span>${item.label}</span>`;
        if (item.disabled) menuItemEl.classList.add('disabled');
        menuItemEl.addEventListener('click', (e) => {
          if (!item.disabled) {
            executeContextMenuAction(item.action);
            hideContextMenu();
          }
          e.stopPropagation(); 
        });
        // Basic submenu handling (visual only for now)
        if (item.subItems && item.subItems.length > 0) {
            menuItemEl.classList.add('has-submenu');
            // Actual submenu display logic would go here on hover/click
        }
      }
      contextMenu.appendChild(menuItemEl);
    });
    const menuWidth = contextMenu.offsetWidth;
    const menuHeight = contextMenu.offsetHeight;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    let finalX = x;
    let finalY = y;
    if (x + menuWidth > viewportWidth) finalX = viewportWidth - menuWidth - 5;
    if (y + menuHeight > viewportHeight) finalY = viewportHeight - menuHeight - 5;
    contextMenu.style.left = `${finalX}px`;
    contextMenu.style.top = `${finalY}px`;
    contextMenu.classList.remove('hidden');
  }

  function executeContextMenuAction(action) {
    if (!currentContextMenuTarget) return;
    switch(action) {
        case 'open-app':
            if (currentContextMenuTarget.matches('.desktop-icon')) {
                currentContextMenuTarget.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
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
    
    // Initially disable pointer events on widgets screen to let desktop content be clickable
    widgetsScreen.style.pointerEvents = 'none';
    
    // Show widgets scrollbar on handle hover and enable pointer events
    widgetsScrollHandle.addEventListener('mouseenter', function() {
      widgetsScreen.style.overflowY = 'auto';
      widgetsScreen.style.pointerEvents = 'auto';
    });
    
    // Keep scroll visible while mouse is over either handle or widgets
    widgetsScreen.addEventListener('mouseenter', function() {
      widgetsScreen.style.overflowY = 'auto';
      widgetsScreen.style.pointerEvents = 'auto';
    });
    
    // Hide scrollbar when mouse leaves both areas
    widgetsScrollHandle.addEventListener('mouseleave', function(e) {
      // Only hide if not entering the widgets panel
      if (e.relatedTarget !== widgetsScreen) {
        setTimeout(() => {
          if (!widgetsScreen.matches(':hover')) {
            widgetsScreen.style.overflowY = 'hidden';
            widgetsScreen.style.pointerEvents = 'none';
          }
        }, 100);
      }
    });
    
    widgetsScreen.addEventListener('mouseleave', function(e) {
      // Only hide if not entering the handle
      if (e.relatedTarget !== widgetsScrollHandle) {
        setTimeout(() => {
          if (!widgetsScrollHandle.matches(':hover')) {
            widgetsScreen.style.overflowY = 'hidden';
            widgetsScreen.style.pointerEvents = 'none';
          }
        }, 100);
      }
    });
    
    // Make the handle easier to interact with
    widgetsScrollHandle.style.cursor = 'pointer';
    
    console.log("Widgets interaction initialized");
  }

  updateCurrentTime();
  setInterval(updateCurrentTime, 60000);
  if (typeof populateStartMenuApps === 'function') populateStartMenuApps();
  else console.error('populateStartMenuApps is not defined or not a function');
  
  initializeDesktopIconPositions(); 
  console.log('SCRIPT EXECUTION: DOMContentLoaded END');
});