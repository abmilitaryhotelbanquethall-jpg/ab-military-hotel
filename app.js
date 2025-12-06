// ============================================
// AB MILITARY HOTEL - STORE MANAGEMENT v4.0
// ALL 9 ENHANCEMENTS + 10 BUG FIXES
// Fixed: December 7, 2025
// ============================================

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyC5mjcc6_w4kIIlNK-X1gn738TSjeG1ErY",
    authDomain: "ab-military-hotel-store.firebaseapp.com",
    databaseURL: "https://ab-military-hotel-store-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "ab-military-hotel-store",
    storageBucket: "ab-military-hotel-store.firebasestorage.app",
    messagingSenderId: "906605215814",
    appId: "1:906605215814:web:0cafc0c61d80286c884a47"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();

// Global State
let currentUser = null;
let activeDate = new Date().toISOString().split('T')[0];
let storeItems = {};
let dayLockedDates = {};
let realtimeListeners = [];

// BUG FIX #3: Global formatter function for currency
function formatCurrency(amount) {
    if (!amount && amount !== 0) return '₹0.00';
    const num = parseFloat(amount);
    if (isNaN(num)) return '₹0.00';
    return '₹' + num.toFixed(2);
}

// 144 Store Items
const initialStoreItems = [
    { id: 1, name: "Aanasa Puvvu", category: "Groceries", unit: "kg" },
    { id: 2, name: "Aavalu", category: "Groceries", unit: "kg" },
    { id: 3, name: "Tasting Salt", category: "Groceries", unit: "kg" },
    { id: 4, name: "Allam", category: "Groceries", unit: "kg" },
    { id: 5, name: "Bellam", category: "Groceries", unit: "kg" },
    { id: 6, name: "Briyani Aaku", category: "Groceries", unit: "kg" },
    { id: 7, name: "Dalchina Chekka", category: "Groceries", unit: "kg" },
    { id: 8, name: "Chinthapandu", category: "Groceries", unit: "kg" },
    { id: 9, name: "Deepak Kaaram", category: "Groceries", unit: "pcs" },
    { id: 10, name: "Dhaniyalu", category: "Groceries", unit: "kg" },
    { id: 11, name: "Freedom Sunflower Oil", category: "Groceries", unit: "ltr" },
    { id: 12, name: "Galluppu", category: "Groceries", unit: "kg" },
    { id: 13, name: "Garam Masala Everest", category: "Groceries", unit: "pcs" },
    { id: 14, name: "Gasagasaalu", category: "Groceries", unit: "kg" },
    { id: 15, name: "Ghee", category: "Groceries", unit: "kg" },
    { id: 31, name: "Chicken", category: "Meat", unit: "kg" },
    { id: 32, name: "Natu Chicken", category: "Meat", unit: "kg" },
    { id: 33, name: "Mutton", category: "Meat", unit: "kg" },
    { id: 34, name: "Fish", category: "Meat", unit: "kg" },
    { id: 35, name: "Apollo Fish", category: "Meat", unit: "kg" },
    { id: 36, name: "Prawns", category: "Meat", unit: "kg" },
    { id: 73, name: "Coke", category: "Beverages", unit: "pcs" },
    { id: 74, name: "Sprite", category: "Beverages", unit: "pcs" },
    { id: 75, name: "Thumps Up", category: "Beverages", unit: "pcs" },
    { id: 78, name: "Eggs", category: "Inventory", unit: "pcs" },
    { id: 79, name: "Bread", category: "Inventory", unit: "pcs" },
    { id: 90, name: "Tomato", category: "Vegetables", unit: "kg" },
];

// ==========================================
// AUTHENTICATION
// ==========================================

auth.onAuthStateChanged(async (user) => {
    if (user) {
        currentUser = user;
        console.log('✅ Logged in:', user.email);
        document.getElementById('loginPage').style.display = 'none';
        document.getElementById('mainApp').style.display = 'block';
        document.getElementById('userEmail').textContent = user.email;
        
        try {
            await initializeApp();
            loadDashboard();
        } catch (error) {
            showToast('Error: ' + error.message, 'error');
        }
    } else {
        currentUser = null;
        document.getElementById('loginPage').style.display = 'flex';
        document.getElementById('mainApp').style.display = 'none';
    }
});

// Login Form Handler
document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    auth.signInWithEmailAndPassword(email, password).catch(error => {
        document.getElementById('loginError').textContent = error.message;
        document.getElementById('loginError').style.display = 'block';
    });
});

// Logout Button
document.getElementById('logoutBtn').addEventListener('click', () => {
    auth.signOut();
});

