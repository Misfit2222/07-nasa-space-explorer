// Inputs
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');
const btn = document.getElementById('getImagesBtn');
const gallery = document.getElementById('gallery');

// Modal
const modal = document.getElementById('modal');
const modalBackdrop = modal.querySelector('.modal-backdrop');
const modalCloseBtn = modal.querySelector('.modal-close');
const modalMedia = document.getElementById('modalMedia');
const modalTitle = document.getElementById('modalTitle');
const modalDate = document.getElementById('modalDate');
const modalExplanation = document.getElementById('modalExplanation');

// Random fact
const factText = document.getElementById('factText');

// Setup date inputs
setupDateInputs(startInput, endInput);

// Random facts
const spaceFacts = [
  "Neutron stars can spin at 600 rotations per second.",
  "A day on Venus is longer than a year on Venus.",
  "There are more stars in the universe than grains of sand on Earth.",
  "Jupiter has the shortest day of all planets.",
  "Footprints on the Moon will last millions of years.",
  "Saturn could float in water.",
  "A day on Mars is only 40 minutes longer than Earth."
];

function showRandomFact() {
  factText.textContent = spaceFacts[Math.floor(Math.random() * spaceFacts.length)];
}
showRandomFact();

// NASA API
const API_KEY = "DEMO_KEY"; // Replace with your real key

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
    const data = await res.json();

    if (!Array.isArray(data)) {
      gallery.innerHTML = `<p class="error">⚠️ No images found.</p>`;
      return;
    }

    data.sort((a, b) => new Date(a.date) - new Date(b.date));
    renderGallery(data);

  } catch (err) {
    gallery.innerHTML = `<p class="error">❌ Error fetching data.</p>`;
  }
}

function renderGallery(items) {
  gallery.innerHTML = "";

  items.forEach(item => {
    const card = document.createElement("div");
    card.className = "gallery-item";

    let mediaHTML = "";

    if (item.media_type === "image") {
      mediaHTML = `
        <div class="image-wrapper">
          <img src="${item.url}" alt="${item.title}">
        </div>
      `;
    } else {
      mediaHTML = `
        <div class="video-thumb">🎬 APOD Video</div>
        <a class="video-link" href="${item.url}" target="_blank">Open video</a>
      `;
    }

    card.innerHTML = `
      ${mediaHTML}
      <p class="item-title"><strong>${item.title}</strong></p>
      <p class="item-date">${item.date}</p>
    `;

    card.addEventListener("click", () => openModal(item));
    gallery.appendChild(card);
  });
}

// Modal
function openModal(item) {
  modalMedia.innerHTML = "";

  if (item.media_type === "image") {
    modalMedia.innerHTML = `<img src="${item.hdurl || item.url}" alt="${item.title}">`;
  } else {
    modalMedia.innerHTML = `<a href="${item.url}" target="_blank">Open APOD video</a>`;
  }

  modalTitle.textContent = item.title;
  modalDate.textContent = item.date;
  modalExplanation.textContent = item.explanation;

  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  modal.classList.add("hidden");
  document.body.style.overflow = "";
}

modalBackdrop.addEventListener("click", closeModal);
modalCloseBtn.addEventListener("click", closeModal);

document.addEventListener("keydown", e => {
  if (e.key === "Escape") closeModal();
});
