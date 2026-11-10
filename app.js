const initialItems = [
  {
    id: 1,
    name: 'Silver key ring',
    category: 'Accessories',
    status: 'Lost',
    building: 'Central Library',
    description: 'Black leather key ring with three campus keys and a small silver charm.',
    timestamp: 'Today, 8:40 AM',
    author: 'Student'
  },
  {
    id: 2,
    name: 'MacBook Air charger',
    category: 'Electronics',
    status: 'Found',
    building: 'Engineering Block',
    description: 'White USB-C charger found near the design studio. Case still attached.',
    timestamp: 'Yesterday, 6:15 PM',
    author: 'Staff'
  },
  {
    id: 3,
    name: 'Student ID card',
    category: 'Documents',
    status: 'Claimed',
    building: 'Lecture Hall A',
    description: 'ID card with a photo and student number. Claimed by the owner after verifying details.',
    timestamp: 'Today, 9:20 AM',
    author: 'Security'
  },
  {
    id: 4,
    name: 'Orange notebook',
    category: 'Stationery',
    status: 'Lost',
    building: 'Science Centre',
    description: 'Spiral notebook with chemistry notes and a pencil tucked inside the cover.',
    timestamp: 'Today, 7:05 AM',
    author: 'Student'
  },
  {
    id: 5,
    name: 'Black water bottle',
    category: 'Other',
    status: 'Found',
    building: 'Student Union',
    description: 'Insulated bottle with a faint campus sticker and a dent on the base.',
    timestamp: 'Mon, 5:10 PM',
    author: 'Student'
  }
];

const state = {
  items: [...initialItems],
  activeStatus: 'all',
  searchTerm: '',
  buildingFilter: 'all'
};

const itemsListEl = document.getElementById('itemsList');
const resultCountEl = document.getElementById('resultCount');
const searchInputEl = document.getElementById('searchInput');
const buildingFilterEl = document.getElementById('buildingFilter');
const reportFormEl = document.getElementById('reportForm');
const toastEl = document.getElementById('toast');

function setToast(message) {
  toastEl.textContent = message;
  toastEl.classList.add('visible');
  clearTimeout(setToast.timeoutId);
  setToast.timeoutId = setTimeout(() => {
    toastEl.classList.remove('visible');
  }, 2200);
}

function populateBuildingFilter() {
  const buildings = [...new Set(state.items.map((item) => item.building))].sort();
  buildingFilterEl.innerHTML = '<option value="all">All buildings</option>' +
    buildings.map((building) => `<option value="${building}">${building}</option>`).join('');
  buildingFilterEl.value = state.buildingFilter;
}

function getFilteredItems() {
  const normalizedQuery = state.searchTerm.trim().toLowerCase();

  return state.items.filter((item) => {
    const matchesStatus = state.activeStatus === 'all' || item.status === state.activeStatus;
    const matchesBuilding = state.buildingFilter === 'all' || item.building === state.buildingFilter;
    const haystack = `${item.name} ${item.description} ${item.building}`.toLowerCase();
    const matchesQuery = !normalizedQuery || haystack.includes(normalizedQuery);

    return matchesStatus && matchesBuilding && matchesQuery;
  });
}

function renderItems() {
  const filteredItems = getFilteredItems();
  resultCountEl.textContent = `${filteredItems.length} item${filteredItems.length === 1 ? '' : 's'}`;

  if (!filteredItems.length) {
    itemsListEl.innerHTML = `
      <div class="empty-state">
        <h4>No matching items found</h4>
        <p>Try a different building or change your search terms.</p>
      </div>
    `;
    return;
  }

  itemsListEl.innerHTML = filteredItems.map((item) => `
    <article class="listing-item" data-id="${item.id}">
      <div class="listing-item-header">
        <div>
          <h4 class="item-title">${item.name}</h4>
          <div class="item-meta">
            <span>${item.category}</span>
            <span>•</span>
            <span>${item.author}</span>
            <span>•</span>
            <span>${item.timestamp}</span>
          </div>
        </div>
        <span class="pill ${item.status.toLowerCase()}">${item.status}</span>
      </div>

      <p class="item-description">${item.description}</p>

      <div class="item-actions">
        <span class="item-location">${item.building}</span>
        <button
          class="claim-button ${item.status === 'Claimed' ? 'is-claimed' : ''}"
          type="button"
          data-action="claim"
          data-id="${item.id}"
          ${item.status === 'Claimed' ? 'disabled' : ''}
        >
          ${item.status === 'Claimed' ? 'Claimed' : 'Mark as claimed'}
        </button>
      </div>
    </article>
  `).join('');
}

function updateStats() {
  const openCases = state.items.filter((item) => item.status !== 'Claimed').length;
  const claimedToday = state.items.filter((item) => item.status === 'Claimed').length;
  const buildings = new Set(state.items.map((item) => item.building)).size;

  document.getElementById('stat-open').textContent = String(openCases);
  document.getElementById('stat-claimed').textContent = String(claimedToday);
  document.getElementById('stat-buildings').textContent = String(buildings);
}

function handleStatusFilterClick(event) {
  const chip = event.target.closest('.filter-chip');
  if (!chip) return;

  state.activeStatus = chip.dataset.status;
  document.querySelectorAll('.filter-chip').forEach((button) => {
    button.classList.toggle('is-active', button === chip);
  });
  renderItems();
}

function handleSearchInput(event) {
  state.searchTerm = event.target.value;
  renderItems();
}

function handleBuildingFilterChange(event) {
  state.buildingFilter = event.target.value;
  renderItems();
}

function handleReportSubmit(event) {
  event.preventDefault();

  const formData = new FormData(reportFormEl);
  const itemName = String(formData.get('itemName') || '').trim();
  const itemDescription = String(formData.get('itemDescription') || '').trim();

  if (!itemName) {
    setToast('Please add an item name before submitting.');
    return;
  }

  const newItem = {
    id: Date.now(),
    name: itemName,
    category: String(formData.get('itemCategory') || 'Other'),
    status: String(formData.get('itemStatus') || 'Lost'),
    building: String(formData.get('itemBuilding') || 'Central Library'),
    description: itemDescription || 'No extra details added yet.',
    timestamp: 'Just now',
    author: 'You'
  };

  state.items.unshift(newItem);
  populateBuildingFilter();
  updateStats();
  renderItems();
  reportFormEl.reset();
  setToast('Item reported successfully.');
}

function handleClaimClick(event) {
  const button = event.target.closest('[data-action="claim"]');
  if (!button) return;

  const itemId = Number(button.dataset.id);
  const item = state.items.find((entry) => entry.id === itemId);
  if (!item || item.status === 'Claimed') return;

  item.status = 'Claimed';
  item.timestamp = 'Just now';
  item.author = 'You';
  updateStats();
  renderItems();
  setToast(`${item.name} marked as claimed.`);
}

searchInputEl.addEventListener('input', handleSearchInput);
buildingFilterEl.addEventListener('change', handleBuildingFilterChange);
document.querySelectorAll('.filter-chip').forEach((button) => {
  button.addEventListener('click', handleStatusFilterClick);
});
reportFormEl.addEventListener('submit', handleReportSubmit);
document.addEventListener('click', (event) => {
  const button = event.target.closest('[data-action="claim"]');
  if (button) handleClaimClick(event);
});

populateBuildingFilter();
updateStats();
renderItems();
