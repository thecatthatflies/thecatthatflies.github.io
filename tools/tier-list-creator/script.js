const LOCAL_STORAGE_KEY = 'tierLists';
let currentTierList = null; // Holds the tier list being edited/viewed
let autoSaveTimeout;

// IMPORTANT: For sharing links to work over the internet, these files must be hosted on a web server.
// When run purely offline (e.g., by opening index.html directly in a browser),
// window.location.origin will be 'file://', and such links are not shareable.
// Replace 'https://yourdomain.com' with your actual domain if you host this application.
const SHARE_BASE_URL = 'https://theprojectplateau.space';

// --- Utility Functions ---
function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

function saveTierListsToLocalStorage(tierLists) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tierLists));
}

function getTierListsFromLocalStorage() {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    return data ? JSON.parse(data) : {};
}

function showCopyMessage(messageElementId) {
    const messageElement = document.getElementById(messageElementId);
    messageElement.textContent = 'Copied!';
    messageElement.classList.add('show');
    setTimeout(() => {
        messageElement.classList.remove('show');
    }, 2000);
}

function debounce(func, delay) {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
    };
}

const debouncedSaveCurrentTierList = debounce(() => {
    if (currentTierList && currentTierList.title.trim()) {
        const tierLists = getTierListsFromLocalStorage();
        tierLists[currentTierList.id] = currentTierList;
        saveTierListsToLocalStorage(tierLists);
        console.log('Tier list auto-saved!');
    }
}, 1500); // Auto-save every 1.5 seconds after inactivity

// --- Global Settings Application ---
const GOOGLE_FONTS = [
    'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Oswald', 'Merriweather', 'Playfair Display'
];

function applyGlobalStyles() {
    if (!currentTierList || !currentTierList.settings) return;

    const settings = currentTierList.settings;
    const root = document.documentElement;

    root.style.setProperty('--font-family', `'${settings.fontFamily}', sans-serif`);
    root.style.setProperty('--body-bg-color', settings.bodyBgColor);
    root.style.setProperty('--body-text-color', settings.bodyTextColor);
    root.style.setProperty('--item-default-bg-color', settings.itemDefaultBgColor);
    root.style.setProperty('--item-default-text-color', settings.itemDefaultTextColor);
    root.style.setProperty('--item-width', `${settings.itemWidth}px`);
    root.style.setProperty('--item-height', `${settings.itemHeight}px`);
    root.style.setProperty('--tier-min-height', `${settings.tierMinHeight}px`);

    // Update Google Fonts link if necessary
    const googleFontLink = document.getElementById('googleFontLink');
    if (googleFontLink) {
        const fontName = settings.fontFamily.replace(/\s/g, '+');
        googleFontLink.href = `https://fonts.googleapis.com/css2?family=${fontName}:wght@400;700&display=swap`;
    }
}

function updateSetting(key, value) {
    if (currentTierList && currentTierList.settings) {
        currentTierList.settings[key] = value;
        applyGlobalStyles(); // Apply changes immediately
        debouncedSaveCurrentTierList(); // Trigger auto-save
    }
}

function populateSettingsUI() {
    if (!currentTierList || !currentTierList.settings) return;

    const settings = currentTierList.settings;

    document.getElementById('fontFamily').value = settings.fontFamily || 'Roboto';
    document.getElementById('bodyBgColor').value = settings.bodyBgColor || '#f4f7f6';
    document.getElementById('bodyTextColor').value = settings.bodyTextColor || '#333';
    document.getElementById('itemDefaultBgColor').value = settings.itemDefaultBgColor || '#ffffff';
    document.getElementById('itemDefaultTextColor').value = settings.itemDefaultTextColor || '#333';
    document.getElementById('itemWidth').value = settings.itemWidth || 120;
    document.getElementById('itemHeight').value = settings.itemHeight || 40;
    document.getElementById('tierMinHeight').value = settings.tierMinHeight || 80;
}

