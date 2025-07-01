const { app, BrowserWindow, shell } = require("electron");
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
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: true,
    },
    icon: path.join(__dirname, "assets/icon.png"), // Add your app icon here if you have one
    show: false, // Don't show until ready
    titleBarStyle: "default",
    autoHideMenuBar: false,
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
