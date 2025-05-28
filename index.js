// ===========================
// DATA MANAGEMENT
// ===========================
let places = JSON.parse(localStorage.getItem('places') || '[]');
let currentView = 'grid';
let currentFilter = 'all';
let currentMenu = [];
let editingPlaceId = null;
let editingMenu = []; // Menu being edited
let currentEditTab = 'info'; // Current tab in edit modal

// ===========================
// INITIALIZATION
// ===========================
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    updateStats();
    updateFeaturedContent();
    displayPlaces();
    updateCategoryFilters();
    setupEventListeners();

    // Load sample data if empty
    if (places.length === 0) {
        loadSampleData();
    }
}

function setupEventListeners() {
    document.getElementById('searchBox').addEventListener('input', displayPlaces);
}

function loadSampleData() {
    places = [
        {
            id: 1,
            name: "Phở Hà Nội",
            category: "Nhà hàng",
            address: "123 Nguyễn Huệ, Q1, TP.HCM",
            phone: "0901234567",
            bookingLink: "",
            notes: "Phở ngon, nước dùng đậm đà, phục vụ chu đáo",
            image: "",
            menu: [
                {
                    id: 1,
                    name: "Phở bò",
                    price: 45000,
                    description: "Phở bò truyền thống với nước dùng được ninh từ xương",
                    image: ""
                },
                {
                    id: 2,
                    name: "Phở gà",
                    price: 40000,
                    description: "Phở gà nước trong, thịt gà xé phay mềm",
                    image: ""
                }
            ],
            dateAdded: "01/01/2024",
            status: "visited",
            favorite: true
        },
        {
            id: 2,
            name: "Coffee House Đà Nẵng",
            category: "Quán cafe",
            address: "45 Trần Phú, Hải Châu, Đà Nẵng",
            phone: "0905678901",
            bookingLink: "",
            notes: "View đẹp, không gian thoáng mát, phù hợp hẹn hò",
            image: "",
            menu: [
                {
                    id: 3,
                    name: "Cà phê sữa đá",
                    price: 25000,
                    description: "Cà phê phin truyền thống pha với sữa đặc",
                    image: ""
                }
            ],
            dateAdded: "15/01/2024",
            status: "wishlist",
            favorite: false
        }
    ];
    localStorage.setItem('places', JSON.stringify(places));
}

// ===========================
// NAVIGATION FUNCTIONS
// ===========================
function showPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });

    // Show selected page
    document.getElementById(pageId).classList.add('active');

    // Update navigation
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.classList.remove('active');
    });
    event.target.classList.add('active');

    // Update content based on page
    if (pageId === 'places') {
        displayPlaces();
    } else if (pageId === 'favorites') {
        displayFavorites();
    } else if (pageId === 'home') {
        updateStats();
        updateFeaturedContent();
    }
}

// ===========================
// MODAL FUNCTIONS
// ===========================
function showModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function hideModal(modalId) {
    document.getElementById(modalId).classList.remove('active');

    // Reset forms when closing modals
    if (modalId === 'editPlaceModal') {
        editingPlaceId = null;
        editingMenu = [];
        currentEditTab = 'info';
        // Reset tabs to info tab
        switchEditTab('info');
    }
}

