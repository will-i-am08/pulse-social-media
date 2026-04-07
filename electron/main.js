const { app, BrowserWindow, shell, Menu, session } = require('electron')
const path = require('path')

const APP_NAME = 'Pulse Social Media'
const APP_URL = 'https://pulsesocialmedia.com.au/apps'
const APP_ORIGIN = 'https://pulsesocialmedia.com.au'

// Routes that belong to the app — everything else is the marketing site
const APP_ROUTE_PREFIXES = [
  '/apps', '/dashboard', '/create-post', '/posts', '/calendar', '/brands',
  '/photos', '/analytics', '/clients', '/team', '/holidays', '/settings',
  '/profile', '/account', '/automations', '/creative-studio', '/blog-engine',
  '/brand-research', '/geo', '/proposals', '/login', '/auth', '/api',
]

function isAppRoute(url) {
  try {
    const pathname = new URL(url).pathname
    return APP_ROUTE_PREFIXES.some(p => pathname === p || pathname.startsWith(p + '/'))
  } catch {
    return false
  }
}

// Set app name before anything else so it propagates everywhere
app.setName(APP_NAME)

function buildMenu() {
  const isMac = process.platform === 'darwin'
  const template = [
    ...(isMac ? [{
      label: APP_NAME,
      submenu: [
        { role: 'about', label: `About ${APP_NAME}` },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide', label: `Hide ${APP_NAME}` },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit', label: `Quit ${APP_NAME}` },
      ],
    }] : []),
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' }, { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' }, { role: 'copy' }, { role: 'paste' },
        { role: 'selectAll' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload', label: 'Reload' },
        { role: 'forceReload', label: 'Force Reload' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        ...(isMac ? [{ type: 'separator' }, { role: 'front' }] : [{ role: 'close' }]),
      ],
    },
  ]
  return Menu.buildFromTemplate(template)
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    title: APP_NAME,
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      devTools: false,
    },
    icon: path.join(__dirname, '..', 'build', 'icon.png'),
  })

  // Identify requests as coming from the desktop app
  const defaultUA = win.webContents.getUserAgent()
  win.webContents.setUserAgent(`${defaultUA} PulseDesktop/1.0`)

  // Right-click: show spell-check + edit context menu for editable elements,
  // minimal copy menu for read-only selections, nothing otherwise.
  win.webContents.on('context-menu', (event, params) => {
    event.preventDefault()
    const menuItems = []

    // Spell-check suggestions
    if (params.misspelledWord) {
      if (params.dictionarySuggestions.length) {
        params.dictionarySuggestions.forEach(word => {
          menuItems.push({ label: word, click: () => win.webContents.replaceMisspelling(word) })
        })
        menuItems.push({ type: 'separator' })
      }
      menuItems.push({
        label: 'Add to Dictionary',
        click: () => win.webContents.session.addWordToSpellCheckerDictionary(params.misspelledWord),
      })
      menuItems.push({ type: 'separator' })
    }

    if (params.isEditable) {
      menuItems.push(
        { role: 'undo' }, { role: 'redo' }, { type: 'separator' },
        { role: 'cut' }, { role: 'copy' }, { role: 'paste' },
        { role: 'selectAll' },
      )
    } else if (params.selectionText) {
      menuItems.push({ role: 'copy' })
    }

    if (menuItems.length) Menu.buildFromTemplate(menuItems).popup()
  })

  // Inject drag region + fix for interactive elements beneath it.
  // -webkit-app-region: drag swallows OS-level mouse events even with
  // pointer-events: none, so interactive elements need no-drag explicitly.
  win.webContents.on('did-finish-load', async () => {
    await win.webContents.insertCSS(`
      #pulse-drag-region {
        position: fixed;
        top: 0;
        left: ${process.platform === 'darwin' ? '80px' : '0'};
        right: 0;
        height: 40px;
        -webkit-app-region: drag;
        pointer-events: none;
        z-index: 2147483647;
      }
      /* Ensure buttons/links in the drag area still receive clicks */
      a, button, input, select, textarea, label, [role="button"], [role="link"] {
        -webkit-app-region: no-drag;
      }
      ${process.platform === 'darwin' ? `
      /* Push sidebar top content below macOS traffic lights (~40px) */
      #sidebar > div:first-child {
        padding-top: 28px;
      }
      ` : ''}
    `)
    await win.webContents.executeJavaScript(`
      if (!document.getElementById('pulse-drag-region')) {
        const el = document.createElement('div');
        el.id = 'pulse-drag-region';
        document.body.appendChild(el);
      }
    `)
  })

  // Show a friendly retry page if the network is unavailable
  win.webContents.on('did-fail-load', (event, errorCode) => {
    if (errorCode === -3) return // -3 = ERR_ABORTED (our own navigation prevention)
    win.webContents.loadURL(`data:text/html,
      <html>
        <head><style>
          body { margin: 0; background: #0f0e0e; color: #e6e1e1; font-family: sans-serif;
                 display: flex; align-items: center; justify-content: center; height: 100vh; text-align: center; }
          h2 { margin: 0 0 8px; font-size: 20px; }
          p  { margin: 0 0 20px; color: #a08082; font-size: 14px; }
          button { background: #ff5473; color: #fff; border: none; padding: 10px 24px;
                   border-radius: 6px; font-size: 14px; cursor: pointer; }
          button:hover { background: #e04060; }
        </style></head>
        <body>
          <div>
            <h2>No connection</h2>
            <p>Check your internet and try again.</p>
            <button onclick="window.location.href='${APP_URL}'">Retry</button>
          </div>
        </body>
      </html>
    `)
  })

  // Load straight into the app (middleware redirects to /login if not authenticated)
  win.loadURL(APP_URL)

  // Open external links in the system browser, not a new Electron window
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (!url.startsWith(APP_ORIGIN)) {
      shell.openExternal(url)
      return { action: 'deny' }
    }
    return { action: 'allow' }
  })

  win.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith(APP_ORIGIN)) {
      event.preventDefault()
      shell.openExternal(url)
      return
    }
    // Block navigation to marketing pages — keep user inside the app
    if (!isAppRoute(url)) {
      event.preventDefault()
      win.loadURL(APP_URL)
    }
  })

  // Also catch server-side 3xx redirects to marketing pages
  win.webContents.on('will-redirect', (event, url) => {
    if (!url.startsWith(APP_ORIGIN)) {
      event.preventDefault()
      shell.openExternal(url)
      return
    }
    if (!isAppRoute(url)) {
      event.preventDefault()
      win.loadURL(APP_URL)
    }
  })
}

app.whenReady().then(async () => {
  // Clear HTTP cache on every launch so the app always loads the latest deploy
  await session.defaultSession.clearCache()

  Menu.setApplicationMenu(buildMenu())
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
