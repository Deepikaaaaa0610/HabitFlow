// ========================================
// HABITFLOW - VANILLA JAVASCRIPT TRACKER
// ========================================

// Wait for DOM to be fully loaded
window.addEventListener('DOMContentLoaded', function() {
    
    // ===== STATE =====
    let habits = [];
    let currentFilter = 'all';

    // ===== DOM ELEMENTS =====
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

    // ===== LOAD FROM STORAGE =====
    function loadFromStorage() {
        const stored = localStorage.getItem('habitflow_habits');
        if (stored) {
            try {
                habits = JSON.parse(stored);
            } catch (e) {
                habits = [];
            }
        }
    }

    // ===== SAVE TO STORAGE =====
    function saveToStorage() {
        localStorage.setItem('habitflow_habits', JSON.stringify(habits));
    }

    // ===== ADD HABIT =====
    function addHabit() {
        const name = habitNameInput.value.trim();
        const category = habitCategorySelect.value;

        if (!name) {
            showError('Please enter a habit name!');
            return;
        }

        if (name.length < 3) {
            showError('Habit name must be at least 3 characters!');
            return;
        }

        const newHabit = {
            id: Date.now(),
            name: name,
            category: category,
            completed: false,
            createdAt: new Date().toISOString(),
            streak: 0
        };

        habits.push(newHabit);
        saveToStorage();
        renderHabits();
        updateStats();

        habitNameInput.value = '';
        hideError();
        showToast('Habit added successfully! 🎉');
    }

    // ===== RENDER HABITS =====
    function renderHabits() {
        habitsContainer.innerHTML = '';
        
        let filtered = habits;
        if (currentFilter === 'active') {
            filtered = habits.filter(h => !h.completed);
        } else if (currentFilter === 'completed') {
            filtered = habits.filter(h => h.completed);
        }

        if (filtered.length === 0) {
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';

        filtered.forEach(habit => {
            const card = document.createElement('div');
            card.className = 'habit-card' + (habit.completed ? ' completed' : '');
            card.dataset.id = habit.id;

            const category = document.createElement('div');
            category.className = 'habit-category';
            category.textContent = getCategoryLabel(habit.category);

            const name = document.createElement('div');
            name.className = 'habit-name';
            name.textContent = habit.name;

            const meta = document.createElement('div');
            meta.className = 'habit-meta';
            meta.innerHTML = `<span>📅 ${formatDate(habit.createdAt)}</span><span>🔥 ${habit.streak} days</span>`;

            const actions = document.createElement('div');
            actions.className = 'habit-actions';

            const completeBtn = document.createElement('button');
            completeBtn.className = 'btn-complete';
            completeBtn.textContent = habit.completed ? '✓ Completed' : 'Mark Complete';
            completeBtn.onclick = () => toggleComplete(habit.id);

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'btn-delete';
            deleteBtn.textContent = '🗑️ Delete';
            deleteBtn.onclick = () => deleteHabit(habit.id);

            actions.appendChild(completeBtn);
            actions.appendChild(deleteBtn);

            card.appendChild(category);
            card.appendChild(name);
            card.appendChild(meta);
            card.appendChild(actions);

            habitsContainer.appendChild(card);
        });
    }

    // ===== TOGGLE COMPLETE =====
    function toggleComplete(id) {
        const habit = habits.find(h => h.id === id);
        if (!habit) return;

        habit.completed = !habit.completed;
        if (habit.completed) {
            habit.streak++;
        }

        saveToStorage();
        renderHabits();
        updateStats();
        showToast(habit.completed ? 'Habit completed! 🎉' : 'Marked incomplete');
    }

    // ===== DELETE HABIT =====
    function deleteHabit(id) {
        const habit = habits.find(h => h.id === id);
        if (!habit) return;

        if (!confirm(`Delete "${habit.name}"?`)) return;

        habits = habits.filter(h => h.id !== id);
        saveToStorage();
        renderHabits();
        updateStats();
        showToast('Habit deleted');
    }

    // ===== UPDATE STATS =====
    function updateStats() {
        const total = habits.length;
        const completed = habits.filter(h => h.completed).length;
        const maxStreak = habits.length > 0 ? Math.max(...habits.map(h => h.streak)) : 0;

        totalHabitsEl.textContent = total;
        completedTodayEl.textContent = completed;
        streakCountEl.textContent = maxStreak;

        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
        progressBar.style.width = percentage + '%';
        progressPercent.textContent = percentage + '%';
    }

    // ===== FILTER =====
    function setFilter(filter) {
        currentFilter = filter;
        filterBtns.forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
        renderHabits();
    }

    // ===== HELPERS =====
    function getCategoryLabel(cat) {
        const labels = {
            health: '🏃 Health & Fitness',
            productivity: '💼 Productivity',
            mindfulness: '🧘 Mindfulness',
            learning: '📚 Learning',
            creative: '🎨 Creative'
        };
        return labels[cat] || cat;
    }

    function formatDate(iso) {
        const date = new Date(iso);
        const now = new Date();
        const diff = Math.floor((now - date) / (1000 * 60 * 60 * 24));
        
        if (diff === 0) return 'Today';
        if (diff === 1) return 'Yesterday';
        if (diff < 7) return diff + ' days ago';
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    function showError(msg) {
        errorMessage.textContent = msg;
        errorMessage.style.display = 'block';
    }

    function hideError() {
        errorMessage.style.display = 'none';
    }

    function showToast(msg) {
        toast.textContent = msg;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
    }

    // ===== EVENT LISTENERS =====
    addHabitBtn.addEventListener('click', addHabit);
    
    habitNameInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') addHabit();
    });

    habitNameInput.addEventListener('input', hideError);

    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            setFilter(this.dataset.filter);
        });
    });

    // ===== INITIALIZE =====
    loadFromStorage();
    renderHabits();
    updateStats();

    console.log('HabitFlow initialized successfully!');
});
