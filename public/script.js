// Utility function to get URL parameters
function getUrlParameter(name) {
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  const regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
  const results = regex.exec(location.search);
  return results === null ? "" : decodeURIComponent(results[1]);
}

// Utility function to update URL parameters
function updateUrlParameters(params) {
  const url = new URL(window.location.href);
  Object.keys(params).forEach((key) => {
    if (params[key] !== null && params[key] !== undefined) {
      url.searchParams.set(key, params[key]);
    } else {
      url.searchParams.delete(key);
    }
  });
  window.history.pushState({}, "", url);
}

// Global variables
let currentPage = parseInt(getUrlParameter("page") || 1);
let totalPages = 1;
let currentVfxPage = parseInt(getUrlParameter("vfxPage") || 1);
let totalVfxPages = 1;
let currentPageSize = parseInt(getUrlParameter("pageSize") || 12);
let currentVfxPageSize = parseInt(getUrlParameter("vfxPageSize") || 6);
let currentLayout = parseInt(getUrlParameter("layout") || 2);
let data = {};
let vfxData = {};
let currentMusicPage = parseInt(getUrlParameter("musicPage") || 1);
let totalMusicPages = 1;
let currentMusicPageSize = parseInt(getUrlParameter("musicPageSize") || 12);
let musicData = {};

// Function to copy file path or name
function copyPath(fileName, type = "path", category = "sfx") {
  let apiEndpoint;
  if (category === true || category === "vfx") {
    // Backward compatibility for boolean true representing VFX
    apiEndpoint = "/api/copy-vfx-path";
  } else if (category === "music") {
    apiEndpoint = "/api/copy-music-path";
  } else {
    apiEndpoint = "/api/copy-path";
  }

  fetch(`${apiEndpoint}?file=${encodeURIComponent(fileName)}&type=${type}`)
    .then((res) => res.json())
    .then((data) => {
      const textToCopy = type === "path" ? data.path : fileName;
      navigator.clipboard.writeText(textToCopy).then(() => {
        const suffix =
          category === "vfx" || category === true
            ? ".vfx"
            : category === "music"
            ? ".music"
            : "";
        const copyBtn = document.querySelector(
          `[data-file="${fileName}"][data-type="${type}"]${suffix}`
        );
        if (!copyBtn) return;
        copyBtn.textContent = type === "path" ? "Copied Path!" : "Copied Name!";
        copyBtn.classList.add("copied");
        setTimeout(() => {
          copyBtn.textContent = type === "path" ? "Copy Path" : "Copy Name";
          copyBtn.classList.remove("copied");
        }, 2000);
      });
    })
    .catch(console.error);
}

// Function to open file location
function openFileLocation(fileName, category = "sfx") {
  if (category === "sfx") {
    window.electronAPI.openFileLocation(fileName);
  } else if (category === "vfx") {
    window.electronAPI.openVFXLocation(fileName);
  } else if (category === "music") {
    window.electronAPI.openMusicLocation(fileName);
  }
}

// Update pagination controls
function updatePaginationControls(isVfx = false) {
  if (isVfx) {
    const prevPageBtn = document.getElementById("prevPageVfx");
    const nextPageBtn = document.getElementById("nextPageVfx");
    const paginationInfo = document.getElementById("paginationInfoVfx");

    prevPageBtn.disabled = currentVfxPage <= 1;
    nextPageBtn.disabled = currentVfxPage >= totalVfxPages;
    paginationInfo.textContent = `Page ${currentVfxPage} of ${totalVfxPages} (${vfxData.total} videos)`;
  } else {
    const prevPageBtn = document.getElementById("prevPage");
    const nextPageBtn = document.getElementById("nextPage");
    const paginationInfo = document.getElementById("paginationInfo");

    prevPageBtn.disabled = currentPage <= 1;
    nextPageBtn.disabled = currentPage >= totalPages;
    paginationInfo.textContent = `Page ${currentPage} of ${totalPages} (${data.total} sounds)`;
  }
}

// Function to update grid layout
function updateGridLayout(layout) {
  const container = document.querySelector(".container");
  if (container) {
    container.style.gridTemplateColumns = `repeat(${layout}, minmax(0, 1fr))`;
  }

  // Update URL parameter
  updateUrlParameters({ layout });
}

