// Import Firebase SDKs
import { initializeApp, getApps} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyCHkdMeDrEVGtMIJ6_x8hlxyIaO87RAqsk",
    authDomain: "wealthwise-3478b.firebaseapp.com",
    projectId: "wealthwise-3478b",
    storageBucket: "wealthwise-3478b.appspot.com",
    messagingSenderId: "855679488886",
    appId: "1:855679488886:web:3faa36dd9f9cbceabba057",
    measurementId: "G-THF8SY4BZ2"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

// Pop-up modal functions
function showModal(message) {
    const modal = document.getElementById("popup-modal");
    const modalMessage = document.querySelector(".modal-message");
    modalMessage.textContent = message;
    modal.style.display = "block";

    // Close modal on click
    document.querySelector(".close").addEventListener("click", () => {
        modal.style.display = "none";
    });

    document.querySelector(".modal-button").addEventListener("click", () => {
        modal.style.display = "none";
    });
}

// Handle Form Submission
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("register-form").addEventListener("submit", async (e) => {
        e.preventDefault();

        // Get input values
        const fullName = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("pass").value.trim();
        const confirmPassword = document.getElementById("re_pass").value.trim();

        // Validation Checks
        if (!fullName) {
            showModal("Please enter your name.");
            return;
        }
        if (!email) {
            showModal("Please enter your email.");
            return;
        }
        if (!password) {
            showModal("Please enter your password.");
            return;
        }
        if (!confirmPassword) {
            showModal("Please confirm your password.");
            return;
        }
        if (password !== confirmPassword) {
            showModal("Passwords do not match!");
            return;
        }

        try {
            // Create user with Firebase Authentication
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Show success modal
            showModal(`User registered successfully! Welcome, ${fullName}`);
                    setTimeout(() => {
                window.location.href = "login.html";
            }, 3000);
            // Optionally, redirect user
            console.log(user);
        } catch (error) {
            console.error("Error signing up:", error.message);
            showModal(error.message);
        }
    });
});