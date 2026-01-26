// ========================================
// HABITFLOW - VANILLA JAVASCRIPT TRACKER
// ========================================
// This application demonstrates core DOM manipulation concepts:
// - Dynamic element creation with createElement()
// - Event delegation for efficient event handling
// - Class manipulation for visual state changes
// - LocalStorage for data persistence
// - State management with vanilla JavaScript
// ========================================

// ===== STATE MANAGEMENT =====
// Main habits array - central source of truth for all habit data
let habits = [];

// Current active filter (all, active, or completed)
let currentFilter = 'all';

// ===== DOM ELEMENT REFERENCES =====
// Cache DOM elements for better performance
const habitNameInput = document.getElementById('habitName');
const habitCategorySelect = document.getElementById('habitCategory');
const addHabitBtn = document.getElementById('addHabitBtn');
const habitsContainer = document.getElementById('habitsContainer');
const emptyState = document.getElementById('emptyState');
const errorMessage = document.getElementById('errorMessage');
const toast = document.getElementById('toast');
const totalHabitsEl = document.getElementById('totalHabits');
const completedTodayEl = document.getElementById('completedToday');
const streakCountEl = document.getElementById('streakCount');
const progressBar = document.getElementById('progressBar');
const progressPercent = document.getElementById('progressPercent');
const filterBtns = document.querySelectorAll('.filter-btn');

// ===== INITIALIZATION =====
// Initialize app when DOM is fully loaded
document.addEventListener('DOMContentLoaded', init);

function init() {
    loadHabitsFromStorage();
    renderHabits();
    updateStats();
    setupEventListeners();
}

// ===== EVENT LISTENERS SETUP =====
// Centralized event listener setup
function setupEventListeners() {
    // Add habit button click
    addHabitBtn.addEventListener('click', handleAddHabit);

    // Enter key support for adding habits
    habitNameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleAddHabit();
        }
    });

    // Clear error on input
    habitNameInput.addEventListener('input', hideError);

    // Event delegation for habit actions (complete/delete)
    // This is more efficient than adding listeners to each button
    habitsContainer.addEventListener('click', handleHabitAction);

    // Filter button click handlers
    filterBtns.forEach(btn => {
        btn.addEventListener('click', handleFilter);
    });
}

// ===== LOCALSTORAGE FUNCTIONS =====
// Load habits from localStorage
function loadHabitsFromStorage() {
    const stored = localStorage.getItem('habitflow_habits');
    if (stored) {
        try {
            habits = JSON.parse(stored);
        } catch (error) {
            console.error('Error parsing stored habits:', error);
            habits = [];
        }
    }
}

// Save habits to localStorage
function saveHabitsToStorage() {
    try {
        localStorage.setItem('habitflow_habits', JSON.stringify(habits));
    } catch (error) {
        console.error('Error saving to localStorage:', error);
        showToast('Failed to save data!', 'error');
    }
}

// ===== ADD HABIT FUNCTION =====
// Handle adding a new habit
function handleAddHabit() {
    const name = habitNameInput.value.trim();
    const category = habitCategorySelect.value;

    // Input validation
    if (!name) {
        showError('Please enter a habit name!');
        habitNameInput.focus();
        return;
    }

    if (name.length < 3) {
        showError('Habit name must be at least 3 characters!');
        habitNameInput.focus();
        return;
    }

    if (name.length > 50) {
        showError('Habit name is too long (max 50 characters)!');
        habitNameInput.focus();
        return;
    }

    // Create new habit object
    const newHabit = {
        id: Date.now(), // Unique ID using timestamp
        name: name,
        category: category,
        completed: false,
        createdAt: new Date().toISOString(),
        completedAt: null,
        streak: 0
    };

    // Add to state
    habits.push(newHabit);

    // Persist to localStorage
    saveHabitsToStorage();

    // Update DOM
    renderHabits();
    updateStats();

    // Reset form
    habitNameInput.value = '';
    habitCategorySelect.selectedIndex = 0;
    hideError();

    // Show success feedback
    showToast('Habit added successfully! 🎉', 'success');
}