// Function to update page size
function updatePageSize(pageType, size) {
  if (pageType === "sfx") {
    currentPageSize = size;
    currentPage = 1; // Reset to first page

    // Update URL parameters
    updateUrlParameters({
      pageSize: size,
      page: 1,
    });

    loadSounds(
      document.getElementById("search-sfx").value,
      currentPage,
      currentPageSize
    );
  } else if (pageType === "vfx") {
    currentVfxPageSize = size;
    currentVfxPage = 1; // Reset to first page

    // Update URL parameters
    updateUrlParameters({
      vfxPageSize: size,
      vfxPage: 1,
    });

    loadVfx(
      document.getElementById("search-vfx").value,
      currentVfxPage,
      currentVfxPageSize
    );
  } else if (pageType === "music") {
    currentMusicPageSize = size;
    currentMusicPage = 1; // Reset to first page

    updateUrlParameters({
      musicPageSize: size,
      musicPage: 1,
    });

    loadMusic(
      document.getElementById("search-music").value,
      currentMusicPage,
      currentMusicPageSize
    );
  }
}

// Load sounds with optional search and pagination
function loadSounds(
  query = "",
  page = currentPage,
  pageSize = currentPageSize
) {
  const results = document.getElementById("results");
  results.innerHTML = "Loading sounds..."; // Add loading indicator

  // Update URL parameters
  updateUrlParameters({
    q: query || null,
    page,
    pageSize,
  });

  fetch(
    `/api/sounds?q=${encodeURIComponent(
      query
    )}&page=${page}&pageSize=${pageSize}`
  )
    .then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    })
    .then((responseData) => {
      data = responseData;
      currentPage = data.currentPage;
      totalPages = data.totalPages;

      results.innerHTML = ""; // Clear loading indicator

      if (data.sounds.length === 0) {
        results.innerHTML = "No sounds found.";
        return;
      }

      data.sounds.forEach((sound, index) => {
        try {
          const box = document.createElement("div");
          box.className = "wave-box";
          box.draggable = true;

          const header = document.createElement("div");
          header.className = "wave-header";

          const title = document.createElement("div");
          title.innerText = sound.name;
          title.className = "wave-title";

          const buttonContainer = document.createElement("div");
          buttonContainer.className = "button-container";

          const copyPathBtn = document.createElement("button");
          copyPathBtn.textContent = "Copy Path";
          copyPathBtn.className = "copy-btn";
          copyPathBtn.dataset.file = sound.name;
          copyPathBtn.dataset.type = "path";
          copyPathBtn.addEventListener("click", () =>
            copyPath(sound.name, "path")
          );

          const copyNameBtn = document.createElement("button");
          copyNameBtn.textContent = "Copy Name";
          copyNameBtn.className = "copy-btn";
          copyNameBtn.dataset.file = sound.name;
          copyNameBtn.dataset.type = "name";
          copyNameBtn.addEventListener("click", () =>
            copyPath(sound.name, "name")
          );

          const openLocationBtn = document.createElement("button");
          openLocationBtn.textContent = "Open Location";
          openLocationBtn.className = "open-location-btn";
          openLocationBtn.dataset.file = sound.name;
          openLocationBtn.addEventListener("click", () =>
            openFileLocation(sound.name)
          );

          const dragBtn = document.createElement("button");
          dragBtn.textContent = "Drag to App";
          dragBtn.className = "drag-btn sfx";
          dragBtn.draggable = true;
          dragBtn.addEventListener("dragstart", (event) => {
            handleDragStart(event, sound.name, "sfx");
          });

          buttonContainer.appendChild(copyPathBtn);
          buttonContainer.appendChild(copyNameBtn);
          buttonContainer.appendChild(openLocationBtn);
          buttonContainer.appendChild(dragBtn);

          header.appendChild(title);
          header.appendChild(buttonContainer);

          const waveformEl = document.createElement("div");
          waveformEl.className = "waveform";
          waveformEl.id = `waveform-${index}`;

          box.appendChild(header);
          box.appendChild(waveformEl);
          results.appendChild(box);

          const wavesurfer = WaveSurfer.create({
            container: `#waveform-${index}`,
            waveColor: "#999",
            progressColor: "#333",
            height: 100,
            barWidth: 2,
            responsive: true,
            fillParent: true,
          });

          wavesurfer.on("error", (error) => {
            console.error(`Error loading sound ${sound.name}:`, error);
            const waveformEl = document.getElementById(`waveform-${index}`);
            if (waveformEl) {
              waveformEl.innerHTML = `<div class="error">Failed to load sound: ${sound.name}</div>`;
            }
          });

          wavesurfer.load(sound.url);

          waveformEl.addEventListener("mouseenter", () => {
            wavesurfer.play();
          });
          waveformEl.addEventListener("mouseleave", () => {
            wavesurfer.pause();
          });
        } catch (renderError) {
          console.error(`Error rendering sound ${sound.name}:`, renderError);
        }
      });

      updatePaginationControls();
      updateGridLayout(currentLayout);
    })
    .catch((error) => {
      console.error("Error loading sounds:", error);
      results.innerHTML = `Error loading sounds: ${error.message}`;
    });
}

