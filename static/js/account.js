import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";
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

// ✅ Detect if user is logged in
onAuthStateChanged(auth, async (user) => {
    if (user) {
        const storedFullName = localStorage.getItem("fullName");
        if (storedFullName) {
            console.log("Fetching details from localStorage...");
            displayUserDetailsFromLocalStorage();
        } else {
            console.log("Fetching details from Firebase...");
            await fetchUserDetails(user.uid);
        }
    } else {
        window.location.href = "login.html"; // Redirect if not logged in
    }
});

// ✅ Function to fetch user details from Firebase and store in localStorage
async function fetchUserDetails(uid) {
    const userRef = ref(db, `users/${uid}`);
    try {
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
            const userData = snapshot.val();
            console.log("Fetched user details from Firebase:", userData);
            localStorage.setItem("fullName", userData.fullName || "N/A");
            localStorage.setItem("email", userData.email || "N/A");
            localStorage.setItem("dob", userData.dob || "N/A");
            localStorage.setItem("phoneNumber", userData.phoneNumber || "N/A");
            localStorage.setItem("accountNumber", userData.accountNumber || "N/A");

            displayUserDetailsFromLocalStorage();
        } else {
            console.warn("User data not found in database.");
        }
    } catch (error) {
        console.error("Error fetching user details:", error);
    }
}

// ✅ Function to display user details from localStorage
function displayUserDetailsFromLocalStorage() {
    document.getElementById("displayName").textContent = localStorage.getItem("fullName") || "User";
    document.getElementById("fullName").textContent = localStorage.getItem("fullName") || "N/A";
    document.getElementById("email").textContent = localStorage.getItem("email") || "N/A";
    document.getElementById("dob").textContent = localStorage.getItem("dob") || "N/A";
    document.getElementById("phoneNumber").textContent = localStorage.getItem("phoneNumber") || "N/A";
    document.getElementById("accountNumber").textContent = localStorage.getItem("accountNumber") || "N/A";
    const fullName = localStorage.getItem("fullName") || "N/A";
    const email = localStorage.getItem("email") || "N/A";
    const dob = localStorage.getItem("dob") || "N/A";
    const phoneNumber = localStorage.getItem("phoneNumber") || "N/A";
    const accountNumber = localStorage.getItem("accountNumber") || "N/A";

    // ✅ Log the stored user details
    console.log("Displaying user details from localStorage:", {
        fullName, email, dob, phoneNumber, accountNumber
    });
}

// ✅ Tab Switching Logic
document.getElementById("account-tab").addEventListener("click", () => {
    document.getElementById("dashboard-content").style.display = "none";
    document.getElementById("account-content").style.display = "block";
});

document.getElementById("dashboard-tab").addEventListener("click", () => {
    document.getElementById("dashboard-content").style.display = "block";
    document.getElementById("account-content").style.display = "none";
});



document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM fully loaded and parsed."); // Debugging log

    const accountTab = document.getElementById("account-tab");
    if (accountTab) {
        console.log("Account tab found."); // Debugging log
        accountTab.addEventListener("click", () => {
            document.getElementById("dashboard-content").style.display = "none";
            document.getElementById("account-content").style.display = "block";
        });
    } else {
        console.warn("account-tab not found in the document.");
    }

    const dashboardTab = document.getElementById("dashboard-tab");
    if (dashboardTab) {
        console.log("Dashboard tab found."); // Debugging log
        dashboardTab.addEventListener("click", () => {
            document.getElementById("dashboard-content").style.display = "block";
            document.getElementById("account-content").style.display = "none";
        });
    } else {
        console.warn("dashboard-tab not found in the document.");
    } 
});