// ===========================
// EDIT MODAL TAB FUNCTIONS
// ===========================
function switchEditTab(tabName) {
    currentEditTab = tabName;

    // Update tab buttons
    document.querySelectorAll('.edit-tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    // Update tab content
    document.querySelectorAll('.edit-tab-content').forEach(content => {
        content.classList.remove('active');
    });

    if (tabName === 'info') {
        document.getElementById('editInfoTab').classList.add('active');
    } else if (tabName === 'menu') {
        document.getElementById('editMenuTab').classList.add('active');
        loadEditMenu();
    }
}

// ===========================
// IMAGE HANDLING FUNCTIONS
// ===========================
function convertImageToBase64(file, callback) {
    if (!file || file.size === 0) {
        callback('');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        callback(e.target.result);
    };
    reader.onerror = function() {
        callback('');
    };
    reader.readAsDataURL(file);
}

function previewImage(input, previewId) {
    const file = input.files[0];
    const preview = document.getElementById(previewId);

    if (file) {
        convertImageToBase64(file, function(base64) {
            preview.src = base64;
            preview.style.display = 'block';
        });
    }
}

// ===========================
// PLACE MANAGEMENT FUNCTIONS
// ===========================
function addPlace(event) {
    event.preventDefault();
    const formData = new FormData(event.target);

    // Handle image upload
    const imageFile = formData.get('image');

    if (imageFile && imageFile.size > 0) {
        convertImageToBase64(imageFile, function(base64Image) {
            const place = {
                id: Date.now(),
                name: formData.get('name'),
                category: formData.get('category'),
                address: formData.get('address'),
                phone: formData.get('phone') || '',
                bookingLink: formData.get('bookingLink') || '',
                notes: formData.get('notes') || '',
                image: base64Image,
                menu: [...currentMenu],
                dateAdded: new Date().toLocaleDateString('vi-VN'),
                status: 'wishlist',
                favorite: false
            };

            places.push(place);
            saveToLocalStorage();

            // Reset form and menu
            event.target.reset();
            resetMenuForm();

            updateAll();
            alert('✅ Đã thêm địa điểm thành công!');
        });
    } else {
        const place = {
            id: Date.now(),
            name: formData.get('name'),
            category: formData.get('category'),
            address: formData.get('address'),
            phone: formData.get('phone') || '',
            bookingLink: formData.get('bookingLink') || '',
            notes: formData.get('notes') || '',
            image: '',
            menu: [...currentMenu],
            dateAdded: new Date().toLocaleDateString('vi-VN'),
            status: 'wishlist',
            favorite: false
        };

        places.push(place);
        saveToLocalStorage();

        // Reset form and menu
        event.target.reset();
        resetMenuForm();

        updateAll();
        alert('✅ Đã thêm địa điểm thành công!');
    }
}

function quickAddPlace(event) {
    event.preventDefault();
    const formData = new FormData(event.target);

    const place = {
        id: Date.now(),
        name: formData.get('name'),
        category: formData.get('category'),
        address: formData.get('address'),
        phone: '',
        bookingLink: '',
        notes: formData.get('notes') || '',
        image: '',
        menu: [],
        dateAdded: new Date().toLocaleDateString('vi-VN'),
        status: 'wishlist',
        favorite: false
    };

    places.push(place);
    saveToLocalStorage();

    hideModal('addPlaceModal');
    event.target.reset();

    updateAll();
    alert('✅ Đã thêm địa điểm thành công!');
}

function editPlace(id) {
    const place = places.find(p => p.id === id);
    if (!place) return;

    editingPlaceId = id;
    editingMenu = [...(place.menu || [])]; // Copy menu for editing

    // Populate form
    document.getElementById('editPlaceId').value = place.id;
    document.getElementById('editPlaceName').value = place.name;
    document.getElementById('editPlaceCategory').value = place.category;
    document.getElementById('editPlaceAddress').value = place.address;
    document.getElementById('editPlacePhone').value = place.phone;
    document.getElementById('editPlaceBooking').value = place.bookingLink;
    document.getElementById('editPlaceNotes').value = place.notes;

    // Reset to info tab
    currentEditTab = 'info';
    document.querySelectorAll('.edit-tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.edit-tab-content').forEach(content => content.classList.remove('active'));
    document.querySelector('.edit-tab-btn[onclick*="info"]').classList.add('active');
    document.getElementById('editInfoTab').classList.add('active');

    showModal('editPlaceModal');
}

function updatePlace(event) {
    event.preventDefault();

    if (!editingPlaceId) return;

    const formData = new FormData(event.target);
    const placeIndex = places.findIndex(p => p.id === editingPlaceId);

    if (placeIndex === -1) return;

    // Update place data (info only, menu is updated separately)
    places[placeIndex] = {
        ...places[placeIndex],
        name: formData.get('name'),
        category: formData.get('category'),
        address: formData.get('address'),
        phone: formData.get('phone') || '',
        bookingLink: formData.get('bookingLink') || '',
        notes: formData.get('notes') || ''
    };

    saveToLocalStorage();
    updateAll();

    alert('✅ Đã cập nhật thông tin địa điểm thành công!');
}

function deletePlace(id) {
    if (confirm('❓ Bạn có chắc muốn xóa địa điểm này không?')) {
        places = places.filter(place => place.id !== id);
        saveToLocalStorage();
        updateAll();
        alert('🗑️ Đã xóa địa điểm thành công!');
    }
}

function toggleStatus(id, status) {
    const place = places.find(p => p.id === id);
    if (place) {
        place.status = place.status === status ? 'wishlist' : status;
        saveToLocalStorage();
        updateStats();
        displayPlaces();
    }
}

function toggleFavorite(id) {
    const place = places.find(p => p.id === id);
    if (place) {
        place.favorite = !place.favorite;
        saveToLocalStorage();
        updateStats();
        displayPlaces();
        displayFavorites();
    }
}

// ===========================
// MENU EDITING FUNCTIONS
// ===========================
function loadEditMenu() {
    const container = document.getElementById('editMenuItems');
    container.innerHTML = '';

    if (editingMenu.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #666;">
                <h4>🍽️ Chưa có món ăn nào</h4>
                <p>Hãy thêm món ăn đầu tiên cho thực đơn</p>
            </div>
        `;
        return;
    }

    editingMenu.forEach(item => {
        const menuItemElement = createEditMenuItemElement(item);
        container.appendChild(menuItemElement);
    });
}

function createEditMenuItemElement(item, isEditing = false) {
    const div = document.createElement('div');
    div.className = `edit-menu-item ${isEditing ? 'editing' : ''}`;
    div.setAttribute('data-item-id', item.id);

    if (isEditing) {
        div.innerHTML = createEditMenuItemForm(item);
    } else {
        div.innerHTML = createEditMenuItemDisplay(item);
    }

    return div;
}

function createEditMenuItemDisplay(item) {
    return `
        <div class="menu-item-header">
            <span class="menu-item-title">${item.name || 'Món ăn mới'}</span>
            <div class="menu-item-actions">
                <button class="btn btn-outline" onclick="editMenuItem(${item.id})" style="padding: 6px 12px; font-size: 0.8rem;">✏️ Sửa</button>
                <button class="btn btn-danger" onclick="deleteMenuItem(${item.id})" style="padding: 6px 12px; font-size: 0.8rem;">🗑️ Xóa</button>
            </div>
        </div>
        <div class="menu-display">
            ${item.image ? `<img src="${item.image}" alt="${item.name}" class="menu-display-image">` : ''}
            <div class="menu-display-info">
                <div class="menu-display-name">${item.name}</div>
                ${item.description ? `<div class="menu-display-description">${item.description}</div>` : ''}
                <div class="menu-display-price">${item.price ? item.price.toLocaleString() + ' VNĐ' : 'Chưa có giá'}</div>
            </div>
        </div>
    `;
}

function createEditMenuItemForm(item) {
    return `
        <div class="menu-item-header">
            <span class="menu-item-title">✏️ Chỉnh sửa món ăn</span>
            <div class="menu-item-actions">
                <button class="btn btn-primary" onclick="saveMenuItem(${item.id})" style="padding: 6px 12px; font-size: 0.8rem;">💾 Lưu</button>
                <button class="btn btn-secondary" onclick="cancelEditMenuItem(${item.id})" style="padding: 6px 12px; font-size: 0.8rem;">❌ Hủy</button>
            </div>
        </div>
        <div class="menu-item-form">
            <div class="menu-form-left">
                <div class="menu-form-row">
                    <div class="form-group">
                        <label>Tên món</label>
                        <input type="text" id="editItemName${item.id}" value="${item.name}" placeholder="Tên món ăn">
                    </div>
                    <div class="form-group">
                        <label>Giá (VNĐ)</label>
                        <input type="number" id="editItemPrice${item.id}" value="${item.price}" placeholder="Giá tiền">
                    </div>
                </div>
                <div class="form-group">
                    <label>Mô tả</label>
                    <textarea id="editItemDescription${item.id}" rows="2" placeholder="Mô tả món ăn">${item.description}</textarea>
                </div>
            </div>
            <div class="menu-image-upload">
                ${item.image ? `<img src="${item.image}" id="editItemImagePreview${item.id}" class="menu-image-preview">` : `<div id="editItemImagePreview${item.id}" class="menu-image-preview" style="display: flex; align-items: center; justify-content: center; background: #f1f3f4; color: #666;">📷</div>`}
                <input type="file" id="editItemImageInput${item.id}" accept="image/*" style="display: none;" onchange="previewEditMenuImage(${item.id})">
                <button type="button" class="btn btn-outline menu-image-upload-btn" onclick="document.getElementById('editItemImageInput${item.id}').click()">📷 Ảnh</button>
            </div>
        </div>
    `;
}

function addEditMenuItem() {
    const newItem = {
        id: Date.now(),
        name: '',
        price: 0,
        description: '',
        image: ''
    };

    editingMenu.push(newItem);

    const container = document.getElementById('editMenuItems');

    // Clear "no items" message if exists
    if (container.querySelector('div[style*="text-align: center"]')) {
        container.innerHTML = '';
    }

    const menuItemElement = createEditMenuItemElement(newItem, true);
    container.appendChild(menuItemElement);

    // Focus on name input
    setTimeout(() => {
        document.getElementById(`editItemName${newItem.id}`).focus();
    }, 100);
}

function editMenuItem(itemId) {
    const item = editingMenu.find(m => m.id === itemId);
    if (!item) return;

    const element = document.querySelector(`[data-item-id="${itemId}"]`);
    element.className = 'edit-menu-item editing';
    element.innerHTML = createEditMenuItemForm(item);
}

function saveMenuItem(itemId) {
    const item = editingMenu.find(m => m.id === itemId);
    if (!item) return;

    // Get form values
    const name = document.getElementById(`editItemName${itemId}`).value;
    const price = parseInt(document.getElementById(`editItemPrice${itemId}`).value) || 0;
    const description = document.getElementById(`editItemDescription${itemId}`).value;
    const imagePreview = document.getElementById(`editItemImagePreview${itemId}`);

    // Update item
    item.name = name;
    item.price = price;
    item.description = description;
    // Image is updated through previewEditMenuImage function

    // Update display
    const element = document.querySelector(`[data-item-id="${itemId}"]`);
    element.className = 'edit-menu-item';
    element.innerHTML = createEditMenuItemDisplay(item);
}

function cancelEditMenuItem(itemId) {
    const item = editingMenu.find(m => m.id === itemId);
    if (!item) return;

    // If it's a new item (empty name), remove it
    if (!item.name) {
        deleteMenuItem(itemId);
        return;
    }

    // Revert to display mode
    const element = document.querySelector(`[data-item-id="${itemId}"]`);
    element.className = 'edit-menu-item';
    element.innerHTML = createEditMenuItemDisplay(item);
}

function deleteMenuItem(itemId) {
    if (confirm('❓ Bạn có chắc muốn xóa món này không?')) {
        editingMenu = editingMenu.filter(m => m.id !== itemId);

        const element = document.querySelector(`[data-item-id="${itemId}"]`);
        element.remove();

        // Show "no items" message if menu is empty
        if (editingMenu.length === 0) {
            loadEditMenu();
        }
    }
}

function previewEditMenuImage(itemId) {
    const input = document.getElementById(`editItemImageInput${itemId}`);
    const preview = document.getElementById(`editItemImagePreview${itemId}`);
    const file = input.files[0];

    if (file) {
        convertImageToBase64(file, function(base64) {
            const item = editingMenu.find(m => m.id === itemId);
            if (item) {
                item.image = base64;
                preview.src = base64;
                preview.style.display = 'block';
            }
        });
    }
}

function saveMenuChanges() {
    if (!editingPlaceId) return;

    const placeIndex = places.findIndex(p => p.id === editingPlaceId);
    if (placeIndex === -1) return;

    // Update place menu
    places[placeIndex].menu = [...editingMenu];
    saveToLocalStorage();
    updateAll();

    alert('✅ Đã lưu thay đổi menu thành công!');
}

// ===========================
// DISPLAY FUNCTIONS
// ===========================
function displayPlaces() {
    const container = document.getElementById('placesContainer');
    const searchTerm = document.getElementById('searchBox').value.toLowerCase();

    let filteredPlaces = places.filter(place => {
        const matchesSearch = place.name.toLowerCase().includes(searchTerm) ||
            place.address.toLowerCase().includes(searchTerm) ||
            place.category.toLowerCase().includes(searchTerm);
        const matchesFilter = currentFilter === 'all' || place.category === currentFilter;
        return matchesSearch && matchesFilter;
    });

    container.className = currentView === 'grid' ? 'places-grid' : 'places-list';
    container.innerHTML = '';

    if (filteredPlaces.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: #666;">
                <h3>🔍 Không tìm thấy địa điểm nào</h3>
                <p>Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc</p>
            </div>
        `;
        return;
    }

    filteredPlaces.forEach(place => {
        const card = createPlaceCard(place);
        container.appendChild(card);
    });
}

function createPlaceCard(place) {
    const card = document.createElement('div');
    card.className = `place-card ${currentView === 'list' ? 'list-view' : ''}`;

    card.innerHTML = `
        ${place.image ? `<img src="${place.image}" alt="${place.name}" class="place-image" loading="lazy">` : ''}
        <div class="place-info">
            <h3>${place.name}</h3>
            <div class="place-meta">
                <span class="place-tag">${place.category}</span>
                <span class="place-tag">📍 ${place.address}</span>
                ${place.phone ? `<span class="place-tag">📞 ${place.phone}</span>` : ''}
            </div>
            ${place.notes ? `<p style="color: #666; margin: 0.5rem 0;">${place.notes}</p>` : ''}
            <div class="place-status">
                <button class="status-btn ${place.status === 'visited' ? 'visited' : ''}" 
                        onclick="toggleStatus(${place.id}, 'visited')">
                    ${place.status === 'visited' ? '✅ Đã đến' : '📝 Muốn thử'}
                </button>
                <button class="status-btn ${place.favorite ? 'favorite' : ''}" 
                        onclick="toggleFavorite(${place.id})">
                    ${place.favorite ? '❤️ Yêu thích' : '🤍 Yêu thích'}
                </button>
                <button class="btn btn-outline" onclick="showPlaceDetail(${place.id})" style="padding: 6px 12px; font-size: 0.8rem;">
                    👁️ Chi tiết
                </button>
                <button class="btn btn-primary" onclick="editPlace(${place.id})" style="padding: 6px 12px; font-size: 0.8rem;">
                    ✏️ Sửa
                </button>
                <button class="btn btn-danger" onclick="deletePlace(${place.id})" style="padding: 6px 12px; font-size: 0.8rem;">
                    🗑️ Xóa
                </button>
            </div>
        </div>
    `;

    return card;
}

function displayFavorites() {
    const container = document.getElementById('favoritesContainer');
    const favoritePlaces = places.filter(place => place.favorite);

    container.innerHTML = '';

    if (favoritePlaces.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: #666;">
                <h3>💔 Chưa có địa điểm yêu thích</h3>
                <p>Hãy đánh dấu ❤️ những địa điểm bạn thích nhất</p>
            </div>
        `;
        return;
    }

    favoritePlaces.forEach(place => {
        const card = createPlaceCard(place);
        container.appendChild(card);
    });
}

function showPlaceDetail(id) {
    const place = places.find(p => p.id === id);
    if (!place) return;

    const content = document.getElementById('placeDetailContent');
    content.innerHTML = `
        <div style="text-align: center; margin-bottom: 2rem;">
            ${place.image ? `<img src="${place.image}" alt="${place.name}" style="max-width: 100%; max-height: 300px; border-radius: 15px; margin-bottom: 1rem; object-fit: cover;" loading="lazy">` : ''}
            <h2>${place.name}</h2>
            <p style="color: #666; font-size: 1.1rem;">${place.category} • ${place.address}</p>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
            ${place.phone ? `<div><strong>📞 Điện thoại:</strong><br>${place.phone}</div>` : ''}
            ${place.bookingLink ? `<div><strong>🔗 Đặt bàn:</strong><br><a href="${place.bookingLink}" target="_blank" style="color: #667eea;">Đặt ngay</a></div>` : ''}
            <div><strong>📅 Ngày thêm:</strong><br>${place.dateAdded}</div>
            <div><strong>📊 Trạng thái:</strong><br>${place.status === 'visited' ? '✅ Đã đến' : '📝 Muốn thử'}</div>
        </div>
        
        ${place.notes ? `
            <div style="margin-bottom: 2rem;">
                <h3>📝 Ghi chú</h3>
                <p style="background: #f8f9fa; padding: 1rem; border-radius: 10px;">${place.notes}</p>
            </div>
        ` : ''}
        
        ${place.menu && place.menu.length > 0 ? `
            <div class="menu-section">
                <h3>🍽️ Thực đơn (${place.menu.length} món)</h3>
                ${place.menu.map(item => `
                    <div class="menu-item">
                        <div class="menu-item-display">
                            <div style="display: flex; align-items: center;">
                                ${item.image ? `<img src="${item.image}" alt="${item.name}" class="menu-image" loading="lazy">` : ''}
                                <div class="menu-item-info">
                                    <h4>${item.name}</h4>
                                    ${item.description ? `<p>${item.description}</p>` : ''}
                                </div>
                            </div>
                            <div class="menu-price">${item.price ? item.price.toLocaleString() + ' VNĐ' : 'Chưa có giá'}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        ` : ''}
        
        <div style="margin-top: 2rem; text-align: center;">
            <button class="btn btn-primary" onclick="editPlace(${place.id}); hideModal('placeDetailModal');">✏️ Chỉnh sửa địa điểm</button>
        </div>
    `;

    showModal('placeDetailModal');
}

// ===========================
// MENU MANAGEMENT (ADD NEW PLACE)
// ===========================
function addMenuItem() {
    const menuContainer = document.getElementById('menuItems');
    const itemId = Date.now();

    const menuItem = document.createElement('div');
    menuItem.className = 'menu-item';
    menuItem.innerHTML = `
        <div class="menu-item-form">
            <input type="text" placeholder="Tên món" onchange="updateMenuItem(${itemId}, 'name', this.value)">
            <input type="number" placeholder="Giá (VNĐ)" onchange="updateMenuItem(${itemId}, 'price', this.value)">
            <input type="text" placeholder="Mô tả" onchange="updateMenuItem(${itemId}, 'description', this.value)">
            <div class="file-upload" onclick="document.getElementById('menuImage${itemId}').click()" style="padding: 0.5rem; font-size: 0.8rem;">
                <input type="file" id="menuImage${itemId}" accept="image/*" onchange="updateMenuItemImage(${itemId}, this)">
                📷 Ảnh
            </div>
            <button type="button" onclick="removeMenuItem(${itemId})" class="btn btn-danger" style="padding: 8px 12px;">🗑️</button>
        </div>
        <img id="menuPreview${itemId}" style="max-width: 100px; max-height: 80px; border-radius: 8px; margin-top: 0.5rem; display: none;" loading="lazy">
    `;

    menuContainer.appendChild(menuItem);

    currentMenu.push({
        id: itemId,
        name: '',
        price: 0,
        description: '',
        image: ''
    });
}

function updateMenuItem(id, field, value) {
    const item = currentMenu.find(m => m.id === id);
    if (item) {
        if (field === 'price') {
            item[field] = parseInt(value) || 0;
        } else {
            item[field] = value;
        }
    }
}

function updateMenuItemImage(id, input) {
    const file = input.files[0];
    const item = currentMenu.find(m => m.id === id);
    const preview = document.getElementById(`menuPreview${id}`);

    if (file && item) {
        convertImageToBase64(file, function(base64) {
            item.image = base64;
            preview.src = base64;
            preview.style.display = 'block';
        });
    }
}

function removeMenuItem(id) {
    currentMenu = currentMenu.filter(m => m.id !== id);
    document.querySelector(`[onclick*="removeMenuItem(${id})"]`).closest('.menu-item').remove();
}

function resetMenuForm() {
    currentMenu = [];
    document.getElementById('menuItems').innerHTML = '';
    const imagePreview = document.getElementById('imagePreview');
    if (imagePreview) {
        imagePreview.style.display = 'none';
    }
}

// ===========================
// CSV IMPORT
// ===========================
function importCSV(input) {
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const csv = e.target.result;
        const lines = csv.split('\n');

        for (let i = 1; i < lines.length; i++) {
            const data = lines[i].split(',');
            if (data.length >= 2 && data[0].trim()) {
                addMenuItem();
                const lastItem = currentMenu[currentMenu.length - 1];
                lastItem.name = data[0]?.trim() || '';
                lastItem.price = parseInt(data[1]?.trim()) || 0;
                lastItem.description = data[2]?.trim() || '';

                // Update the UI
                const menuItems = document.querySelectorAll('#menuItems .menu-item');
                const lastMenuItem = menuItems[menuItems.length - 1];
                const inputs = lastMenuItem.querySelectorAll('input[type="text"], input[type="number"]');
                inputs[0].value = lastItem.name;
                inputs[1].value = lastItem.price;
                inputs[2].value = lastItem.description;
            }
        }

        alert(`📄 Đã import ${currentMenu.length} món từ file CSV!`);
    };
    reader.readAsText(file);
}

// ===========================
// UTILITY FUNCTIONS
// ===========================
function setView(view) {
    currentView = view;
    document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    displayPlaces();
}

function setFilter(category) {
    currentFilter = category;
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    displayPlaces();
}

function updateCategoryFilters() {
    const container = document.getElementById('categoryFilters');
    const categories = ['all', ...new Set(places.map(p => p.category))];

    container.innerHTML = '';
    categories.forEach(category => {
        const btn = document.createElement('button');
        btn.className = `filter-btn ${currentFilter === category ? 'active' : ''}`;
        btn.textContent = category === 'all' ? 'Tất cả' : category;
        btn.onclick = () => setFilter(category);
        container.appendChild(btn);
    });
}

function updateStats() {
    document.getElementById('totalPlaces').textContent = places.length;
    document.getElementById('totalDishes').textContent = places.reduce((sum, place) => sum + (place.menu?.length || 0), 0);
    document.getElementById('visitedPlaces').textContent = places.filter(p => p.status === 'visited').length;
    document.getElementById('favoriteCount').textContent = places.filter(p => p.favorite).length;
}

function updateFeaturedContent() {
    updateFeaturedPlaces();
    updateFeaturedDishes();
}

function updateFeaturedPlaces() {
    const featuredPlaces = places.filter(p => p.favorite || p.status === 'visited').slice(0, 6);
    const container = document.getElementById('featuredPlaces');
    container.innerHTML = '';

    if (featuredPlaces.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666; grid-column: 1/-1;">💡 Chưa có địa điểm nổi bật. Hãy thêm và đánh dấu yêu thích!</p>';
    } else {
        featuredPlaces.forEach(place => {
            const card = document.createElement('div');
            card.className = 'featured-card';
            card.onclick = () => showPlaceDetail(place.id);
            card.innerHTML = `
                ${place.image ? `<img src="${place.image}" alt="${place.name}" loading="lazy">` : '<div style="height: 200px; background: #f1f3f4; border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-bottom: 1rem; color: #666; font-size: 3rem;">🍽️</div>'}
                <h3>${place.name}</h3>
                <p>${place.category} • ${place.address}</p>
            `;
            container.appendChild(card);
        });
    }
}

function updateFeaturedDishes() {
    const allDishes = places.flatMap(place =>
        (place.menu || []).map(dish => ({...dish, placeName: place.name}))
    ).slice(0, 6);

    const container = document.getElementById('featuredDishes');
    container.innerHTML = '';

    if (allDishes.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666; grid-column: 1/-1;">🍽️ Chưa có món ăn nào. Hãy thêm thực đơn cho các địa điểm!</p>';
    } else {
        allDishes.forEach(dish => {
            const card = document.createElement('div');
            card.className = 'featured-card';
            card.innerHTML = `
                ${dish.image ? `<img src="${dish.image}" alt="${dish.name}" loading="lazy">` : '<div style="height: 200px; background: linear-gradient(45deg, #667eea, #764ba2); border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-bottom: 1rem; color: white; font-size: 3rem;">🍽️</div>'}
                <h3>${dish.name}</h3>
                <p><strong>${dish.placeName}</strong> • ${dish.price ? dish.price.toLocaleString() + ' VNĐ' : 'Giá chưa có'}</p>
            `;
            container.appendChild(card);
        });
    }
}

function updateAll() {
    updateStats();
    updateFeaturedContent();
    displayPlaces();
    updateCategoryFilters();
}

function saveToLocalStorage() {
    localStorage.setItem('places', JSON.stringify(places));
}

// ===========================
// EXPORT/IMPORT FUNCTIONS
// ===========================
function exportData() {
    const data = {
        places: places,
        exportDate: new Date().toISOString(),
        version: '2.0'
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `food-places-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    alert('📤 Đã xuất dữ liệu thành công!');
}

function importData() {
    const file = document.getElementById('importFile').files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);

            if (data.places && Array.isArray(data.places)) {
                if (confirm('⚠️ Việc nhập dữ liệu sẽ ghi đè lên dữ liệu hiện tại. Bạn có chắc chắn?')) {
                    places = data.places;
                    saveToLocalStorage();
                    updateAll();
                    alert('📥 Đã nhập dữ liệu thành công!');
                }
            } else {
                alert('❌ File không đúng định dạng!');
            }
        } catch (error) {
            alert('❌ Lỗi khi đọc file. Vui lòng kiểm tra định dạng file.');
        }
    };
    reader.readAsText(file);
}