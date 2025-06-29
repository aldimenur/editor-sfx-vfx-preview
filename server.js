// server.js
const express = require("express");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static("public"));

// Helper function to get files with pagination and search
function getFiles(directory, query, page = 1, pageSize = 12) {
  try {
    let files = fs
      .readdirSync(directory)
      .filter((file) => {
        const lowercaseQuery = query.toLowerCase();
        const allowedExtensions = [".mp3", ".wav", ".ogg", ".m4a"];
        return (
          allowedExtensions.some((ext) => file.toLowerCase().endsWith(ext)) &&
          file.toLowerCase().includes(lowercaseQuery)
        );
      })
      .map((file) => ({
        name: file,
        url: `/sounds/${file}`,
      }));

    const total = files.length;
    const totalPages = Math.ceil(total / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedFiles = files.slice(startIndex, endIndex);

    return {
      sounds: paginatedFiles,
      total,
      currentPage: page,
      totalPages,
      pageSize,
    };
  } catch (error) {
    console.error("Error reading directory:", error);
    return {
      sounds: [],
      total: 0,
      currentPage: 1,
      totalPages: 1,
      pageSize,
    };
  }
}

// Helper function to get VFX files with pagination and search
function getVfxFiles(directory, query, page = 1, pageSize = 6) {
  try {
    let files = fs
      .readdirSync(directory)
      .filter((file) => {
        const lowercaseQuery = query.toLowerCase();
        const allowedExtensions = [".mp4", ".avi", ".mov", ".mkv", ".webm"];
        return (
          allowedExtensions.some((ext) => file.toLowerCase().endsWith(ext)) &&
          file.toLowerCase().includes(lowercaseQuery)
        );
      })
      .map((file) => ({
        name: file,
        url: `/${path.relative("public", directory)}/${file}`,
      }));

    const total = files.length;
    const totalPages = Math.ceil(total / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedFiles = files.slice(startIndex, endIndex);

    return {
      videos: paginatedFiles,
      total,
      currentPage: page,
      totalPages,
      pageSize,
    };
  } catch (error) {
    console.error("Error reading VFX directory:", error);
    return {
      videos: [],
      total: 0,
      currentPage: 1,
      totalPages: 1,
      pageSize,
    };
  }
}

// API endpoint for sounds
app.get("/api/sounds", (req, res) => {
  const { q = "", page = 1, pageSize = 12 } = req.query;
  const result = getFiles(
    path.join(__dirname, "sfx"),
    q,
    parseInt(page),
    parseInt(pageSize)
  );
  res.json(result);
});

// API endpoint for VFX
app.get("/api/vfx", (req, res) => {
  const { q = "", page = 1, pageSize = 6 } = req.query;
  const result = getVfxFiles(
    path.join(__dirname, "vfx"),
    q,
    parseInt(page),
    parseInt(pageSize)
  );
  res.json(result);
});

// API endpoint to copy file path
app.get("/api/copy-path", (req, res) => {
  const { file, type } = req.query;
  const sfxPath = path.join(__dirname, "sfx", file);

  try {
    const fullPath = type === "path" ? sfxPath : file;
    res.json({ path: fullPath });
  } catch (error) {
    res.status(500).json({ error: "Could not get file path" });
  }
});

// API endpoint to copy VFX file path
app.get("/api/copy-vfx-path", (req, res) => {
  const { file, type } = req.query;
  const vfxPath = path.join(__dirname, "vfx", file);

  try {
    const fullPath = type === "path" ? vfxPath : file;
    res.json({ path: fullPath });
  } catch (error) {
    res.status(500).json({ error: "Could not get VFX file path" });
  }
});

// API endpoint to open file location
app.get("/api/open-file-location", (req, res) => {
  const { file } = req.query;
  const sfxPath = path.join(__dirname, "sfx", file);

  try {
    // Use the appropriate command based on the operating system
    const command =
      process.platform === "win32"
        ? `explorer /select,"${sfxPath}"`
        : process.platform === "darwin"
        ? `open -R "${sfxPath}"`
        : `xdg-open "$(dirname "${sfxPath}")"`;

    exec(command, (error) => {
      if (error) {
        console.error("Error opening file location:", error);
        res.json({ success: false });
      } else {
        res.json({ success: true });
      }
    });
  } catch (error) {
    console.error("Error opening file location:", error);
    res.status(500).json({ success: false });
  }
});

// API endpoint to open VFX file location
app.get("/api/open-vfx-location", (req, res) => {
  const { file } = req.query;
  const vfxPath = path.join(__dirname, "vfx", file);

  try {
    // Use the appropriate command based on the operating system
    const command =
      process.platform === "win32"
        ? `explorer /select,"${vfxPath}"`
        : process.platform === "darwin"
        ? `open -R "${vfxPath}"`
        : `xdg-open "$(dirname "${vfxPath}")"`;

    exec(command, (error) => {
      if (error) {
        console.error("Error opening VFX file location:", error);
        res.json({ success: false });
      } else {
        res.json({ success: true });
      }
    });
  } catch (error) {
    console.error("Error opening VFX file location:", error);
    res.status(500).json({ success: false });
  }
});

// Serve static files for sounds and VFX
app.use("/sounds", express.static(path.join(__dirname, "sfx")));
app.use("/vfx", express.static(path.join(__dirname, "vfx")));

// New API endpoint for file counts
app.get("/api/file-count", (req, res) => {
  const { type } = req.query;
  let directory;
  let fileExtension;

  if (type === "sfx") {
    directory = path.join(__dirname, "sfx");
    fileExtension = ".mp3";
  } else if (type === "vfx") {
    directory = path.join(__dirname, "vfx");
    fileExtension = ".mp4";
  } else {
    return res.status(400).json({ error: 'Invalid type. Use "sfx" or "vfx".' });
  }

  try {
    // Ensure the directory exists
    if (!fs.existsSync(directory)) {
      console.error(`Directory not found: ${directory}`);

      return res
        .status(404)
        .json({ error: `Directory ${directory} not found`, count: 0 });
    }

    // Read directory contents and filter files
    const files = fs.readdirSync(directory).filter((file) => {
      // Check file extension and ensure it's a file, not a directory
      const fullPath = path.join(directory, file);
      return (
        fs.statSync(fullPath).isFile() &&
        path.extname(file).toLowerCase() === fileExtension
      );
    });

    res.json({ count: files.length });
  } catch (error) {
    console.error(`Error counting ${type} files:`, error);
    res.status(500).json({ error: "Failed to count files", count: 0 });
  }
});

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
