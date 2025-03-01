// import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
// import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";
// import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-database.js";

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

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();


// ✅ Function to fetch user details from Firebase and store in localStorage
async function fetchUserDetails(uid) {
    const userRef = db.ref(`users/${uid}`);
    try {
        const snapshot = await userRef.once("value");
        if (snapshot.exists()) {
            const userData = snapshot.val();
            console.log("Fetched user details from Firebase:", userData);

            // Store in localStorage
            localStorage.setItem("userName", userData.fullName || "User");

            displayUserName();
        } else {
            console.warn("User data not found in database.");
        }
    } catch (error) {
        console.error("Error fetching user details:", error);
    }
}

// ✅ Function to display user name from localStorage
// function displayUserName() {
//     const displayNameElement = document.getElementById("displayName");
//     if (displayNameElement) {
//         displayNameElement.textContent = localStorage.getItem("userName") || "Guest";
//     }
// }
function displayUserName() {
    const displayNameElement = document.getElementById("displayName");
    const userName = localStorage.getItem("userName");

    if (displayNameElement) {
        if (userName) {
            displayNameElement.textContent = userName; // Display username
        } else {
            //alert("Session timed out! Please log in again.");
            showSessionTimeoutModal();
            // setTimeout(() => {
            //     window.location.href = "login.html"; // Redirect to login
            // }, 10000);// Redirect to login
        }
    }
}

// ✅ Show Bootstrap session timeout modal
function showSessionTimeoutModal() {
    const sessionModal = new bootstrap.Modal(document.getElementById("sessionTimeoutModal"));
    sessionModal.show();
}

// ✅ Detect if user is logged in and fetch details
auth.onAuthStateChanged(async (user) => {
    if (user) {
        console.log("User is logged in:", user.uid);
        if (!sessionStorage.getItem("loginTimestamp")) {
            sessionStorage.setItem("loginTimestamp", Date.now().toString());
            sessionStorage.setItem("pageCount", "0"); // Track page visits
        }


        // Fetch details only if not in localStorage
        if (!localStorage.getItem("userName")) {
            console.log("Fetching details from Firebase...");
            await fetchUserDetails(user.uid);
        } else {
            console.log("Fetching details from localStorage...");
            displayUserName();
        }
    } else {
        alert("Session expired! Please log in again.");
        window.location.href = "login.html";
    }
});

// ✅ Track Number of Pages Visited
document.addEventListener("DOMContentLoaded", function () {
    let pageCount = parseInt(sessionStorage.getItem("pageCount") || "0");
    sessionStorage.setItem("pageCount", (pageCount + 1).toString());
});

// ✅ Detect Back Button & Clear Only for First Navigation
window.addEventListener("popstate", function () {
    let pageCount = parseInt(sessionStorage.getItem("pageCount") || "0");

    if (pageCount === 1) { // First navigation after login
        console.log("First back button press detected. Clearing session.");
        localStorage.clear();
        sessionStorage.clear();
        alert("Session expired! Please log in again.");
        window.location.href = "login.html"; // Redirect to login page
    } else {
        console.log("User has navigated multiple pages. No logout.");
        sessionStorage.setItem("pageCount", (pageCount - 1).toString());
    }
});

// ✅ Run when page loads
document.addEventListener("DOMContentLoaded", displayUserName);

// ✅ Run when user switches back to tab
document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
        displayUserName();
    }
});

// ✅ Logout function
function logout() {
    localStorage.clear(); // Clear user data
    window.location.href = "login.html"; // Redirect to login page
}

// ✅ Attach logout event to a button
document.getElementById("logoutBtn")?.addEventListener("click", logout);

const mobileScreen = window.matchMedia("(max-width: 990px )");
$(document).ready(function () {
    $(".dashboard-nav-dropdown-toggle").click(function () {
        $(this).closest(".dashboard-nav-dropdown")
            .toggleClass("show")
            .find(".dashboard-nav-dropdown")
            .removeClass("show");
        $(this).parent()
            .siblings()
            .removeClass("show");
    });
    $(".menu-toggle").click(function () {
        if (mobileScreen.matches) {
            $(".dashboard-nav").toggleClass("mobile-show");
        } else {
            $(".dashboard").toggleClass("dashboard-compact");
        }
    });
});

document.addEventListener("DOMContentLoaded", function () {
    const logoutButton = document.getElementById("logoutButton");

    if (logoutButton) {
        logoutButton.addEventListener("click", function (event) {
            event.preventDefault(); // Prevent default link behavior

            // Clear user session from localStorage
            //localStorage.removeItem("user");

            // Optional: Clear all localStorage (if needed)
             localStorage.clear();

            // Redirect to login page
            window.location.href = "/login.html";
        });
    }
});

document.addEventListener("DOMContentLoaded", function () {
    const redirectToLoginBtn = document.getElementById("redirectToLogin");
    if (redirectToLoginBtn) {
        redirectToLoginBtn.addEventListener("click", function () {
            window.location.href = "login.html"; // Redirect to login page
        });
    }
});