// Load VFX with optional search and pagination
function loadVfx(
  query = "",
  page = currentVfxPage,
  pageSize = currentVfxPageSize
) {
  const results = document.getElementById("vfx-results");
  results.innerHTML = "Loading videos..."; // Add loading indicator

  // Update URL parameters
  updateUrlParameters({
    vfxQ: query || null,
    vfxPage: page,
    vfxPageSize: pageSize,
  });

  fetch(
    `/api/vfx?q=${encodeURIComponent(query)}&page=${page}&pageSize=${pageSize}`
  )
    .then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    })
    .then((responseData) => {
      vfxData = responseData;
      currentVfxPage = vfxData.currentPage;
      totalVfxPages = vfxData.totalPages;

      results.innerHTML = ""; // Clear loading indicator

      if (vfxData.videos.length === 0) {
        results.innerHTML = "No videos found.";
        return;
      }

      vfxData.videos.forEach((video) => {
        const box = document.createElement("div");
        box.className = "video-box";
        box.draggable = true;

        const header = document.createElement("div");
        header.className = "wave-header";

        const title = document.createElement("div");
        title.innerText = video.name;
        title.className = "wave-title";

        const buttonContainer = document.createElement("div");
        buttonContainer.className = "button-container";

        const copyPathBtn = document.createElement("button");
        copyPathBtn.textContent = "Copy Path";
        copyPathBtn.className = "copy-btn vfx";
        copyPathBtn.dataset.file = video.name;
        copyPathBtn.dataset.type = "path";
        copyPathBtn.addEventListener("click", () =>
          copyPath(video.name, "path", "vfx")
        );

        const copyNameBtn = document.createElement("button");
        copyNameBtn.textContent = "Copy Name";
        copyNameBtn.className = "copy-btn vfx";
        copyNameBtn.dataset.file = video.name;
        copyNameBtn.dataset.type = "name";
        copyNameBtn.addEventListener("click", () =>
          copyPath(video.name, "name", "vfx")
        );

        const openLocationBtn = document.createElement("button");
        openLocationBtn.textContent = "Open Location";
        openLocationBtn.className = "open-location-btn vfx";
        openLocationBtn.dataset.file = video.name;
        openLocationBtn.addEventListener("click", () =>
          openFileLocation(video.name, "vfx")
        );

        const dragBtn = document.createElement("button");
        dragBtn.textContent = "Drag to App";
        dragBtn.className = "drag-btn vfx";
        dragBtn.draggable = true;
        dragBtn.addEventListener("dragstart", (event) => {
          handleDragStart(event, video.name, "vfx");
        });

        buttonContainer.appendChild(copyPathBtn);
        buttonContainer.appendChild(copyNameBtn);
        buttonContainer.appendChild(openLocationBtn);
        buttonContainer.appendChild(dragBtn);

        header.appendChild(title);
        header.appendChild(buttonContainer);

        const videoEl = document.createElement("video");
        videoEl.className = "video-preview";
        videoEl.src = video.url;
        videoEl.controls = true;

        box.appendChild(header);
        box.appendChild(videoEl);
        results.appendChild(box);
      });

      updatePaginationControls(true);
      updateGridLayout(currentLayout);
    })
    .catch((error) => {
      console.error("Error loading VFX:", error);
      results.innerHTML = `Error loading VFX: ${error.message}`;
    });
}

