// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBPQuMYLdnRKibr1HoesN5FOeKWyIIyl9A",
    authDomain: "todolistjava-d62b4.firebaseapp.com",
    databaseURL: "https://todolistjava-d62b4-default-rtdb.firebaseio.com",
    projectId: "todolistjava-d62b4",
    storageBucket: "todolistjava-d62b4.firebasestorage.app",
    messagingSenderId: "395333535881",
    appId: "1:395333535881:web:16febf86a4c2a3053e9e58"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get a reference to the Realtime Database service
const database = firebase.database();

// Test connection to Firebase
console.log("Firebase Realtime Database initialized");