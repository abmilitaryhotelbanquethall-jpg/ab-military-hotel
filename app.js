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

// Global State (using JavaScript variables instead of localStorage)
let currentUser = null;
let currentSessionId = null; // Track current session
let activeDate = new Date().toISOString().split('T')[0];
let storeItems = {};
let categoriesCache = {}; // Read-only cache from Firebase
let recentActivities = [];
let sortOrder = 'asc';
let currentSortBy = 'id';
let currentFilter = 'all';
let totalSortOrder = 'asc';
let currentTotalSortBy = 'id';

// ===== NO UNIT CONVERSION - STORE EXACTLY AS ENTERED =====
// This system stores quantities EXACTLY as user enters them
// No conversion between kg/gm or ltr/ml
// Rate is calculated per entered unit (not base unit)

// Global function to close all modals
function closeModal() {
  var modals = document.querySelectorAll('.modal-overlay');
  for (var i = 0; i < modals.length; i++) {
    modals[i].remove();
  }
}

window.closeModal = closeModal;

// 144 Store Items Data
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
  { id: 16, name: "Jaaji Kayalu", category: "Groceries", unit: "kg" },
  { id: 17, name: "Jaapathri", category: "Groceries", unit: "kg" },
  { id: 18, name: "Jeedi Nooka", category: "Groceries", unit: "kg" },
  { id: 19, name: "Jeedi Pappu", category: "Groceries", unit: "kg" },
  { id: 20, name: "Jeelakarra", category: "Groceries", unit: "kg" },
  { id: 21, name: "Kandhi Pappu", category: "Groceries", unit: "kg" },
  { id: 22, name: "Kashmir Red Chilli Powder", category: "Groceries", unit: "kg" },
  { id: 23, name: "Kismis", category: "Groceries", unit: "kg" },
  { id: 24, name: "Kobbari Podi", category: "Groceries", unit: "kg" },
  { id: 25, name: "Lavangalu", category: "Groceries", unit: "kg" },
  { id: 26, name: "LG Inguva", category: "Groceries", unit: "pcs" },
  { id: 27, name: "Marati Mogga", category: "Groceries", unit: "kg" },
  { id: 28, name: "Masala Kaaram", category: "Groceries", unit: "pcs" },
  { id: 29, name: "Menthi Aaku", category: "Groceries", unit: "kg" },
  { id: 30, name: "Miriyalu", category: "Groceries", unit: "kg" },
  { id: 31, name: "Chicken", category: "Meat", subcategory: "Chicken", unit: "kg" },
  { id: 32, name: "Natu Chicken", category: "Meat", subcategory: "Natu Chicken", unit: "kg" },
  { id: 33, name: "Mutton", category: "Meat", subcategory: "Mutton", unit: "kg" },
  { id: 34, name: "Fish", category: "Meat", subcategory: "Fish", unit: "kg" },
  { id: 35, name: "Apollo Fish", category: "Meat", subcategory: "Apollo Fish", unit: "kg" },
  { id: 36, name: "Prawns", category: "Meat", subcategory: "Prawns", unit: "kg" },
  { id: 41, name: "Pachi Senagapappu", category: "Groceries", unit: "kg" },
  { id: 42, name: "Pasupu", category: "Groceries", unit: "kg" },
  { id: 43, name: "Pucha Pappu", category: "Groceries", unit: "kg" },
  { id: 44, name: "Sambhar Masala MTR", category: "Groceries", unit: "pcs" },
  { id: 45, name: "Semiya", category: "Groceries", unit: "kg" },
  { id: 46, name: "Shaa Jeera", category: "Groceries", unit: "kg" },
  { id: 47, name: "Sugar", category: "Groceries", unit: "kg" },
  { id: 48, name: "Tata Salt", category: "Groceries", unit: "kg" },
  { id: 49, name: "Thella Nuvvulu", category: "Groceries", unit: "kg" },
  { id: 50, name: "Yaalikulu", category: "Groceries", unit: "kg" },
  { id: 51, name: "Yendukobbari", category: "Groceries", unit: "kg" },
  { id: 52, name: "Yendu Mirichi", category: "Groceries", unit: "kg" },
  { id: 53, name: "Brown Rice", category: "Groceries", unit: "kg" },
  { id: 54, name: "Corn Flour", category: "Groceries", unit: "kg" },
  { id: 55, name: "Maida", category: "Groceries", unit: "kg" },
  { id: 56, name: "Menthulu", category: "Groceries", unit: "kg" },
  { id: 57, name: "Minapa Gullu", category: "Groceries", unit: "kg" },
  { id: 58, name: "Mutton Masala Everest", category: "Groceries", unit: "pcs" },
  { id: 59, name: "Chicken Masala Everest", category: "Groceries", unit: "pcs" },
  { id: 60, name: "Pesara Pappu", category: "Groceries", unit: "kg" },
  { id: 61, name: "Ragi Pindi", category: "Groceries", unit: "kg" },
  { id: 62, name: "Rasam Powder", category: "Groceries", unit: "kg" },
  { id: 63, name: "Red Rice", category: "Groceries", unit: "kg" },
  { id: 64, name: "Senaga Pindi", category: "Groceries", unit: "kg" },
  { id: 65, name: "Ullipayalu", category: "Groceries", unit: "kg" },
  { id: 66, name: "Unity Rice", category: "Groceries", unit: "kg" },
  { id: 67, name: "Vari Pindi", category: "Groceries", unit: "kg" },
  { id: 68, name: "Vellulli", category: "Groceries", unit: "kg" },
  { id: 69, name: "Verushanaga Gullu", category: "Groceries", unit: "kg" },
  { id: 70, name: "White Rice Lalitha", category: "Groceries", unit: "kg" },
  { id: 71, name: "Yerra Ravva", category: "Groceries", unit: "kg" },
  { id: 72, name: "Thella Ravva", category: "Groceries", unit: "kg" },
  { id: 73, name: "Coke", category: "Beverages", unit: "pcs" },
  { id: 74, name: "Sprite", category: "Beverages", unit: "pcs" },
  { id: 75, name: "Thumps Up", category: "Beverages", unit: "pcs" },
  { id: 76, name: "Maaza", category: "Beverages", unit: "pcs" },
  { id: 77, name: "Meal Maker", category: "Inventory", unit: "kg" },
  { id: 78, name: "Eggs", category: "Inventory", unit: "pcs" },
  { id: 79, name: "Bread", category: "Inventory", unit: "pcs" },
  { id: 80, name: "Curd", category: "Inventory", unit: "kg" },
  { id: 81, name: "Tomato Sauce", category: "Inventory", unit: "pcs" },
  { id: 82, name: "Chilli Sauce", category: "Inventory", unit: "pcs" },
  { id: 83, name: "Soya Sauce", category: "Inventory", unit: "pcs" },
  { id: 84, name: "Vinegar", category: "Inventory", unit: "pcs" },
  { id: 85, name: "Baby Corn", category: "Inventory", unit: "kg" },
  { id: 86, name: "Capsicum", category: "Inventory", unit: "kg" },
  { id: 87, name: "Carrots", category: "Inventory", unit: "kg" },
  { id: 88, name: "Beetroot", category: "Inventory", unit: "kg" },
  { id: 89, name: "Cucumber", category: "Inventory", unit: "kg" },
  { id: 90, name: "Tomato", category: "Inventory", unit: "kg" },
  { id: 91, name: "Kandha", category: "Inventory", unit: "kg" },
  { id: 92, name: "Lemons", category: "Inventory", unit: "kg" },
  { id: 93, name: "Ginger", category: "Inventory", unit: "kg" },
  { id: 94, name: "Curry Leaves", category: "Inventory", unit: "kg" },
  { id: 95, name: "Coriander", category: "Inventory", unit: "kg" },
  { id: 96, name: "Mint", category: "Inventory", unit: "kg" },
  { id: 97, name: "Green Chilli", category: "Inventory", unit: "kg" },
  { id: 98, name: "Banana", category: "Inventory", unit: "dozen" },
  { id: 99, name: "Apples", category: "Inventory", unit: "kg" },
  { id: 100, name: "Oranges", category: "Inventory", unit: "kg" },
  { id: 101, name: "Pineapple", category: "Inventory", unit: "pcs" },
  { id: 102, name: "Watermelon", category: "Inventory", unit: "pcs" },
  { id: 103, name: "Papaya", category: "Inventory", unit: "kg" },
  { id: 104, name: "Tissue Papers", category: "Inventory", unit: "pcs" },
  { id: 105, name: "Paper Plates", category: "Inventory", unit: "pcs" },
  { id: 106, name: "Disposable Spoons", category: "Inventory", unit: "pcs" },
  { id: 107, name: "Disposable Cups", category: "Inventory", unit: "pcs" },
  { id: 108, name: "Carry Bags Small", category: "Inventory", unit: "pcs" },
  { id: 109, name: "Carry Bags Large", category: "Inventory", unit: "pcs" },
  { id: 110, name: "Floor Cleaner", category: "Inventory", unit: "ltr" },
  { id: 111, name: "Dish Soap", category: "Inventory", unit: "ltr" },
  { id: 112, name: "Hand Wash", category: "Inventory", unit: "ltr" },
  { id: 113, name: "Phenol", category: "Inventory", unit: "ltr" },
  { id: 114, name: "Dustbin Bags Big", category: "Inventory", unit: "pcs" },
  { id: 115, name: "Dustbin Bags Small", category: "Inventory", unit: "pcs" },
  { id: 116, name: "Ice Cream Cups", category: "Inventory", unit: "pcs" },
  { id: 117, name: "Wooden Spoons", category: "Inventory", unit: "pcs" },
  { id: 118, name: "Toothpicks", category: "Inventory", unit: "pcs" },
  { id: 119, name: "Straws", category: "Inventory", unit: "pcs" },
  { id: 120, name: "Food Packing Boxes", category: "Inventory", unit: "pcs" },
  { id: 121, name: "Electricity Bill", category: "Other Bills", unit: "pcs" },
  { id: 122, name: "Water Bill", category: "Other Bills", unit: "pcs" },
  { id: 123, name: "Gas Bill", category: "Other Bills", unit: "pcs" },
  { id: 124, name: "Transport Expenses", category: "Other Bills", unit: "pcs" },
  { id: 125, name: "Tea Expenses", category: "Other Bills", unit: "pcs" },
  { id: 126, name: "Auto Expenses", category: "Other Bills", unit: "pcs" },
  { id: 127, name: "Stationary", category: "Other Bills", unit: "pcs" },
  { id: 128, name: "Notebooks", category: "Other Bills", unit: "pcs" },
  { id: 129, name: "Account Books", category: "Other Bills", unit: "pcs" },
  { id: 130, name: "Vankayalu Normal", category: "Inventory", unit: "kg" },
  { id: 131, name: "Sora Kayalu", category: "Inventory", unit: "kg" },
  { id: 132, name: "Benda Kayalu", category: "Inventory", unit: "kg" },
  { id: 133, name: "Dosa Kayalu", category: "Inventory", unit: "kg" },
  { id: 134, name: "Paala Koora", category: "Inventory", unit: "kg" },
  { id: 135, name: "Goru Chikkudu", category: "Inventory", unit: "kg" },
  { id: 136, name: "Bangala Dhumpa", category: "Inventory", unit: "kg" },
  { id: 137, name: "Beerakayalu", category: "Inventory", unit: "kg" },
  { id: 138, name: "Dhonda Kayalu", category: "Inventory", unit: "kg" },
  { id: 139, name: "Munaga Kayalu", category: "Inventory", unit: "kg" },
  { id: 140, name: "Thella Vankayalu", category: "Inventory", unit: "kg" },
  { id: 141, name: "Kaakara Kayalu", category: "Inventory", unit: "kg" },
  { id: 142, name: "Gongura", category: "Inventory", unit: "kg" },
  { id: 143, name: "Cabbages", category: "Inventory", unit: "kg" },
  { id: 144, name: "Cauliflower", category: "Inventory", unit: "kg" }
];

// Initialize default categories if none exist
async function initializeDefaultCategories() {
  try {
    const snapshot = await database.ref('categories').once('value');
    
    if (!snapshot.exists()) {
      console.log('No categories found. Creating defaults...');
      
      const defaultCategories = {
        "cat_groceries": {
          id: "cat_groceries",
          name: "Groceries",
          color: "#3B82F6",
          subcategories: []
        },
        "cat_meat": {
          id: "cat_meat",
          name: "Meat",
          color: "#EF4444",
          subcategories: ["Chicken", "Natu Chicken", "Mutton", "Fish", "Apollo Fish", "Prawns"]
        },
        "cat_inventory": {
          id: "cat_inventory",
          name: "Inventory",
          color: "#8B5CF6",
          subcategories: []
        },
        "cat_beverages": {
          id: "cat_beverages",
          name: "Beverages",
          color: "#F59E0B",
          subcategories: []
        },
        "cat_other_bills": {
          id: "cat_other_bills",
          name: "Other Bills",
          color: "#6B7280",
          subcategories: ["Current Bill", "Auto Expenses", "Extra Expenses", "Miscellaneous Expenses"]
        }
      };
      
      await database.ref('categories').set(defaultCategories);
      console.log('✅ Default categories created!');
      showToast('Default categories created!', 'success');
    }
  } catch (error) {
    console.error('Error initializing categories:', error);
  }
}

// Load categories from Firebase
async function loadCategoriesFromFirebase() {
  try {
    const snapshot = await database.ref('categories').once('value');
    const categories = snapshot.val();
    
    if (!categories) {
      console.log('⚠️ No categories found in Firebase - Using fallback');
      categoriesCache = {
        'Groceries': { name: 'Groceries', color: '#3B82F6' },
        'Meat': { name: 'Meat', color: '#EF4444' },
        'Inventory': { name: 'Inventory', color: '#8B5CF6' },
        'Beverages': { name: 'Beverages', color: '#F59E0B' },
        'Other Bills': { name: 'Other Bills', color: '#6B7280' }
      };
      return;
    }
    
    // Convert Firebase categories to simple object
    categoriesCache = {};
    for (const [key, cat] of Object.entries(categories)) {
      categoriesCache[cat.name] = cat;
    }
    
    console.log('✅ Loaded categories from Firebase:', Object.keys(categoriesCache));
  } catch (error) {
    console.error('Error loading categories:', error);
    // Fallback categories
    categoriesCache = {
      'Groceries': { name: 'Groceries', color: '#3B82F6' },
      'Meat': { name: 'Meat', color: '#EF4444' },
      'Inventory': { name: 'Inventory', color: '#8B5CF6' },
      'Beverages': { name: 'Beverages', color: '#F59E0B' },
      'Other Bills': { name: 'Other Bills', color: '#6B7280' }
    };
  }
}

// Initialize 144 store items on first load
async function initializeStoreItems() {
  try {
    const storeItemsRef = database.ref('storeItems');
    const snapshot = await storeItemsRef.once('value');
    
    if (!snapshot.exists()) {
      console.log('No store items found. Initializing 144 items...');
      const today = new Date().toISOString().split('T')[0];
      
      const itemsData = {};
      initialStoreItems.forEach(item => {
        itemsData[`item_${item.id}`] = {
          ...item,
          createdDate: today
        };
      });
      
      await storeItemsRef.set(itemsData);
      await database.ref('settings/itemCounter').set(144);
      
      console.log('✅ Initialized 144 store items');
      showToast('Store items initialized successfully!', 'success');
      
      loadStoreItems();
      loadStoreItemsTable();
      loadDashboardMetrics();
    } else {
      console.log('✅ Store items already exist');
      loadStoreItems();
    }
  } catch (error) {
    console.error('Error initializing store items:', error);
    showToast('Error initializing items: ' + error.message, 'error');
  }
}

