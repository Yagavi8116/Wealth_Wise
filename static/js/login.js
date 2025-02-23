import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";
import { getDatabase, ref, get, set } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-database.js";

// Firebase Configuration 
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

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getDatabase();
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("login-form").addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("your_name").value;
        const password = document.getElementById("your_pass").value;

        if (!email || !password) {
            showPopup("Email and password are required!", "error");
            return;
        }

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            const userRef = ref(db, `users/${user.uid}`);
            get(userRef).then((snapshot) => {
                if (snapshot.exists()) {
                    const userData = snapshot.val();
                    // localStorage.setItem("userName", userData.fullName || "User");
                    if (userData.fullName) {
                        // ✅ Store correct user name in localStorage
                        localStorage.setItem("userName", userData.fullName);
                    } else {
                        console.warn("Full name missing in database, using default.");
                        localStorage.setItem("userName", "User");
                    }
                    if (userData.dob && userData.phoneNumber && userData.accountNumber) {
                        showPopup("Login successful! Redirecting...", "success");
                        setTimeout(() => {
                            window.location.href = "home.html";
                        }, 2000);
                    } else {
                        showUserDetailsPopup(user);
                    }
                } else {
                    showUserDetailsPopup(user);
                }
            });
        } catch (error) {
            console.error("Error logging in:", error.message);
            showPopup(error.message, "error");
        }
    });
});

function showPopup(message, type) {
    const popup = document.createElement("div");
    popup.className = `popup ${type}`;
    popup.textContent = message;
    document.body.appendChild(popup);
    setTimeout(() => {
        popup.remove();
    }, 3000);
}

function showUserDetailsPopup(user) {
    if (document.getElementById('userDetailsPopup')) return;

    const popupHTML = `
      <div id="userDetailsPopup" class="popup-login">
        <div class="popup-content-login">
          <h2>Complete Your Profile</h2>
          <label>Full Name</label>
          <input type="text" id="fullName">
          
          <label>Email</label>
          <input type="email" id="email" value="${user.email}" disabled>
          
          <label>Date of Birth</label>
          <input type="date" id="dob">
          
          <label>Phone Number</label>
          <input type="text" id="phoneNumber" maxlength="10" placeholder="Enter 10-digit number">
          
          <label>Bank Account Number</label>
          <input type="text" id="accountNumber" maxlength="6" placeholder="Enter 6-digit number">
          
          <button id="saveDetails">Save</button>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', popupHTML);
    document.getElementById('saveDetails').addEventListener('click', saveUserDetails);
}

function saveUserDetails() {
    const user = auth.currentUser;
    if (!user) {
        console.error("No authenticated user found.");
        return;
    }
    const fullName = document.getElementById('fullName').value.trim();
    const dob = document.getElementById('dob').value;
    const phoneNumber = document.getElementById('phoneNumber').value;
    const accountNumber = document.getElementById('accountNumber').value;

    if (!fullName) {
        alert("Full name is required!");
        return;
    }

    if (phoneNumber.length !== 10 || accountNumber.length !== 6) {
        alert("Invalid phone number or account number.");
        return;
    }

    const userRef = ref(db, `users/${user.uid}`);
    set(userRef, {
        fullName,
        email: user.email,
        dob,
        phoneNumber,
        accountNumber
    }).then(() => {
        localStorage.setItem("userName", fullName);
        document.getElementById('userDetailsPopup').remove();
        alert("Details saved successfully! Redirecting to home...");
        setTimeout(() => {
            window.location.href = "home.html";
        }, 2000);
    }).catch((error) => {
        console.error("Error saving details:", error);
    });
}
