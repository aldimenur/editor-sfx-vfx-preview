// Global variables
let currentPage = 1;
let totalPages = 1;
let currentVfxPage = 1;
let totalVfxPages = 1;
let data = {};
let vfxData = {};

// Function to copy file path or name
function copyPath(fileName, type = "path", isVfx = false) {
  const apiEndpoint = isVfx ? "/api/copy-vfx-path" : "/api/copy-path";
  fetch(`${apiEndpoint}?file=${encodeURIComponent(fileName)}&type=${type}`)
    .then((res) => res.json())
    .then((data) => {
      let textToCopy = type === "path" ? data.path : fileName;
      navigator.clipboard.writeText(textToCopy).then(() => {
        const copyBtn = document.querySelector(
          `[data-file="${fileName}"][data-type="${type}"]${isVfx ? ".vfx" : ""}`
        );
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
function openFileLocation(fileName, isVfx = false) {
  const apiEndpoint = isVfx
    ? "/api/open-vfx-location"
    : "/api/open-file-location";
  fetch(`${apiEndpoint}?file=${encodeURIComponent(fileName)}`)
    .then((res) => res.json())
    .then((data) => {
      const openLocationBtn = document.querySelector(
        `[data-file="${fileName}"].open-location-btn${isVfx ? ".vfx" : ""}`
      );
      if (data.success) {
        openLocationBtn.textContent = "Location Opened!";
        openLocationBtn.classList.add("copied");
      } else {
        openLocationBtn.textContent = "Error Opening";
        openLocationBtn.classList.add("copied");
      }
      setTimeout(() => {
        openLocationBtn.textContent = "Open Location";
        openLocationBtn.classList.remove("copied");
      }, 2000);
    })
    .catch((error) => {
      console.error(error);
      const openLocationBtn = document.querySelector(
        `[data-file="${fileName}"].open-location-btn${isVfx ? ".vfx" : ""}`
      );
      openLocationBtn.textContent = "Error Opening";
      openLocationBtn.classList.add("copied");
      setTimeout(() => {
        openLocationBtn.textContent = "Open Location";
        openLocationBtn.classList.remove("copied");
      }, 2000);
    });
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

// Load sounds with optional search and pagination
function loadSounds(query = "", page = 1) {
  const results = document.getElementById("results");
  results.innerHTML = "Loading sounds..."; // Add loading indicator

  fetch(`/api/sounds?q=${encodeURIComponent(query)}&page=${page}`)
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

          buttonContainer.appendChild(copyPathBtn);
          buttonContainer.appendChild(copyNameBtn);
          buttonContainer.appendChild(openLocationBtn);

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
    })
    .catch((error) => {
      console.error("Error loading sounds:", error);
      results.innerHTML = `Error loading sounds: ${error.message}`;
    });
}

// Load VFX with optional search and pagination
function loadVfx(query = "", page = 1) {
  const results = document.getElementById("vfx-results");

  fetch(`/api/vfx?q=${encodeURIComponent(query)}&page=${page}`)
    .then((res) => res.json())
    .then((responseData) => {
      vfxData = responseData;
      currentVfxPage = vfxData.currentPage;
      totalVfxPages = vfxData.totalPages;

      results.innerHTML = "";
      vfxData.videos.forEach((video) => {
        const box = document.createElement("div");
        box.className = "video-box";

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
          copyPath(video.name, "path", true)
        );

        const copyNameBtn = document.createElement("button");
        copyNameBtn.textContent = "Copy Name";
        copyNameBtn.className = "copy-btn vfx";
        copyNameBtn.dataset.file = video.name;
        copyNameBtn.dataset.type = "name";
        copyNameBtn.addEventListener("click", () =>
          copyPath(video.name, "name", true)
        );

        const openLocationBtn = document.createElement("button");
        openLocationBtn.textContent = "Open Location";
        openLocationBtn.className = "open-location-btn vfx";
        openLocationBtn.dataset.file = video.name;
        openLocationBtn.addEventListener("click", () =>
          openFileLocation(video.name, true)
        );

        buttonContainer.appendChild(copyPathBtn);
        buttonContainer.appendChild(copyNameBtn);
        buttonContainer.appendChild(openLocationBtn);

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

    // Initial load of sounds
    loadSounds();

    // Search functionality
    searchSfx.addEventListener("input", () => {
      currentPage = 1; // Reset to first page on new search
      loadSounds(searchSfx.value);
    });

    // Pagination
    prevPageBtn.addEventListener("click", () => {
      if (currentPage > 1) {
        currentPage--;
        loadSounds(searchSfx.value, currentPage);
      }
    });

    nextPageBtn.addEventListener("click", () => {
      if (currentPage < totalPages) {
        currentPage++;
        loadSounds(searchSfx.value, currentPage);
      }
    });
  }

  if (document.getElementById("search-vfx")) {
    // VFX Page
    const searchVfx = document.getElementById("search-vfx");
    const prevPageVfxBtn = document.getElementById("prevPageVfx");
    const nextPageVfxBtn = document.getElementById("nextPageVfx");

    // Initial load of VFX
    loadVfx();

    // Search functionality
    searchVfx.addEventListener("input", () => {
      currentVfxPage = 1; // Reset to first page on new search
      loadVfx(searchVfx.value);
    });

    // Pagination
    prevPageVfxBtn.addEventListener("click", () => {
      if (currentVfxPage > 1) {
        currentVfxPage--;
        loadVfx(searchVfx.value, currentVfxPage);
      }
    });

    nextPageVfxBtn.addEventListener("click", () => {
      if (currentVfxPage < totalVfxPages) {
        currentVfxPage++;
        loadVfx(searchVfx.value, currentVfxPage);
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
    }
  });
});
