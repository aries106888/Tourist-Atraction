// Shared interactivity for Serengeti Wonders
const SW = {
  itinerary: JSON.parse(localStorage.getItem('sw_itinerary') || '[]'),
  init() {
    this.updateItineraryBadge();
    this.bindEvents();
  },
  showToast(msg, bg = 'bg-success') {
    let tc = document.getElementById('toastContainer');
    if (!tc) {
      tc = document.createElement('div');
      tc.id = 'toastContainer';
      tc.className = 'toast-container position-fixed bottom-0 end-0 p-3';
      document.body.appendChild(tc);
    }
    const id = 'toast_' + Date.now();
    const html = `
      <div id="${id}" class="toast align-items-center text-white ${bg} border-0 show" role="alert">
        <div class="d-flex"><div class="toast-body"><i class="bi bi-check-circle-fill me-2"></i>${msg}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button></div>
      </div>`;
    tc.insertAdjacentHTML('beforeend', html);
    setTimeout(() => { document.getElementById(id)?.remove(); }, 3500);
  },
  addToItinerary(name, price) {
    this.itinerary.push({ name, price, id: Date.now() });
    localStorage.setItem('sw_itinerary', JSON.stringify(this.itinerary));
    this.updateItineraryBadge();
    this.showToast(`<strong>${name}</strong> added to your Safari Itinerary!`);
  },
  clearItinerary() {
    this.itinerary = [];
    localStorage.setItem('sw_itinerary', JSON.stringify(this.itinerary));
    this.updateItineraryBadge();
    this.renderItineraryModal();
    this.showToast('Itinerary cleared', 'bg-secondary');
  },
  updateItineraryBadge() {
    const el = document.getElementById('itinBadge');
    if (el) el.textContent = this.itinerary.length;
  },
  renderItineraryModal() {
    const list = document.getElementById('itineraryList');
    const totalEl = document.getElementById('itineraryTotal');
    if (!list) return;
    if (this.itinerary.length === 0) {
      list.innerHTML = '<li class="list-group-item text-muted text-center py-4">No expeditions added yet. Click "+ Add to Itinerary" on any circuit or tour!</li>';
      if (totalEl) totalEl.textContent = '$0';
      return;
    }
    let total = 0;
    list.innerHTML = this.itinerary.map((item, idx) => {
      const num = parseInt(item.price.toString().replace(/[^0-9]/g, '')) || 0;
      total += num;
      return `<li class="list-group-item d-flex justify-content-between align-items-center">
        <div><strong>${item.name}</strong><br><span class="text-success small fw-semibold">${item.price}</span></div>
        <button class="btn btn-outline-danger btn-sm" onclick="SW.removeItem(${idx})"><i class="bi bi-trash"></i></button>
      </li>`;
    }).join('');
    if (totalEl) totalEl.textContent = '$' + total.toLocaleString();
  },
  removeItem(idx) {
    this.itinerary.splice(idx, 1);
    localStorage.setItem('sw_itinerary', JSON.stringify(this.itinerary));
    this.updateItineraryBadge();
    this.renderItineraryModal();
  },
  openBooking(title = 'Custom Safari Expedition', defaultPrice = 2450) {
    const titleEl = document.getElementById('bookingModalTitle');
    const tourInput = document.getElementById('bookTourName');
    const basePriceInput = document.getElementById('bookBasePrice');
    if (titleEl) titleEl.textContent = 'Reserve Slot: ' + title;
    if (tourInput) tourInput.value = title;
    if (basePriceInput) basePriceInput.value = defaultPrice;
    this.calcBookingTotal();
    const modalEl = document.getElementById('bookingModal');
    if (modalEl) {
      const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
      modal.show();
    }
  },
  calcBookingTotal() {
    const guests = parseInt(document.getElementById('bookGuests')?.value || 1);
    const base = parseInt(document.getElementById('bookBasePrice')?.value || 2450);
    const lodgeTier = parseFloat(document.getElementById('bookTier')?.value || 1);
    const total = Math.round(guests * base * lodgeTier);
    const totalEl = document.getElementById('bookTotalEstimate');
    if (totalEl) totalEl.textContent = '$' + total.toLocaleString();
  },
  bindEvents() {
    // Quick booking calculator triggers
    ['bookGuests', 'bookTier'].forEach(id => {
      document.getElementById(id)?.addEventListener('change', () => this.calcBookingTotal());
    });
    // Filter pills
    document.querySelectorAll('[data-filter]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const cat = e.currentTarget.getAttribute('data-filter');
        document.querySelectorAll('[data-filter]').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        document.querySelectorAll('[data-category]').forEach(card => {
          if (cat === 'all' || card.getAttribute('data-category').includes(cat)) {
            card.closest('.card-col')?.classList.remove('d-none');
          } else {
            card.closest('.card-col')?.classList.add('d-none');
          }
        });
      });
    });
    // Live Search
    const searchInput = document.getElementById('liveSearch');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const val = e.target.value.toLowerCase().trim();
        document.querySelectorAll('.searchable-card').forEach(card => {
          const text = card.textContent.toLowerCase();
          card.closest('.card-col')?.classList.toggle('d-none', !text.includes(val));
        });
      });
    }
  }
};
document.addEventListener('DOMContentLoaded', () => SW.init());
