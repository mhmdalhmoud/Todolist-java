// UI Components - Handles all UI-related functionality

class TodoUI {
    constructor(todoService) {
        this.todoService = todoService;
        this.tasks = [];
        this.filteredTasks = [];
        
        // DOM elements
        this.tasksContainer = document.getElementById('tasks-container');
        this.currentListTitle = document.getElementById('current-list-title');
        this.addTaskForm = document.getElementById('add-task-form');
        this.taskInput = document.getElementById('task-input');
        this.taskDueDate = document.getElementById('task-due-date');
        this.taskPriority = document.getElementById('task-priority');
        this.searchInput = document.getElementById('search-input');
        this.clearSearchBtn = document.getElementById('clear-search');
        this.filterPriority = document.getElementById('filter-priority');
        this.sortBy = document.getElementById('sort-by');
        
        // Modal elements
        this.editTaskModal = document.getElementById('edit-task-modal');
        this.editTaskForm = document.getElementById('edit-task-form');
        this.editTaskId = document.getElementById('edit-task-id');
        this.editTaskText = document.getElementById('edit-task-text');
        this.editTaskDueDate = document.getElementById('edit-task-due-date');
        this.editTaskPriority = document.getElementById('edit-task-priority');
        this.closeEditModalBtn = document.getElementById('close-edit-modal');
        
        // Set today's date as default for the date pickers
        try {
            const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
            if (this.taskDueDate) {
                this.taskDueDate.value = today;
            }
            if (this.editTaskDueDate) {
                this.editTaskDueDate.value = today;
            }
        } catch (e) {
            console.error('Error setting default date:', e);
        }
        
        // Initialize event listeners
        this.initEventListeners();
        
        // Load initial data
        this.loadTasks();
    }
    
