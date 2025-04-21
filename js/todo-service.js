// Todo Service - Handles all Firebase operations

class TodoService {
    constructor() {
        // Make sure Firebase and database are initialized
        if (typeof firebase === 'undefined' || typeof database === 'undefined') {
            console.error('Firebase or database is not initialized. Check firebase-config.js');
            return;
        }
        
        try {
            this.tasksRef = database.ref('tasks');
            console.log('TodoService initialized successfully');
        } catch (error) {
            console.error('Error initializing TodoService:', error);
        }
    }

    // ==================== Task Operations ====================

    // Get all tasks
    getAllTasks(callback) {
        this.tasksRef.on('value', (snapshot) => {
            const tasks = [];
            snapshot.forEach((childSnapshot) => {
                const task = {
                    id: childSnapshot.key,
                    ...childSnapshot.val()
                };
                
                // Only include tasks that are not soft deleted
                if (!task.isDeleted) {
                    tasks.push(task);
                }
            });
            callback(tasks);
        });
    }

    // Create a new task
    createTask(task) {
        const newTaskRef = this.tasksRef.push();
        return newTaskRef.set({
            ...task,
            completed: false,
            isDeleted: false,
            createdAt: firebase.database.ServerValue.TIMESTAMP
        })
        .then(() => {
            console.log("Task created with ID:", newTaskRef.key);
            return newTaskRef.key;
        })
        .catch(error => {
            console.error("Error creating task:", error);
            throw error;
        });
    }

    // Update an existing task
    updateTask(taskId, updates) {
        return this.tasksRef.child(taskId).update(updates)
            .then(() => {
                console.log("Task updated successfully");
            })
            .catch(error => {
                console.error("Error updating task:", error);
                throw error;
            });
    }

    // Toggle task completion status
    toggleTaskComplete(taskId, currentStatus) {
        return this.updateTask(taskId, { completed: !currentStatus });
    }

    // Soft delete a task (mark as deleted but keep in database)
    softDeleteTask(taskId) {
        return this.updateTask(taskId, { 
            isDeleted: true,
            deletedAt: firebase.database.ServerValue.TIMESTAMP
        });
    }
    
    // // Hard delete a task (actually remove from database) - for admin purposes only
    // hardDeleteTask(taskId) {
    //     return this.tasksRef.child(taskId).remove()
    //         .then(() => {
    //             console.log("Task permanently deleted successfully");
    //         })
    //         .catch(error => {
    //             console.error("Error permanently deleting task:", error);
    //             throw error;
    //         });
    // }
    
    // Get all deleted tasks (for potential restore function)
    // getDeletedTasks(callback) {
    //     this.tasksRef.orderByChild('isDeleted').equalTo(true).on('value', (snapshot) => {
    //         const deletedTasks = [];
    //         snapshot.forEach((childSnapshot) => {
    //             deletedTasks.push({
    //                 id: childSnapshot.key,
    //                 ...childSnapshot.val()
    //             });
    //         });
    //         callback(deletedTasks);
    //     });
    // }
    
    // // Restore a deleted task
    // restoreTask(taskId) {
    //     return this.updateTask(taskId, { 
    //         isDeleted: false,
    //         deletedAt: null
    //     });
    // }
}

// Create a global instance
window.todoService = new TodoService();