// Load Music with optional search and pagination
function loadMusic(
  query = "",
  page = currentMusicPage,
  pageSize = currentMusicPageSize
) {
  const results = document.getElementById("music-results");
  if (!results) return; // safety check
  results.innerHTML = "Loading music...";

  updateUrlParameters({
    musicQ: query || null,
    musicPage: page,
    musicPageSize: pageSize,
  });

  fetch(
    `/api/music?q=${encodeURIComponent(
      query
    )}&page=${page}&pageSize=${pageSize}`
  )
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return res.json();
    })
    .then((responseData) => {
      musicData = responseData;
      currentMusicPage = musicData.currentPage;
      totalMusicPages = musicData.totalPages;

      results.innerHTML = "";

      if (musicData.music.length === 0) {
        results.innerHTML = "No music found.";
        return;
      }

      musicData.music.forEach((track, index) => {
        const box = document.createElement("div");
        box.className = "wave-box";
        box.draggable = true;

        const header = document.createElement("div");
        header.className = "wave-header";

        const title = document.createElement("div");
        title.innerText = track.name;
        title.className = "wave-title";

        const buttonContainer = document.createElement("div");
        buttonContainer.className = "button-container";

        const copyPathBtn = document.createElement("button");
        copyPathBtn.textContent = "Copy Path";
        copyPathBtn.className = "copy-btn music";
        copyPathBtn.dataset.file = track.name;
        copyPathBtn.dataset.type = "path";
        copyPathBtn.addEventListener("click", () =>
          copyPath(track.name, "path", "music")
        );

        const copyNameBtn = document.createElement("button");
        copyNameBtn.textContent = "Copy Name";
        copyNameBtn.className = "copy-btn music";
        copyNameBtn.dataset.file = track.name;
        copyNameBtn.dataset.type = "name";
        copyNameBtn.addEventListener("click", () =>
          copyPath(track.name, "name", "music")
        );

        const openLocationBtn = document.createElement("button");
        openLocationBtn.textContent = "Open Location";
        openLocationBtn.className = "open-location-btn music";
        openLocationBtn.dataset.file = track.name;
        openLocationBtn.addEventListener("click", () =>
          openFileLocation(track.name, "music")
        );

        const dragBtn = document.createElement("button");
        dragBtn.textContent = "Drag to App";
        dragBtn.className = "drag-btn music";
        dragBtn.draggable = true;
        dragBtn.addEventListener("dragstart", (event) => {
          handleDragStart(event, track.name, "music");
        });

        buttonContainer.appendChild(copyPathBtn);
        buttonContainer.appendChild(copyNameBtn);
        buttonContainer.appendChild(openLocationBtn);
        buttonContainer.appendChild(dragBtn);

        header.appendChild(title);
        header.appendChild(buttonContainer);

        const waveformEl = document.createElement("div");
        waveformEl.className = "waveform";
        waveformEl.id = `music-waveform-${index}`;

        box.appendChild(header);
        box.appendChild(waveformEl);
        results.appendChild(box);

        const wavesurfer = WaveSurfer.create({
          container: `#music-waveform-${index}`,
          waveColor: "#999",
          progressColor: "#333",
          height: 100,
          barWidth: 2,
          responsive: true,
          fillParent: true,
        });

        wavesurfer.on("error", (error) => {
          console.error(`Error loading track ${track.name}:`, error);
          const waveformEl = document.getElementById(`music-waveform-${index}`);
          if (waveformEl) {
            waveformEl.innerHTML = `<div class="error">Failed to load track: ${track.name}</div>`;
          }
        });

        wavesurfer.load(track.url);

        waveformEl.addEventListener("mouseenter", () => {
          wavesurfer.play();
        });
        waveformEl.addEventListener("mouseleave", () => {
          wavesurfer.pause();
        });
      });

      updateMusicPaginationControls();
      updateGridLayout(currentLayout);
    })
    .catch((error) => {
      console.error("Error loading music:", error);
      results.innerHTML = `Error loading music: ${error.message}`;
    });
}