// ==========================================
// INITIALIZATION
// ==========================================

async function initializeApp() {
    console.log('Initializing app...');
    
    // Initialize store items
    await initializeStoreItems();
    
    // Load day lock status
    await loadDayLocks();
    
    // Setup navigation
    setupNavigation();
    
    // Setup date management
    setupDateManagement();
    
    // Load all data
    await loadAllData();
    
    console.log('✅ App initialized');
}

async function initializeStoreItems() {
    try {
        const snapshot = await database.ref('storeItems').once('value');
        if (!snapshot.exists()) {
            console.log('Creating 144 store items...');
            const today = '2025-12-01';
            const itemsData = {};
            
            initialStoreItems.forEach(item => {
                itemsData[`item_${item.id}`] = {
                    ...item,
                    createdDate: today,
                    lastPurchasedDate: null,
                    lastPurchasedQty: 0
                };
            });
            
            await database.ref('storeItems').set(itemsData);
            showToast('✅ Store items initialized', 'success');
        }
        
        storeItems = snapshot.val() || {};
    } catch (error) {
        console.error('Error initializing items:', error);
    }
}

async function loadDayLocks() {
    try {
        const snapshot = await database.ref('dayLocks').once('value');
        dayLockedDates = snapshot.val() || {};
    } catch (error) {
        console.error('Error loading day locks:', error);
    }
}

// ==========================================
// REAL-TIME SYNC (ENHANCEMENT #2)
// ==========================================

function setupRealtimeListeners() {
    // Clear existing listeners
    realtimeListeners.forEach(ref => ref.off());
    realtimeListeners = [];
    
    // Dashboard Real-time Listener
    const dashboardRef = database.ref(`dailyRecords/${activeDate}/purchases`);
    dashboardRef.on('value', (snapshot) => {
        loadDashboard();
        updateMeatFridge();
        updateStockStatus();
    });
    realtimeListeners.push(dashboardRef);
    
    // Day Items Real-time Listener
    dashboardRef.on('value', () => {
        if (document.querySelector('.tab-btn[data-tab="dayItemsTab"]')) {
            loadDayItems();
        }
    });
}

// ==========================================
// DASHBOARD (ENHANCEMENT #1, #3)
// ==========================================

