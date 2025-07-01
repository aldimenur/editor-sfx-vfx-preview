# Electron Setup for Firasat SFX VFX Preview

Your SFX/VFX preview application has been successfully configured to work with Electron as a desktop application!

## What's Been Set Up

1. **Main Electron Process** (`main.js`) - Handles the desktop window and server management
2. **Updated Package.json** - Configured with proper Electron scripts and build settings
3. **CommonJS Conversion** - Server.js converted from ES6 modules to CommonJS for Electron compatibility
4. **Development Dependencies** - Added concurrently, wait-on, and electron-builder

## How to Run

### Development Mode
```bash
npm start
```
This will launch the Electron desktop application.

### Run Server Only (for web browser)
```bash
npm run server
```

### Development with Auto-restart
```bash
npm run dev
```
This runs the server with nodemon for auto-restart on file changes.

### Alternative Launcher
Double-click `start-electron.bat` for a simple Windows launcher.

## Building for Distribution

### Build for Windows
```bash
npm run build-win
```

### Build for macOS
```bash
npm run build-mac
```

### Build for Linux
```bash
npm run build-linux
```

### Build for All Platforms
```bash
npm run build
```

## Application Features

- **Desktop Application**: Runs as a native desktop app
- **File Management**: Browse SFX, VFX, and Music files
- **Preview Functionality**: Play audio and video files directly
- **Search & Pagination**: Find files quickly with search functionality
- **Cross-Platform**: Works on Windows, macOS, and Linux

## Folder Structure

- `sfx/` - Sound effects files (mp3, wav, ogg, m4a)
- `vfx/` - Video effects files (mp4, avi, mov, mkv, webm)
- `music/` - Music files (mp3, wav, ogg, m4a)
- `public/` - Web interface files
- `assets/` - Application icons and assets

## Adding Custom Icons

To customize the app icon, add these files to the `assets/` folder:
- `icon.ico` - Windows icon
- `icon.icns` - macOS icon
- `icon.png` - Linux icon (512x512 recommended)

## Troubleshooting

1. **App won't start**: Make sure all dependencies are installed with `npm install`
2. **Server issues**: Check if port 3000 is available
3. **Build errors**: Ensure you have the latest version of electron-builder

## Notes

- The app automatically starts an Express server on port 3000
- External links (Instagram, WhatsApp) will open in your default browser
- The server process is automatically terminated when you close the app
- All your existing SFX/VFX files will be automatically detected

## Drag and Drop Functionality

### Direct File Drag to Other Applications

Each file now has a dedicated "Drag to App" button:

- Click the "Drag to App" button next to the file
- Drag the button into another application (e.g., Premiere Pro, After Effects)
- The full file path will be transferred, allowing easy import of media files

#### Button Colors
- SFX files: Blue "Drag to App" button
- VFX files: Orange "Drag to App" button
- Music files: Purple "Drag to App" button

### Tips
- The cursor changes to a grab/grabbing icon to indicate draggable state
- Works with SFX, VFX, and Music files
- Compatible with most video editing and audio production software 