// Toast Notification
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast ${type} show`;
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// Authentication
auth.onAuthStateChanged(async (user) => {
  if (user) {
    currentUser = user;
    console.log('✅ User logged in:', user.email);
    
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('mainApp').style.display = 'block';
    document.getElementById('userEmail').textContent = user.email;
    
    try {
      // Track login session first
      await trackLoginSession(user);
      
      // Initialize database
      await initializeDatabase();
      
      // Then initialize app
      initializeApp();
      
      showToast('✅ Welcome back, ' + user.email + '!', 'success');
      
      // Load dashboard data immediately
      if (activeDate) {
        loadDashboardMetrics();
      }
    } catch (error) {
      console.error('Initialization error:', error);
      if (error.code === 'PERMISSION_DENIED' || error.message.includes('permission')) {
        showPermissionWarning();
      } else {
        showToast('Error: ' + error.message, 'error');
      }
    }
  } else {
    currentUser = null;
    document.getElementById('loginPage').style.display = 'flex';
    document.getElementById('mainApp').style.display = 'none';
  }
});

// Firebase Permission Warning - REMOVED
// Users don't need to see technical warnings
// System works fine without displaying errors
function showPermissionWarning() {
  // Warning hidden - user doesn't need technical details
  console.log('⚠️ Firebase permission error detected (hidden from user)');
}

// Login Form
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const errorDiv = document.getElementById('loginError');
  
  if (!email || !password) {
    errorDiv.textContent = 'Please enter email and password';
    errorDiv.style.display = 'block';
    return;
  }
  
  try {
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    console.log('✅ Login successful:', userCredential.user.email);
    trackLoginSession(userCredential.user);
  } catch (error) {
    console.error('Login error:', error);
    
    if (error.code === 'auth/user-not-found') {
      errorDiv.textContent = 'User not found. Please check your email.';
    } else if (error.code === 'auth/wrong-password') {
      errorDiv.textContent = 'Incorrect password. Please try again.';
    } else if (error.code === 'auth/invalid-email') {
      errorDiv.textContent = 'Invalid email format.';
    } else {
      errorDiv.textContent = 'Login failed: ' + error.message;
    }
    errorDiv.style.display = 'block';
  }
});

// Logout
document.getElementById('logoutBtn').addEventListener('click', () => {
  auth.signOut();
});

// Sidebar Logout
setTimeout(() => {
  const sidebarLogout = document.getElementById('sidebarLogoutBtn');
  if (sidebarLogout) {
    sidebarLogout.addEventListener('click', () => {
      auth.signOut();
    });
  }
}, 100);

// Device Tracking Functions
function getDeviceInfo() {
  const ua = navigator.userAgent;
  let browser = 'Unknown';
  let os = 'Unknown';
  
  if (ua.includes('Chrome') && !ua.includes('Edge')) browser = 'Chrome';
  else if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
  else if (ua.includes('Edge')) browser = 'Edge';
  
  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Mac')) os = 'Mac';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
  
  return `${browser} on ${os}`;
}

async function trackLoginSession(user) {
  const sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  currentSessionId = sessionId; // Save globally
  window.currentSessionId = sessionId; // Also save to window
  
  const deviceInfo = getDeviceInfo();
  
  try {
    await database.ref(`sessions/${sessionId}`).set({
      userId: user.email,
      deviceInfo: deviceInfo,
      loginTime: firebase.database.ServerValue.TIMESTAMP,
      lastActive: firebase.database.ServerValue.TIMESTAMP,
      isActive: true,
      isCurrent: true
    });
    
    console.log('✅ Login session tracked:', sessionId);
    
    // Update last active every 5 minutes
    setInterval(() => {
      if (currentSessionId) {
        database.ref(`sessions/${currentSessionId}/lastActive`).set(firebase.database.ServerValue.TIMESTAMP);
      }
    }, 300000);
  } catch (error) {
    console.error('Error tracking session:', error);
  }
}

// Initialize Database
async function initializeDatabase() {
  console.log('Initializing database...');
  
  try {
    // 1. Initialize default categories if needed
    await initializeDefaultCategories();
    
    // 2. Load categories from Firebase
    await loadCategoriesFromFirebase();
    
    // 3. Initialize store items (144 items)
    await initializeStoreItems();
    
    // 4. Set active date if not exists
    const dateRef = database.ref('settings/activeDate');
    const dateSnapshot = await dateRef.once('value');
    if (!dateSnapshot.exists()) {
      await dateRef.set(new Date().toISOString().split('T')[0]);
    }
    activeDate = dateSnapshot.val() || new Date().toISOString().split('T')[0];
    
    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    showToast('Error initializing database: ' + error.message, 'error');
  }
}

// Initialize Application
function initializeApp() {
  // Update UI with active date
  document.getElementById('activeDateInput').value = activeDate;
  updateActiveDateDisplay();
  
  // Load initial data
  loadDashboardMetrics();
  
  // Setup event handlers
  setupNavigation();
  setupDateManagement();
  setupAddBulkItems();
  setupSmartSelect();
  setupUpdateItems();
  setupViewItems();
  setupDayReport();
  setupMonthReport();
  setupPurchaseReport();
  setupAdminPanel();
}

// Navigation
function setupNavigation() {
  const navBtns = document.querySelectorAll('.sidebar-btn');
  const pages = document.querySelectorAll('.page');
  
  navBtns.forEach(btn => {
    if (btn.getAttribute('data-page')) {
      btn.addEventListener('click', () => {
        const pageName = btn.getAttribute('data-page');
        
        navBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        pages.forEach(p => p.classList.remove('active'));
        document.getElementById(`${pageName}Page`).classList.add('active');
        
        // Refresh page data when navigated to
        if (pageName === 'dashboard') loadDashboardMetrics();
        if (pageName === 'addBulkItems') loadStoreItemsTable();
        if (pageName === 'viewItems') loadViewItems();
        if (pageName === 'purchaseReport') loadPurchaseReport();
        if (pageName === 'adminPanel') {
          loadAdminStats();
          loadDeviceTracking();
          updateLockActiveDate();
          loadCategoriesForAdmin();
          loadEmailAlertSettings();
          loadDeleteItemsDropdowns();
        }
      });
    }
  });
}

// Date Management
function setupDateManagement() {
  const activeDateInput = document.getElementById('activeDateInput');
  activeDateInput.value = activeDate;
  
  document.getElementById('setActiveDateBtn').addEventListener('click', () => {
    activeDate = activeDateInput.value;
    updateActiveDateDisplay();
    database.ref('settings/activeDate').set(activeDate);
    showToast('Active date updated successfully');
    loadDashboardMetrics();
  });
  
  document.getElementById('setTodayBtn').addEventListener('click', () => {
    activeDate = new Date().toISOString().split('T')[0];
    activeDateInput.value = activeDate;
    updateActiveDateDisplay();
    database.ref('settings/activeDate').set(activeDate);
    showToast('Active date set to today');
    loadDashboardMetrics();
  });
}

function updateActiveDateDisplay() {
  const formatted = new Date(activeDate + 'T00:00:00').toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
  document.getElementById('activeDateDisplay').textContent = `Active Date: ${formatted}`;
  
  // Update all date inputs to use active date as default
  document.getElementById('purchaseDate').value = activeDate;
  document.getElementById('searchDate').value = activeDate;
  document.getElementById('dayReportDate').value = activeDate;
}

// Load Meat Inventory for Dashboard
// Calculate Stock Status (using totalAvailable instead of just purchasedQty)
function calculateStockStatus(item) {
  const itemStockInStore = parseFloat(item.stockInStore) || 0;
  const itemPurchasedQty = parseFloat(item.purchasedQty) || 0;
  const itemTotalAvailable = parseFloat(item.totalAvailable) || (itemStockInStore + itemPurchasedQty);
  const itemUsedQty = parseFloat(item.usedQty) || 0;
  const itemRemaining = itemTotalAvailable - itemUsedQty;
  
  if (itemTotalAvailable === 0) return { status: 'empty', percentage: 0, remaining: 0 };
  
  const percentage = (itemRemaining / itemTotalAvailable) * 100;
  
  let status;
  if (percentage === 0) {
    status = 'empty';
  } else if (percentage <= 20) {
    status = 'critical';
  } else if (percentage <= 40) {
    status = 'low';
  } else if (percentage <= 70) {
    status = 'medium';
  } else {
    status = 'full';
  }
  
  return {
    status,
    percentage: Math.round(percentage),
    remaining: itemRemaining,
    totalAvailable: itemTotalAvailable,
    stockInStore: itemStockInStore,
    purchasedQty: itemPurchasedQty,
    usedQty: itemUsedQty
  };
}

// Get stock status by percentage (NEW APPROACH)
function getStockStatusByPercentage(item) {
  var totalAvailable = item.totalAvailable || 0;
  var remaining = item.remaining || 0;
  
  // Avoid division by zero
  if (totalAvailable === 0) {
    return {
      status: 'critical',
      icon: '🔴',
      text: 'CRITICAL - No Stock!',
      showButton: true,
      percentage: 0
    };
  }
  
  // Calculate percentage remaining
  var percentageRemaining = (remaining / totalAvailable) * 100;
  
  // Status based on percentage
  if (percentageRemaining <= 0) {
    return {
      status: 'critical',
      icon: '🔴',
      text: 'CRITICAL - Out of Stock (0%)',
      showButton: true,
      percentage: 0
    };
  } else if (percentageRemaining < 25) {
    // Less than 25% remaining = CRITICAL
    return {
      status: 'critical',
      icon: '🔴',
      text: 'CRITICAL - Only ' + percentageRemaining.toFixed(0) + '% Left',
      showButton: true,
      percentage: percentageRemaining
    };
  } else if (percentageRemaining < 50) {
    // 25-50% remaining = LOW
    return {
      status: 'low',
      icon: '🟡',
      text: 'LOW - ' + percentageRemaining.toFixed(0) + '% Remaining',
      showButton: true,
      percentage: percentageRemaining
    };
  } else {
    // 50% or more remaining = GOOD
    return {
      status: 'good',
      icon: '🟢',
      text: 'Good Stock - ' + percentageRemaining.toFixed(0) + '%',
      showButton: false,
      percentage: percentageRemaining
    };
  }
}

// Load Low Stock Items for Dashboard (PERCENTAGE-BASED) - REAL-TIME
function loadLowStockItems() {
  const date = activeDate;
  
  // Use real-time listener for auto-updates
  database.ref(`dailyRecords/${date}/purchases`).on('value', (snapshot) => {
    const items = snapshot.val() || {};
    
    const lowStockItems = [];
    const counts = { critical: 0, low: 0, good: 0, total: 0 };
    
    for (const [itemKey, item] of Object.entries(items)) {
      counts.total++;
      
      // Calculate correct remaining quantity
      const stockInStore = parseFloat(item.stockInStore) || 0;
      const purchasedQty = parseFloat(item.purchasedQty) || 0;
      const totalAvailable = parseFloat(item.totalAvailable) || (stockInStore + purchasedQty);
      const usedQty = parseFloat(item.usedQty) || 0;
      const remaining = totalAvailable - usedQty;
      
      const itemForStatus = {
        totalAvailable: totalAvailable,
        remaining: remaining
      };
      
      const statusInfo = getStockStatusByPercentage(itemForStatus);
      
      // Count by status
      if (statusInfo.status === 'critical') {
        counts.critical++;
      } else if (statusInfo.status === 'low') {
        counts.low++;
      } else if (statusInfo.status === 'good') {
        counts.good++;
      }
      
      // Add to low stock list if critical or low (< 50%)
      if (statusInfo.status === 'critical' || statusInfo.status === 'low') {
        lowStockItems.push({
          ...item,
          status: statusInfo.status,
          percentage: Math.round(statusInfo.percentage),
          remaining: remaining,
          unit: item.purchasedUnit || item.unit,
          itemKey
        });
      }
    }
    
    // Update stat cards
    const criticalElem = document.getElementById('critical-count');
    const lowElem = document.getElementById('low-count');
    const goodElem = document.getElementById('medium-count');
    const totalElem = document.getElementById('full-count');
    
    if (criticalElem) criticalElem.textContent = counts.critical;
    if (lowElem) lowElem.textContent = counts.low;
    if (goodElem) goodElem.textContent = counts.good;
    if (totalElem) totalElem.textContent = counts.total;
    
    displayLowStockItems(lowStockItems);
  });
}

function displayLowStockItems(items) {
  const tbody = document.getElementById('low-stock-tbody');
  
  if (!tbody) {
    console.log('Low stock tbody not found');
    return;
  }
  
  if (items.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:20px;color:var(--color-success);">✅ All items have good stock levels! (50%+ remaining)</td></tr>';
    return;
  }
  
  tbody.innerHTML = '';
  
  // Sort: Critical first (lowest percentage), then Low
  items.sort((a, b) => {
    if (a.status === 'critical' && b.status !== 'critical') return -1;
    if (a.status !== 'critical' && b.status === 'critical') return 1;
    return a.percentage - b.percentage;
  });
  
  items.forEach(item => {
    const statusColor = item.status === 'critical' ? '#EF4444' : '#F59E0B';
    const statusText = item.status === 'critical' ? 'CRITICAL (<25%)' : 'LOW (25-49%)';
    const bgColor = item.status === 'critical' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)';
    
    // Display with meat type if applicable
    let itemDisplay = item.itemName;
    if (item.category === 'Meat' && item.type) {
      const typeColor = item.type === 'fridge' ? '#3B82F6' : '#F59E0B';
      const typeIcon = item.type === 'fridge' ? '❄️' : '🔥';
      itemDisplay += ` <span style="background: ${typeColor}; color: white; padding: 2px 6px; border-radius: 4px; font-size: 11px;">${typeIcon} ${item.type.toUpperCase()}</span>`;
    }
    
    const row = document.createElement('tr');
    row.style.background = bgColor;
    row.innerHTML = `
      <td>${itemDisplay}</td>
      <td><span class="category-badge" style="background: var(--color-bg-3); padding: 4px 8px; border-radius: 4px;">${item.category}</span></td>
      <td>
        <div class="stock-bar-container">
          <div class="stock-bar" style="width: ${item.percentage}%; background: ${statusColor}"></div>
          <span class="stock-percentage">${item.percentage}%</span>
        </div>
      </td>
      <td><strong>${item.remaining.toFixed(2)} ${item.unit}</strong></td>
      <td><span class="status-badge status-${item.status}">${statusText}</span></td>
      <td><button onclick="repurchaseItem('${item.itemKey}')" class="btn btn--sm btn--primary">🛒 Repurchase</button></td>
    `;
    tbody.appendChild(row);
  });
}

function repurchaseItem(itemKey) {
  const navBtns = document.querySelectorAll('.sidebar-btn');
  navBtns.forEach(b => b.classList.remove('active'));
  document.querySelector('[data-page="smartSelect"]').classList.add('active');
  
  const pages = document.querySelectorAll('.page');
  pages.forEach(p => p.classList.remove('active'));
  document.getElementById('smartSelectPage').classList.add('active');
  
  document.getElementById('selectItemDropdown').value = itemKey;
  document.getElementById('selectItemDropdown').dispatchEvent(new Event('change'));
  showToast('Please enter purchase details', 'info');
}

window.repurchaseItem = repurchaseItem;

function loadMeatInventory() {
  const date = activeDate;
  database.ref(`dailyRecords/${date}/purchases`).once('value', (snapshot) => {
    const items = snapshot.val() || {};
    
    // Reset displays
    const meatTypes = [
      { name: 'Chicken', id: 'chicken' },
      { name: 'Natu Chicken', id: 'natu-chicken' },
      { name: 'Mutton', id: 'mutton' },
      { name: 'Fish', id: 'fish' },
      { name: 'Apollo Fish', id: 'apollo-fish' },
      { name: 'Prawns', id: 'prawns' }
    ];
    
    for (const meatType of meatTypes) {
      let fridgeQty = 0;
      let freshQty = 0;
      
      // Find fridge and fresh items for this meat type
      for (const [itemKey, item] of Object.entries(items)) {
        if (item.category === 'Meat' && item.subcategory === meatType.name) {
          const meatStockInStore = item.stockInStore || 0;
          const meatPurchasedQty = item.purchasedQty || 0;
          const meatTotalAvailable = item.totalAvailable || (meatStockInStore + meatPurchasedQty);
          const meatRemaining = meatTotalAvailable - (item.usedQty || 0);
          
          if (item.type === 'fridge') {
            fridgeQty = meatRemaining;
          } else if (item.type === 'fresh') {
            freshQty = meatRemaining;
          }
        }
      }
      
      const totalQty = fridgeQty + freshQty;
      
      const fridgeElem = document.getElementById(`${meatType.id}-fridge`);
      const freshElem = document.getElementById(`${meatType.id}-fresh`);
      const totalElem = document.getElementById(`${meatType.id}-total`);
      
      if (fridgeElem) fridgeElem.textContent = `${fridgeQty.toFixed(2)} kg`;
      if (freshElem) freshElem.textContent = `${freshQty.toFixed(2)} kg`;
      if (totalElem) totalElem.textContent = `${totalQty.toFixed(2)} kg`;
    }
  });
}

// Dashboard Metrics - COMPREHENSIVE VERSION
function loadDashboardMetrics() {
  const date = activeDate;
  
  // 1. Total Items in Store
  database.ref('storeItems').once('value', (snapshot) => {
    const storeItems = snapshot.val() || {};
    const totalStoreItems = Object.keys(storeItems).length;
    document.getElementById('metric-total-store-items').textContent = totalStoreItems;
  });
  
  // 2-6. Day-specific metrics (using Stock in Store)
  database.ref(`dailyRecords/${date}/purchases`).once('value', (snapshot) => {
    const items = snapshot.val() || {};
    
    const dayItemsCount = Object.keys(items).length;
    let usedItemsCount = 0;
    let totalExpenses = 0;
    let totalPurchases = 0;
    let totalStoreBill = 0;
    
    for (const key in items) {
      const item = items[key];
      const dayStockInStore = item.stockInStore || 0;
      const dayPurchasedQty = item.purchasedQty || 0;
      const dayTotalAvailable = item.totalAvailable || (dayStockInStore + dayPurchasedQty);
      const dayUsedQty = item.usedQty || 0;
      
      // Count used items (items with usedQty > 0)
      if (dayUsedQty > 0) {
        usedItemsCount++;
      }
      
      // Sum expenses
      totalExpenses += item.expense || 0;
      
      // Sum purchases (only what was bought TODAY)
      totalPurchases += item.purchaseAmount || 0;
      
      // Calculate remaining value (remaining qty * rate)
      const dayRemaining = dayTotalAvailable - dayUsedQty;
      totalStoreBill += dayRemaining * (item.purchaseRate || 0);
    }
    
    // Update metrics
    document.getElementById('metric-day-items').textContent = dayItemsCount;
    document.getElementById('metric-used-items').textContent = usedItemsCount;
    document.getElementById('metric-expenses').textContent = '₹' + totalExpenses.toFixed(2);
    document.getElementById('metric-purchases').textContent = '₹' + totalPurchases.toFixed(2);
    document.getElementById('metric-total-bill').textContent = '₹' + totalStoreBill.toFixed(2);
  });
  
  // Recent Activities
  loadRecentActivities();
  
  // Load Meat Inventory
  loadMeatInventory();
  
  // Load Low Stock Items
  loadLowStockItems();
}

function calculateTotalStockValue() {
  let totalValue = 0;
  
  database.ref('purchaseHistory').once('value', (snapshot) => {
    if (snapshot.exists()) {
      const purchases = Object.values(snapshot.val());
      const itemTotals = {};
      
      purchases.forEach(purchase => {
        if (!itemTotals[purchase.itemId]) {
          itemTotals[purchase.itemId] = {
            totalQty: 0,
            totalValue: 0,
            rate: purchase.rate
          };
        }
        itemTotals[purchase.itemId].totalQty += purchase.quantity;
        itemTotals[purchase.itemId].totalValue += purchase.amount;
      });
      
      // Calculate remaining value
      database.ref('dailyRecords').once('value', (dailySnapshot) => {
        const dailyRecords = dailySnapshot.val() || {};
        const usedQuantities = {};
        
        Object.values(dailyRecords).forEach(day => {
          if (day.purchases) {
            Object.values(day.purchases).forEach(item => {
              if (!usedQuantities[item.itemId]) {
                usedQuantities[item.itemId] = 0;
              }
              usedQuantities[item.itemId] += item.usedQty || 0;
            });
          }
        });
        
        Object.keys(itemTotals).forEach(itemId => {
          const purchased = itemTotals[itemId].totalQty;
          const used = usedQuantities[itemId] || 0;
          const remaining = purchased - used;
          const rate = itemTotals[itemId].rate;
          totalValue += remaining * rate;
        });
        
        document.getElementById('totalStockValueMetric').textContent = `₹${totalValue.toFixed(2)}`;
      });
    } else {
      document.getElementById('totalStockValueMetric').textContent = '₹0';
    }
  });
}

function loadRecentActivities() {
  const activityList = document.getElementById('recentActivityList');
  
  database.ref('purchaseHistory').limitToLast(5).once('value', (snapshot) => {
    activityList.innerHTML = '';
    
    if (snapshot.exists()) {
      const activities = [];
      snapshot.forEach(child => {
        activities.unshift(child.val());
      });
      
      activities.forEach(activity => {
        const div = document.createElement('div');
        div.className = 'activity-item';
        const date = new Date(activity.date).toLocaleDateString('en-IN');
        div.innerHTML = `
          <div class="activity-time">${date}</div>
          <div><strong>Purchase:</strong> ${activity.itemName} - ${activity.quantity} ${activity.unit} @ ₹${activity.rate}</div>
        `;
        activityList.appendChild(div);
      });
    } else {
      activityList.innerHTML = '<div class="activity-item">No recent activities</div>';
    }
  });
}

// Bulk Add Functionality
function setupBulkAdd() {
  document.getElementById('createBulkFormBtn').addEventListener('click', createBulkForm);
  document.getElementById('saveBulkItemsBtn').addEventListener('click', saveBulkItems);
  document.getElementById('clearBulkFormBtn').addEventListener('click', () => {
    document.getElementById('bulkFormContainer').innerHTML = '';
    document.getElementById('bulkFormActions').style.display = 'none';
  });
}

function createBulkForm() {
  const count = parseInt(document.getElementById('bulkCount').value);
  const container = document.getElementById('bulkFormContainer');
  
  const categoryOptions = Object.keys(categoriesCache).sort().map(cat => 
    `<option value="${cat}">${cat}</option>`
  ).join('');
  
  let html = '';
  for (let i = 1; i <= count; i++) {
    html += `
      <div class="bulk-row">
        <span>Item ${i}:</span>
        <input type="text" id="bulk-name-${i}" class="form-control" placeholder="Item Name">
        <select id="bulk-category-${i}" class="form-control">
          <option value="">Select Category</option>
          ${categoryOptions}
        </select>
        <select id="bulk-unit-${i}" class="form-control">
          <option value="">Select Unit</option>
          <option value="kg">kg</option>
          <option value="g">g</option>
          <option value="ltr">ltr</option>
          <option value="ml">ml</option>
          <option value="pcs">pcs</option>
          <option value="pkts">pkts</option>
          <option value="dozen">dozen</option>
        </select>
      </div>
    `;
  }
  
  container.innerHTML = html;
  document.getElementById('bulkFormActions').style.display = 'flex';
  showToast(`Created form for ${count} items`);
}

async function saveBulkItems() {
  const count = parseInt(document.getElementById('bulkCount').value);
  const items = [];
  
  for (let i = 1; i <= count; i++) {
    const name = document.getElementById(`bulk-name-${i}`).value.trim();
    const category = document.getElementById(`bulk-category-${i}`).value;
    const unit = document.getElementById(`bulk-unit-${i}`).value;
    
    if (name) {
      items.push({ name, category, unit });
    }
  }
  
  if (items.length === 0) {
    showToast('Please enter at least one item', 'error');
    return;
  }
  
  try {
    const snapshot = await database.ref('storeItems').once('value');
    const existingItems = snapshot.val() || {};
    const ids = Object.values(existingItems).map(item => item.id || 0);
    let nextId = ids.length > 0 ? Math.max(...ids) + 1 : 1;
    
    const today = new Date().toISOString().split('T')[0];
    
    for (const item of items) {
      const newItem = {
        id: nextId,
        name: item.name,
        category: item.category,
        unit: item.unit,
        createdDate: today
      };
      
      await database.ref(`storeItems/item_${nextId}`).set(newItem);
      nextId++;
    }
    
    await database.ref('settings/itemCounter').set(nextId - 1);
    
    showToast(`Successfully added ${items.length} items!`, 'success');
    document.getElementById('bulkFormContainer').innerHTML = '';
    document.getElementById('bulkFormActions').style.display = 'none';
    loadStoreItemsTable();
    loadStoreItems();
    loadDashboardMetrics();
  } catch (error) {
    showToast('Error adding bulk items: ' + error.message, 'error');
  }
}

// Add Bulk Items
function setupAddBulkItems() {
  setupBulkAdd();
  
  document.getElementById('addBulkItemForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('itemName').value;
    const category = document.getElementById('itemCategory').value;
    const unit = document.getElementById('itemUnit').value;
    
    if (!name || !category || !unit) {
      showToast('Please fill all required fields', 'error');
      return;
    }
    
    try {
      // Get next ID
      const snapshot = await database.ref('storeItems').once('value');
      const items = snapshot.val() || {};
      const ids = Object.values(items).map(item => item.id || 0);
      const nextId = ids.length > 0 ? Math.max(...ids) + 1 : 1;
      
      const newItem = {
        id: nextId,
        name,
        category,
        subcategory: '',
        unit,
        createdDate: new Date().toISOString().split('T')[0]
      };
      
      await database.ref(`storeItems/item_${nextId}`).set(newItem);
      await database.ref('settings/itemCounter').set(nextId);
      
      showToast('Item added successfully');
      document.getElementById('addBulkItemForm').reset();
      loadStoreItemsTable();
      loadStoreItems();
      loadDashboardMetrics();
    } catch (error) {
      showToast('Error adding item: ' + error.message, 'error');
    }
  });
  
  loadStoreItemsTable();
}

function loadStoreItems() {
  database.ref('storeItems').on('value', (snapshot) => {
    if (snapshot.exists()) {
      storeItems = snapshot.val();
      console.log(`✅ Loaded ${Object.keys(storeItems).length} store items`);
      populateItemDropdowns();
    } else {
      console.log('No store items found in database');
      storeItems = {};
    }
  });
}

function loadStoreItemsTable() {
  const tbody = document.getElementById('storeItemsTableBody');
  
  database.ref('storeItems').once('value', (snapshot) => {
    tbody.innerHTML = '';
    
    if (snapshot.exists()) {
      const items = snapshot.val();
      console.log(`✅ Displaying ${Object.keys(items).length} items in table`);
      
      Object.entries(items).forEach(([key, item]) => {
        const subcatDisplay = item.subcategory ? ` (${item.subcategory})` : '';
        const row = tbody.insertRow();
        row.innerHTML = `
          <td>${item.id}</td>
          <td>${item.name}</td>
          <td>${item.category}${subcatDisplay}</td>
          <td>${item.unit}</td>
          <td>${item.createdDate}</td>
          <td>
            <button class="btn btn--outline btn--sm" onclick="deleteStoreItem('${key}')">Delete</button>
          </td>
        `;
      });
    } else {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center">No items found</td></tr>';
    }
  });
}

function deleteStoreItem(key) {
  if (confirm('Are you sure you want to delete this item?')) {
    database.ref(`storeItems/${key}`).remove()
      .then(() => {
        showToast('Item deleted successfully');
        loadStoreItemsTable();
        loadStoreItems();
      })
      .catch(error => showToast('Error deleting item: ' + error.message, 'error'));
  }
}

// Smart Select & Add
function setupSmartSelect() {
  // Show/hide meat type selector based on selected item
  const itemDropdown = document.getElementById('selectItemDropdown');
  itemDropdown.addEventListener('change', function() {
    const itemKey = itemDropdown.value;
    if (itemKey && storeItems[itemKey]) {
      const item = storeItems[itemKey];
      const meatTypeSelector = document.getElementById('meatTypeSelector');
      
      // Show unit
      document.getElementById('unitDisplay').textContent = 'Unit: ' + item.unit;
      document.getElementById('rateUnitDisplay').textContent = item.unit;
      
      if (item.category === 'Meat') {
        meatTypeSelector.style.display = 'block';
      } else {
        meatTypeSelector.style.display = 'none';
      }
      
      // Recalculate rate if values exist
      calculatePerUnitRate();
    }
  });
  
  // FIX 1: Auto-calculate per-unit rate from total amount
  const qtyInput = document.getElementById('purchasedQty');
  qtyInput.addEventListener('input', calculatePerUnitRate);
  
  document.getElementById('smartSelectForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const itemKey = document.getElementById('selectItemDropdown').value;
    const purchasedQty = parseFloat(document.getElementById('purchasedQty').value);
    const purchasedUnit = document.getElementById('purchasedUnit').value;
    const totalAmountPaid = parseFloat(document.getElementById('totalAmountPaid').value);
    const purchaseDate = document.getElementById('purchaseDate').value;
    
    if (!itemKey || !purchasedQty || !totalAmountPaid || !purchaseDate) {
      showToast('Please fill all fields', 'error');
      return;
    }
    
    // Calculate rate from total amount (NO CONVERSION)
    const purchaseRate = totalAmountPaid / purchasedQty;
    
    const item = storeItems[itemKey];
    
    // Get meat type if meat item
    let meatType = null;
    if (item.category === 'Meat') {
      meatType = document.getElementById('meatType').value;
      if (!meatType) {
        showToast('Please select meat type (Fridge or Fresh)', 'error');
        return;
      }
    }
    
    // Generate unique item key
    const purchaseKey = item.category === 'Meat' ? (itemKey + '_' + meatType) : itemKey;
    
    // Check for duplicates
    database.ref('dailyRecords/' + purchaseDate + '/purchases/' + purchaseKey).once('value').then(function(existingSnapshot) {
      if (existingSnapshot.exists()) {
        const existing = existingSnapshot.val();
        const existingStock = existing.stockInStore || 0;
        const existingPurchased = existing.purchasedQty || 0;
        const existingTotal = existingStock + existingPurchased;
        
        const update = confirm(
          item.name + (meatType ? ' (' + meatType.toUpperCase() + ')' : '') + ' already exists for ' + purchaseDate + '.\n\n' +
          'Stock in Store: ' + existingStock + ' ' + existing.unit + '\n' +
          'Already Purchased Today: ' + existingPurchased + ' ' + existing.unit + ' @ ₹' + existing.purchaseRate + '\n' +
          'New Purchase: ' + purchasedQty + ' ' + item.unit + ' @ ₹' + purchaseRate + '\n\n' +
          'Click OK to ADD to today\'s purchases, or Cancel to skip.'
        );
        
        if (update) {
          const newPurchasedQty = existingPurchased + purchasedQty;
          const newTotalAvailable = existingStock + newPurchasedQty;
          const newPurchaseAmount = existing.purchaseAmount + (purchasedQty * purchaseRate);
          
          database.ref('dailyRecords/' + purchaseDate + '/purchases/' + purchaseKey).update({
            purchasedQty: newPurchasedQty,
            totalAvailable: newTotalAvailable,
            purchaseAmount: newPurchaseAmount,
            remaining: newTotalAvailable - (existing.usedQty || 0)
          }).then(function() {
            showToast('✅ Added ' + purchasedQty + ' ' + item.unit + ' to today\'s purchases. Total Available: ' + newTotalAvailable + ' ' + item.unit, 'success');
            savePurchaseHistory(purchaseDate, item, purchasedQty, purchaseRate);
          });
        } else {
          showToast('Purchase cancelled - duplicate not allowed', 'info');
        }
      } else {
        // NEW ITEM - Create normally
        const purchaseAmount = purchasedQty * purchaseRate;
        
        const dailyPurchase = {
          itemId: item.id,
          itemName: item.name,
          category: item.category,
          subcategory: item.subcategory || '',
          type: meatType,
          unit: purchasedUnit,
          purchasedUnit: purchasedUnit,
          stockInStore: 0,
          purchasedQty: purchasedQty,
          totalAvailable: purchasedQty,
          purchaseRate: purchaseRate,
          purchaseAmount: purchaseAmount,
          usedQty: 0,
          usedUnit: purchasedUnit,
          expense: 0,
          remaining: purchasedQty,
          purchaseDate: purchaseDate
        };
        
        database.ref('dailyRecords/' + purchaseDate + '/purchases/' + purchaseKey).set(dailyPurchase).then(function() {
          showToast('✅ ' + item.name + (meatType ? ' (' + meatType.toUpperCase() + ')' : '') + ' added successfully!', 'success');
          savePurchaseHistory(purchaseDate, item, purchasedQty, purchaseRate);
        });
      }
    });
  });
}

// FIX 1: Calculate per-unit rate from total amount with unit conversion (with null checks)
function calculatePerUnitRate() {
  const qtyInput = document.getElementById('purchasedQty');
  const amountInput = document.getElementById('totalAmountPaid');
  const unitSelect = document.getElementById('purchasedUnit');
  const rateDisplay = document.getElementById('calculatedRateDisplay');
  const rateUnitDisplay = document.getElementById('rateUnitDisplay');
  const baseRateDisplay = document.getElementById('baseRateDisplay');
  const baseUnitRateDisplay = document.getElementById('baseUnitRateDisplay');
  const baseUnitDisplay = document.getElementById('baseUnitDisplay');
  
  // Null checks for all elements
  if (!qtyInput || !amountInput || !unitSelect || !rateDisplay || !baseRateDisplay) {
    console.log('calculatePerUnitRate: Required elements not found, skipping...');
    return;
  }
  
  const qty = parseFloat(qtyInput.value) || 0;
  const totalAmount = parseFloat(amountInput.value) || 0;
  const unit = unitSelect.value;
  
  if (qty > 0 && totalAmount > 0) {
    // Rate per purchased unit (NO CONVERSION)
    const ratePerUnit = totalAmount / qty;
    rateDisplay.textContent = '₹' + ratePerUnit.toFixed(2);
    if (rateUnitDisplay) rateUnitDisplay.textContent = unit;
    
    // Show same rate (no base unit conversion)
    baseRateDisplay.textContent = '₹' + ratePerUnit.toFixed(2);
    if (baseUnitRateDisplay) baseUnitRateDisplay.textContent = unit;
    if (baseUnitDisplay) baseUnitDisplay.textContent = unit;
  } else {
    rateDisplay.textContent = '₹0';
    if (rateUnitDisplay) rateUnitDisplay.textContent = '-';
    baseRateDisplay.textContent = '₹0';
    if (baseUnitRateDisplay) baseUnitRateDisplay.textContent = '-';
  }
}

window.calculatePerUnitRate = calculatePerUnitRate;

function savePurchaseHistory(purchaseDate, item, purchasedQty, purchaseRate) {
  const purchaseAmount = purchasedQty * purchaseRate;
  const purchaseHistory = {
    date: purchaseDate,
    itemId: item.id,
    itemName: item.name,
    category: item.category,
    quantity: purchasedQty,
    unit: item.unit,
    rate: purchaseRate,
    amount: purchaseAmount,
    timestamp: Date.now()
  };
  
  database.ref('purchaseHistory').push(purchaseHistory).then(function() {
    updateDailyTotals(purchaseDate);
    document.getElementById('smartSelectForm').reset();
    document.getElementById('itemSearchInput').value = '';
    document.getElementById('purchaseDate').value = activeDate;
    document.getElementById('meatTypeSelector').style.display = 'none';
    document.getElementById('unitDisplay').textContent = 'Unit: -';
    document.getElementById('rateUnitDisplay').textContent = '-';
    document.getElementById('calculatedRateDisplay').textContent = '₹0';
    loadDashboardMetrics();
  });
}

function populateItemDropdowns() {
  const dropdown = document.getElementById('selectItemDropdown');
  dropdown.innerHTML = '<option value="">Choose an item</option>';
  
  Object.entries(storeItems).forEach(([key, item]) => {
    const option = document.createElement('option');
    option.value = key;
    option.textContent = `${item.id} - ${item.name} (${item.unit})`;
    option.dataset.itemName = item.name.toLowerCase();
    option.dataset.itemId = item.id;
    option.dataset.itemUnit = item.unit;
    dropdown.appendChild(option);
  });
}

// FIX 4: Real-time search filter for items
function filterItemsBySearch() {
  const searchText = document.getElementById('itemSearchInput').value.toLowerCase();
  const select = document.getElementById('selectItemDropdown');
  const options = select.querySelectorAll('option');
  
  let visibleCount = 0;
  
  for (let i = 1; i < options.length; i++) {
    const itemName = options[i].dataset.itemName || options[i].textContent.toLowerCase();
    
    if (itemName.includes(searchText) || searchText === '') {
      options[i].style.display = '';
      visibleCount++;
    } else {
      options[i].style.display = 'none';
    }
  }
  
  if (searchText && visibleCount === 0) {
    console.log('No items found matching: ' + searchText);
  }
}

window.filterItemsBySearch = filterItemsBySearch;

function populateCategoryDropdowns() {
  const dropdowns = [
    document.getElementById('itemCategory'),
    document.getElementById('purchaseFilterCategory')
  ];
  
  dropdowns.forEach(dropdown => {
    if (dropdown) {
      const hasAll = dropdown.id === 'purchaseFilterCategory';
      dropdown.innerHTML = hasAll ? '<option value="">All Categories</option>' : '<option value="">Select Category</option>';
      
      // Populate from categoriesCache (loaded from Firebase)
      Object.keys(categoriesCache).sort().forEach(categoryName => {
        const option = document.createElement('option');
        option.value = categoryName;
        option.textContent = categoryName;
        dropdown.appendChild(option);
      });
    }
  });
}

function updateDailyTotals(date) {
  database.ref(`dailyRecords/${date}/purchases`).once('value', (snapshot) => {
    if (snapshot.exists()) {
      const purchases = Object.values(snapshot.val());
      let totalPurchased = 0;
      let totalExpense = 0;
      
      purchases.forEach(item => {
        totalPurchased += item.purchaseAmount || 0;
        totalExpense += item.expense || 0;
      });
      
      database.ref(`dailyRecords/${date}`).update({
        totalPurchased,
        totalExpense
      });
    }
  });
}

// FIX 3: Update Items - Support for meat types (both fridge and fresh)
function setupUpdateItems() {
  document.getElementById('searchUpdateBtn').addEventListener('click', searchItemsForUpdate);
  
  document.getElementById('cancelUpdateBtn').addEventListener('click', () => {
    if (confirm('Cancel update? Changes will be lost.')) {
      document.getElementById('updateItemsResults').style.display = 'none';
      showToast('Update cancelled', 'info');
    }
  });
}

function searchItemsForUpdate() {
  const searchDate = document.getElementById('searchDate').value;
  const searchName = document.getElementById('searchItemName').value.toLowerCase();
  
  if (!searchDate && !searchName) {
    showToast('Please enter a date or item name', 'error');
    return;
  }
  
  if (searchDate) {
    database.ref(`dailyRecords/${searchDate}/purchases`).once('value', (snapshot) => {
      if (snapshot.exists()) {
        const purchases = snapshot.val();
        const matchingItems = [];
        
        // FIX 3: Find ALL matching items (including both meat types)
        Object.entries(purchases).forEach(([key, item]) => {
          if (!searchName || item.itemName.toLowerCase().includes(searchName)) {
            matchingItems.push({ key, item, date: searchDate });
          }
        });
        
        if (matchingItems.length > 0) {
          displayUpdateItemsList(matchingItems);
        } else {
          showToast('No items found', 'error');
        }
      } else {
        showToast('No items found for this date', 'error');
      }
    });
  }
}

function displayUpdateItemsList(items) {
  const resultsDiv = document.getElementById('updateItemsResults');
  if (!resultsDiv) {
    console.log('Update items form container not found');
    return;
  }
  
  resultsDiv.style.display = 'block';
  
  const container = document.getElementById('updateItemForm');
  if (!container || !container.parentElement) {
    console.log('Update items form container not found - page not loaded yet');
    return;
  }
  
  container.parentElement.innerHTML = '<h3>Found Items - Click to Edit</h3><div id="update-items-list"></div>';
  
  const listDiv = document.getElementById('update-items-list');
  if (!listDiv) {
    console.error('Update items list div not found');
    return;
  }
  listDiv.style.cssText = 'display: grid; gap: 15px; margin-top: 20px;';
  
  items.forEach(({ key, item, date }) => {
    const typeLabel = item.type ? ` <span style="background: ${item.type === 'fridge' ? '#3B82F6' : '#F59E0B'}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">${item.type === 'fridge' ? '❄️ FRIDGE' : '🔥 FRESH'}</span>` : '';
    
    const card = document.createElement('div');
    card.style.cssText = 'padding: 15px; background: var(--color-surface); border: 2px solid var(--color-border); border-radius: 8px; cursor: pointer; transition: all 0.2s;';
    card.onmouseover = () => card.style.borderColor = 'var(--color-primary)';
    card.onmouseout = () => card.style.borderColor = 'var(--color-border)';
    
    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <strong style="font-size: 18px;">${item.itemName}</strong>${typeLabel}
          <div style="color: var(--color-text-secondary); font-size: 13px; margin-top: 5px;">
            ${item.category} | ${item.purchasedQty} ${item.unit} @ ₹${item.purchaseRate}/${item.unit}
          </div>
        </div>
        <button class="btn btn--primary" onclick="editUpdateItem('${key}', '${date}')", event.stopPropagation()">✏️ Edit</button>
      </div>
    `;
    
    card.onclick = () => editUpdateItem(key, date);
    listDiv.appendChild(card);
  });
}