// Function to fetch file counts
function fetchFileCounts() {
  // Only run on the home page
  if (
    !document.getElementById("sfx-count") ||
    !document.getElementById("vfx-count")
  )
    return;

  // Fetch SFX count
  fetch("/api/file-count?type=sfx")
    .then((response) => {
      // Check if the response is OK (status in the range 200-299)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      const sfxCountEl = document.getElementById("sfx-count");
      if (sfxCountEl) {
        sfxCountEl.textContent = `(${data.count} files)`;
      }
    })
    .catch((error) => {
      console.error("Error fetching SFX count:", error);
      const sfxCountEl = document.getElementById("sfx-count");
      if (sfxCountEl) {
        sfxCountEl.textContent = "(Error loading)";
      }
    });

  // Fetch VFX count
  fetch("/api/file-count?type=vfx")
    .then((response) => {
      // Check if the response is OK (status in the range 200-299)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      const vfxCountEl = document.getElementById("vfx-count");
      if (vfxCountEl) {
        vfxCountEl.textContent = `(${data.count} files)`;
      }
    })
    .catch((error) => {
      console.error("Error fetching VFX count:", error);
      const vfxCountEl = document.getElementById("vfx-count");
      if (vfxCountEl) {
        vfxCountEl.textContent = "(Error loading)";
      }
    });
}

// Page-specific initialization
document.addEventListener("DOMContentLoaded", () => {
  // Check which page we're on and initialize accordingly
  if (document.getElementById("search-sfx")) {
    // SFX Page
    const searchSfx = document.getElementById("search-sfx");
    const prevPageBtn = document.getElementById("prevPage");
    const nextPageBtn = document.getElementById("nextPage");
    const pageSizeSelect = document.getElementById("page-size-sfx");
    const layoutSelect = document.getElementById("layout-select-sfx");

    // Set initial values from URL parameters
    searchSfx.value = getUrlParameter("q") || "";

    // Initial load of sounds
    loadSounds(searchSfx.value, currentPage, currentPageSize);

    // Page Size Selection
    if (pageSizeSelect) {
      pageSizeSelect.value = currentPageSize;
      pageSizeSelect.addEventListener("change", (e) => {
        updatePageSize("sfx", parseInt(e.target.value));
      });
    }

    // Layout Selection
    if (layoutSelect) {
      layoutSelect.value = currentLayout;
      layoutSelect.addEventListener("change", (e) => {
        currentLayout = parseInt(e.target.value);
        updateGridLayout(currentLayout);
      });
    }

    // Search functionality
    searchSfx.addEventListener("input", () => {
      currentPage = 1; // Reset to first page on new search
      loadSounds(searchSfx.value, currentPage, currentPageSize);
    });

    // Pagination
    prevPageBtn.addEventListener("click", () => {
      if (currentPage > 1) {
        currentPage--;
        loadSounds(searchSfx.value, currentPage, currentPageSize);
      }
    });

    nextPageBtn.addEventListener("click", () => {
      if (currentPage < totalPages) {
        currentPage++;
        loadSounds(searchSfx.value, currentPage, currentPageSize);
      }
    });
  }

  if (document.getElementById("search-vfx")) {
    // VFX Page
    const searchVfx = document.getElementById("search-vfx");
    const prevPageVfxBtn = document.getElementById("prevPageVfx");
    const nextPageVfxBtn = document.getElementById("nextPageVfx");
    const pageSizeSelect = document.getElementById("page-size-vfx");
    const layoutSelect = document.getElementById("layout-select-vfx");

    // Set initial values from URL parameters
    searchVfx.value = getUrlParameter("vfxQ") || "";

    // Initial load of VFX
    loadVfx(searchVfx.value, currentVfxPage, currentVfxPageSize);

    // Page Size Selection
    if (pageSizeSelect) {
      pageSizeSelect.value = currentVfxPageSize;
      pageSizeSelect.addEventListener("change", (e) => {
        updatePageSize("vfx", parseInt(e.target.value));
      });
    }

    // Layout Selection
    if (layoutSelect) {
      layoutSelect.value = currentLayout;
      layoutSelect.addEventListener("change", (e) => {
        currentLayout = parseInt(e.target.value);
        updateGridLayout(currentLayout);
      });
    }

    // Search functionality
    searchVfx.addEventListener("input", () => {
      currentVfxPage = 1; // Reset to first page on new search
      loadVfx(searchVfx.value, currentVfxPage, currentVfxPageSize);
    });

    // Pagination
    prevPageVfxBtn.addEventListener("click", () => {
      if (currentVfxPage > 1) {
        currentVfxPage--;
        loadVfx(searchVfx.value, currentVfxPage, currentVfxPageSize);
      }
    });

    nextPageVfxBtn.addEventListener("click", () => {
      if (currentVfxPage < totalVfxPages) {
        currentVfxPage++;
        loadVfx(searchVfx.value, currentVfxPage, currentVfxPageSize);
      }
    });
  }

  if (document.getElementById("search-music")) {
    const searchMusic = document.getElementById("search-music");
    const prevPageMusicBtn = document.getElementById("prevPageMusic");
    const nextPageMusicBtn = document.getElementById("nextPageMusic");
    const pageSizeSelectMusic = document.getElementById("page-size-music");
    const layoutSelectMusic = document.getElementById("layout-select-music");

    searchMusic.value = getUrlParameter("musicQ") || "";

    loadMusic(searchMusic.value, currentMusicPage, currentMusicPageSize);

    if (pageSizeSelectMusic) {
      pageSizeSelectMusic.value = currentMusicPageSize;
      pageSizeSelectMusic.addEventListener("change", (e) => {
        updatePageSize("music", parseInt(e.target.value));
      });
    }

    if (layoutSelectMusic) {
      layoutSelectMusic.value = currentLayout;
      layoutSelectMusic.addEventListener("change", (e) => {
        currentLayout = parseInt(e.target.value);
        updateGridLayout(currentLayout);
      });
    }

    searchMusic.addEventListener("input", () => {
      currentMusicPage = 1;
      loadMusic(searchMusic.value, currentMusicPage, currentMusicPageSize);
    });

    prevPageMusicBtn.addEventListener("click", () => {
      if (currentMusicPage > 1) {
        currentMusicPage--;
        loadMusic(searchMusic.value, currentMusicPage, currentMusicPageSize);
      }
    });

    nextPageMusicBtn.addEventListener("click", () => {
      if (currentMusicPage < totalMusicPages) {
        currentMusicPage++;
        loadMusic(searchMusic.value, currentMusicPage, currentMusicPageSize);
      }
    });
  }

  // Fetch file counts
  fetchFileCounts();
});

