import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyCHkdMeDrEVGtMIJ6_x8hlxyIaO87RAqsk",
    authDomain: "wealthwise-3478b.firebaseapp.com",
    projectId: "wealthwise-3478b",
    storageBucket: "wealthwise-3478b.firebasestorage.app",
    messagingSenderId: "855679488886",
    appId: "1:855679488886:web:3faa36dd9f9cbceabba057",
    measurementId: "G-THF8SY4BZ2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Handle Login Form Submission
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("login-form").addEventListener("submit", async (e) => {
        e.preventDefault();

        // Get input values
        const email = document.getElementById("your_name").value;
        const password = document.getElementById("your_pass").value;

        // Validate inputs
        if (!email || !password) {
            showPopup("Email and password are required!", "error");
            return;
        }

        try {
            // Authenticate user with Firebase
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Show success pop-up
            showPopup("Login successful! Redirecting...", "success");

            // Redirect to home.html after 3 seconds
            setTimeout(() => {
                window.location.href = "home.html";
            }, 3000);

        } catch (error) {
            console.error("Error logging in:", error.message);
            showPopup(error.message, "error");
        }
    });
});

// Function to show pop-up message
function showPopup(message, type) {
    const popup = document.createElement("div");
    popup.className = `popup ${type}`;
    popup.textContent = message;

    document.body.appendChild(popup);

    // Remove pop-up after 3 seconds
    setTimeout(() => {
        popup.remove();
    }, 3000);
}