function editUpdateItem(itemKey, date) {
  database.ref(`dailyRecords/${date}/purchases/${itemKey}`).once('value', (snapshot) => {
    if (!snapshot.exists()) return;
    
    const item = snapshot.val();
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'update-item-modal';
    
    modal.innerHTML = `
      <div class="modal-content">
        <h2>Update: ${item.itemName}${item.type ? ' (' + item.type.toUpperCase() + ')' : ''}</h2>
        
        <div class="form-group">
          <label>Purchased Quantity:</label>
          <input type="number" id="upd-qty" value="${item.purchasedQty}" step="0.01" class="form-control" oninput="recalcUpdate()">
        </div>
        
        <div class="form-group">
          <label>Unit:</label>
          <select id="upd-unit" class="form-control">
            <option value="kg" ${item.unit === 'kg' ? 'selected' : ''}>kg</option>
            <option value="ltr" ${item.unit === 'ltr' ? 'selected' : ''}>ltr</option>
            <option value="pcs" ${item.unit === 'pcs' ? 'selected' : ''}>pcs</option>
            <option value="gm" ${item.unit === 'gm' ? 'selected' : ''}>gm</option>
          </select>
        </div>
        
        <div class="form-group">
          <label>Total Amount Paid (₹):</label>
          <input type="number" id="upd-amount" value="${item.purchaseAmount || (item.purchasedQty * item.purchaseRate)}" step="0.01" class="form-control" oninput="recalcUpdate()">
        </div>
        
        <div class="form-group" style="background: var(--color-bg-1); padding: 12px; border-radius: 6px;">
          <label>Calculated Rate:</label>
          <div style="font-size: 22px; font-weight: bold; color: var(--color-primary);">
            <span id="upd-rate">₹${item.purchaseRate.toFixed(2)}</span> / <span id="upd-unit-display">${item.unit}</span>
          </div>
        </div>
        
        <div class="form-group">
          <label>Used Quantity:</label>
          <input type="number" id="upd-used" value="${item.usedQty || 0}" step="0.01" class="form-control" oninput="recalcUpdate()">
        </div>
        
        <div class="form-group" style="background: var(--color-bg-4); padding: 12px; border-radius: 6px;">
          <label>Expense (for used qty):</label>
          <div style="font-size: 22px; font-weight: bold; color: var(--color-error);">
            <span id="upd-expense">₹0</span>
          </div>
        </div>
        
        <div class="modal-actions">
          <button onclick="saveUpdateItem('${itemKey}', '${date}')" class="btn btn--primary">✅ Update</button>
          <button onclick="closeUpdateModal()" class="btn btn--secondary">❌ Cancel</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    recalcUpdate();
  });
}

function recalcUpdate() {
  const qty = parseFloat(document.getElementById('upd-qty').value) || 0;
  const amount = parseFloat(document.getElementById('upd-amount').value) || 0;
  const used = parseFloat(document.getElementById('upd-used').value) || 0;
  const unit = document.getElementById('upd-unit').value;
  
  document.getElementById('upd-unit-display').textContent = unit;
  
  if (qty > 0 && amount > 0) {
    const rate = amount / qty;
    document.getElementById('upd-rate').textContent = '₹' + rate.toFixed(2);
    
    // FIX 2: Calculate expense for used quantity
    const expense = used * rate;
    document.getElementById('upd-expense').textContent = '₹' + expense.toFixed(2);
  }
}

function saveUpdateItem(itemKey, date) {
  const qty = parseFloat(document.getElementById('upd-qty').value);
  const amount = parseFloat(document.getElementById('upd-amount').value);
  const unit = document.getElementById('upd-unit').value;
  const used = parseFloat(document.getElementById('upd-used').value) || 0;
  const rate = qty > 0 ? amount / qty : 0;
  const expense = used * rate;
  
  database.ref(`dailyRecords/${date}/purchases/${itemKey}`).update({
    purchasedQty: qty,
    purchaseAmount: amount,
    purchaseRate: rate,
    unit: unit,
    usedQty: used,
    expense: expense,
    remaining: qty - used
  }).then(() => {
    showToast('✅ Item updated successfully!', 'success');
    closeUpdateModal();
    updateDailyTotals(date);
    searchItemsForUpdate();
  }).catch(error => {
    showToast('Error: ' + error.message, 'error');
  });
}

function closeUpdateModal() {
  const modal = document.getElementById('update-item-modal');
  if (modal) modal.remove();
}

window.editUpdateItem = editUpdateItem;
window.recalcUpdate = recalcUpdate;
window.saveUpdateItem = saveUpdateItem;
window.closeUpdateModal = closeUpdateModal;

// Removed old update functions - replaced with new FIX 3 implementation above

// View Items
function setupViewItems() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabName = btn.getAttribute('data-tab');
      
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      tabContents.forEach(c => c.classList.remove('active'));
      document.getElementById(`${tabName}Tab`).classList.add('active');
    });
  });
  
  document.getElementById('exportDayItemsJson').addEventListener('click', () => exportToJSON('dayItems'));
  document.getElementById('exportTotalItemsJson').addEventListener('click', () => exportToJSON('totalItems'));
  
  document.getElementById('sort-by').addEventListener('change', sortItems);
  document.getElementById('sort-order-btn').addEventListener('click', toggleSortOrder);
  document.getElementById('filter-status').addEventListener('change', filterItems);
  
  // FIX 4: Total Items sorting
  document.getElementById('total-sort-by').addEventListener('change', sortTotalItems);
  document.getElementById('total-sort-order-btn').addEventListener('click', toggleTotalSortOrder);
  
  loadViewItems();
}

function loadViewItems() {
  loadDayItems();
  loadTotalItems();
}

function loadDayItems() {
  const tbody = document.getElementById('dayItemsTableBody');
  const totalCell = document.getElementById('dayItemsTotal');
  
  database.ref(`dailyRecords/${activeDate}/purchases`).once('value', (snapshot) => {
    tbody.innerHTML = '';
    let totalExpense = 0;
    
    if (snapshot.exists()) {
      const items = snapshot.val();
      
      Object.entries(items).forEach(([key, item]) => {
        const viewItemStock = item.stockInStore || 0;
        const viewItemPurchased = item.purchasedQty || 0;
        const viewTotalAvailable = item.totalAvailable || (viewItemStock + viewItemPurchased);
        const viewUsedQty = item.usedQty || 0;
        const viewRemaining = viewTotalAvailable - viewUsedQty;
        
        // FIX 7: Correct remaining calculation
        const correctRemaining = viewItemPurchased - viewUsedQty;
        
        // FIX 2: Calculate expense for USED quantity only
        const expenseForUsed = viewUsedQty * (item.purchaseRate || 0);
        totalExpense += expenseForUsed;
        
        const stockStatus = calculateStockStatus(item);
        
        let itemDisplay = item.itemName;
        if (item.category === 'Meat' && item.type) {
          const typeColor = item.type === 'fridge' ? '#3B82F6' : '#F59E0B';
          const typeIcon = item.type === 'fridge' ? '❄️' : '🔥';
          itemDisplay += ` <span class="meat-type-badge" style="background: ${typeColor}; color: white;">${typeIcon} ${item.type.toUpperCase()}</span>`;
        }
        
        const dayItemStock = item.stockInStore || 0;
        const dayItemPurchased = item.purchasedQty || 0;
        const dayItemTotal = item.totalAvailable || (dayItemStock + dayItemPurchased);
        
        // Display exact quantities without conversion
        const displayUnit = item.purchasedUnit || item.unit;
        
        const stockDisplay = dayItemStock.toFixed(2);
        const purchasedDisplay = dayItemPurchased.toFixed(2);
        const totalDisplay = dayItemTotal.toFixed(2);
        const usedDisplay = viewUsedQty.toFixed(2);
        const remainingDisplay = correctRemaining.toFixed(2);
        
        // Get stock status for Actions column (PERCENTAGE-BASED)
        const itemForStatus = {
          totalAvailable: dayItemTotal,
          remaining: correctRemaining
        };
        const actionStatus = getStockStatusByPercentage(itemForStatus);
        
        const row = tbody.insertRow();
        row.dataset.itemId = item.itemId || '';
        row.dataset.itemName = item.itemName;
        row.dataset.category = item.category;
        row.dataset.status = stockStatus.status;
        row.dataset.remaining = correctRemaining;
        row.dataset.expense = expenseForUsed;
        
        // FIX 5: Show Total Amount Paid (not breakdown rate)
        const totalAmountPaid = item.purchaseAmount || (dayItemPurchased * (item.purchaseRate || 0));
        
        // Build Actions column HTML with status indicator (PERCENTAGE-BASED)
        let actionsHTML = '<div class="status-box ' + actionStatus.status + '" style="padding: 12px; border-radius: 8px; display: flex; flex-direction: column; gap: 8px;">';
        actionsHTML += '<div style="display: flex; align-items: center; gap: 8px;">';
        actionsHTML += '<span class="status-icon" style="font-size: 20px;">' + actionStatus.icon + '</span>';
        actionsHTML += '<span class="status-text" style="font-weight: 600; font-size: 13px;">' + actionStatus.text + '</span>';
        actionsHTML += '</div>';
        if (actionStatus.showButton) {
          actionsHTML += '<button class="btn btn--sm btn--primary" onclick="repurchaseItem(\'' + key + '\')" style="width: 100%; margin-top: 4px;">🛒 Repurchase Item</button>';
        }
        actionsHTML += '</div>';
        
        // Build Delete button HTML
        let deleteHTML = '<button class="btn btn--sm delete-day-item-btn" onclick="deleteDayItemWithConfirm(\'' + key + '\', \'' + item.itemName + '\', \'' + activeDate + '\')">🗑️ Delete</button>';
        
        row.innerHTML = `
          <td>${itemDisplay}</td>
          <td>${item.category}</td>
          <td><strong>${stockDisplay}</strong> ${displayUnit}</td>
          <td><strong>${purchasedDisplay}</strong> ${displayUnit}</td>
          <td><strong>${totalDisplay}</strong> ${displayUnit}</td>
          <td><strong style="color: var(--color-primary);">₹${totalAmountPaid.toFixed(2)}</strong></td>
          <td><strong>${usedDisplay} ${displayUnit}</strong></td>
          <td><strong style="color: var(--color-error);">₹${expenseForUsed.toFixed(2)}</strong></td>
          <td><strong>${remainingDisplay} ${displayUnit}</strong></td>
          <td>${actionsHTML}</td>
          <td>${deleteHTML}</td>
        `;
      });
    }
    
    totalCell.innerHTML = `<strong>₹${totalExpense.toFixed(2)}</strong>`;
    
    applySortAndFilter();
  });
}

// Sorting and Filtering Functions
function toggleSortOrder() {
  sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
  const btn = document.getElementById('sort-order-btn');
  btn.textContent = sortOrder === 'asc' ? '⬆️ Ascending' : '⬇️ Descending';
  applySortAndFilter();
}

function sortItems() {
  currentSortBy = document.getElementById('sort-by').value;
  applySortAndFilter();
}

function filterItems() {
  currentFilter = document.getElementById('filter-status').value;
  applySortAndFilter();
}

function applySortAndFilter() {
  const tbody = document.getElementById('dayItemsTableBody');
  const rows = Array.from(tbody.querySelectorAll('tr:not(.total-row)'));
  
  rows.forEach(row => {
    const status = row.dataset.status || 'full';
    if (currentFilter === 'all' || status === currentFilter) {
      row.style.display = '';
    } else {
      row.style.display = 'none';
    }
  });
  
  const visibleRows = rows.filter(row => row.style.display !== 'none');
  
  visibleRows.sort((a, b) => {
    let valA, valB;
    
    switch(currentSortBy) {
      case 'id':
        valA = parseInt(a.dataset.itemId) || 0;
        valB = parseInt(b.dataset.itemId) || 0;
        break;
      case 'name':
        valA = a.dataset.itemName.toLowerCase();
        valB = b.dataset.itemName.toLowerCase();
        return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      case 'category':
        valA = a.dataset.category.toLowerCase();
        valB = b.dataset.category.toLowerCase();
        return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      case 'status':
        const statusOrder = { critical: 1, low: 2, medium: 3, full: 4 };
        valA = statusOrder[a.dataset.status] || 5;
        valB = statusOrder[b.dataset.status] || 5;
        break;
      case 'remaining':
        valA = parseFloat(a.dataset.remaining) || 0;
        valB = parseFloat(b.dataset.remaining) || 0;
        break;
      case 'expense':
        valA = parseFloat(a.dataset.expense) || 0;
        valB = parseFloat(b.dataset.expense) || 0;
        break;
      default:
        return 0;
    }
    
    return sortOrder === 'asc' ? valA - valB : valB - valA;
  });
  
  visibleRows.forEach(row => tbody.appendChild(row));
}

// FIX 3: Edit Day Item with ability to change unit and support for meat types
function editDayItem(itemKey, date) {
  date = date || activeDate;
  database.ref(`dailyRecords/${date}/purchases/${itemKey}`).once('value', (snapshot) => {
    if (snapshot.exists()) {
      const item = snapshot.val();
      
      // Create modal for editing
      const modal = document.createElement('div');
      modal.className = 'modal-overlay';
      modal.innerHTML = `
        <div class="modal-content">
          <h2>Edit Item: ${item.itemName}${item.type ? ' (' + item.type.toUpperCase() + ')' : ''}</h2>
          
          <div class="form-group">
            <label>Purchased Quantity:</label>
            <input type="number" id="edit-purchased-qty" value="${item.purchasedQty}" step="0.01" class="form-control" oninput="recalculateEditRate()">
          </div>
          
          <div class="form-group">
            <label>Unit:</label>
            <select id="edit-unit" class="form-control" onchange="recalculateEditRate()">
              <option value="kg" ${item.unit === 'kg' ? 'selected' : ''}>kg (Kilogram)</option>
              <option value="gm" ${item.unit === 'gm' || item.unit === 'g' ? 'selected' : ''}>gm (Grams)</option>
              <option value="ltr" ${item.unit === 'ltr' ? 'selected' : ''}>ltr (Liters)</option>
              <option value="ml" ${item.unit === 'ml' ? 'selected' : ''}>ml (Milliliters)</option>
              <option value="pcs" ${item.unit === 'pcs' ? 'selected' : ''}>pcs (Pieces)</option>
            </select>
          </div>
          
          <div class="form-group">
            <label>Total Amount Paid (₹):</label>
            <input type="number" id="edit-total-amount" value="${item.purchaseAmount || (item.purchasedQty * item.purchaseRate)}" step="0.01" class="form-control" oninput="recalculateEditRate()">
          </div>
          
          <div class="form-group" style="background: var(--color-bg-1); padding: 15px; border-radius: 8px;">
            <label>📊 Calculated Rates:</label>
            <div style="font-size: 20px; font-weight: bold; color: var(--color-primary);">
              <div><span id="edit-calc-rate">₹${item.purchaseRate.toFixed(2)}</span> per <span id="edit-unit-display">${item.unit}</span></div>
              <div style="font-size: 14px; margin-top: 8px; color: var(--color-text-secondary);">
                <span id="edit-base-rate">₹0</span> per <span id="edit-base-unit">-</span>
              </div>
            </div>
          </div>
          
          <div class="form-group">
            <label>Used Quantity:</label>
            <input type="number" id="edit-used-qty" value="${item.usedQty || 0}" step="0.01" class="form-control" oninput="recalculateEditRate()">
          </div>
          
          <div class="form-group">
            <label>Used Unit:</label>
            <select id="edit-used-unit" class="form-control" onchange="recalculateEditRate()">
              <option value="kg" ${item.unit === 'kg' ? 'selected' : ''}>kg (Kilogram)</option>
              <option value="gm" ${item.unit === 'gm' || item.unit === 'g' ? 'selected' : ''}>gm (Grams)</option>
              <option value="ltr" ${item.unit === 'ltr' ? 'selected' : ''}>ltr (Liters)</option>
              <option value="ml" ${item.unit === 'ml' ? 'selected' : ''}>ml (Milliliters)</option>
              <option value="pcs" ${item.unit === 'pcs' ? 'selected' : ''}>pcs (Pieces)</option>
            </select>
          </div>
          
          <div class="form-group" style="background: var(--color-bg-4); padding: 15px; border-radius: 8px;">
            <label>💸 Calculated Expense:</label>
            <div style="font-size: 22px; font-weight: bold; color: var(--color-error);">
              <span id="edit-expense-display">₹0</span>
            </div>
          </div>
          
          <div class="modal-actions">
            <button onclick="saveEditedDayItem('${itemKey}', '${date}')" class="btn btn--primary">💾 Save</button>
            <button onclick="closeModal()" class="btn btn--secondary">❌ Cancel</button>
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
      
      // Auto-calculate when amount/qty changes
      document.getElementById('edit-total-amount').oninput = recalculateEditRate;
      document.getElementById('edit-purchased-qty').oninput = recalculateEditRate;
    }
  });
}