// --- Home Page Logic (index.html) ---
function loadAndDisplaySavedTierLists() {
    const savedTierListsContainer = document.getElementById('savedTierLists');
    const noSavedListsMessage = document.getElementById('noSavedListsMessage');
    const tierLists = getTierListsFromLocalStorage();

    savedTierListsContainer.innerHTML = ''; // Clear previous content

    const tierListIds = Object.keys(tierLists);
    if (tierListIds.length === 0) {
        noSavedListsMessage.style.display = 'block';
        return;
    } else {
        noSavedListsMessage.style.display = 'none';
    }

    tierListIds.forEach(id => {
        const tierList = tierLists[id];
        const card = document.createElement('div');
        card.className = 'tier-list-card';
        card.innerHTML = `
            <h3>${tierList.title || 'Untitled Tier List'}</h3>
            <div class="card-actions">
                <button class="button" onclick="viewTierList('${id}')">View/Edit</button>
                <button class="button" onclick="shareSavedTierList('${id}')">Share</button>
                <button class="button" onclick="deleteTierList('${id}')">Delete</button>
            </div>
        `;
        savedTierListsContainer.appendChild(card);
    });
}

function viewTierList(id) {
    // When running offline, this will open create.html from the local file system
    window.location.href = `create.html?id=${id}`;
}

function deleteTierList(id) {
    if (confirm('Are you sure you want to delete this tier list?')) {
        const tierLists = getTierListsFromLocalStorage();
        delete tierLists[id];
        saveTierListsToLocalStorage(tierLists);
        loadAndDisplaySavedTierLists(); // Refresh the list
    }
}

function shareSavedTierList(id) {
    const tierLists = getTierListsFromLocalStorage();
    const tierList = tierLists[id];
    if (tierList) {
        const encodedData = btoa(JSON.stringify(tierList));
        // Use the placeholder base URL for sharing
        const shareUrl = `${SHARE_BASE_URL}/create.html?data=${encodedData}`;
        navigator.clipboard.writeText(shareUrl).then(() => {
            alert('Share link copied to clipboard! Remember to host your files and replace "yourdomain.com" for the link to work.');
        }).catch(err => {
            console.error('Failed to copy: ', err);
            alert('Could not copy link. Please copy manually: ' + shareUrl + '\n\nRemember to host your files and replace "yourdomain.com" for the link to work.');
        });
    }
}

// --- Create/Edit Page Logic (create.html) ---
function initializeTierListEditor() {
    const urlParams = new URLSearchParams(window.location.search);
    const tierListId = urlParams.get('id');
    const tierListData = urlParams.get('data');

    if (tierListId) {
        loadTierListFromId(tierListId);
    } else if (tierListData) {
        loadTierListFromUrlData(tierListData);
    } else {
        // Start a new empty tier list with default settings
        currentTierList = {
            id: generateUniqueId(),
            title: '',
            items: [], // Items that have been assigned to a tier
            tiers: [
                { id: generateUniqueId(), name: 'S Tier', color: '#ff7f7f' },
                { id: generateUniqueId(), name: 'A Tier', color: '#ffbf7f' },
                { id: generateUniqueId(), name: 'B Tier', color: '#ffff7f' },
                { id: generateUniqueId(), name: 'C Tier', color: '#bfff7f' },
                { id: generateUniqueId(), name: 'D Tier', color: '#7fbfff' },
                { id: generateUniqueId(), name: 'F Tier', color: '#bf7fff' }
            ],
            unrankedItems: [], // Items not yet assigned to a tier
            settings: { // Default settings
                fontFamily: 'Roboto',
                bodyBgColor: '#f4f7f6',
                bodyTextColor: '#333',
                itemDefaultBgColor: '#ffffff',
                itemDefaultTextColor: '#333',
                itemWidth: 120,
                itemHeight: 40,
                tierMinHeight: 80
            }
        };
        renderTierListEditor();
    }

    // Setup drag and drop for unranked items pool
    const unrankedItemsZone = document.getElementById('unrankedItems');
    unrankedItemsZone.addEventListener('dragover', allowDrop);
    unrankedItemsZone.addEventListener('drop', dropItemToUnranked);
    unrankedItemsZone.addEventListener('dragleave', removeDragOver);
    unrankedItemsZone.addEventListener('dragenter', addDragOver);

    // Add event listener for title change
    document.getElementById('tierListTitle').addEventListener('input', (e) => {
        if (currentTierList) {
            currentTierList.title = e.target.value;
            debouncedSaveCurrentTierList(); // Trigger auto-save
        }
    });
}

