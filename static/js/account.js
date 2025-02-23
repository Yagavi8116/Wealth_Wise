import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-database.js";

// ✅ Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyCHkdMeDrEVGtMIJ6_x8hlxyIaO87RAqsk",
    authDomain: "wealthwise-3478b.firebaseapp.com",
    projectId: "wealthwise-3478b",
    storageBucket: "wealthwise-3478b.appspot.com",
    messagingSenderId: "855679488886",
    appId: "1:855679488886:web:3faa36dd9f9cbceabba057",
    measurementId: "G-THF8SY4BZ2",
    databaseURL: "https://wealthwise-3478b-default-rtdb.asia-southeast1.firebasedatabase.app"
};

// ✅ Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getDatabase(app);

// ✅ Function to fetch user details from Firebase and store in localStorage
async function fetchUserDetails(uid) {
    const userRef = ref(db, `users/${uid}`);
    try {
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
            const userData = snapshot.val();
            console.log("Fetched user details from Firebase:", userData);

            // Store in localStorage
            Object.entries(userData).forEach(([key, value]) => {
                localStorage.setItem(key, value || "N/A");
            });

            displayUserDetails();
        } else {
            console.warn("User data not found in database.");
        }
    } catch (error) {
        console.error("Error fetching user details:", error);
    }
}

// ✅ Function to display user details from localStorage
function displayUserDetails() {
    const elements = ["fullName", "email", "dob", "phoneNumber", "accountNumber"];
    elements.forEach((id) => {
        const element = document.getElementById(id);
        if (element) element.textContent = localStorage.getItem(id) || "N/A";
    });

    // Special case for display name
    const displayName = document.getElementById("displayName");
    if (displayName) displayName.textContent = localStorage.getItem("fullName") || "User";

    console.log("User details updated in UI");
}

// ✅ Detect if user is logged in and fetch details
onAuthStateChanged(auth, async (user) => {
    if (user) {
        console.log("User is logged in:", user.uid);
        localStorage.clear();

        // Check if details exist in localStorage, else fetch from Firebase
        if (!localStorage.getItem("fullName")) {
            console.log("Fetching details from Firebase...");
            await fetchUserDetails(user.uid);
        } else {
            console.log("Fetching details from localStorage...");
            displayUserDetails();
        }
    } else {
        window.location.href = "login.html";
    }
});

// ✅ Tab Switching Logic
document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM fully loaded and parsed.");

    const accountTab = document.getElementById("account-tab");
    const dashboardTab = document.getElementById("dashboard-tab");
    const dashboardContent = document.getElementById("dashboard-content");
    const accountContent = document.getElementById("account-content");

    if (dashboardContent && accountContent) {
        // ✅ Show Dashboard by default, hide Account
        dashboardContent.style.display = "block";
        accountContent.style.display = "none";
    }

    if (accountTab && dashboardTab) {
        accountTab.addEventListener("click", () => {
            console.log("Account tab clicked.");
            dashboardContent.style.display = "none";
            accountContent.style.display = "block";
            displayUserDetails(); // ✅ Ensure data is refreshed
        });

        dashboardTab.addEventListener("click", () => {
            console.log("Dashboard tab clicked.");
            dashboardContent.style.display = "block";
            accountContent.style.display = "none";
        });
    } else {
        console.warn("Tab elements not found.");
    }

    // ✅ Ensure Account Details are displayed when on account.html
    if (window.location.href.includes("account.html")) {
        console.log("Account page detected, displaying details...");
        dashboardContent.style.display = "none";
        accountContent.style.display = "block";
        displayUserDetails(); // Fetch and show user data
    }
});
