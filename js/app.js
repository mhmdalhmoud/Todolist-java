// Main application file - Initializes the app
document.addEventListener('DOMContentLoaded', () => {
    // Make sure Firebase and database are properly initialized
    try {
        // Ensure todoService exists
        if (typeof todoService === 'undefined') {
            console.log('Creating new TodoService instance');
            window.todoService = new TodoService();
        }
        
        // Test Realtime Database connection
        const testRef = database.ref('connection_test');
        testRef.set({
            timestamp: firebase.database.ServerValue.TIMESTAMP,
            message: 'Connected successfully'
        })
        .then(() => {
            console.log('Successfully connected to Firebase Realtime Database');
            // Remove the test data
            return testRef.remove();
        })
        .then(() => {
            // Initialize the UI with the todoService after confirming database connection
            window.todoUI = new TodoUI(window.todoService);
            console.log('Todo App initialized with Realtime Database');
        })
        .catch(error => {
            console.error('Failed to connect to Firebase Realtime Database:', error);
        });
    } catch (error) {
        console.error('Error initializing application:', error);
    }
    
    // Add custom styles for priority colors via Tailwind
    if (window.tailwind) {
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        'priority-high': '#FCA5A5',
                        'priority-medium': '#FDE68A',
                        'priority-low': '#A7F3D0',
                    }
                }
            }
        };
    }
});