function recalculateEditRate() {
  const qty = parseFloat(document.getElementById('edit-purchased-qty').value) || 0;
  const amount = parseFloat(document.getElementById('edit-total-amount').value) || 0;
  const unit = document.getElementById('edit-unit').value;
  const usedQty = parseFloat(document.getElementById('edit-used-qty').value) || 0;
  const usedUnit = document.getElementById('edit-used-unit').value;
  
  document.getElementById('edit-unit-display').textContent = unit;
  
  if (qty > 0 && amount > 0) {
    // Rate per purchased unit
    const ratePerUnit = amount / qty;
    document.getElementById('edit-calc-rate').textContent = '₹' + ratePerUnit.toFixed(2);
    
    // Rate per base unit
    const baseUnit = getBaseUnit(unit);
    const ratePerBaseUnit = calculateRatePerBaseUnit(amount, qty, unit);
    document.getElementById('edit-base-rate').textContent = '₹' + ratePerBaseUnit.toFixed(2);
    document.getElementById('edit-base-unit').textContent = baseUnit;
    
    // Calculate expense for used quantity
    if (usedQty > 0) {
      const expense = calculateExpense(usedQty, usedUnit, ratePerBaseUnit, baseUnit);
      document.getElementById('edit-expense-display').textContent = '₹' + expense.toFixed(2);
    } else {
      document.getElementById('edit-expense-display').textContent = '₹0';
    }
  }
}