function loadTierListFromId(id) {
    const tierLists = getTierListsFromLocalStorage();
    const loadedList = tierLists[id];
    if (loadedList) {
        currentTierList = loadedList;
        // Ensure settings object exists for older saved lists
        if (!currentTierList.settings) {
            currentTierList.settings = {
                fontFamily: 'Roboto', bodyBgColor: '#f4f7f6', bodyTextColor: '#333',
                itemDefaultBgColor: '#ffffff', itemDefaultTextColor: '#333',
                itemWidth: 120, itemHeight: 40, tierMinHeight: 80
            };
        }
        renderTierListEditor();
    } else {
        alert('Tier list not found!');
        window.location.href = 'index.html'; // Redirect to home if not found
    }
}

function loadTierListFromUrlData(encodedData) {
    try {
        const decodedData = atob(encodedData);
        const loadedList = JSON.parse(decodedData);
        // Assign a new ID to shared lists so they don't overwrite existing ones immediately
        loadedList.id = generateUniqueId();
        currentTierList = loadedList;
        // Ensure settings object exists for shared lists
        if (!currentTierList.settings) {
            currentTierList.settings = {
                fontFamily: 'Roboto', bodyBgColor: '#f4f7f6', bodyTextColor: '#333',
                itemDefaultBgColor: '#ffffff', itemDefaultTextColor: '#333',
                itemWidth: 120, itemHeight: 40, tierMinHeight: 80
            };
        }
        renderTierListEditor();
        alert('Tier list loaded from shared link! You can save it to your local storage.');
    } catch (e) {
        console.error('Error decoding or parsing tier list data from URL:', e);
        alert('Invalid tier list data in URL. Starting a new tier list.');
        window.location.href = 'create.html'; // Start fresh
    }
}

function renderTierListEditor() {
    if (!currentTierList) return;

    document.getElementById('tierListTitle').value = currentTierList.title;

    applyGlobalStyles(); // Apply current settings to CSS variables
    populateSettingsUI(); // Populate settings controls

    renderUnrankedItems();
    renderTiers();
}

function renderUnrankedItems() {
    const unrankedItemsContainer = document.getElementById('unrankedItems');
    unrankedItemsContainer.innerHTML = '';
    if (currentTierList.unrankedItems.length === 0) {
        unrankedItemsContainer.innerHTML = '<p class="placeholder-text">Drag items here to unrank them, or add new items above.</p>';
    } else {
        currentTierList.unrankedItems.forEach(item => {
            unrankedItemsContainer.appendChild(createTierItemElement(item));
        });
    }
}

function renderTiers() {
    const tierContainer = document.getElementById('tierContainer');
    tierContainer.innerHTML = '';
    if (currentTierList.tiers.length === 0) {
        tierContainer.innerHTML = '<p class="placeholder-text">Add tiers above to start organizing your items.</p>';
    } else {
        currentTierList.tiers.forEach(tier => {
            const tierRow = document.createElement('div');
            tierRow.className = 'tier-row';
            tierRow.dataset.tierId = tier.id;
            tierRow.innerHTML = `
                <div class="tier-header" style="background-color: ${tier.color};">
                    <span class="tier-name">${tier.name}</span>
                    <div class="tier-actions">
                        <button onclick="editTierName('${tier.id}')" title="Edit Tier Name">&#9998;</button>
                        <button onclick="editTierColor('${tier.id}')" title="Change Tier Color">&#127912;</button>
                        <button onclick="removeTier('${tier.id}')" title="Remove Tier">&times;</button>
                    </div>
                </div>
                <div id="tierItems-${tier.id}" class="tier-items-zone drop-zone">
                    <!-- Items for this tier will go here -->
                </div>
            `;
            tierContainer.appendChild(tierRow);

            const tierItemsZone = tierRow.querySelector('.tier-items-zone');
            tierItemsZone.addEventListener('dragover', allowDrop);
            tierItemsZone.addEventListener('drop', (e) => dropItemToTier(e, tier.id));
            tierItemsZone.addEventListener('dragleave', removeDragOver);
            tierItemsZone.addEventListener('dragenter', addDragOver);

            // Populate items for this tier
            const itemsInThisTier = currentTierList.items.filter(item => item.tierId === tier.id);
            if (itemsInThisTier.length === 0) {
                tierItemsZone.innerHTML = '<p class="placeholder-text">Drag items here.</p>';
            } else {
                itemsInThisTier.forEach(item => {
                    tierItemsZone.appendChild(createTierItemElement(item));
                });
            }
        });
    }
}

