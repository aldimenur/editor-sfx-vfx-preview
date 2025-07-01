// server.js
const express = require("express");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

// In CommonJS, __dirname is available globally

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static("public"));

// Helper function to get files with pagination and search
function getFiles(directory, query, page = 1, pageSize = 12) {
  try {
    let files = [];

    // Recursively read files
    const readRecursively = (dir) => {
      try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);

          if (entry.isDirectory()) {
            readRecursively(fullPath);
          } else {
            try {
              const relativePath = path.relative(directory, fullPath);

              // Safely handle special characters in file paths
              const safeRelativePath = relativePath
                .split(path.sep)
                .map((segment) => encodeURIComponent(segment))
                .join("/");

              files.push({
                name: relativePath,
                url: `/sounds/${safeRelativePath}`,
                originalPath: fullPath,
              });
            } catch (fileError) {
              console.error(`Error processing file ${fullPath}:`, fileError);
            }
          }
        }
      } catch (dirError) {
        console.error(`Error reading directory ${dir}:`, dirError);
      }
    };

    readRecursively(directory);

    // Filter files based on query and extensions
    files = files.filter((file) => {
      const lowercaseQuery = query.toLowerCase();
      const lowercaseFileName = file.name.toLowerCase();
      const allowedExtensions = [".mp3", ".wav", ".ogg", ".m4a"];
      return (
        allowedExtensions.some((ext) => lowercaseFileName.endsWith(ext)) &&
        lowercaseFileName.includes(lowercaseQuery)
      );
    });

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
    let files = [];

    // Recursively read files
    const readRecursively = (dir) => {
      try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);

          if (entry.isDirectory()) {
            readRecursively(fullPath);
          } else {
            try {
              const relativePath = path.relative(directory, fullPath);

              // Safely handle special characters in file paths
              const safeRelativePath = relativePath
                .split(path.sep)
                .map((segment) => encodeURIComponent(segment))
                .join("/");

              files.push({
                name: relativePath,
                url: `/${path.relative(
                  "public",
                  directory
                )}/${safeRelativePath}`,
                originalPath: fullPath,
              });
            } catch (fileError) {
              console.error(`Error processing file ${fullPath}:`, fileError);
            }
          }
        }
      } catch (dirError) {
        console.error(`Error reading directory ${dir}:`, dirError);
      }
    };

    readRecursively(directory);

    // Filter files based on query and extensions
    files = files.filter((file) => {
      const lowercaseQuery = query.toLowerCase();
      const lowercaseFileName = file.name.toLowerCase();
      const allowedExtensions = [".mp4", ".avi", ".mov", ".mkv", ".webm"];
      return (
        allowedExtensions.some((ext) => lowercaseFileName.endsWith(ext)) &&
        lowercaseFileName.includes(lowercaseQuery)
      );
    });

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

// Helper function to get Music files with pagination and search
function getMusicFiles(directory, query, page = 1, pageSize = 12) {
  try {
    let files = [];

    // Recursively read files
    const readRecursively = (dir) => {
      try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);

          if (entry.isDirectory()) {
            readRecursively(fullPath);
          } else {
            try {
              const relativePath = path.relative(directory, fullPath);

              // Safely handle special characters in file paths
              const safeRelativePath = relativePath
                .split(path.sep)
                .map((segment) => encodeURIComponent(segment))
                .join("/");

              files.push({
                name: relativePath,
                url: `/music/${safeRelativePath}`,
                originalPath: fullPath,
              });
            } catch (fileError) {
              console.error(`Error processing file ${fullPath}:`, fileError);
            }
          }
        }
      } catch (dirError) {
        console.error(`Error reading directory ${dir}:`, dirError);
      }
    };

    readRecursively(directory);

    // Filter files based on query and extensions
    files = files.filter((file) => {
      const lowercaseQuery = query.toLowerCase();
      const lowercaseFileName = file.name.toLowerCase();
      const allowedExtensions = [".mp3", ".wav", ".ogg", ".m4a"];
      return (
        allowedExtensions.some((ext) => lowercaseFileName.endsWith(ext)) &&
        lowercaseFileName.includes(lowercaseQuery)
      );
    });

    const total = files.length;
    const totalPages = Math.ceil(total / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedFiles = files.slice(startIndex, endIndex);

    return {
      music: paginatedFiles,
      total,
      currentPage: page,
      totalPages,
      pageSize,
    };
  } catch (error) {
    console.error("Error reading music directory:", error);
    return {
      music: [],
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

// API endpoint for Music
app.get("/api/music", (req, res) => {
  const { q = "", page = 1, pageSize = 12 } = req.query;
  const result = getMusicFiles(
    path.join(__dirname, "music"),
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

// API endpoint to copy Music file path
app.get("/api/copy-music-path", (req, res) => {
  const { file, type } = req.query;
  const musicPath = path.join(__dirname, "music", file);

  try {
    const fullPath = type === "path" ? musicPath : file;
    res.json({ path: fullPath });
  } catch (error) {
    res.status(500).json({ error: "Could not get Music file path" });
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

// API endpoint to open Music file location
app.get("/api/open-music-location", (req, res) => {
  const { file } = req.query;
  const musicPath = path.join(__dirname, "music", file);

  try {
    const command =
      process.platform === "win32"
        ? `explorer /select,"${musicPath}"`
        : process.platform === "darwin"
        ? `open -R "${musicPath}"`
        : `xdg-open "$(dirname "${musicPath}")"`;

    exec(command, (error) => {
      if (error) {
        console.error("Error opening Music file location:", error);
        res.json({ success: false });
      } else {
        res.json({ success: true });
      }
    });
  } catch (error) {
    console.error("Error opening Music file location:", error);
    res.status(500).json({ success: false });
  }
});

// API endpoint to count files
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
  } else if (type === "music") {
    directory = path.join(__dirname, "music");
    fileExtension = ".mp3";
  } else {
    return res
      .status(400)
      .json({ error: 'Invalid type. Use "sfx", "vfx", or "music".' });
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

app.use("/sounds", express.static(path.join(__dirname, "sfx")));
app.use("/vfx", express.static(path.join(__dirname, "vfx")));
app.use("/music", express.static(path.join(__dirname, "music")));

// Start the server
const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});