function saveEditedDayItem(itemKey, date) {
  const newQty = parseFloat(document.getElementById('edit-purchased-qty').value);
  const newAmount = parseFloat(document.getElementById('edit-total-amount').value);
  const newUnit = document.getElementById('edit-unit').value;
  const usedQty = parseFloat(document.getElementById('edit-used-qty').value) || 0;
  const usedUnit = document.getElementById('edit-used-unit').value;
  const newRate = newQty > 0 ? newAmount / newQty : 0;
  
  // Calculate expense (NO CONVERSION)
  const expense = usedQty * newRate;
  
  database.ref(`dailyRecords/${date}/purchases/${itemKey}`).update({
    purchasedQty: newQty,
    purchaseAmount: newAmount,
    purchaseRate: newRate,
    purchasedUnit: newUnit,
    unit: newUnit,
    usedQty: usedQty,
    usedUnit: usedUnit,
    expense: expense,
    totalAvailable: (newQty + ((document.getElementById('edit-purchased-qty').dataset.stockInStore || 0))),
    remaining: newQty - usedQty
  }).then(() => {
    showToast('✅ Item updated successfully!', 'success');
    closeEditModal();
    updateDailyTotals(date);
    loadDayItems();
    loadDashboardMetrics();
  }).catch(error => {
    showToast('Error updating item: ' + error.message, 'error');
  });
}

window.recalculateEditRate = recalculateEditRate;
window.saveEditedDayItem = saveEditedDayItem;
window.closeModal = closeModal;

function deleteDayItemWithConfirm(itemKey, itemName, date) {
  // Show comprehensive confirmation dialog
  var confirmMessage = '⚠️ DELETE CONFIRMATION\n\n' +
    'Item: ' + itemName + '\n' +
    'Date: ' + date + '\n\n' +
    'This will permanently delete this item from today\'s records.\n' +
    'This action CANNOT be undone!\n\n' +
    'Are you sure you want to delete?';
  
  if (!confirm(confirmMessage)) {
    return;  // User clicked Cancel
  }
  
  // Delete from Firebase
  var itemPath = 'dailyRecords/' + date + '/purchases/' + itemKey;
  
  database.ref(itemPath).remove()
    .then(function() {
      showToast('✅ Item deleted successfully: ' + itemName, 'success');
      
      // Update daily totals
      updateDailyTotals(date);
      
      // Refresh the day items display
      loadDayItems();
      
      // Update dashboard if on that page
      var currentPageElement = document.querySelector('.page.active');
      if (currentPageElement && currentPageElement.id === 'dashboardPage') {
        loadDashboardMetrics();
      }
    })
    .catch(function(error) {
      console.error('Delete error:', error);
      showToast('❌ Error deleting item: ' + error.message, 'error');
    });
}

function deleteDayItem(itemKey, date) {
  if (confirm('Delete this item from Day Items?')) {
    database.ref(`dailyRecords/${date}/purchases/${itemKey}`).remove()
      .then(() => {
        updateDailyTotals(date);
        showToast('Item deleted successfully');
        loadDayItems();
        loadDashboardMetrics();
      })
      .catch(error => showToast('Error deleting item: ' + error.message, 'error'));
  }
}

function loadTotalItems() {
  const tbody = document.getElementById('totalItemsTableBody');
  
  database.ref('storeItems').once('value', async (storeSnapshot) => {
    if (!tbody) {
      console.error('Total items tbody not found');
      return;
    }
    
    tbody.innerHTML = '';
    
    if (!storeSnapshot.exists()) {
      tbody.innerHTML = '<tr><td colspan="8" style="text-align:center">No items in store. Add items first.</td></tr>';
      return;
    }
    
    const items = storeSnapshot.val();
    const itemsArray = [];
    
    // Get last purchase data for each item
    for (const [key, item] of Object.entries(items)) {
      let lastPurchasedQty = '-';
      let lastPurchaseAmount = '-';
      
      // Find most recent purchase for this item
      const purchaseSnapshot = await database.ref('dailyRecords').orderByKey().limitToLast(30).once('value');
      
      if (purchaseSnapshot.exists()) {
        const dailyRecords = purchaseSnapshot.val();
        const dates = Object.keys(dailyRecords).sort().reverse();
        
        for (const date of dates) {
          const purchases = dailyRecords[date].purchases || {};
          
          // Look for this item in purchases
          for (const [purchaseKey, purchase] of Object.entries(purchases)) {
            if (purchase.itemId === item.id) {
              lastPurchasedQty = `${purchase.purchasedQty} ${purchase.unit}`;
              // FIX 5: Store total purchase amount, not breakdown rate
              const totalAmount = purchase.purchaseAmount || (purchase.purchasedQty * (purchase.purchaseRate || 0));
              lastPurchaseAmount = `₹${totalAmount.toFixed(2)}`;
              break;
            }
          }
          
          if (lastPurchasedQty !== '-') break;
        }
      }
      
      itemsArray.push({
        ...item,
        itemKey: key,
        lastPurchasedQty,
        lastPurchaseAmount
      });
    }
    
    displayTotalItems(itemsArray);
    console.log('Total items loaded:', itemsArray.length);
  });
}

function displayTotalItems(items) {
  const tbody = document.getElementById('totalItemsTableBody');
  tbody.innerHTML = '';
  
  items.forEach(item => {
    const row = tbody.insertRow();
    row.dataset.itemId = item.id;
    row.dataset.itemName = item.name;
    row.dataset.category = item.category;
    row.dataset.unit = item.unit;
    row.dataset.createdDate = item.createdDate || '';
    
    // FIX 5: Display total purchase amount (already corrected in loadTotalItems)
    const lastPurchaseDisplay = item.lastPurchaseAmount || '-';
    
    row.innerHTML = `
      <td>${item.id}</td>
      <td>${item.name}</td>
      <td>${item.category}</td>
      <td>${item.unit}</td>
      <td><strong>${item.lastPurchasedQty}</strong></td>
      <td><strong>${lastPurchaseDisplay}</strong></td>
      <td>${item.createdDate || 'N/A'}</td>
      <td>
        <button class="btn btn--outline btn--sm" onclick="editTotalItem('${item.itemKey}')">✏️ Edit</button>
        <button class="btn btn--outline btn--sm" onclick="deleteTotalItem('${item.itemKey}')">🗑️ Delete</button>
      </td>
    `;
  });
}

function toggleTotalSortOrder() {
  totalSortOrder = totalSortOrder === 'asc' ? 'desc' : 'asc';
  const btn = document.getElementById('total-sort-order-btn');
  btn.textContent = totalSortOrder === 'asc' ? '⬆️ Ascending' : '⬇️ Descending';
  sortTotalItems();
}

function sortTotalItems() {
  const sortBy = document.getElementById('total-sort-by').value;
  currentTotalSortBy = sortBy;
  
  const rows = Array.from(document.querySelectorAll('#totalItemsTableBody tr'));
  
  rows.sort((a, b) => {
    let valA, valB;
    
    switch(sortBy) {
      case 'id':
        valA = parseInt(a.dataset.itemId) || 0;
        valB = parseInt(b.dataset.itemId) || 0;
        break;
      case 'name':
        valA = a.dataset.itemName.toLowerCase();
        valB = b.dataset.itemName.toLowerCase();
        return totalSortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      case 'category':
        valA = a.dataset.category.toLowerCase();
        valB = b.dataset.category.toLowerCase();
        return totalSortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      case 'unit':
        valA = a.dataset.unit.toLowerCase();
        valB = b.dataset.unit.toLowerCase();
        return totalSortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      case 'createdDate':
        valA = new Date(a.dataset.createdDate || '2000-01-01');
        valB = new Date(b.dataset.createdDate || '2000-01-01');
        return totalSortOrder === 'asc' ? valA - valB : valB - valA;
      default:
        return 0;
    }
    
    return totalSortOrder === 'asc' ? valA - valB : valB - valA;
  });
  
  const tbody = document.getElementById('totalItemsTableBody');
  rows.forEach(row => tbody.appendChild(row));
}

function editTotalItem(itemKey) {
  database.ref(`storeItems/${itemKey}`).once('value', (snapshot) => {
    if (!snapshot.exists()) {
      showToast('Item not found', 'error');
      return;
    }
    
    const item = snapshot.val();
    
    // Find last purchase for this item
    database.ref('dailyRecords').once('value', (recordsSnapshot) => {
      const allRecords = recordsSnapshot.val() || {};
      let lastPurchase = null;
      let lastPurchaseDate = null;
      let lastPurchaseKey = null;
      
      // Find most recent purchase
      const dates = Object.keys(allRecords).sort().reverse();
      for (const date of dates) {
        const purchases = allRecords[date].purchases || {};
        for (const purchaseKey in purchases) {
          const purchase = purchases[purchaseKey];
          if (purchase.itemId === item.id || purchase.itemName === item.name) {
            lastPurchaseDate = date;
            lastPurchase = purchase;
            lastPurchaseKey = purchaseKey;
            break;
          }
        }
        if (lastPurchase) break;
      }
      
      // Show edit dialog
      showEditItemDialog(itemKey, item, lastPurchase, lastPurchaseDate, lastPurchaseKey);
    });
  });
}