function createTierItemElement(item) {
    const itemElement = document.createElement('div');
    itemElement.className = 'tier-item';
    itemElement.draggable = true;
    itemElement.dataset.itemId = item.id;

    let itemContent = `<span>${item.name}</span>`;
    if (item.imageUrl) {
        itemContent = `<img src="${item.imageUrl}" alt="${item.name}"><span>${item.name}</span>`;
    }

    itemElement.innerHTML = `
        ${itemContent}
        <button class="tier-item-remove" onclick="removeItem('${item.id}')">&times;</button>
    `;
    itemElement.addEventListener('dragstart', dragStart);
    return itemElement;
}

let uploadedImageBase64 = null; // Temporarily store uploaded image

function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            uploadedImageBase64 = e.target.result;
            alert('Image uploaded and ready to be added with the next item!');
        };
        reader.readAsDataURL(file);
    }
}

function addItem() {
    const newItemNameInput = document.getElementById('newItemName');
    const newItemImageUrlInput = document.getElementById('newItemImageUrl');
    const newItemImageUploadInput = document.getElementById('newItemImageUpload');

    const itemName = newItemNameInput.value.trim();
    let imageUrl = newItemImageUrlInput.value.trim();

    if (itemName) {
        if (uploadedImageBase64) {
            imageUrl = uploadedImageBase64; // Use uploaded image if available
            uploadedImageBase64 = null; // Clear for next item
            newItemImageUploadInput.value = ''; // Clear file input
        }

        const newItem = { id: generateUniqueId(), name: itemName, imageUrl: imageUrl || null };
        currentTierList.unrankedItems.push(newItem);
        newItemNameInput.value = '';
        newItemImageUrlInput.value = '';
        renderUnrankedItems();
        debouncedSaveCurrentTierList(); // Trigger auto-save
    }
}

function removeItem(itemId) {
    // Remove from unranked items
    currentTierList.unrankedItems = currentTierList.unrankedItems.filter(item => item.id !== itemId);
    // Remove from ranked items
    currentTierList.items = currentTierList.items.filter(item => item.id !== itemId);
    renderTierListEditor();
    debouncedSaveCurrentTierList(); // Trigger auto-save
}

function addTier() {
    const newTierNameInput = document.getElementById('newTierName');
    const newTierColorInput = document.getElementById('newTierColor');
    const tierName = newTierNameInput.value.trim();
    const tierColor = newTierColorInput.value;

    if (tierName) {
        const newTier = { id: generateUniqueId(), name: tierName, color: tierColor };
        currentTierList.tiers.push(newTier);
        newTierNameInput.value = '';
        newTierColorInput.value = '#cccccc'; // Reset color
        renderTiers();
        debouncedSaveCurrentTierList(); // Trigger auto-save
    }
}

function removeTier(tierId) {
    if (confirm('Removing this tier will unrank all items currently in it. Continue?')) {
        // Move items from this tier back to unranked
        const itemsToUnrank = currentTierList.items.filter(item => item.tierId === tierId);
        currentTierList.unrankedItems.push(...itemsToUnrank.map(item => ({ id: item.id, name: item.name, imageUrl: item.imageUrl })));

        // Remove items from the 'items' array
        currentTierList.items = currentTierList.items.filter(item => item.tierId !== tierId);

        // Remove the tier itself
        currentTierList.tiers = currentTierList.tiers.filter(tier => tier.id !== tierId);
        renderTierListEditor();
        debouncedSaveCurrentTierList(); // Trigger auto-save
    }
}

function editTierName(tierId) {
    const tier = currentTierList.tiers.find(t => t.id === tierId);
    if (tier) {
        const newName = prompt('Enter new name for tier:', tier.name);
        if (newName !== null && newName.trim() !== '') {
            tier.name = newName.trim();
            renderTiers();
            debouncedSaveCurrentTierList(); // Trigger auto-save
        }
    }
}