// Tab switching
document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    // Remove active class from all buttons and tabs
    document
      .querySelectorAll(".tab-btn")
      .forEach((b) => b.classList.remove("active"));
    document
      .querySelectorAll(".tab-content")
      .forEach((t) => t.classList.remove("active"));

    // Add active class to clicked button and corresponding tab
    btn.classList.add("active");
    document.getElementById(`${btn.dataset.tab}-tab`).classList.add("active");

    // Load content based on active tab
    if (btn.dataset.tab === "sfx") {
      loadSounds();
    } else if (btn.dataset.tab === "vfx") {
      loadVfx();
    } else if (btn.dataset.tab === "music") {
      loadMusic();
    }
  });
});

// Update pagination controls for Music
function updateMusicPaginationControls() {
  const prevPageBtn = document.getElementById("prevPageMusic");
  const nextPageBtn = document.getElementById("nextPageMusic");
  const paginationInfo = document.getElementById("paginationInfoMusic");
  if (!prevPageBtn || !nextPageBtn || !paginationInfo) return;

  prevPageBtn.disabled = currentMusicPage <= 1;
  nextPageBtn.disabled = currentMusicPage >= totalMusicPages;
  paginationInfo.textContent = `Page ${currentMusicPage} of ${totalMusicPages} (${musicData.total} tracks)`;
}

// Function to handle file drag start
function handleDragStart(event, fileName, category) {
  event.preventDefault(); // Prevent default to allow custom drag handling
  window.electronAPI.startDrag(fileName, category);
}