function showEditItemDialog(itemKey, item, lastPurchase, lastPurchaseDate, lastPurchaseKey) {
  // Create modal HTML
  const modal = document.createElement('div');
  modal.id = 'edit-item-modal';
  modal.className = 'modal-overlay';
  
  const lastQty = lastPurchase ? lastPurchase.purchasedQty : 0;
  const lastRate = lastPurchase ? lastPurchase.purchaseRate : 0;
  const lastUnit = lastPurchase ? lastPurchase.unit : item.unit;
  
  const lastTotalAmount = lastPurchase ? (lastPurchase.purchaseAmount || (lastQty * lastRate)) : 0;
  const lastBreakdownRate = lastQty > 0 ? (lastTotalAmount / lastQty) : 0;
  
  modal.innerHTML = `
    <div class="modal-content">
      <h2>Edit Store Item: ${item.name}</h2>
      
      <div class="form-group">
        <label>Item Name:</label>
        <input type="text" id="edit-item-name" value="${item.name}" class="form-control">
      </div>
      
      <div class="form-group">
        <label>Category:</label>
        <input type="text" id="edit-item-category" value="${item.category}" class="form-control" readonly>
      </div>
      
      <div class="form-group">
        <label>Unit:</label>
        <select id="edit-item-unit" class="form-control">
          <option value="kg" ${item.unit === 'kg' ? 'selected' : ''}>kg</option>
          <option value="gm" ${item.unit === 'gm' || item.unit === 'g' ? 'selected' : ''}>gm</option>
          <option value="ltr" ${item.unit === 'ltr' ? 'selected' : ''}>ltr</option>
          <option value="ml" ${item.unit === 'ml' ? 'selected' : ''}>ml</option>
          <option value="pcs" ${item.unit === 'pcs' ? 'selected' : ''}>pcs</option>
        </select>
        <small class="help-text" style="color: var(--color-success); font-size: 12px; display: block; margin-top: 4px;">✅ You can change the unit here</small>
      </div>
      
      <hr style="margin: 20px 0; border: none; border-top: 1px solid var(--color-border);">
      
      <h3>Last Purchase Data ${lastPurchaseDate ? '(from ' + lastPurchaseDate + ')' : ''}</h3>
      
      ${lastPurchase ? `
        <div class="form-group">
          <label>Last Purchased Quantity:</label>
          <input type="number" id="edit-last-qty" value="${lastQty}" step="0.01" class="form-control" oninput="recalculateLastPurchaseInModal()">
          <small>Unit: ${lastUnit}</small>
        </div>
        
        <div class="form-group">
          <label>💰 Last Total Amount Paid (₹):</label>
          <input type="number" id="edit-last-amount" value="${lastTotalAmount.toFixed(2)}" step="0.01" class="form-control" oninput="recalculateLastPurchaseInModal()">
          <small class="help-text" style="color: var(--color-success);">✅ CORRECT: Total amount paid for ${lastQty} ${lastUnit}</small>
        </div>
        
        <div class="form-group" style="background: var(--color-bg-1); padding: 12px; border-radius: 8px;">
          <label>📊 Breakdown Rate (Auto-calculated):</label>
          <div style="font-size: 18px; font-weight: bold; color: var(--color-primary);">
            <span id="breakdown-rate-display">₹${lastBreakdownRate.toFixed(2)}</span> per ${lastUnit}
          </div>
          <small style="color: var(--color-text-secondary);">Calculated: Total Amount ÷ Quantity</small>
        </div>
      ` : `
        <p style="color: var(--color-text-secondary); margin: 20px 0;">No purchase history found for this item.</p>
      `}
      
      <div class="modal-actions">
        <button onclick="saveItemEdit('${itemKey}', ${lastPurchase ? "'" + lastPurchaseDate + "', '" + lastPurchaseKey + "'" : 'null, null'})" class="btn btn--primary">
          💾 Save Changes
        </button>
        <button onclick="closeEditModal()" class="btn btn--secondary">
          ❌ Cancel
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Focus first input
  setTimeout(() => {
    document.getElementById('edit-item-name').focus();
  }, 100);
}

function recalculateLastPurchaseInModal() {
  const qty = parseFloat(document.getElementById('edit-last-qty').value) || 0;
  const amount = parseFloat(document.getElementById('edit-last-amount').value) || 0;
  
  if (qty > 0 && amount > 0) {
    const rate = amount / qty;
    const rateDisplay = document.getElementById('breakdown-rate-display');
    if (rateDisplay) {
      rateDisplay.textContent = '₹' + rate.toFixed(2);
    }
  }
}

window.recalculateLastPurchaseInModal = recalculateLastPurchaseInModal;

function saveItemEdit(itemKey, lastPurchaseDate, lastPurchaseKey) {
  const newName = document.getElementById('edit-item-name').value.trim();
  const newUnit = document.getElementById('edit-item-unit').value;
  
  if (!newName) {
    showToast('Item name cannot be empty', 'error');
    return;
  }
  
  // Update store item name and unit
  database.ref(`storeItems/${itemKey}`).update({
    name: newName,
    unit: newUnit
  }).then(() => {
    showToast('✅ Item name and unit updated!', 'success');
    
    // Update last purchase data if exists
    if (lastPurchaseDate && lastPurchaseKey) {
      const newQty = parseFloat(document.getElementById('edit-last-qty').value);
      const newAmount = parseFloat(document.getElementById('edit-last-amount').value);
      const newRate = newQty > 0 ? newAmount / newQty : 0;
      
      if (isNaN(newQty) || isNaN(newAmount) || isNaN(newRate)) {
        showToast('Invalid quantity or amount', 'error');
        return;
      }
      
      // Update purchase record
      const updates = {
        purchasedQty: newQty,
        purchaseRate: newRate,
        purchaseAmount: newAmount
      };
      
      // Recalculate remaining and expense
      database.ref(`dailyRecords/${lastPurchaseDate}/purchases/${lastPurchaseKey}`).once('value', (snapshot) => {
        if (snapshot.exists()) {
          const purchase = snapshot.val();
          const usedQty = purchase.usedQty || 0;
          updates.remaining = newQty - usedQty;
          updates.expense = usedQty * newRate;
          
          database.ref(`dailyRecords/${lastPurchaseDate}/purchases/${lastPurchaseKey}`).update(updates).then(() => {
            showToast('✅ Purchase data updated successfully!', 'success');
            updateDailyTotals(lastPurchaseDate);
            closeEditModal();
            loadTotalItems();
          }).catch((error) => {
            showToast('Error updating purchase: ' + error.message, 'error');
          });
        }
      });
    } else {
      closeEditModal();
      loadTotalItems();
    }
  }).catch((error) => {
    showToast('Error updating item: ' + error.message, 'error');
  });
}

function closeEditModal() {
  const modal = document.getElementById('edit-item-modal');
  if (modal) {
    modal.remove();
  }
}

function deleteTotalItem(itemKey) {
  if (confirm('Delete this item from store? This will remove it from all records.')) {
    database.ref(`storeItems/${itemKey}`).remove()
      .then(() => {
        showToast('Item deleted successfully');
        loadTotalItems();
        loadStoreItems();
        loadDashboardMetrics();
      })
      .catch(error => showToast('Error deleting item: ' + error.message, 'error'));
  }
}

// Day Report
function setupDayReport() {
  document.getElementById('searchDayReportBtn').addEventListener('click', loadDayReport);
  document.getElementById('exportDayReportExcel').addEventListener('click', () => exportDayReportToExcel());
  document.getElementById('exportDayReportCsv').addEventListener('click', () => exportDayReportToCSV());
  document.getElementById('exportDayReportJson').addEventListener('click', () => exportToJSON('dayReport'));
}

function loadDayReport() {
  const reportDate = document.getElementById('dayReportDate').value;
  
  if (!reportDate) {
    showToast('Please select a date', 'error');
    return;
  }
  
  database.ref(`dailyRecords/${reportDate}/purchases`).once('value', (snapshot) => {
    document.getElementById('dayReportResults').style.display = 'block';
    
    if (snapshot.exists()) {
      const items = Object.values(snapshot.val());
      
      let totalItems = items.length;
      let itemsUsed = items.filter(i => i.usedQty > 0).length;
      let totalExpense = items.reduce((sum, i) => sum + (i.expense || 0), 0);
      let totalPurchased = items.reduce((sum, i) => sum + (i.purchaseAmount || 0), 0);
      
      document.getElementById('dayReportTotalItems').textContent = totalItems;
      document.getElementById('dayReportItemsUsed').textContent = itemsUsed;
      document.getElementById('dayReportExpense').textContent = `₹${totalExpense.toFixed(2)}`;
      document.getElementById('dayReportPurchased').textContent = `₹${totalPurchased.toFixed(2)}`;
      
      const tbody = document.getElementById('dayReportTableBody');
      tbody.innerHTML = '';
      
      // FIX 6: Show correct total purchase amount column with proper unit display
      items.forEach(item => {
        const reportStock = item.stockInStore || 0;
        const reportPurchased = item.purchasedQty || 0;
        const reportTotalAvailable = item.totalAvailable || (reportStock + reportPurchased);
        const reportUsedQty = item.usedQty || 0;
        const reportRemaining = reportTotalAvailable - reportUsedQty;
        
        // Display exact quantities without conversion
        const displayUnit = item.purchasedUnit || item.unit;
        
        const stockDisplay = reportStock.toFixed(2);
        const purchasedDisplay = reportPurchased.toFixed(2);
        const totalDisplay = reportTotalAvailable.toFixed(2);
        const usedDisplay = reportUsedQty.toFixed(2);
        const remainingDisplay = reportRemaining.toFixed(2);
        
        // Correct purchase amount display
        const totalAmountPaid = item.purchaseAmount || (reportPurchased * (item.purchaseRate || 0));
        const expense = reportUsedQty * (item.purchaseRate || 0);
        tbody.innerHTML += `
          <tr>
            <td>${item.itemName}</td>
            <td>${item.category}</td>
            <td><strong>${stockDisplay} ${displayUnit}</strong></td>
            <td><strong>${purchasedDisplay} ${displayUnit}</strong></td>
            <td><strong>${totalDisplay} ${displayUnit}</strong></td>
            <td><strong style="color: var(--color-primary)">₹${totalAmountPaid.toFixed(2)}</strong></td>
            <td><strong>${usedDisplay} ${displayUnit}</strong></td>
            <td><strong style="color:var(--color-error)">₹${expense.toFixed(2)}</strong></td>
            <td><strong>${remainingDisplay} ${displayUnit}</strong></td>
          </tr>
        `;
      });
    } else {
      document.getElementById('dayReportTotalItems').textContent = '0';
      document.getElementById('dayReportItemsUsed').textContent = '0';
      document.getElementById('dayReportExpense').textContent = '₹0';
      document.getElementById('dayReportPurchased').textContent = '₹0';
      document.getElementById('dayReportTableBody').innerHTML = '';
    }
  });
}

// Month Report
function setupMonthReport() {
  const monthInput = document.getElementById('monthReportMonth');
  const today = new Date();
  monthInput.value = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  
  document.getElementById('searchMonthReportBtn').addEventListener('click', loadMonthReport);
  document.getElementById('exportMonthReportExcel').addEventListener('click', () => exportMonthReportToExcel());
  document.getElementById('exportMonthReportCsv').addEventListener('click', () => exportMonthReportToCSV());
}

function loadMonthReport() {
  const monthValue = document.getElementById('monthReportMonth').value;
  
  if (!monthValue) {
    showToast('Please select a month', 'error');
    return;
  }
  
  const [year, month] = monthValue.split('-');
  const startDate = `${year}-${month}-01`;
  const endDate = `${year}-${month}-31`;
  
  database.ref('dailyRecords').once('value', (snapshot) => {
    document.getElementById('monthReportResults').style.display = 'block';
    
    let totalPurchased = 0;
    let totalExpense = 0;
    let totalInvestment = 0;
    const dailyData = [];
    
    if (snapshot.exists()) {
      const records = snapshot.val();
      
      Object.entries(records).forEach(([date, data]) => {
        if (date >= startDate && date <= endDate) {
          const itemsPurchased = data.purchases ? Object.keys(data.purchases).length : 0;
          const itemsUsed = data.purchases 
            ? Object.values(data.purchases).filter(i => i.usedQty > 0).length 
            : 0;
          const dailyExpense = data.totalExpense || 0;
          const purchasedAmount = data.totalPurchased || 0;
          const investmentBills = data.investmentBills || 0;
          
          totalPurchased += purchasedAmount;
          totalExpense += dailyExpense;
          totalInvestment += investmentBills;
          
          dailyData.push({
            date,
            itemsPurchased,
            itemsUsed,
            dailyExpense,
            purchasedAmount,
            investmentBills
          });
        }
      });
    }
    
    const grandTotal = totalPurchased + totalExpense + totalInvestment;
    
    document.getElementById('monthTotalPurchased').textContent = `₹${totalPurchased.toFixed(2)}`;
    document.getElementById('monthTotalExpense').textContent = `₹${totalExpense.toFixed(2)}`;
    document.getElementById('monthInvestmentBills').textContent = `₹${totalInvestment.toFixed(2)}`;
    document.getElementById('monthGrandTotal').textContent = `₹${grandTotal.toFixed(2)}`;
    
    const tbody = document.getElementById('monthReportTableBody');
    tbody.innerHTML = '';
    
    dailyData.sort((a, b) => a.date.localeCompare(b.date));
    
    // FIX 6: Make dates clickable to view day report
    dailyData.forEach(day => {
      const row = tbody.insertRow();
      row.className = 'clickable-row';
      row.style.cursor = 'pointer';
      row.onclick = () => viewDayReportFromMonth(day.date);
      
      row.innerHTML = `
        <td>
          <strong>${formatDateDisplay(day.date)}</strong>
          <span style="font-size: 11px; color: var(--color-text-secondary); margin-left: 10px;">
            📊 Click to view details
          </span>
        </td>
        <td>${day.itemsPurchased}</td>
        <td>${day.itemsUsed}</td>
        <td>₹${day.dailyExpense.toFixed(2)}</td>
        <td>₹${day.purchasedAmount.toFixed(2)}</td>
        <td>₹${day.investmentBills.toFixed(2)}</td>
      `;
    });
  });
}

function formatDateDisplay(dateStr) {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function viewDayReportFromMonth(date) {
  // Navigate to Day Report page
  const navBtns = document.querySelectorAll('.sidebar-btn');
  navBtns.forEach(b => b.classList.remove('active'));
  document.querySelector('[data-page="dayReport"]').classList.add('active');
  
  const pages = document.querySelectorAll('.page');
  pages.forEach(p => p.classList.remove('active'));
  document.getElementById('dayReportPage').classList.add('active');
  
  // Set date and load report
  document.getElementById('dayReportDate').value = date;
  loadDayReport();
  
  showToast(`📊 Viewing Day Report for ${formatDateDisplay(date)}`, 'info');
}

// Purchase Report
function setupPurchaseReport() {
  const monthInput = document.getElementById('purchaseFilterMonth');
  const today = new Date();
  monthInput.value = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  
  document.getElementById('applyPurchaseFilterBtn').addEventListener('click', loadPurchaseReport);
  document.getElementById('clearPurchaseFilterBtn').addEventListener('click', () => {
    document.getElementById('purchaseFilterMonth').value = '';
    document.getElementById('purchaseFilterCategory').value = '';
    loadPurchaseReport();
  });
  document.getElementById('exportPurchaseExcel').addEventListener('click', () => exportPurchaseReportToExcel());
  document.getElementById('exportPurchaseCsv').addEventListener('click', () => exportPurchaseReportToCSV());
  
  loadPurchaseReport();
}

function loadPurchaseReport() {
  const filterMonth = document.getElementById('purchaseFilterMonth').value;
  const filterCategory = document.getElementById('purchaseFilterCategory').value;
  
  database.ref('purchaseHistory').once('value', (snapshot) => {
    const tbody = document.getElementById('purchaseReportTableBody');
    const totalCell = document.getElementById('purchaseReportTotal');
    tbody.innerHTML = '';
    
    let total = 0;
    
    if (snapshot.exists()) {
      const purchasesData = snapshot.val();
      let purchases = Object.entries(purchasesData).map(([key, val]) => ({ ...val, key }));
      
      if (filterMonth) {
        const [year, month] = filterMonth.split('-');
        purchases = purchases.filter(p => p.date.startsWith(`${year}-${month}`));
      }
      
      if (filterCategory) {
        purchases = purchases.filter(p => p.category === filterCategory);
      }
      
      purchases.sort((a, b) => b.date.localeCompare(a.date));
      
      purchases.forEach(purchase => {
        total += purchase.amount;
        
        const row = tbody.insertRow();
        row.innerHTML = `
          <td>${new Date(purchase.date + 'T00:00:00').toLocaleDateString('en-IN')}</td>
          <td>${purchase.itemName}</td>
          <td>${purchase.category}</td>
          <td>${purchase.quantity}</td>
          <td>${purchase.unit}</td>
          <td>₹${purchase.rate}</td>
          <td>₹${purchase.amount.toFixed(2)}</td>
          <td>
            <button onclick="deletePurchaseEntry('${purchase.key}', '${purchase.date}')" class="btn btn--sm btn--danger">🗑️ Remove</button>
          </td>
        `;
      });
    }
    
    totalCell.innerHTML = `<strong>₹${total.toFixed(2)}</strong>`;
  });
}

function deletePurchaseEntry(purchaseKey, date) {
  if (!confirm('Delete this purchase entry? This cannot be undone.')) return;
  
  database.ref(`purchaseHistory/${purchaseKey}`).remove()
    .then(() => {
      showToast('✅ Purchase deleted successfully', 'success');
      loadPurchaseReport();
    })
    .catch(error => showToast('Error deleting purchase: ' + error.message, 'error'));
}

window.deletePurchaseEntry = deletePurchaseEntry;

// Category Management Functions

// Display categories in admin panel
function displayCategoriesInAdmin(categories) {
  const container = document.getElementById('categories-list');
  if (!container) return;
  
  container.innerHTML = '';
  
  if (!categories || Object.keys(categories).length === 0) {
    container.innerHTML = '<p>No categories found. Add one above.</p>';
    return;
  }
  
  for (const [catId, category] of Object.entries(categories)) {
    const subcatHTML = category.subcategories && category.subcategories.length > 0 
      ? `<div class="subcategories">
           <strong>Subcategories:</strong> ${category.subcategories.join(', ')}
         </div>`
      : '<div class="subcategories"><em>No subcategories</em></div>';
    
    const card = document.createElement('div');
    card.className = 'category-card';
    card.style.borderLeft = `4px solid ${category.color}`;
    card.innerHTML = `
      <div class="category-info">
        <div class="category-name">${category.name}</div>
        <div class="category-color-indicator" style="background: ${category.color}"></div>
      </div>
      ${subcatHTML}
      <div class="category-actions">
        <button onclick="editCategory('${catId}')" class="btn btn--sm">✏️ Edit</button>
        <button onclick="deleteCategory('${catId}')" class="btn btn--sm btn--danger">🗑️ Delete</button>
      </div>
    `;
    container.appendChild(card);
  }
}

// Populate parent category dropdown
function populateParentCategoryDropdown(categories) {
  const select = document.getElementById('parent-category');
  if (!select) return;
  
  select.innerHTML = '<option value="">Select Parent Category</option>';
  
  for (const [catId, category] of Object.entries(categories)) {
    const option = document.createElement('option');
    option.value = catId;
    option.textContent = category.name;
    select.appendChild(option);
  }
}

// Add new category
async function addCategory() {
  const name = document.getElementById('new-category-name').value.trim();
  const color = document.getElementById('new-category-color').value;
  
  if (!name) {
    showToast('Please enter category name', 'error');
    return;
  }
  
  const catId = 'cat_' + name.toLowerCase().replace(/\s+/g, '_');
  
  try {
    await database.ref(`categories/${catId}`).set({
      id: catId,
      name: name,
      color: color,
      subcategories: []
    });
    
    showToast('✅ Category added successfully!', 'success');
    
    // Clear form
    document.getElementById('new-category-name').value = '';
    document.getElementById('new-category-color').value = '#3B82F6';
    
    // Reload categories
    await loadCategoriesFromFirebase();
    loadCategoriesForAdmin();
    
  } catch (error) {
    console.error('Error adding category:', error);
    showToast('Error adding category: ' + error.message, 'error');
  }
}

// Add subcategory to existing category
async function addSubcategory() {
  const parentCatId = document.getElementById('parent-category').value;
  const subcategoryName = document.getElementById('new-subcategory-name').value.trim();
  
  if (!parentCatId || !subcategoryName) {
    showToast('Please select parent category and enter subcategory name', 'error');
    return;
  }
  
  try {
    // Get current category
    const snapshot = await database.ref(`categories/${parentCatId}`).once('value');
    const category = snapshot.val();
    
    if (!category) {
      showToast('Category not found', 'error');
      return;
    }
    
    // Add subcategory to array
    const subcategories = category.subcategories || [];
    if (!subcategories.includes(subcategoryName)) {
      subcategories.push(subcategoryName);
      
      await database.ref(`categories/${parentCatId}/subcategories`).set(subcategories);
      
      showToast('✅ Subcategory added successfully!', 'success');
      
      // Clear form
      document.getElementById('parent-category').value = '';
      document.getElementById('new-subcategory-name').value = '';
      
      // Reload categories
      await loadCategoriesFromFirebase();
      loadCategoriesForAdmin();
    } else {
      showToast('Subcategory already exists', 'error');
    }
    
  } catch (error) {
    console.error('Error adding subcategory:', error);
    showToast('Error adding subcategory: ' + error.message, 'error');
  }
}

// Edit category
async function editCategory(catId) {
  const snapshot = await database.ref(`categories/${catId}`).once('value');
  const category = snapshot.val();
  
  if (!category) {
    showToast('Category not found', 'error');
    return;
  }
  
  const newName = prompt('Edit category name:', category.name);
  const newColor = prompt('Edit category color (hex):', category.color);
  
  if (newName && newColor) {
    try {
      await database.ref(`categories/${catId}`).update({
        name: newName,
        color: newColor
      });
      
      showToast('✅ Category updated successfully!', 'success');
      await loadCategoriesFromFirebase();
      loadCategoriesForAdmin();
      
    } catch (error) {
      console.error('Error updating category:', error);
      showToast('Error updating category: ' + error.message, 'error');
    }
  }
}

// Delete category
async function deleteCategory(catId) {
  if (!confirm('Delete this category? This cannot be undone.')) return;
  
  try {
    await database.ref(`categories/${catId}`).remove();
    showToast('✅ Category deleted successfully!', 'success');
    await loadCategoriesFromFirebase();
    loadCategoriesForAdmin();
    
  } catch (error) {
    console.error('Error deleting category:', error);
    showToast('Error deleting category: ' + error.message, 'error');
  }
}

// Load categories for admin panel display
function loadCategoriesForAdmin() {
  database.ref('categories').once('value', (snapshot) => {
    const categories = snapshot.val() || {};
    displayCategoriesInAdmin(categories);
    populateParentCategoryDropdown(categories);
  });
}

// Make category functions global
window.addCategory = addCategory;
window.addSubcategory = addSubcategory;
window.editCategory = editCategory;
window.deleteCategory = deleteCategory;

// Admin Panel
function setupAdminPanel() {
  document.getElementById('resetItemIdsBtn').addEventListener('click', resetItemIds);
  document.getElementById('exportAllDataBtn').addEventListener('click', exportAllData);
  document.getElementById('copyItemsToDateBtn').addEventListener('click', copyItemsToDate);
  document.getElementById('importJsonBtn').addEventListener('click', importJsonData);
  
  document.getElementById('email-alerts-enabled').addEventListener('change', toggleEmailAlerts);
  document.getElementById('saveEmailSettingsBtn').addEventListener('click', saveEmailSettings);
  document.getElementById('sendTestAlertBtn').addEventListener('click', sendTestAlert);
  
  document.getElementById('deleteItemsByNameBtn').addEventListener('click', deleteItemsByName);
  document.getElementById('deleteItemsByDateBtn').addEventListener('click', deleteItemsByDateAdmin);
  document.getElementById('deleteItemsByCategoryBtn').addEventListener('click', deleteItemsByCategory);
  
  loadAdminStats();
  loadCategoriesForAdmin();
  loadEmailAlertSettings();
  loadDeleteItemsDropdowns();
}

function loadEmailAlertSettings() {
  database.ref('settings/emailAlerts').once('value', (snapshot) => {
    if (snapshot.exists()) {
      const settings = snapshot.val();
      document.getElementById('email-alerts-enabled').checked = settings.enabled || false;
      document.getElementById('alert-email').value = settings.email || 'admin@abmilitary.com';
      document.getElementById('alert-threshold').value = settings.threshold || 40;
      document.getElementById('alert-frequency').value = settings.frequency || 'daily';
      toggleEmailAlerts();
    }
  });
}

function toggleEmailAlerts() {
  const enabled = document.getElementById('email-alerts-enabled').checked;
  const statusBadge = document.getElementById('alert-status');
  statusBadge.textContent = enabled ? 'ON' : 'OFF';
  statusBadge.className = enabled ? 'status-badge status-full' : 'status-badge status-critical';
}

function saveEmailSettings() {
  const enabled = document.getElementById('email-alerts-enabled').checked;
  const email = document.getElementById('alert-email').value;
  const threshold = parseInt(document.getElementById('alert-threshold').value);
  const frequency = document.getElementById('alert-frequency').value;
  
  database.ref('settings/emailAlerts').set({
    enabled,
    email,
    threshold,
    frequency,
    updatedAt: firebase.database.ServerValue.TIMESTAMP
  }).then(() => {
    showToast('✅ Email alert settings saved', 'success');
  }).catch(error => {
    showToast('Error saving settings: ' + error.message, 'error');
  });
}

function sendTestAlert() {
  const email = document.getElementById('alert-email').value;
  const subject = '⚠️ AB Military Hotel - Low Stock Alert Test';
  const body = `This is a test alert from AB Military Hotel Store Management System.\n\nLow Stock Items:\n- Example Item 1: 15% stock remaining (CRITICAL)\n- Example Item 2: 25% stock remaining (LOW)\n\nPlease repurchase these items soon.\n\nDate: ${new Date().toLocaleString()}`;
  
  window.open(`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
  showToast('📧 Test alert email opened', 'info');
}

