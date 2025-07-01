const { app, BrowserWindow, shell, ipcMain } = require("electron");
const path = require("path");
const { spawn } = require("child_process");

let mainWindow;
let serverProcess;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: true,
    },
    icon: path.join(__dirname, "assets/icon.png"), // Add your app icon here if you have one
    show: false, // Don't show until ready
    titleBarStyle: "hiddenInset",
    autoHideMenuBar: true,
    titleBarOverlay: false,
  });

  // Start the Express server
  serverProcess = spawn("node", ["server.js"], {
    cwd: __dirname,
    stdio: "pipe",
  });

  serverProcess.stdout.on("data", (data) => {
    console.log(`Server: ${data}`);
  });

  serverProcess.stderr.on("data", (data) => {
    console.error(`Server Error: ${data}`);
  });

  // Wait a moment for server to start, then load the app
  setTimeout(() => {
    mainWindow.loadURL("http://localhost:3000");
  }, 2000);

  // Show window when ready
  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  // Handle file open requests
  ipcMain.handle("open-file-location", (event, fileName) => {
    const filePath = path.join(__dirname, "sfx", fileName);
    shell.showItemInFolder(filePath);
  });

  ipcMain.handle("open-vfx-location", (event, fileName) => {
    const filePath = path.join(__dirname, "vfx", fileName);
    shell.showItemInFolder(filePath);
  });

  ipcMain.handle("open-music-location", (event, fileName) => {
    const filePath = path.join(__dirname, "music", fileName);
    shell.showItemInFolder(filePath);
  });

  // New handler to get full file path for drag and drop
  ipcMain.handle("get-full-file-path", (event, { fileName, category }) => {
    let filePath;
    switch (category) {
      case "sfx":
        filePath = path.join(__dirname, "sfx", fileName);
        break;
      case "vfx":
        filePath = path.join(__dirname, "vfx", fileName);
        break;
      case "music":
        filePath = path.join(__dirname, "music", fileName);
        break;
      default:
        return null;
    }
    return filePath;
  });

  // Native file drag-and-drop handler
  ipcMain.on("ondragstart", (event, { fileName, category }) => {
    let filePath;
    switch (category) {
      case "sfx":
        filePath = path.join(__dirname, "sfx", fileName);
        break;
      case "vfx":
        filePath = path.join(__dirname, "vfx", fileName);
        break;
      case "music":
        filePath = path.join(__dirname, "music", fileName);
        break;
      default:
        return;
    }

    // Use application icon as drag icon (fallback if specific asset not found)
    const iconPath = path.join(__dirname, "assets", "video.png");

    event.sender.startDrag({
      file: filePath,
      icon: iconPath,
    });
  });

  // Handle window closed
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed
app.on("window-all-closed", () => {
  // Kill the server process
  if (serverProcess) {
    serverProcess.kill();
  }

  if (process.platform !== "darwin") {
    app.quit();
  }
});

// Handle app quit
app.on("before-quit", () => {
  if (serverProcess) {
    serverProcess.kill();
  }
});
