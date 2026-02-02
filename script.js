// ========================================
// HABITFLOW - VANILLA JAVASCRIPT TRACKER
// ========================================

// ===== STATE MANAGEMENT =====
let habits = [];
let currentFilter = 'all';

// ===== DOM ELEMENT REFERENCES =====
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
function init() {
    loadHabitsFromStorage();
    renderHabits();
    updateStats();
    setupEventListeners();
}

// ===== EVENT LISTENERS SETUP =====
function setupEventListeners() {
    addHabitBtn.addEventListener('click', handleAddHabit);
    
    habitNameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleAddHabit();
        }
    });
    
    habitNameInput.addEventListener('input', hideError);
    habitsContainer.addEventListener('click', handleHabitAction);
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', handleFilter);
    });
}

// ===== LOCALSTORAGE FUNCTIONS =====
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

function saveHabitsToStorage() {
    try {
        localStorage.setItem('habitflow_habits', JSON.stringify(habits));
    } catch (error) {
        console.error('Error saving to localStorage:', error);
        showToast('Failed to save data!');
    }
}

// ===== ADD HABIT FUNCTION =====
function handleAddHabit() {
    const name = habitNameInput.value.trim();
    const category = habitCategorySelect.value;

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

    const newHabit = {
        id: Date.now(),
        name: name,
        category: category,
        completed: false,
        createdAt: new Date().toISOString(),
        completedAt: null,
        streak: 0
    };

    habits.push(newHabit);
    saveHabitsToStorage();
    renderHabits();
    updateStats();

    habitNameInput.value = '';
    habitCategorySelect.selectedIndex = 0;
    hideError();
    showToast('Habit added successfully! 🎉');
}

// ===== RENDER HABITS FUNCTION =====
function renderHabits() {
    habitsContainer.innerHTML = '';
    let filteredHabits = getFilteredHabits();

    if (filteredHabits.length === 0) {
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';

    filteredHabits.forEach(habit => {
        const habitCard = createHabitCard(habit);
        habitsContainer.appendChild(habitCard);
    });
}

function getFilteredHabits() {
    if (currentFilter === 'active') {
        return habits.filter(h => !h.completed);
    } else if (currentFilter === 'completed') {
        return habits.filter(h => h.completed);
    }
    return habits;
}

// ===== CREATE HABIT CARD FUNCTION =====
function createHabitCard(habit) {
    const card = document.createElement('div');
    card.className = `habit-card ${habit.completed ? 'completed' : ''}`;
    card.dataset.id = habit.id;

    const categoryBadge = document.createElement('div');
    categoryBadge.className = 'habit-category';
    categoryBadge.textContent = getCategoryLabel(habit.category);

    const habitName = document.createElement('div');
    habitName.className = 'habit-name';
    habitName.textContent = habit.name;

    const metaDiv = document.createElement('div');
    metaDiv.className = 'habit-meta';

    const createdDate = document.createElement('span');
    createdDate.textContent = `📅 ${formatDate(habit.createdAt)}`;

    const streakInfo = document.createElement('span');
    streakInfo.textContent = `🔥 ${habit.streak} day${habit.streak !== 1 ? 's' : ''}`;

    metaDiv.appendChild(createdDate);
    metaDiv.appendChild(streakInfo);

    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'habit-actions';

    const completeBtn = document.createElement('button');
    completeBtn.className = 'btn-complete';
    completeBtn.textContent = habit.completed ? '✓ Completed' : 'Mark Complete';
    completeBtn.dataset.action = 'complete';

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn-delete';
    deleteBtn.textContent = '🗑️ Delete';
    deleteBtn.dataset.action = 'delete';

    actionsDiv.appendChild(completeBtn);
    actionsDiv.appendChild(deleteBtn);

    card.appendChild(categoryBadge);
    card.appendChild(habitName);
    card.appendChild(metaDiv);
    card.appendChild(actionsDiv);

    return card;
}

// ===== HANDLE HABIT ACTIONS =====
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
function toggleHabitComplete(habitId) {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    habit.completed = !habit.completed;

    if (habit.completed) {
        habit.completedAt = new Date().toISOString();
        habit.streak += 1;
    } else {
        habit.completedAt = null;
    }

    saveHabitsToStorage();
    renderHabits();
    updateStats();

    showToast(habit.completed ? 'Habit completed! 🎉' : 'Habit marked as incomplete');
}

// ===== DELETE HABIT FUNCTION =====
function deleteHabit(habitId) {
    const habitIndex = habits.findIndex(h => h.id === habitId);
    if (habitIndex === -1) return;

    const habitName = habits[habitIndex].name;

    if (!confirm(`Are you sure you want to delete "${habitName}"?`)) {
        return;
    }

    habits.splice(habitIndex, 1);
    saveHabitsToStorage();
    renderHabits();
    updateStats();

    showToast('Habit deleted successfully');
}

// ===== UPDATE STATS FUNCTION =====
function updateStats() {
    const total = habits.length;
    const completed = habits.filter(h => h.completed).length;
    const maxStreak = habits.length > 0 ? Math.max(...habits.map(h => h.streak)) : 0;

    totalHabitsEl.textContent = total;
    completedTodayEl.textContent = completed;
    streakCountEl.textContent = maxStreak;

    updateProgressBar(total, completed);
}

// ===== UPDATE PROGRESS BAR =====
function updateProgressBar(total, completed) {
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    progressBar.style.width = `${percentage}%`;
    progressPercent.textContent = `${percentage}%`;
}

// ===== FILTER HANDLERS =====
function handleFilter(e) {
    const button = e.target;
    const filter = button.dataset.filter;

    filterBtns.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');

    currentFilter = filter;
    renderHabits();
}

// ===== HELPER FUNCTIONS =====
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

function formatDate(isoString) {
    const date = new Date(isoString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
}

function hideError() {
    errorMessage.style.display = 'none';
}

function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ===== INITIALIZE APP =====
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
});