// ===== RENDER HABITS FUNCTION =====
// Main rendering function - demonstrates DOM manipulation depth
function renderHabits() {
    // Clear existing content
    habitsContainer.innerHTML = '';

    // Filter habits based on current filter
    let filteredHabits = getFilteredHabits();

    // Show/hide empty state based on filtered results
    if (filteredHabits.length === 0) {
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';

    // Create and append habit cards
    // Each habit gets its own dynamically created card
    filteredHabits.forEach(habit => {
        const habitCard = createHabitCard(habit);
        habitsContainer.appendChild(habitCard);
    });
}

// ===== GET FILTERED HABITS =====
// Filter habits based on current filter state
function getFilteredHabits() {
    if (currentFilter === 'active') {
        return habits.filter(h => !h.completed);
    } else if (currentFilter === 'completed') {
        return habits.filter(h => h.completed);
    }
    return habits; // 'all' filter
}

// ===== CREATE HABIT CARD FUNCTION =====
// DOM Manipulation: Dynamically creates habit card elements
// This demonstrates complex DOM creation with multiple child elements
function createHabitCard(habit) {
    // Create main card container
    const card = document.createElement('div');
    card.className = `habit-card ${habit.completed ? 'completed' : ''}`;
    card.dataset.id = habit.id; // Store ID in data attribute for event delegation

    // Create category badge
    const categoryBadge = document.createElement('div');
    categoryBadge.className = 'habit-category';
    categoryBadge.textContent = getCategoryLabel(habit.category);

    // Create habit name heading
    const habitName = document.createElement('div');
    habitName.className = 'habit-name';
    habitName.textContent = habit.name;

    // Create metadata section
    const metaDiv = document.createElement('div');
    metaDiv.className = 'habit-meta';

    const createdDate = document.createElement('span');
    createdDate.textContent = `📅 ${formatDate(habit.createdAt)}`;

    const streakInfo = document.createElement('span');
    streakInfo.textContent = `🔥 ${habit.streak} day${habit.streak !== 1 ? 's' : ''}`;

    metaDiv.appendChild(createdDate);
    metaDiv.appendChild(streakInfo);

    // Create actions container
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'habit-actions';

    // Complete button - changes based on completion status
    const completeBtn = document.createElement('button');
    completeBtn.className = 'btn-complete';
    completeBtn.textContent = habit.completed ? '✓ Completed' : 'Mark Complete';
    completeBtn.dataset.action = 'complete'; // For event delegation

    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn-delete';
    deleteBtn.textContent = '🗑️ Delete';
    deleteBtn.dataset.action = 'delete'; // For event delegation

    actionsDiv.appendChild(completeBtn);
    actionsDiv.appendChild(deleteBtn);

    // Assemble all parts into the card
    card.appendChild(categoryBadge);
    card.appendChild(habitName);
    card.appendChild(metaDiv);
    card.appendChild(actionsDiv);

    return card;
}

// ===== HANDLE HABIT ACTIONS =====
// Event delegation: Handle clicks on dynamically created buttons
// This is more efficient than adding individual listeners
function handleHabitAction(e) {
    const button = e.target.closest('button');
    if (!button) return;

    const card = button.closest('.habit-card');
    if (!card) return;

    const habitId = parseInt(card.dataset.id);
    const action = button.dataset.action;

    if (action === 'complete') {
        toggleHabitComplete(habitId);
    } else if (action === 'delete') {
        deleteHabit(habitId);
    }
}

// ===== TOGGLE COMPLETE FUNCTION =====
// Toggle completion status - demonstrates class manipulation
function toggleHabitComplete(habitId) {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    // Toggle completed state
    habit.completed = !habit.completed;

    // Update metadata
    if (habit.completed) {
        habit.completedAt = new Date().toISOString();
        habit.streak += 1;
    } else {
        habit.completedAt = null;
    }

    // Persist changes
    saveHabitsToStorage();

    // Re-render to update DOM classes and structure
    renderHabits();
    updateStats();

    // User feedback
    showToast(
        habit.completed ? 'Habit completed! 🎉' : 'Habit marked as incomplete',
        habit.completed ? 'success' : 'info'
    );
}

// ===== DELETE HABIT FUNCTION =====
// Remove habit from state and update DOM
function deleteHabit(habitId) {
    const habitIndex = habits.findIndex(h => h.id === habitId);
    if (habitIndex === -1) return;

    const habitName = habits[habitIndex].name;

    // Confirm deletion
    if (!confirm(`Are you sure you want to delete "${habitName}"?`)) {
        return;
    }

    // Remove from array
    habits.splice(habitIndex, 1);

    // Persist changes
    saveHabitsToStorage();

    // Update DOM
    renderHabits();
    updateStats();

    showToast('Habit deleted successfully', 'info');
}

// ===== UPDATE STATS FUNCTION =====
// Update dashboard statistics - demonstrates DOM content updates
function updateStats() {
    const total = habits.length;
    const completed = habits.filter(h => h.completed).length;
    const maxStreak = habits.length > 0 
        ? Math.max(...habits.map(h => h.streak)) 
        : 0;

    // Update stat values with animation trigger
    animateValue(totalHabitsEl, parseInt(totalHabitsEl.textContent) || 0, total, 500);
    animateValue(completedTodayEl, parseInt(completedTodayEl.textContent) || 0, completed, 500);
    animateValue(streakCountEl, parseInt(streakCountEl.textContent) || 0, maxStreak, 500);

    // Update progress bar
    updateProgressBar(total, completed);
}

// ===== ANIMATE VALUE FUNCTION =====
// Smooth number animation for stats
function animateValue(element, start, end, duration) {
    const range = end - start;
    const increment = range / (duration / 16); // 60fps
    let current = start;

    const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
            current = end;
            clearInterval(timer);
        }
        element.textContent = Math.round(current);
    }, 16);
}

// ===== UPDATE PROGRESS BAR =====
// Update progress bar width and percentage
function updateProgressBar(total, completed) {
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    // Update bar width with CSS transition
    progressBar.style.width = `${percentage}%`;
    progressPercent.textContent = `${percentage}%`;
}

// ===== FILTER HANDLERS =====
// Handle filter button clicks
function handleFilter(e) {
    const button = e.target;
    const filter = button.dataset.filter;

    // Update active state on buttons
    filterBtns.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');

    // Update filter state and re-render
    currentFilter = filter;
    renderHabits();
}

// ===== HELPER FUNCTIONS =====

// Get category display label
function getCategoryLabel(category) {
    const labels = {
        health: '🏃 Health & Fitness',
        productivity: '💼 Productivity',
        mindfulness: '🧘 Mindfulness',
        learning: '📚 Learning',
        creative: '🎨 Creative'
    };
    return labels[category] || category;
}

// Format date for display
function formatDate(isoString) {
    const date = new Date(isoString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
    });
}

// Show error message with animation
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
}

// Hide error message
function hideError() {
    errorMessage.style.display = 'none';
}

// Show toast notification
function showToast(message, type = 'info') {
    toast.textContent = message;
    toast.classList.add('show');

    // Auto-hide after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ===== KEYBOARD SHORTCUTS =====
// Add keyboard shortcut for quick access
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + N to focus on input
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        habitNameInput.focus();
    }
});