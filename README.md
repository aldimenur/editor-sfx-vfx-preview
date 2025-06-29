# Sound & Video FX Preview Firasat

## Overview

This application provides a user-friendly interface to preview and manage sound and video effects (SFX and VFX).

## Features

- Preview sound effects from the `/sfx` directory
- Preview video effects from the `/vfx` directory
- Search functionality for both sound and video effects
- Pagination support
- Copy file path or name
- Open file location directly from the application

## How to Use

1. Start the server by running `node server.js`
2. Open `http://localhost:3000` in your browser
3. Use the tabs to switch between Sound FX and Video FX
4. Use the search bar to filter effects
5. Hover over sound waveforms to preview audio
6. Click on video previews to control playback

## Directory Structure

```
Brokoli/
├── sfx/           # Sound effect files (mp3, wav, etc.)
├── vfx/           # Video effect files (mp4, avi, mov, etc.)
├── public/        # Web application files
│   ├── index.html
│   ├── script.js
│   └── styles.css
└── server.js      # Node.js server
```

## Requirements

- Node.js
- Express.js

## Installation

1. Clone the repository
2. Run `npm install`
3. Place your sound effects in the `sfx` directory
4. Place your video effects in the `vfx` directory
5. Start the server with `node server.js`

## Contributing

Feel free to submit pull requests or open issues for any improvements or bug fixes.

## License

[Your License Here]