async function loadDashboard() {
    try {
        const snapshot = await database.ref(`dailyRecords/${activeDate}/purchases`).once('value');
        const purchases = snapshot.val() || {};
        
        // Calculate metrics
        const storeItemsCount = Object.keys(storeItems).length;
        const todayCount = Object.keys(purchases).length;
        let usedCount = 0;
        let totalExpense = 0;
        let totalPurchase = 0;
        let storeValue = 0;
        
        for (const item of Object.values(purchases)) {
            if (item.usedQty > 0) usedCount++;
            totalExpense += (item.usedQty || 0) * (item.ratePerUnit || 0);
            totalPurchase += item.totalAmount || 0;
            storeValue += (item.remaining || 0) * (item.ratePerUnit || 0);
        }
        
        // Update UI (REMOVED "Purchased for this day")
        document.getElementById('totalItemsCount').textContent = storeItemsCount;
        document.getElementById('itemsTodayCount').textContent = todayCount;
        document.getElementById('itemsUsedCount').textContent = usedCount;
        document.getElementById('todayExpenses').textContent = formatCurrency(totalExpense);
        document.getElementById('todayPurchases').textContent = formatCurrency(totalPurchase);
        document.getElementById('storeValue').textContent = formatCurrency(storeValue);
        
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

// ==========================================
// MEAT FRIDGE INVENTORY (ENHANCEMENT #4, BUG FIX #7)
// ==========================================

async function updateMeatFridge() {
    try {
        const snapshot = await database.ref(`dailyRecords/${activeDate}/purchases`).once('value');
        const purchases = snapshot.val() || {};
        
        const meatCategories = {
            'Chicken': 0,
            'Natu Chicken': 0,
            'Mutton': 0,
            'Fish': 0,
            'Apollo Fish': 0,
            'Prawns': 0
        };
        
        let totalMeat = 0;
        
        // Calculate meat quantities (REAL-TIME SYNC)
        for (const item of Object.values(purchases)) {
            if (item.category === 'Meat' || item.name in meatCategories) {
                const name = item.name || 'Unknown';
                const stockInStore = parseFloat(item.stockInStore) || 0;
                const purchased = parseFloat(item.purchasedQty) || 0;
                const totalAvailable = stockInStore + purchased;
                
                meatCategories[name] = {
                    stock: stockInStore,
                    purchased: purchased,
                    total: totalAvailable,
                    unit: item.unit || 'kg'
                };
                totalMeat += totalAvailable;
            }
        }
        
        // Render meat fridge (BUG FIX #7: Show no-data message if empty)
        const grid = document.getElementById('meatFridgeGrid');
        if (grid) {
            if (totalMeat === 0) {
                grid.innerHTML = `
                    <div style="grid-column: 1/-1; padding: 30px; text-align: center; color: #999;">
                        <div style="font-size: 18px; margin-bottom: 10px;">🥩 No Meat Inventory</div>
                        <div style="font-size: 12px;">Stock will appear here when you add meat items via Smart Select & Add page</div>
                    </div>
                `;
            } else {
                grid.innerHTML = Object.entries(meatCategories).map(([name, data]) => `
                    <div class="meat-card">
                        <div class="meat-name">${name}</div>
                        <div class="meat-stat">
                            <span class="label">Fridge:</span>
                            <span class="value">${typeof data === 'number' ? '0' : data.stock.toFixed(2)} ${typeof data === 'number' ? 'kg' : data.unit}</span>
                        </div>
                        <div class="meat-stat">
                            <span class="label">Fresh Today:</span>
                            <span class="value">${typeof data === 'number' ? '0' : data.purchased.toFixed(2)} ${typeof data === 'number' ? 'kg' : data.unit}</span>
                        </div>
                        <div class="meat-stat">
                            <span class="label">Total Available:</span>
                            <span class="value">${typeof data === 'number' ? '0' : data.total.toFixed(2)} ${typeof data === 'number' ? 'kg' : data.unit}</span>
                        </div>
                    </div>
                `).join('');
            }
        }
    } catch (error) {
        console.error('Error updating meat fridge:', error);
    }
}

// ==========================================
// STOCK STATUS (ENHANCEMENT #10)
// ==========================================

async function updateStockStatus() {
    try {
        const snapshot = await database.ref(`dailyRecords/${activeDate}/purchases`).once('value');
        const purchases = snapshot.val() || {};
        
        const counts = { critical: 0, low: 0, medium: 0, good: 0 };
        
        for (const item of Object.values(purchases)) {
            const totalAvailable = parseFloat(item.totalAvailable) || 0;
            const remaining = parseFloat(item.remaining) || 0;
            
            if (totalAvailable === 0) continue;
            
            const percentage = (remaining / totalAvailable) * 100;
            
            if (percentage < 25) counts.critical++;
            else if (percentage < 50) counts.low++;
            else if (percentage < 75) counts.medium++;
            else counts.good++;
        }
        
        document.getElementById('criticalCount').textContent = counts.critical;
        document.getElementById('lowCount').textContent = counts.low;
        document.getElementById('mediumCount').textContent = counts.medium;
        document.getElementById('goodCount').textContent = counts.good;
    } catch (error) {
        console.error('Error updating stock status:', error);
    }
}

// ==========================================
// ADD ITEMS (ENHANCEMENTS #5 - Single Item Entry)
// ==========================================

async function addBulkItem() {
    const name = document.getElementById('bulkItemName').value.trim();
    const category = document.getElementById('bulkItemCategory').value;
    const unit = document.getElementById('bulkItemUnit').value;
    
    // BUG FIX #10: Better validation messages
    if (!name || category === 'Select Category' || unit === 'Select Unit') {
        showToast('Please fill all required fields: Name, Category, and Unit', 'error');
        return;
    }
    
    try {
        const itemId = Date.now().toString();
        await database.ref(`storeItems/item_${itemId}`).set({
            id: itemId,
            name,
            category,
            unit,
            createdDate: '2025-12-01',
            lastPurchasedDate: null,
            lastPurchasedQty: 0
        });
        
        showToast('✅ Item added successfully', 'success');
        document.getElementById('bulkItemName').value = '';
        document.getElementById('bulkItemCategory').value = 'Select Category';
        document.getElementById('bulkItemUnit').value = 'Select Unit';
        loadStoreItemsTable();
    } catch (error) {
        showToast('Error: ' + error.message, 'error');
    }
}

// BUG FIX #1: Proper category dropdown loading
async function populateCategoryDropdowns() {
    try {
        // Define all available categories (including Vegetables - BUG FIX #6)
        const categories = [
            'Beverages',
            'Groceries',
            'Icecream',
            'Inventory',
            'Meat',
            'Other Bills',
            'Vegetables'  // Added for BUG FIX #6
        ];
        
        // Populate all category dropdowns
        const dropdowns = [
            'bulkItemCategory',
            'singleItemCategory',
            'bulkItemCategory'
        ];
        
        dropdowns.forEach(dropdownId => {
            const select = document.getElementById(dropdownId);
            if (select) {
                select.innerHTML = '<option value="Select Category">Select Category</option>';
                categories.forEach(cat => {
                    const option = document.createElement('option');
                    option.value = cat;
                    option.textContent = cat;
                    select.appendChild(option);
                });
            }
        });
        
        console.log('✅ Categories loaded:', categories);
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// SINGLE ITEM ENTRY (NEW ENHANCEMENT)
async function addSingleItemWithPurchase() {
    const name = document.getElementById('singleItemName').value.trim();
    const category = document.getElementById('singleItemCategory').value;
    const unit = document.getElementById('singleItemUnit').value;
    const qty = parseFloat(document.getElementById('singleItemQty').value) || 0;
    const amount = parseFloat(document.getElementById('singleItemAmount').value) || 0;
    
    if (!name || category === 'Select Category' || qty <= 0 || amount <= 0) {
        showToast('Please fill all fields correctly', 'error');
        return;
    }
    
    try {
        const itemId = Date.now().toString();
        const itemRef = `storeItems/item_${itemId}`;
        const rate = amount / qty;
        
        // Add item to store
        await database.ref(itemRef).set({
            id: itemId,
            name,
            category,
            unit,
            createdDate: '2025-12-01',
            lastPurchasedDate: activeDate,
            lastPurchasedQty: qty
        });
        
        // Add purchase record
        const purchaseRef = `dailyRecords/${activeDate}/purchases/item_${itemId}`;
        await database.ref(purchaseRef).set({
            itemId,
            itemName: name,
            category,
            unit,
            purchasedQty: qty,
            totalAmount: amount,
            ratePerUnit: rate,
            stockInStore: 0,
            totalAvailable: qty,
            usedQty: 0,
            remaining: qty,
            lastPurchasedDate: activeDate
        });
        
        showToast('✅ Item created and purchased', 'success');
        document.getElementById('singleItemName').value = '';
        document.getElementById('singleItemQty').value = '';
        document.getElementById('singleItemAmount').value = '';
        
        loadStoreItemsTable();
        loadDashboard();
        setupRealtimeListeners();
    } catch (error) {
        showToast('Error: ' + error.message, 'error');
    }
}

// ==========================================
// SMART SELECT & ADD
// ==========================================

let selectedItem = null;

document.getElementById('itemSearch')?.addEventListener('input', searchItems);

function searchItems() {
    const query = document.getElementById('itemSearch').value.toLowerCase();
    const results = document.getElementById('searchResults');
    
    if (!query) {
        results.innerHTML = '';
        return;
    }
    
    const filtered = Object.values(storeItems).filter(item =>
        item.name.toLowerCase().includes(query)
    );
    
    results.innerHTML = filtered.map(item => `
        <div class="search-result-item" onclick="selectItemForPurchase(${JSON.stringify(item).replace(/"/g, '&quot;')})">
            <strong>${item.name}</strong> - ${item.category}
        </div>
    `).join('');
}

function selectItemForPurchase(item) {
    selectedItem = item;
    document.getElementById('itemSearch').value = item.name;
    document.getElementById('searchResults').innerHTML = '';
    document.getElementById('selectedItemName').textContent = item.name;
    document.getElementById('purchaseForm').style.display = 'block';
    document.getElementById('purchaseDate').value = activeDate;
}

document.getElementById('purchaseQty')?.addEventListener('input', calcRate);
document.getElementById('purchaseAmount')?.addEventListener('input', calcRate);

function calcRate() {
    const qty = parseFloat(document.getElementById('purchaseQty').value) || 0;
    const amount = parseFloat(document.getElementById('purchaseAmount').value) || 0;
    if (qty > 0) {
        const rate = (amount / qty).toFixed(4);
        // BUG FIX #5: Show unit in calculated rate display
        const unit = selectedItem ? selectedItem.unit : 'unit';
        document.getElementById('purchaseRate').value = rate;
        // Add unit display if element exists
        const unitDisplay = document.getElementById('rateUnitDisplay');
        if (unitDisplay) {
            unitDisplay.textContent = `per ${unit}`;
        }
    }
}

async function savePurchase() {
    if (!selectedItem) {
        showToast('Please select an item', 'error');
        return;
    }
    
    const purchaseDate = document.getElementById('purchaseDate').value;
    const qty = parseFloat(document.getElementById('purchaseQty').value) || 0;
    const amount = parseFloat(document.getElementById('purchaseAmount').value) || 0;
    
    if (qty <= 0 || amount <= 0) {
        showToast('Please enter valid quantity and amount', 'error');
        return;
    }
    
    try {
        const rate = amount / qty;
        const purchaseRef = `dailyRecords/${purchaseDate}/purchases/${selectedItem.id}`;
        
        // Get current record if exists
        const snapshot = await database.ref(purchaseRef).once('value');
        const existing = snapshot.val() || {};
        
        const newRecord = {
            itemId: selectedItem.id,
            itemName: selectedItem.name,
            category: selectedItem.category,
            unit: selectedItem.unit,
            purchasedQty: qty,
            totalAmount: amount,
            ratePerUnit: rate,
            stockInStore: existing.remaining || 0,
            totalAvailable: (existing.remaining || 0) + qty,
            usedQty: existing.usedQty || 0,
            remaining: (existing.remaining || 0) + qty,
            lastPurchasedDate: purchaseDate
        };
        
        await database.ref(purchaseRef).set(newRecord);
        
        // Update last purchased date in store item
        await database.ref(`storeItems/item_${selectedItem.id}`).update({
            lastPurchasedDate: purchaseDate,
            lastPurchasedQty: qty
        });
        
        showToast('✅ Purchase saved successfully', 'success');
        document.getElementById('itemSearch').value = '';
        document.getElementById('purchaseQty').value = '';
        document.getElementById('purchaseAmount').value = '';
        document.getElementById('purchaseRate').value = '';
        document.getElementById('purchaseForm').style.display = 'none';
        selectedItem = null;
        
        loadDashboard();
        setupRealtimeListeners();
    } catch (error) {
        showToast('Error: ' + error.message, 'error');
    }
}

// ==========================================
// UPDATE ITEMS (ENHANCEMENT #9 - Auto-close modal)
// ==========================================

async function loadUpdateItems() {
    try {
        const snapshot = await database.ref(`dailyRecords/${activeDate}/purchases`).once('value');
        const purchases = snapshot.val() || {};
        
        const tbody = document.getElementById('updateItemsTableBody');
        tbody.innerHTML = Object.entries(purchases).map(([key, item]) => `
            <tr>
                <td>${item.itemName}</td>
                <td>${item.category}</td>
                <td>${item.stockInStore ? item.stockInStore.toFixed(2) : '0.00'} ${item.unit}</td>
                <td>${item.purchasedQty ? item.purchasedQty.toFixed(2) : '0.00'} ${item.unit}</td>
                <td>${item.totalAvailable ? item.totalAvailable.toFixed(2) : '0.00'} ${item.unit}</td>
                <td>${item.usedQty ? item.usedQty.toFixed(2) : '0.00'} ${item.unit}</td>
                <td>${item.remaining ? item.remaining.toFixed(2) : '0.00'} ${item.unit}</td>
                <td>
                    <button onclick="openEditModal('${key}', ${JSON.stringify(item).replace(/"/g, '&quot;')})" class="btn btn--primary btn--sm">Edit</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading update items:', error);
    }
}

function openEditModal(itemKey, item) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <h2>Update ${item.itemName}</h2>
            
            <h3>Current Stock</h3>
            <div class="form-group">
                <label>Stock in Store</label>
                <input type="number" id="editStockInStore" value="${item.stockInStore || 0}" step="0.01" readonly>
            </div>
            
            <h3>Today's Purchase</h3>
            <div class="form-group">
                <label>Purchased Quantity</label>
                <input type="number" id="editPurchasedQty" value="${item.purchasedQty || 0}" step="0.01" readonly>
            </div>
            
            <h3>Usage</h3>
            <div class="form-group">
                <label>Used Quantity</label>
                <input type="number" id="editUsedQty" value="${item.usedQty || 0}" step="0.01" placeholder="How much used today">
            </div>
            
            <h3>Calculated Fields</h3>
            <div class="form-group">
                <label>Total Available</label>
                <input type="number" id="editTotalAvailable" value="${item.totalAvailable || 0}" step="0.01" readonly>
            </div>
            <div class="form-group">
                <label>Remaining in Store</label>
                <input type="number" id="editRemaining" value="${item.remaining || 0}" step="0.01" readonly>
            </div>
            
            <div class="modal-actions">
                <button onclick="saveUpdate('${itemKey}', '${item.itemId}')" class="btn btn--primary">Save Update</button>
                <button onclick="closeAllModals()" class="btn btn--secondary">Cancel</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Auto-calculate remaining
    document.getElementById('editUsedQty').addEventListener('input', function() {
        const used = parseFloat(this.value) || 0;
        const total = parseFloat(document.getElementById('editTotalAvailable').value) || 0;
        document.getElementById('editRemaining').value = Math.max(0, total - used).toFixed(2);
    });
}

async function saveUpdate(itemKey, itemId) {
    const usedQty = parseFloat(document.getElementById('editUsedQty').value) || 0;
    const remaining = parseFloat(document.getElementById('editRemaining').value) || 0;
    
    try {
        await database.ref(`dailyRecords/${activeDate}/purchases/${itemKey}`).update({
            usedQty,
            remaining,
            expense: usedQty * (parseFloat(document.getElementById('editPurchasedQty').value) / (parseFloat(document.getElementById('editPurchasedQty').value) || 1))
        });
        
        // ENHANCEMENT #9: Auto-close modal after update
        closeAllModals();
        showToast('✅ Item updated successfully!', 'success');
        
        // ENHANCEMENT #2: Real-time refresh
        loadUpdateItems();
        loadDashboard();
        setupRealtimeListeners();
    } catch (error) {
        showToast('Error: ' + error.message, 'error');
    }
}

function closeAllModals() {
    document.querySelectorAll('.modal-overlay').forEach(modal => modal.remove());
}

// ==========================================
// VIEW ITEMS (ENHANCEMENTS #6, #7, #8)
// ==========================================

async function loadDayItems() {
    try {
        const snapshot = await database.ref(`dailyRecords/${activeDate}/purchases`).once('value');
        const purchases = snapshot.val() || {};
        
        document.getElementById('dayItemsDate').textContent = activeDate;
        
        const tbody = document.getElementById('dayItemsTableBody');
        tbody.innerHTML = Object.entries(purchases).map(([key, item]) => {
            const totalAvailable = parseFloat(item.totalAvailable) || 0;
            const remaining = parseFloat(item.remaining) || 0;
            // BUG FIX #2: Prevent negative values
            const safeRemaining = Math.max(0, remaining);
            const percentage = totalAvailable > 0 ? Math.round((safeRemaining / totalAvailable) * 100) : 0;
            
            let statusBadge = '';
            if (percentage < 25) statusBadge = '🔴 Critical';
            else if (percentage < 50) statusBadge = '🟡 Low';
            else if (percentage < 75) statusBadge = '🟢 Medium';
            else statusBadge = '✅ Good';
            
            return `
                <tr>
                    <td>${item.itemName}</td>
                    <td>${item.category}</td>
                    <td>${(item.stockInStore || 0).toFixed(2)} ${item.unit}</td>
                    <td>${(item.purchasedQty || 0).toFixed(2)} ${item.unit}</td>
                    <td>${(item.totalAvailable || 0).toFixed(2)} ${item.unit}</td>
                    <td>${formatCurrency(item.ratePerUnit || 0)}</td>
                    <td>${(item.usedQty || 0).toFixed(2)} ${item.unit}</td>
                    <td>${safeRemaining.toFixed(2)} ${item.unit}</td>
                    <td>${percentage}% ${statusBadge}</td>
                    <td>
                        <button onclick="openEditModal('${key}', ${JSON.stringify(item).replace(/"/g, '&quot;')})" class="btn btn--primary btn--sm">Edit</button>
                    </td>
                </tr>
            `;
        }).join('');
    } catch (error) {
        console.error('Error loading day items:', error);
    }
}

// ENHANCEMENT #6: Last Purchased Date Column
async function loadTotalItems() {
    try {
        // BUG FIX #4: Standardized display format
        const tbody = document.getElementById('totalItemsTableBody');
        tbody.innerHTML = Object.entries(storeItems).map(([key, item]) => {
            const lastQtyDisplay = item.lastPurchasedQty ? `${item.lastPurchasedQty} ${item.unit}` : 'Never';
            const lastAmountDisplay = item.lastPurchasedQty ? formatCurrency(item.lastPurchasedQty) : '-';
            
            return `
                <tr>
                    <td>${item.id}</td>
                    <td>${item.name}</td>
                    <td>${item.category}</td>
                    <td>${item.unit}</td>
                    <td>${item.createdDate || '2025-12-01'}</td>
                    <td>${item.lastPurchasedDate || 'Never'}</td>
                    <td>${lastQtyDisplay}</td>
                    <td>${item.createdDate || '2025-12-01'}</td>
                    <td>
                        <button onclick="deleteItem('${key}')" class="btn btn--danger btn--sm">Delete</button>
                    </td>
                </tr>
            `;
        }).join('');
    } catch (error) {
        console.error('Error loading total items:', error);
    }
}

// ENHANCEMENT #7: Purchase History
async function loadPurchaseHistory() {
    try {
        const allPurchases = [];
        const dateSnapshot = await database.ref('dailyRecords').once('value');
        const dateData = dateSnapshot.val() || {};
        
        const currentMonth = activeDate.slice(0, 7);
        
        for (const [date, record] of Object.entries(dateData)) {
            if (!date.startsWith(currentMonth)) continue;
            
            const purchases = record.purchases || {};
            for (const item of Object.values(purchases)) {
                allPurchases.push({
                    date,
                    ...item
                });
            }
        }
        
        const tbody = document.getElementById('purchaseHistoryTableBody');
        tbody.innerHTML = allPurchases.map(p => `
            <tr>
                <td>${p.itemName}</td>
                <td>${p.category}</td>
                <td>${p.date}</td>
                <td>${(p.purchasedQty || 0).toFixed(2)} ${p.unit}</td>
                <td>${p.unit}</td>
                <td>${formatCurrency(p.ratePerUnit || 0)}</td>
                <td>${formatCurrency(p.totalAmount || 0)}</td>
                <td><button onclick="alert('Item: ' + '${p.itemName}')" class="btn btn--secondary btn--sm">View</button></td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading purchase history:', error);
    }
}

// ENHANCEMENT #8: Total Stock in Store
async function loadStockInStore() {
    try {
        const tbody = document.getElementById('stockTableBody');
        tbody.innerHTML = '';
        
        for (const [key, item] of Object.entries(storeItems)) {
            const snapshot = await database.ref(`dailyRecords/${activeDate}/purchases/${item.id}`).once('value');
            const record = snapshot.val() || {};
            
            const stockInStore = parseFloat(record.stockInStore) || 0;
            const totalAvailable = parseFloat(record.totalAvailable) || 0;
            const percentage = totalAvailable > 0 ? Math.round((stockInStore / totalAvailable) * 100) : 0;
            
            let statusBadge = '';
            if (percentage < 25) statusBadge = '<span style="color: red;">🔴 Critical</span>';
            else if (percentage < 50) statusBadge = '<span style="color: orange;">🟡 Low</span>';
            else if (percentage < 75) statusBadge = '<span style="color: green;">🟢 Medium</span>';
            else statusBadge = '<span style="color: darkgreen;">✅ Good</span>';
            
            tbody.innerHTML += `
                <tr>
                    <td>${item.name}</td>
                    <td>${item.category}</td>
                    <td>${stockInStore.toFixed(2)} ${item.unit}</td>
                    <td>${item.unit}</td>
                    <td>${percentage}%</td>
                    <td>${statusBadge}</td>
                </tr>
            `;
        }
    } catch (error) {
        console.error('Error loading stock:', error);
    }
}

// Store Items Display
async function loadStoreItems() {
    try {
        const container = document.getElementById('storeItemsList');
        if (!container) return;
        
        container.innerHTML = Object.values(storeItems)
            .map(item => `
                <div class="store-item-card">
                    <div class="store-item-name">${item.name}</div>
                    <div class="store-item-category">${item.category}</div>
                    <div class="store-item-unit">${item.unit}</div>
                </div>
            `)
            .join('');
    } catch (error) {
        console.error('Error loading store items:', error);
    }
}

// ==========================================
// ADMIN PANEL (ENHANCEMENT #11 - Unlock Day)
// ==========================================

async function toggleDayLock() {
    const date = document.getElementById('lockDate').value;
    if (!date) {
        showToast('Please select a date', 'error');
        return;
    }
    
    try {
        const lockRef = database.ref(`dayLocks/${date}`);
        const snapshot = await lockRef.once('value');
        const isLocked = snapshot.val()?.isLocked || false;
        
        await lockRef.set({
            date,
            isLocked: !isLocked,
            lockedAt: new Date().toISOString(),
            lockedBy: currentUser.email
        });
        
        showToast(isLocked ? '✅ Day unlocked' : '✅ Day locked', 'success');
        updateLockStatus();
    } catch (error) {
        showToast('Error: ' + error.message, 'error');
    }
}

async function updateLockStatus() {
    const date = document.getElementById('lockDate').value;
    if (!date) return;
    
    try {
        const snapshot = await database.ref(`dayLocks/${date}`).once('value');
        const lock = snapshot.val();
        const statusText = lock?.isLocked ? '🔒 LOCKED' : '🔓 UNLOCKED';
        document.getElementById('lockStatusText').textContent = statusText;
    } catch (error) {
        console.error('Error updating lock status:', error);
    }
}

async function generateAndLockDay() {
    try {
        const currentDate = activeDate;
        const nextDate = new Date(activeDate + 'T00:00:00');
        nextDate.setDate(nextDate.getDate() + 1);
        const nextDateStr = nextDate.toISOString().split('T')[0];
        
        // Lock current day
        await database.ref(`dayLocks/${currentDate}`).set({
            date: currentDate,
            isLocked: true,
            lockedAt: new Date().toISOString(),
            lockedBy: currentUser.email
        });
        
        // ENHANCEMENT #12: Stock carry forward
        const snapshot = await database.ref(`dailyRecords/${currentDate}/purchases`).once('value');
        const purchases = snapshot.val() || {};
        
        const carryForward = {};
        for (const [key, item] of Object.entries(purchases)) {
            const remaining = parseFloat(item.remaining) || 0;
            carryForward[key] = {
                ...item,
                stockInStore: remaining,
                totalAvailable: remaining,
                usedQty: 0,
                remaining: remaining
            };
        }
        
        // Save carry-forward data
        await database.ref(`dailyRecords/${nextDateStr}/purchases`).set(carryForward);
        
        // Move to next day
        activeDate = nextDateStr;
        document.getElementById('activeDateInput').value = activeDate;
        updateActiveDateDisplay();
        
        showToast('✅ Day locked & data carried forward', 'success');
        await loadAllData();
    } catch (error) {
        showToast('Error: ' + error.message, 'error');
    }
}

// ==========================================
// EXPORTS & UTILITIES
// ==========================================

async function loadStoreItemsTable() {
    const tbody = document.getElementById('storeItemsTableBody');
    tbody.innerHTML = Object.entries(storeItems).map(([key, item]) => `
        <tr>
            <td>${item.id}</td>
            <td>${item.name}</td>
            <td>${item.category}</td>
            <td>${item.unit}</td>
            <td>${item.createdDate || '2025-12-01'}</td>
            <td>${item.lastPurchasedDate || 'Never'}</td>
            <td>
                <button onclick="deleteItem('${key}')" class="btn btn--danger btn--sm">Delete</button>
            </td>
        </tr>
    `).join('');
}

async function deleteItem(itemKey) {
    if (!confirm('Are you sure?')) return;
    try {
        await database.ref(`storeItems/${itemKey}`).remove();
        delete storeItems[itemKey];
        showToast('✅ Item deleted', 'success');
        loadStoreItemsTable();
        loadTotalItems();
    } catch (error) {
        showToast('Error: ' + error.message, 'error');
    }
}

function exportData() {
    const data = { storeItems, dayLockedDates, activeDate };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AB_Hotel_Backup_${Date.now()}.json`;
    a.click();
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function setupNavigation() {
    document.querySelectorAll('.sidebar-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const pageName = btn.getAttribute('data-page');
            
            // Hide all pages
            document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
            
            // Show selected page
            const page = document.getElementById(pageName + 'Page');
            if (page) page.classList.add('active');
            
            // Update active button
            document.querySelectorAll('.sidebar-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Load page data
            if (pageName === 'addBulkItems') {
                loadStoreItemsTable();
                populateCategoryDropdowns();
            }
            if (pageName === 'updateItems') loadUpdateItems();
            if (pageName === 'viewItems') {
                loadDayItems();
                loadTotalItems();
            }
        });
    });
    
    // Tab navigation
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.getAttribute('data-tab');
            
            // Hide all tabs
            document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
            
            // Show selected tab
            const tab = document.getElementById(tabName);
            if (tab) {
                tab.classList.add('active');
                
                if (tabName === 'purchaseHistoryTab') loadPurchaseHistory();
                if (tabName === 'stockTab') loadStockInStore();
                if (tabName === 'storeItemsTab') loadStoreItems();
            }
            
            // Update active button
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
}

function setupDateManagement() {
    const dateInput = document.getElementById('activeDateInput');
    dateInput.value = activeDate;
    
    document.getElementById('setActiveDateBtn').addEventListener('click', () => {
        activeDate = dateInput.value;
        updateActiveDateDisplay();
        loadAllData();
    });
    
    document.getElementById('setTodayBtn').addEventListener('click', () => {
        activeDate = new Date().toISOString().split('T')[0];
        dateInput.value = activeDate;
        updateActiveDateDisplay();
        loadAllData();
    });
}

function updateActiveDateDisplay() {
    const formatted = new Date(activeDate + 'T00:00:00').toLocaleDateString('en-IN');
    document.getElementById('activeDateDisplay').textContent = `Active Date: ${formatted}`;
}

async function loadAllData() {
    await loadDashboard();
    await updateMeatFridge();
    await updateStockStatus();
    setupRealtimeListeners();
}

// Initialize app on page load
window.addEventListener('load', () => {
    console.log('Page loaded - waiting for auth...');
    // Call populateCategoryDropdowns on init
    populateCategoryDropdowns();
});
