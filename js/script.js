// -----------------------------
// DOM references
// -----------------------------
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');
const btn = document.querySelector('.filters button');
const gallery = document.getElementById('gallery');

const factText = document.getElementById('factText');

// Modal elements
const modal = document.getElementById('modal');
const modalBackdrop = modal.querySelector('.modal-backdrop');
const modalCloseBtn = modal.querySelector('.modal-close');
const modalMedia = document.getElementById('modalMedia');
const modalTitle = document.getElementById('modalTitle');
const modalDate = document.getElementById('modalDate');
const modalExplanation = document.getElementById('modalExplanation');

// -----------------------------
// Date setup (from dateRange.js)
// -----------------------------
setupDateInputs(startInput, endInput);

// -----------------------------
// Random space facts
// -----------------------------
const spaceFacts = [
  "Neutron stars can spin at a rate of 600 rotations per second.",
  "One day on Venus is longer than one year on Venus.",
  "There are more stars in the universe than grains of sand on all Earth's beaches.",
  "Jupiter has the shortest day of all the planets in our solar system.",
  "The footprints on the Moon will likely remain for millions of years.",
  "Saturn could float in water because it’s mostly made of gas.",
  "A day on Mars is only about 40 minutes longer than a day on Earth."
];

function showRandomFact() {
  const index = Math.floor(Math.random() * spaceFacts.length);
  factText.textContent = spaceFacts[index];
}

showRandomFact();

// -----------------------------
// NASA API
// -----------------------------
const API_KEY = "DEMO_KEY"; // Replace with your own key when ready

btn.addEventListener('click', () => {
  const start = startInput.value;
  const end = endInput.value;

  if (!start || !end) {
    alert("Please select both start and end dates.");
    return;
  }

  fetchImages(start, end);
});

async function fetchImages(start, end) {
  gallery.innerHTML = `<p class="loading">🔄 Loading space photos…</p>`;

  try {
    const url = `https://api.nasa.gov/planetary/apod?api_key=${API_KEY}&start_date=${start}&end_date=${end}`;
    const res = await fetch(url);

    if (!res.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await res.json();

    if (!Array.isArray(data) || data.length === 0) {
      gallery.innerHTML = `<p class="error">⚠️ No images found for this date range.</p>`;
      return;
    }

    // APOD sometimes returns newest first or last; sort by date ascending
    data.sort((a, b) => new Date(a.date) - new Date(b.date));

    renderGallery(data);
  } catch (err) {
    console.error(err);
    gallery.innerHTML = `<p class="error">❌ Error fetching data. Please try again.</p>`;
  }
}

// -----------------------------
// Gallery rendering
// -----------------------------
function renderGallery(items) {
  gallery.innerHTML = "";

  items.forEach(item => {
    const card = document.createElement("div");
    card.className = "gallery-item";

    let mediaHTML = "";

    if (item.media_type === "image") {
      mediaHTML = `
        <div class="image-wrapper">
          <img src="${item.url}" alt="${item.title}" />
        </div>
      `;
    } else if (item.media_type === "video") {
      // LevelUp: show a clear video indicator + link
      mediaHTML = `
        <div class="video-thumb">
          🎬 APOD Video
        </div>
        <a class="video-link" href="${item.url}" target="_blank" rel="noopener noreferrer">
          Open video in a new tab
        </a>
      `;
    }

    card.innerHTML = `
      ${mediaHTML}
      <p class="item-title"><strong>${item.title}</strong></p>
      <p class="item-date">${item.date}</p>
    `;

    // Open modal on click (for both images and videos)
    card.addEventListener("click", () => openModal(item));

    gallery.appendChild(card);
  });
}

// -----------------------------
// Modal logic
// -----------------------------
function openModal(item) {
  // Clear previous media
  modalMedia.innerHTML = "";

  if (item.media_type === "image") {
    const img = document.createElement("img");
    img.src = item.hdurl || item.url;
    img.alt = item.title;
    modalMedia.appendChild(img);
  } else if (item.media_type === "video") {
    // Try embedding if it's a YouTube video, otherwise show a link
    if (item.url.includes("youtube.com") || item.url.includes("youtu.be")) {
      const iframe = document.createElement("iframe");
      iframe.src = item.url;
      iframe.title = item.title;
      iframe.allowFullscreen = true;
      modalMedia.appendChild(iframe);
    } else {
      const link = document.createElement("a");
      link.href = item.url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = "Open APOD video";
      modalMedia.appendChild(link);
    }
  }

  modalTitle.textContent = item.title;
  modalDate.textContent = item.date;
  modalExplanation.textContent = item.explanation || "No explanation available.";

  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden"; // prevent background scroll
}

function closeModal() {
  modal.classList.add("hidden");
  document.body.style.overflow = "";
}

// Close events
modalBackdrop.addEventListener("click", closeModal);
modalCloseBtn.addEventListener("click", closeModal);

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !modal.classList.contains("hidden")) {
    closeModal();
  }
});