    // Initialize all event listeners
    initEventListeners() {
        // Task event listeners
        this.addTaskForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAddTask();
        });
        
        // Search and filter event listeners
        this.searchInput.addEventListener('input', () => {
            this.applyFiltersAndRenderTasks();
        });
        
        this.clearSearchBtn.addEventListener('click', () => {
            this.searchInput.value = '';
            this.applyFiltersAndRenderTasks();
        });
        
        this.filterPriority.addEventListener('change', () => {
            this.applyFiltersAndRenderTasks();
        });
        
        this.sortBy.addEventListener('change', () => {
            this.applyFiltersAndRenderTasks();
        });
        
        // Modal event listeners
        this.closeEditModalBtn.addEventListener('click', () => {
            this.hideEditModal();
        });
        
        this.editTaskForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleUpdateTask();
        });
    }
    
    // ==================== Task UI Methods ====================
    
    // Load all tasks from the service
    loadTasks() {
        this.todoService.getAllTasks((tasks) => {
            this.tasks = tasks;
            this.applyFiltersAndRenderTasks();
        });
    }
    
    // Apply all filters and sorting to tasks and render them
    applyFiltersAndRenderTasks() {
        let filtered = [...this.tasks];
        
        // Apply search filter
        const searchQuery = this.searchInput.value.toLowerCase().trim();
        if (searchQuery) {
            filtered = filtered.filter(task => 
                task.text.toLowerCase().includes(searchQuery)
            );
        }
        
        // Apply priority filter
        const priorityFilter = this.filterPriority.value;
        if (priorityFilter) {
            filtered = filtered.filter(task => 
                task.priority === priorityFilter
            );
        }
        
        // Apply sorting
        const sortOption = this.sortBy.value;
        if (sortOption === 'date') {
            filtered.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
        } else if (sortOption === 'priority') {
            const priorityWeight = { high: 3, medium: 2, low: 1 };
            filtered.sort((a, b) => priorityWeight[b.priority] - priorityWeight[a.priority]);
        } else if (sortOption === 'name') {
            filtered.sort((a, b) => a.text.localeCompare(b.text));
        }
        
        this.filteredTasks = filtered;
        this.renderTasks();
    }
    
    // Render the tasks list
    renderTasks() {
        this.tasksContainer.innerHTML = '';
        
        if (this.filteredTasks.length === 0) {
            const emptyMessage = document.createElement('li');
            emptyMessage.className = 'text-center text-gray-500 py-4';
            emptyMessage.textContent = 'No tasks found';
            this.tasksContainer.appendChild(emptyMessage);
            return;
        }
        
        this.filteredTasks.forEach(task => {
            const taskItem = document.createElement('li');
            taskItem.className = `bg-white border rounded-lg p-4 shadow-sm ${task.completed ? 'opacity-70' : ''}`;
            
            // Priority badge
            const priorityColors = {
                high: 'bg-red-100 text-red-800',
                medium: 'bg-yellow-100 text-yellow-800',
                low: 'bg-green-100 text-green-800'
            };
            
            // Format date for display
            let displayDate = 'No date';
            try {
                if (task.dueDate) {
                    displayDate = new Date(task.dueDate).toLocaleDateString();
                }
            } catch (e) {
                console.error('Error formatting date:', e);
                displayDate = 'Invalid date';
            }
            
            // Create safer HTML structure
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'mt-1';
            if (task.completed) {
                checkbox.checked = true;
            }
            
            const taskContent = document.createElement('div');
            taskContent.className = 'flex-grow';
            
            const taskHeader = document.createElement('div');
            taskHeader.className = 'flex items-center gap-2 mb-1';
            
            const taskText = document.createElement('span');
            taskText.className = task.completed ? 'line-through text-gray-500 task-text' : 'font-medium task-text';
            taskText.textContent = task.text;
            
            const priorityBadge = document.createElement('span');
            priorityBadge.className = `text-xs px-2 py-1 rounded-full ${priorityColors[task.priority] || ''}`;
            priorityBadge.textContent = task.priority;
            
            const dateDiv = document.createElement('div');
            dateDiv.className = 'text-sm text-gray-500';
            dateDiv.textContent = `Due: ${displayDate}`;
            
            // Build list item structure
            taskHeader.appendChild(taskText);
            taskHeader.appendChild(priorityBadge);
            taskContent.appendChild(taskHeader);
            taskContent.appendChild(dateDiv);
            
            const buttonContainer = document.createElement('div');
            buttonContainer.className = 'flex gap-2';
            
            const editBtn = document.createElement('button');
            editBtn.className = 'edit-task-btn text-indigo-600 hover:text-indigo-800';
            editBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
            `;
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-task-btn text-red-600 hover:text-red-800';
            deleteBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
            `;
            
            buttonContainer.appendChild(editBtn);
            buttonContainer.appendChild(deleteBtn);
            
            const mainContainer = document.createElement('div');
            mainContainer.className = 'flex items-start gap-4';
            mainContainer.appendChild(checkbox);
            mainContainer.appendChild(taskContent);
            mainContainer.appendChild(buttonContainer);
            
            taskItem.appendChild(mainContainer);
            this.tasksContainer.appendChild(taskItem);
            
            // Add event listeners
            checkbox.addEventListener('change', () => {
                this.handleToggleTaskComplete(task.id, task.completed);
            });
            
            editBtn.addEventListener('click', () => {
                this.showEditModal(task);
            });
            
            deleteBtn.addEventListener('click', () => {
                this.handleSoftDeleteTask(task.id);
            });
        });
    }
    
    // Handle adding a new task
    handleAddTask() {
        const text = this.taskInput.value.trim();
        const dueDate = this.taskDueDate.value; // This should be in YYYY-MM-DD format
        const priority = this.taskPriority.value;
        
        if (text) {
            // Validate the date format
            let validDate = dueDate;
            try {
                // Make sure the date is valid by creating a Date object
                const dateObj = new Date(dueDate);
                if (isNaN(dateObj.getTime())) {
                    // If date is invalid, use today's date
                    validDate = new Date().toISOString().split('T')[0];
                    console.warn('Invalid date provided, using today instead:', validDate);
                }
            } catch (e) {
                console.error('Error processing date:', e);
                // Default to today if there's an error
                validDate = new Date().toISOString().split('T')[0];
            }
            
            const newTask = {
                text: text,
                dueDate: validDate,
                priority: priority
            };
            
            this.todoService.createTask(newTask)
                .then(() => {
                    this.taskInput.value = '';
                    // Keep the current date and priority
                })
                .catch(error => {
                    console.error('Error creating task:', error);
                    alert('Error creating task: ' + error.message);
                });
        }
    }
    
    // Handle toggling task completion
    handleToggleTaskComplete(taskId, currentStatus) {
        this.todoService.toggleTaskComplete(taskId, currentStatus)
            .catch(error => {
                alert('Error updating task: ' + error.message);
            });
    }
    
    // Handle soft deleting a task
    handleSoftDeleteTask(taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.todoService.softDeleteTask(taskId)
                .then(() => {
                    console.log('Task soft deleted successfully');
                })
                .catch(error => {
                    alert('Error deleting task: ' + error.message);
                });
        }
    }
    
    // Show the edit task modal
    showEditModal(task) {
        this.editTaskId.value = task.id;
        this.editTaskText.value = task.text;
        this.editTaskDueDate.value = task.dueDate;
        this.editTaskPriority.value = task.priority;
        
        this.editTaskModal.classList.remove('hidden');
    }
    
    // Hide the edit task modal
    hideEditModal() {
        this.editTaskModal.classList.add('hidden');
    }
    
    // Handle updating a task
    handleUpdateTask() {
        const taskId = this.editTaskId.value;
        const updates = {
            text: this.editTaskText.value.trim(),
            dueDate: this.editTaskDueDate.value,
            priority: this.editTaskPriority.value
        };
        
        if (updates.text) {
            this.todoService.updateTask(taskId, updates)
                .then(() => {
                    this.hideEditModal();
                })
                .catch(error => {
                    alert('Error updating task: ' + error.message);
                });
        }
    }
}

// Create a singleton instance of the UI
window.todoUI = null;