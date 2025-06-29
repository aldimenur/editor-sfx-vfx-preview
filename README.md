# Sound & Video FX Preview Firasat

## Overview

This application provides a comprehensive, user-friendly interface to preview, search, and manage sound and video effects (SFX and VFX) with advanced features like pagination, file path copying, and direct file location access.

## Key Features

- 🎵 Sound Effects Preview
  - Hover to play audio waveforms
  - Search and filter sound effects
  - Pagination support for large sound libraries
  - Copy sound file path or name
  - Open sound file location directly

- 🎥 Video Effects Preview
  - Interactive video previews with playback controls
  - Search and filter video effects
  - Pagination support for video collections
  - Copy video file path or name
  - Open video file location directly

- 🔍 Advanced Search
  - Real-time search across sound and video effect libraries
  - Instant filtering of effects
  - Supports partial and case-insensitive matching

- 📊 Pagination
  - Navigate through large collections of effects
  - Page information display
  - Previous and Next page controls

## Directory Structure

```
Brokoli/
├── sfx/           # Sound effect files (mp3, wav, ogg, m4a)
├── vfx/           # Video effect files (mp4, avi, mov, mkv, webm)
├── public/        # Web application files
│   ├── index.html     # Home page with SFX and VFX links
│   ├── sfx.html       # Sound effects preview page
│   ├── vfx.html       # Video effects preview page
│   ├── script.js      # Main application logic
│   └── styles.css     # Application styling
└── server.js      # Node.js server with API endpoints
```

## Requirements

- Node.js (v14 or higher recommended)
- npm (Node Package Manager)
- Modern web browser

## Installation

1. Clone the repository
2. Navigate to the project directory
3. Run `npm install` to install dependencies
4. Place your sound effects in the `sfx/` directory
   - Supported formats: .mp3, .wav, .ogg, .m4a
5. Place your video effects in the `vfx/` directory
   - Supported formats: .mp4, .avi, .mov, .mkv, .webm
6. Start the server with `node server.js`
7. Open `http://localhost:3000` in your browser

## Quick Start (Windows)

Double-click `start.bat` to:
- Install dependencies
- Start the server
- Open the application in your default browser

## Usage Tips

- Use the home page to quickly access Sound FX or Video FX
- Hover over sound waveforms to preview audio
- Click on video previews to control playback
- Use the search bar to find specific effects
- Use pagination controls to navigate large collections
- Click "Copy Path" or "Copy Name" buttons to quickly copy file information
- Click "Open Location" to directly access the file in your file explorer

## Contributing

Contributions are welcome! Feel free to:
- Submit pull requests
- Open issues for bug reports or feature requests
- Improve documentation
- Add more sound or video effects to the libraries

## License

[Specify your license here]

## Author

Aldimenur
