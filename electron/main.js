const { app, BrowserWindow, shell, Menu } = require('electron')
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

  // Disable right-click context menu
  win.webContents.on('context-menu', (event) => event.preventDefault())

  // Inject a transparent drag region along the top so the window can be moved.
  // pointer-events: none lets clicks pass through to nav elements below.
  // -webkit-app-region: drag is handled at the OS level so dragging still works.
  win.webContents.on('did-finish-load', () => {
    win.webContents.insertCSS(`
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
    `)
    win.webContents.executeJavaScript(`
      if (!document.getElementById('pulse-drag-region')) {
        const el = document.createElement('div');
        el.id = 'pulse-drag-region';
        document.body.appendChild(el);
      }
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
}

app.whenReady().then(() => {
  Menu.setApplicationMenu(buildMenu())
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