function loadDeleteItemsDropdowns() {
  database.ref('storeItems').once('value', (snapshot) => {
    if (snapshot.exists()) {
      const items = snapshot.val();
      const select = document.getElementById('delete-item-name');
      select.innerHTML = '';
      
      Object.entries(items).forEach(([key, item]) => {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = item.name;
        select.appendChild(option);
      });
    }
  });
  
  database.ref('categories').once('value', (snapshot) => {
    if (snapshot.exists()) {
      const categories = snapshot.val();
      const select = document.getElementById('delete-by-category');
      
      Object.values(categories).forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.name;
        option.textContent = cat.name;
        select.appendChild(option);
      });
    }
  });
}

function deleteItemsByName() {
  const select = document.getElementById('delete-item-name');
  const selected = Array.from(select.selectedOptions).map(opt => opt.value);
  
  if (selected.length === 0) {
    showToast('No items selected', 'error');
    return;
  }
  
  if (!confirm(`Delete ${selected.length} items? This will remove them from all records.`)) return;
  
  let deleted = 0;
  selected.forEach(itemKey => {
    database.ref(`storeItems/${itemKey}`).remove()
      .then(() => {
        deleted++;
        if (deleted === selected.length) {
          showToast(`✅ Deleted ${selected.length} items`, 'success');
          loadDeleteItemsDropdowns();
          loadStoreItemsTable();
        }
      })
      .catch(error => showToast('Error deleting items: ' + error.message, 'error'));
  });
}

function deleteItemsByDateAdmin() {
  const date = document.getElementById('delete-by-date').value;
  
  if (!date) {
    showToast('Please select a date', 'error');
    return;
  }
  
  if (!confirm(`Delete all items for ${date}? This cannot be undone.`)) return;
  
  database.ref(`dailyRecords/${date}`).remove()
    .then(() => showToast(`✅ Deleted all items for ${date}`, 'success'))
    .catch(error => showToast('Error deleting items: ' + error.message, 'error'));
}

function deleteItemsByCategory() {
  const category = document.getElementById('delete-by-category').value;
  
  if (!category) {
    showToast('Please select a category', 'error');
    return;
  }
  
  if (!confirm(`Delete all ${category} items from store? This cannot be undone.`)) return;
  
  database.ref('storeItems').once('value', (snapshot) => {
    if (snapshot.exists()) {
      const items = snapshot.val();
      let count = 0;
      
      Object.entries(items).forEach(([key, item]) => {
        if (item.category === category) {
          database.ref(`storeItems/${key}`).remove()
            .then(() => {
              count++;
              if (count === Object.keys(items).filter(k => items[k].category === category).length) {
                showToast(`✅ Deleted ${count} ${category} items`, 'success');
                loadDeleteItemsDropdowns();
                loadStoreItemsTable();
              }
            });
        }
      });
    }
  });
}

function loadAdminStats() {
  database.ref('storeItems').once('value', (snapshot) => {
    const count = snapshot.exists() ? Object.keys(snapshot.val()).length : 0;
    document.getElementById('adminTotalItems').textContent = count;
  });
  
  database.ref('purchaseHistory').once('value', (snapshot) => {
    const count = snapshot.exists() ? Object.keys(snapshot.val()).length : 0;
    document.getElementById('adminTotalPurchases').textContent = count;
  });
  
  database.ref('dailyRecords').once('value', (snapshot) => {
    const count = snapshot.exists() ? Object.keys(snapshot.val()).length : 0;
    document.getElementById('adminTotalDays').textContent = count;
  });
  
  document.getElementById('adminSyncStatus').textContent = 'Connected';
  document.getElementById('adminSyncStatus').className = 'status status--success';
}

function loadDeviceTracking() {
  const tbody = document.getElementById('deviceTrackingTableBody');
  const countSpan = document.getElementById('activeDeviceCount');
  
  database.ref('sessions').once('value', (snapshot) => {
    tbody.innerHTML = '';
    let activeCount = 0;
    
    if (snapshot.exists()) {
      const sessions = snapshot.val();
      
      Object.entries(sessions).forEach(([sessionId, session]) => {
        if (session.isActive) {
          activeCount++;
          
          const isCurrent = sessionId === currentSessionId || sessionId === window.currentSessionId;
          const loginTime = new Date(session.loginTime).toLocaleString('en-IN');
          const lastActive = new Date(session.lastActive).toLocaleString('en-IN');
          
          const row = tbody.insertRow();
          if (isCurrent) {
            row.style.cssText = 'background: rgba(33, 128, 141, 0.1); border: 2px solid var(--color-primary);';
          }
          
          row.innerHTML = `
            <td>
              ${session.deviceInfo}
              ${isCurrent ? '<span class="current-device-badge">⭐ CURRENT DEVICE</span>' : ''}
            </td>
            <td>${loginTime}</td>
            <td>${lastActive}</td>
            <td><span class="status status--success">Active</span></td>
            <td>
              ${isCurrent 
                ? '<span style="color: var(--color-success);">✓ You are here</span>' 
                : `<button onclick="logoutDevice('${sessionId}')" class="btn btn--sm btn--danger">🚻 Logout</button>`
              }
            </td>
          `;
        }
      });
    }
    
    countSpan.textContent = activeCount;
  });
}

function logoutDevice(sessionId) {
  if (!confirm('Logout this device? The user will be signed out immediately.')) return;
  
  database.ref(`sessions/${sessionId}/isActive`).set(false)
    .then(() => database.ref(`sessions/${sessionId}/logoutTime`).set(firebase.database.ServerValue.TIMESTAMP))
    .then(() => {
      showToast('✅ Device logged out successfully', 'success');
      loadDeviceTracking();
    })
    .catch(error => showToast('Error logging out device: ' + error.message, 'error'));
}

window.logoutDevice = logoutDevice;

