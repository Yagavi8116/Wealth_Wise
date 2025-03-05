import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";
//import { getDatabase, ref, get, push, onValue } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-database.js";
import { getDatabase, ref, get, set, push, onValue } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-database.js";

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
const db = getDatabase(app);

async function fetchUserDetails(uid) {
    const userRef = ref(db, `users/${uid}`);
    try {
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
            const userData = snapshot.val();
            console.log("Fetched user details from Firebase:", userData);
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

function displayUserDetails() {
    const elements = ["fullName", "email", "dob", "phoneNumber", "accountNumber"];
    elements.forEach((id) => {
        const element = document.getElementById(id);
        if (element) element.textContent = localStorage.getItem(id) || "N/A";
    });
    const displayName = document.getElementById("displayName");
    if (displayName) displayName.textContent = localStorage.getItem("fullName") || "User";
    console.log("User details updated in UI");
}

onAuthStateChanged(auth, async (user) => {
    if (user) {
        console.log("User is logged in:", user.uid);
        if (!localStorage.getItem("fullName")) {
            console.log("Fetching details from Firebase...");
            await fetchUserDetails(user.uid);
        } else {
            console.log("Fetching details from localStorage...");
            displayUserDetails();
        }
        loadFinancialData();
    } else {
        window.location.href = "login.html";
    }
});

document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM fully loaded and parsed.");
    const accountTab = document.getElementById("account-tab");
    const dashboardTab = document.getElementById("dashboard-tab");
    const dashboardContent = document.getElementById("dashboard-content");
    const accountContent = document.getElementById("account-content");
    if (dashboardContent && accountContent) {
        dashboardContent.style.display = "block";
        accountContent.style.display = "none";
    }
    if (accountTab && dashboardTab) {
        accountTab.addEventListener("click", () => {
            console.log("Account tab clicked.");
            dashboardContent.style.display = "none";
            accountContent.style.display = "block";
            displayUserDetails();
        });
        dashboardTab.addEventListener("click", () => {
            console.log("Dashboard tab clicked.");
            dashboardContent.style.display = "block";
            accountContent.style.display = "none";
        });
    } else {
        console.warn("Tab elements not found.");
    }
    if (window.location.href.includes("account.html")) {
        console.log("Account page detected, displaying details...");
        dashboardContent.style.display = "none";
        accountContent.style.display = "block";
        displayUserDetails(); 
    }
});

// Function to save financial details
document.getElementById("saveFinancialData").addEventListener("click", async () => {
    const user = auth.currentUser;
    if (!user) return alert("User not authenticated");

    const year = document.getElementById("year").value;
    const month = document.getElementById("month").value;
    const income = document.getElementById("income").value.trim();
    const savings = document.getElementById("savings").value.trim();
    const expenses = document.getElementById("expenses").value.trim();
    const debt = document.getElementById("debt").value.trim();
    const investment = document.getElementById("investment").value.trim();

    // Validate inputs
    if (!year || !month || !income || !savings || !expenses || !debt || !investment) {
        return alert("Please fill all fields");
    }

    const userRef = ref(db, `users/${user.uid}/Account_Details`);
    const newEntryRef = push(userRef);

    set(newEntryRef, {
        year, month, income, savings, expenses, debt, investment
    }).then(() => {
        alert("Data saved successfully");
        loadFinancialData(); // Refresh displayed data
    }).catch(error => console.error("Error saving data:", error));
});

// Function to load financial details
// function loadFinancialData() {
//     const user = auth.currentUser;
//     if (!user) return;

//     const userRef = ref(db, `users/${user.uid}/Account_Details`);
//     onValue(userRef, (snapshot) => {
//         const dataTable = document.getElementById("financialDataTable");
//         dataTable.innerHTML = ""; // Clear table before inserting new data
//         let index = 1;

//         snapshot.forEach((childSnapshot) => {
//             const data = childSnapshot.val();
//             const row = `<tr>
//                             <td>${index++}</td>
//                             <td>${data.year}</td>
//                             <td>${data.month}</td>
//                             <td>${data.income}</td>
//                             <td>${data.savings}</td>
//                             <td>${data.expenses}</td>
//                             <td>${data.debt}</td>
//                             <td>${data.investment}</td>
//                         </tr>`;
//             dataTable.innerHTML += row;
//         });
//     });
// }

function loadFinancialData() {
    const user = auth.currentUser;
    if (!user) return;

    const userRef = ref(db, `users/${user.uid}/Account_Details`);
    get(userRef).then((snapshot) => {
        if (!snapshot.exists()) {
            console.log("No financial data found.");
            return;
        }

        const dataTable = document.getElementById("financialDataTable");
        dataTable.innerHTML = ""; // Clear table before inserting new data
        let records = [];

        snapshot.forEach((childSnapshot) => {
            records.push(childSnapshot.val());
        });

        // Sort by Year (descending), then by Month (Jan-Dec order)
        const monthOrder = {
            "Jan": 1, "Feb": 2, "Mar": 3, "Apr": 4, "May": 5, "Jun": 6,
            "Jul": 7, "Aug": 8, "Sep": 9, "Oct": 10, "Nov": 11, "Dec": 12
        };

        records.sort((a, b) => {
            if (a.year !== b.year) return a.year - b.year; // Sort by year (newest first)
            return monthOrder[a.month] - monthOrder[b.month]; // Sort by month (newest first)
        });

        // Append sorted data to table
        records.forEach((data, index) => {
            const row = `<tr>
                            <td>${index + 1}</td>
                            <td>${data.year}</td>
                            <td>${data.month}</td>
                            <td>${data.income}</td>
                            <td>${data.savings}</td>
                            <td>${data.expenses}</td>
                            <td>${data.debt}</td>
                            <td>${data.investment}</td>
                        </tr>`;
            dataTable.innerHTML += row;
        });

        console.log("Financial data loaded and sorted.");
    }).catch(error => console.error("Error loading financial data:", error));
}