function editTierColor(tierId) {
    const tier = currentTierList.tiers.find(t => t.id === tierId);
    if (tier) {
        const colorInput = document.createElement('input');
        colorInput.type = 'color';
        colorInput.value = tier.color;
        colorInput.addEventListener('change', (e) => {
            tier.color = e.target.value;
            renderTiers();
            debouncedSaveCurrentTierList(); // Trigger auto-save
        });
        colorInput.click(); // Programmatically click the color input
    }
}

function saveCurrentTierList() {
    if (!currentTierList || !currentTierList.title.trim()) {
        alert('Please enter a title for your tier list before saving.');
        return;
    }

    const tierLists = getTierListsFromLocalStorage();
    tierLists[currentTierList.id] = currentTierList;
    saveTierListsToLocalStorage(tierLists);
    alert('Tier list saved successfully!');
    // Optionally redirect or update UI
    // window.location.href = 'index.html';
}

function generateShareLink() {
    if (!currentTierList || !currentTierList.title.trim()) {
        alert('Please create a tier list with a title before sharing.');
        return;
    }

    const encodedData = btoa(JSON.stringify(currentTierList));
    // Use the placeholder base URL for sharing
    const shareUrl = `${SHARE_BASE_URL}/create.html?data=${encodedData}`;

    const shareLinkInput = document.getElementById('shareLink');
    shareLinkInput.value = shareUrl;
    document.getElementById('shareLinkContainer').style.display = 'flex';
}

function copyShareLink() {
    const shareLinkInput = document.getElementById('shareLink');
    shareLinkInput.select();
    shareLinkInput.setSelectionRange(0, 99999); // For mobile devices
    document.execCommand('copy');
    showCopyMessage('copyMessage');
}

// --- Drag and Drop Logic ---
let draggedItem = null;

function dragStart(e) {
    draggedItem = e.target;
    e.dataTransfer.setData('text/plain', e.target.dataset.itemId);
    e.target.classList.add('dragging');
}

function allowDrop(e) {
    e.preventDefault(); // Allow drop
    e.target.classList.add('drag-over');
}

function removeDragOver(e) {
    e.target.classList.remove('drag-over');
}

function addDragOver(e) {
    e.target.classList.add('drag-over');
}

function dropItemToUnranked(e) {
    e.preventDefault();
    e.target.classList.remove('drag-over');
    if (!draggedItem) return;

    const itemId = draggedItem.dataset.itemId;

    // Find the item in either ranked or unranked
    let itemToMove = currentTierList.items.find(item => item.id === itemId);
    if (itemToMove) {
        // Item was ranked, move it to unranked
        currentTierList.items = currentTierList.items.filter(item => item.id !== itemId);
        currentTierList.unrankedItems.push({ id: itemToMove.id, name: itemToMove.name, imageUrl: itemToMove.imageUrl });
    } else {
        // Item was already unranked, no change needed in data structure, just re-render
        // This case handles dropping an unranked item back into the unranked zone
    }

    draggedItem.classList.remove('dragging');
    draggedItem = null;
    renderTierListEditor();
    debouncedSaveCurrentTierList(); // Trigger auto-save
}

function dropItemToTier(e, targetTierId) {
    e.preventDefault();
    e.target.classList.remove('drag-over');
    if (!draggedItem) return;

    const itemId = draggedItem.dataset.itemId;

    // Check if the item is currently unranked
    const unrankedIndex = currentTierList.unrankedItems.findIndex(item => item.id === itemId);
    if (unrankedIndex !== -1) {
        // Item was unranked, move it to ranked
        const item = currentTierList.unrankedItems.splice(unrankedIndex, 1)[0];
        currentTierList.items.push({ ...item, tierId: targetTierId });
    } else {
        // Item was already ranked, update its tierId
        const item = currentTierList.items.find(item => item.id === itemId);
        if (item) {
            item.tierId = targetTierId;
        }
    }

    draggedItem.classList.remove('dragging');
    draggedItem = null;
    renderTierListEditor();
    debouncedSaveCurrentTierList(); // Trigger auto-save
}