function updateLockActiveDate() {
  document.getElementById('lockActiveDate').textContent = new Date(activeDate + 'T00:00:00').toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function getNextDate(dateStr) {
  // dateStr format: "2025-11-13" or "13/11/2025"
  let parts;
  if (dateStr.includes('/')) {
    // Format: "13/11/2025" -> split and reverse
    parts = dateStr.split('/');
    dateStr = parts[2] + '-' + parts[1] + '-' + parts[0];
  }
  
  const date = new Date(dateStr + 'T00:00:00');
  date.setDate(date.getDate() + 1); // Add 1 day
  
  const nextYear = date.getFullYear();
  const nextMonth = String(date.getMonth() + 1).padStart(2, '0');
  const nextDay = String(date.getDate()).padStart(2, '0');
  
  return nextYear + '-' + nextMonth + '-' + nextDay;
}

function formatDateForDisplay(dateStr) {
  // Convert "2025-11-14" to "14/11/2025" for display
  const parts = dateStr.split('-');
  return parts[2] + '/' + parts[1] + '/' + parts[0];
}

async function lockDayAndGenerateReport() {
  const currentActiveDate = activeDate;
  const nextDate = getNextDate(currentActiveDate);
  
  if (!confirm(`Lock day ${currentActiveDate}? This will:\n- Generate Excel report\n- Lock all items\n- Prepare carryover to ${nextDate}\n\nContinue?`)) return;
  
  try {
    showToast('Processing... Please wait', 'info');
    
    const daySnapshot = await database.ref(`dailyRecords/${currentActiveDate}`).once('value');
    
    if (!daySnapshot.exists()) {
      showToast('No data for this date', 'error');
      return;
    }
    
    const dayData = daySnapshot.val();
    const items = dayData.purchases || {};
    
    // CRITICAL FIX: Separate Stock in Store from Purchased Qty
    const meatCarryover = {}; // Group meat by name
    const carryoverData = {};
    
    for (const [itemKey, item] of Object.entries(items)) {
      const carryStockInStore = item.stockInStore || 0;
      const carryPurchasedQty = item.purchasedQty || 0;
      const carryTotalAvailable = carryStockInStore + carryPurchasedQty;
      const carryUsedQty = item.usedQty || 0;
      const carryRemaining = carryTotalAvailable - carryUsedQty;
      
      if (carryRemaining > 0) {
        if (item.category === 'Meat') {
          // MEAT: Accumulate all remaining (both fridge and fresh)
          if (!meatCarryover[item.itemName]) {
            meatCarryover[item.itemName] = {
              totalRemaining: 0,
              unit: item.unit,
              itemId: item.itemId,
              category: item.category,
              subcategory: item.subcategory,
              purchaseRate: item.purchaseRate
            };
          }
          meatCarryover[item.itemName].totalRemaining += carryRemaining;
          
          console.log(`🥩 ${item.itemName} ${item.type}: ${carryRemaining} ${item.unit} remaining`);
        } else {
          // NON-MEAT: Carry remaining as Stock in Store, Purchased = 0
          carryoverData[itemKey] = {
            itemId: item.itemId,
            itemName: item.itemName,
            category: item.category,
            subcategory: item.subcategory || '',
            unit: item.unit,
            stockInStore: carryRemaining,
            purchasedQty: 0,
            totalAvailable: carryRemaining,
            purchaseRate: item.purchaseRate,
            purchaseAmount: 0,
            usedQty: 0,
            expense: 0,
            remaining: carryRemaining,
            carriedFrom: currentActiveDate,
            purchaseDate: nextDate
          };
          console.log(`✅ Carried ${carryRemaining} ${item.unit} of ${item.itemName} to Stock in Store for ${nextDate}`);
        }
      }
    }
    
    // Process meat carryover: ALL goes to FRIDGE as Stock in Store
    for (const [meatName, data] of Object.entries(meatCarryover)) {
      const fridgeKey = `item_${data.itemId}_fridge`;
      
      carryoverData[fridgeKey] = {
        itemId: data.itemId,
        itemName: meatName,
        category: data.category,
        subcategory: data.subcategory,
        type: 'fridge',
        unit: data.unit,
        stockInStore: data.totalRemaining,
        purchasedQty: 0,
        totalAvailable: data.totalRemaining,
        purchaseRate: data.purchaseRate,
        purchaseAmount: 0,
        usedQty: 0,
        expense: 0,
        remaining: data.totalRemaining,
        carriedFrom: currentActiveDate,
        purchaseDate: nextDate
      };
      
      console.log(`✅ Meat Carryover: ${meatName} → ${data.totalRemaining} ${data.unit} to FRIDGE Stock in Store (next day)`);
    }
    
    
    // Generate Excel Report with Stock in Store
    const reportData = [];
    let totalStockValue = 0;
    let totalPurchased = 0;
    let totalExpense = 0;
    
    Object.values(items).forEach(item => {
      const excelStockInStore = item.stockInStore || 0;
      const excelPurchasedQty = item.purchasedQty || 0;
      const excelTotalAvailable = item.totalAvailable || (excelStockInStore + excelPurchasedQty);
      const excelRemaining = excelTotalAvailable - (item.usedQty || 0);
      
      reportData.push({
        'Item Name': item.itemName + (item.type ? ` (${item.type.toUpperCase()})` : ''),
        'Category': item.category,
        'Stock in Store': `${excelStockInStore.toFixed(2)} ${item.unit}`,
        'Purchased Today': `${excelPurchasedQty.toFixed(2)} ${item.unit}`,
        'Total Available': `${excelTotalAvailable.toFixed(2)} ${item.unit}`,
        'Purchase Rate': `₹${item.purchaseRate}`,
        'Purchase Amount': `₹${item.purchaseAmount || 0}`,
        'Used Qty': `${item.usedQty || 0} ${item.unit}`,
        'Expense': `₹${item.expense || 0}`,
        'Remaining': `${excelRemaining.toFixed(2)} ${item.unit}`
      });
      
      totalStockValue += excelStockInStore * item.purchaseRate;
      totalPurchased += item.purchaseAmount || 0;
      totalExpense += item.expense || 0;
    });
    
    // Add summary rows
    reportData.push({});
    reportData.push({
      'Item Name': 'SUMMARY',
      'Category': '',
      'Stock in Store': '',
      'Purchased Today': '',
      'Total Available': '',
      'Purchase Rate': '',
      'Purchase Amount': '',
      'Used Qty': '',
      'Expense': '',
      'Remaining': ''
    });
    reportData.push({
      'Item Name': 'Opening Stock Value',
      'Category': '',
      'Stock in Store': '',
      'Purchased Today': '',
      'Total Available': '',
      'Purchase Rate': '',
      'Purchase Amount': `₹${totalStockValue.toFixed(2)}`,
      'Used Qty': '',
      'Expense': '',
      'Remaining': ''
    });
    reportData.push({
      'Item Name': 'Today\'s Purchases',
      'Category': '',
      'Stock in Store': '',
      'Purchased Today': '',
      'Total Available': '',
      'Purchase Rate': '',
      'Purchase Amount': `₹${totalPurchased.toFixed(2)}`,
      'Used Qty': '',
      'Expense': '',
      'Remaining': ''
    });
    reportData.push({
      'Item Name': 'Total Expense',
      'Category': '',
      'Stock in Store': '',
      'Purchased Today': '',
      'Total Available': '',
      'Purchase Rate': '',
      'Purchase Amount': '',
      'Used Qty': '',
      'Expense': `₹${totalExpense.toFixed(2)}`,
      'Remaining': ''
    });
    reportData.push({
      'Item Name': 'Closing Stock Value',
      'Category': '',
      'Stock in Store': '',
      'Purchased Today': '',
      'Total Available': '',
      'Purchase Rate': '',
      'Purchase Amount': `₹${(totalStockValue + totalPurchased - totalExpense).toFixed(2)}`,
      'Used Qty': '',
      'Expense': '',
      'Remaining': ''
    });
    
    const ws = XLSX.utils.json_to_sheet(reportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, currentActiveDate);
    XLSX.writeFile(wb, `AB_Military_Report_${currentActiveDate}.xlsx`);
    
    showToast('✅ Excel report downloaded!', 'success');
    
    // Lock current day
    await database.ref(`dailyRecords/${currentActiveDate}/locked`).set(true);
    await database.ref(`dailyRecords/${currentActiveDate}/lockedTime`).set(firebase.database.ServerValue.TIMESTAMP);
    await database.ref(`dailyRecords/${currentActiveDate}/totalPurchased`).set(totalPurchased);
    await database.ref(`dailyRecords/${currentActiveDate}/totalExpense`).set(totalExpense);
    
    // FIX 8: Show "Start Next Day" button instead of immediate change
    showStartNextDayButton(nextDate, carryoverData);
    
  } catch (error) {
    console.error('Error locking day:', error);
    showToast('Error locking day: ' + error.message, 'error');
  }
}

function showStartNextDayButton(nextDate, nextDayData) {
  // Hide lock button
  document.getElementById('lockDayBtn').style.display = 'none';
  
  // Show start next day button
  const container = document.getElementById('day-lock-container');
  const button = document.createElement('button');
  button.id = 'start-next-day-btn';
  button.className = 'btn btn--primary btn--lg';
  button.style.cssText = 'margin-top: 16px; font-size: 18px; padding: 15px 30px;';
  
  // Format date for display (DD/MM/YYYY)
  const displayDate = formatDateForDisplay(nextDate);
  button.innerHTML = `🚀 Start Next Day (${displayDate}) - Press Enter`;
  
  button.onclick = () => startNextDay(nextDate, nextDayData);
  
  // Add keyboard listener for Enter key
  const handleEnter = (e) => {
    if (e.key === 'Enter' && document.getElementById('start-next-day-btn')) {
      startNextDay(nextDate, nextDayData);
      document.removeEventListener('keypress', handleEnter);
    }
  };
  document.addEventListener('keypress', handleEnter);
  
  container.appendChild(button);
  button.focus(); // Focus for immediate Enter press
  
  showToast('Day locked! Press Enter to start ' + displayDate, 'success');
}

async function startNextDay(nextDate, nextDayData) {
  try {
    showToast('Starting next day... Please wait', 'info');
    
    // Create next day with carried data
    if (Object.keys(nextDayData).length > 0) {
      await database.ref(`dailyRecords/${nextDate}/purchases`).set(nextDayData);
      await database.ref(`dailyRecords/${nextDate}/createdFrom`).set(activeDate);
    }
    
    // Update active date
    await database.ref('settings/activeDate').set(nextDate);
    activeDate = nextDate;
    
    // Update UI
    document.getElementById('activeDateInput').value = nextDate;
    updateActiveDateDisplay();
    updateLockActiveDate();
    
    // Remove start next day button, show lock button again
    const startBtn = document.getElementById('start-next-day-btn');
    if (startBtn) startBtn.remove();
    document.getElementById('lockDayBtn').style.display = 'inline-block';
    
    showToast(`✅ Welcome to ${nextDate}! All quantities carried forward.`, 'success');
    
    // Reload pages
    loadDashboardMetrics();
    loadViewItems();
    
  } catch (error) {
    console.error('Error starting next day:', error);
    showToast('Error: ' + error.message, 'error');
  }
}

// Setup Day Lock button (FIX 8: Two-step day lock process)
setTimeout(() => {
  const lockBtn = document.getElementById('lockDayBtn');
  if (lockBtn && !lockBtn.dataset.initialized) {
    lockBtn.dataset.initialized = 'true';
    lockBtn.addEventListener('click', lockDayAndGenerateReport);
  }
}, 500);

// Make functions global for onclick handlers
window.startNextDay = startNextDay;
window.viewDayReportFromMonth = viewDayReportFromMonth;
window.formatDateDisplay = formatDateDisplay;
window.toggleTotalSortOrder = toggleTotalSortOrder;
window.sortTotalItems = sortTotalItems;

function resetItemIds() {
  if (!confirm('This will reassign sequential IDs to all items. Continue?')) return;
  
  database.ref('storeItems').once('value', (snapshot) => {
    if (snapshot.exists()) {
      const items = Object.entries(snapshot.val());
      items.forEach(([key, item], index) => {
        database.ref(`storeItems/${key}`).update({ id: index + 1 });
      });
      showToast('Item IDs reset successfully');
      loadStoreItemsTable();
    }
  });
}

function exportAllData() {
  database.ref('/').once('value', (snapshot) => {
    const data = snapshot.val();
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ab-military-store-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    showToast('Data exported successfully');
  });
}

function copyItemsToDate() {
  const date = prompt('Enter date (YYYY-MM-DD):');
  if (!date) return;
  
  database.ref('storeItems').once('value', (snapshot) => {
    if (snapshot.exists()) {
      const items = snapshot.val();
      
      Object.entries(items).forEach(([key, item]) => {
        const purchase = {
          itemId: item.id,
          itemName: item.name,
          category: item.category,
          unit: item.unit,
          purchasedQty: 0,
          purchaseRate: 0,
          purchaseAmount: 0,
          usedQty: 0,
          expense: 0
        };
        
        database.ref(`dailyRecords/${date}/purchases/${key}`).set(purchase);
      });
      
      showToast('Items copied to date successfully');
    }
  });
}

function deleteItemsByDate() {
  const date = prompt('Enter date to delete (YYYY-MM-DD):');
  if (!date) return;
  
  if (confirm(`Are you sure you want to delete all items for ${date}?`)) {
    database.ref(`dailyRecords/${date}`).remove()
      .then(() => showToast('Items deleted successfully'))
      .catch(error => showToast('Error deleting items: ' + error.message, 'error'));
  }
}

function importJsonData() {
  const fileInput = document.getElementById('importJsonFile');
  const file = fileInput.files[0];
  
  if (!file) {
    showToast('Please select a file', 'error');
    return;
  }
  
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      
      if (confirm('This will overwrite existing data. Continue?')) {
        database.ref('/').set(data)
          .then(() => {
            showToast('Data imported successfully');
            location.reload();
          })
          .catch(error => showToast('Error importing data: ' + error.message, 'error'));
      }
    } catch (error) {
      showToast('Invalid JSON file: ' + error.message, 'error');
    }
  };
  
  reader.readAsText(file);
}

// Make functions global for onclick handlers
window.editDayItem = editDayItem;
window.deleteDayItem = deleteDayItem;
window.deleteDayItemWithConfirm = deleteDayItemWithConfirm;
window.editTotalItem = editTotalItem;
window.deleteTotalItem = deleteTotalItem;
window.deleteStoreItem = deleteStoreItem;
window.saveItemEdit = saveItemEdit;
window.closeEditModal = closeEditModal;

// Export Functions
function exportToJSON(type) {
  let data, filename;
  
  if (type === 'dayItems') {
    database.ref(`dailyRecords/${activeDate}/purchases`).once('value', (snapshot) => {
      data = snapshot.val() || {};
      filename = `day-items-${activeDate}.json`;
      downloadJSON(data, filename);
    });
  } else if (type === 'totalItems') {
    database.ref('storeItems').once('value', (snapshot) => {
      data = snapshot.val() || {};
      filename = 'total-items.json';
      downloadJSON(data, filename);
    });
  } else if (type === 'dayReport') {
    const reportDate = document.getElementById('dayReportDate').value;
    database.ref(`dailyRecords/${reportDate}`).once('value', (snapshot) => {
      data = snapshot.val() || {};
      filename = `day-report-${reportDate}.json`;
      downloadJSON(data, filename);
    });
  }
}

function downloadJSON(data, filename) {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  showToast('JSON exported successfully');
}

function exportDayReportToExcel() {
  const reportDate = document.getElementById('dayReportDate').value;
  
  database.ref(`dailyRecords/${reportDate}/purchases`).once('value', (snapshot) => {
    if (!snapshot.exists()) {
      showToast('No data to export', 'error');
      return;
    }
    
    const items = Object.values(snapshot.val());
    const data = items.map(item => ({
      'Item': item.itemName,
      'Category': item.category,
      'Purchased Qty': item.purchasedQty,
      'Used Qty': item.usedQty || 0,
      'Purchase Rate': item.purchaseRate,
      'Expense': (item.expense || 0).toFixed(2)
    }));
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Day Report');
    XLSX.writeFile(wb, `day-report-${reportDate}.xlsx`);
    showToast('Excel exported successfully');
  });
}

function exportDayReportToCSV() {
  const reportDate = document.getElementById('dayReportDate').value;
  
  database.ref(`dailyRecords/${reportDate}/purchases`).once('value', (snapshot) => {
    if (!snapshot.exists()) {
      showToast('No data to export', 'error');
      return;
    }
    
    const items = Object.values(snapshot.val());
    let csv = 'Item,Category,Purchased Qty,Used Qty,Purchase Rate,Expense\n';
    
    items.forEach(item => {
      csv += `${item.itemName},${item.category},${item.purchasedQty},${item.usedQty || 0},${item.purchaseRate},${(item.expense || 0).toFixed(2)}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `day-report-${reportDate}.csv`;
    a.click();
    showToast('CSV exported successfully');
  });
}

function exportMonthReportToExcel() {
  const monthValue = document.getElementById('monthReportMonth').value;
  const [year, month] = monthValue.split('-');
  const startDate = `${year}-${month}-01`;
  const endDate = `${year}-${month}-31`;
  
  database.ref('dailyRecords').once('value', (snapshot) => {
    const dailyData = [];
    
    if (snapshot.exists()) {
      const records = snapshot.val();
      
      Object.entries(records).forEach(([date, data]) => {
        if (date >= startDate && date <= endDate) {
          dailyData.push({
            'Date': new Date(date + 'T00:00:00').toLocaleDateString('en-IN'),
            'Items Purchased': data.purchases ? Object.keys(data.purchases).length : 0,
            'Items Used': data.purchases ? Object.values(data.purchases).filter(i => i.usedQty > 0).length : 0,
            'Daily Expense': (data.totalExpense || 0).toFixed(2),
            'Purchased Amount': (data.totalPurchased || 0).toFixed(2),
            'Investment Bills': (data.investmentBills || 0).toFixed(2)
          });
        }
      });
    }
    
    const ws = XLSX.utils.json_to_sheet(dailyData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Month Report');
    XLSX.writeFile(wb, `month-report-${monthValue}.xlsx`);
    showToast('Excel exported successfully');
  });
}

function exportMonthReportToCSV() {
  const monthValue = document.getElementById('monthReportMonth').value;
  const [year, month] = monthValue.split('-');
  const startDate = `${year}-${month}-01`;
  const endDate = `${year}-${month}-31`;
  
  database.ref('dailyRecords').once('value', (snapshot) => {
    let csv = 'Date,Items Purchased,Items Used,Daily Expense,Purchased Amount,Investment Bills\n';
    
    if (snapshot.exists()) {
      const records = snapshot.val();
      
      Object.entries(records).forEach(([date, data]) => {
        if (date >= startDate && date <= endDate) {
          const itemsPurchased = data.purchases ? Object.keys(data.purchases).length : 0;
          const itemsUsed = data.purchases ? Object.values(data.purchases).filter(i => i.usedQty > 0).length : 0;
          csv += `${new Date(date + 'T00:00:00').toLocaleDateString('en-IN')},${itemsPurchased},${itemsUsed},${(data.totalExpense || 0).toFixed(2)},${(data.totalPurchased || 0).toFixed(2)},${(data.investmentBills || 0).toFixed(2)}\n`;
        }
      });
    }
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `month-report-${monthValue}.csv`;
    a.click();
    showToast('CSV exported successfully');
  });
}

function exportPurchaseReportToExcel() {
  database.ref('purchaseHistory').once('value', (snapshot) => {
    if (!snapshot.exists()) {
      showToast('No data to export', 'error');
      return;
    }
    
    const purchases = Object.values(snapshot.val());
    const data = purchases.map(p => ({
      'Purchase Date': new Date(p.date + 'T00:00:00').toLocaleDateString('en-IN'),
      'Item Name': p.itemName,
      'Category': p.category,
      'Quantity': p.quantity,
      'Unit': p.unit,
      'Purchase Rate': p.rate,
      'Total Amount': p.amount.toFixed(2)
    }));
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Purchase Report');
    XLSX.writeFile(wb, 'purchase-report.xlsx');
    showToast('Excel exported successfully');
  });
}

function exportPurchaseReportToCSV() {
  database.ref('purchaseHistory').once('value', (snapshot) => {
    if (!snapshot.exists()) {
      showToast('No data to export', 'error');
      return;
    }
    
    const purchases = Object.values(snapshot.val());
    let csv = 'Purchase Date,Item Name,Category,Quantity,Unit,Purchase Rate,Total Amount\n';
    
    purchases.forEach(p => {
      csv += `${new Date(p.date + 'T00:00:00').toLocaleDateString('en-IN')},${p.itemName},${p.category},${p.quantity},${p.unit},${p.rate},${p.amount.toFixed(2)}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'purchase-report.csv';
    a.click();
    showToast('CSV exported successfully');
  });
}