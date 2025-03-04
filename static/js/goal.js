console.log("Goal.js Loaded!");

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

// ✅ Initialize Firebase (Prevent multiple initializations)
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// ✅ Get Firebase Services
const auth = firebase.auth();
const db = firebase.database();

// ✅ Ensure User is Authenticated
auth.onAuthStateChanged((user) => {
    if (user) {
        console.log("User is logged in:", user.uid);
        const userGoalsRef = db.ref(`users/${user.uid}/goals`);
        renderGoals(userGoalsRef);

        document.getElementById("goalForm").addEventListener("submit", (event) => {
            event.preventDefault();
            let newGoal = {
                name: document.getElementById("goalName").value,
                amount: parseFloat(document.getElementById("goalAmount").value),
                deadline: document.getElementById("goalDeadline").value,
                saved: 0
            };

            userGoalsRef.push(newGoal)
                .then(() => {
                    console.log("Goal added successfully!");
                    document.getElementById("goalForm").reset();
                    renderGoals(userGoalsRef);
                })
                .catch(error => console.error("Error adding goal:", error));
        });

    } else {
        console.error("User not authenticated");
        window.location.href = "login.html";
    }
});

let completedGoals = [];

function renderGoals(userGoalsRef) {
    userGoalsRef.on("value", (snapshot) => {
        const goalList = document.getElementById("goalList");
        goalList.innerHTML = "";
        completedGoals = [];
        let goals = snapshot.val() || {};
        let goalArray = Object.entries(goals);

        if (goalArray.length === 0) {
            goalList.innerHTML = "<p class='text-light'>No goals added yet!</p>";
            return;
        }

        goalArray.forEach(([goalId, goal]) => {
            let progress = (goal.saved / goal.amount) * 100;
            let balance = goal.amount - goal.saved;

            if (progress >= 100) {
                completedGoals.push({ id: goalId, ...goal });
            }

            // Remove both "Add Savings" and "Delete" buttons if the goal is complete
            let actionButtons = progress < 100 
                ? `<button type="submit" class="btn btn-primary fw-bold" onclick="openAddSavingsModal('${goalId}')">
                        <i class="fas fa-plus"></i> Add Savings
                   </button>
                   <button type="button" class="btn btn-danger fw-bold" onclick="deleteGoal('${goalId}')">
                        <i class="fas fa-trash"></i> Delete
                   </button>` 
                : ""; // Hide both buttons if progress is 100%

            let goalCard = `
                <div class="card p-3 mt-2">
                    <h5 style="color: white; font-weight: bold;">${goal.name}</h5>
                    <p style="color: white;">Target: ₹${goal.amount} | Deadline: ${goal.deadline} | Balance: ₹${balance.toFixed(2)}</p>
                    <div class="progress">
                        <div class="progress-bar bg-success progress-bar-striped" role="progressbar" style="width: ${progress}%;" 
                             aria-valuenow="${progress}" aria-valuemin="0" aria-valuemax="100">
                            <div class="progress-value">${progress.toFixed(2)}%</div>
                        </div>
                    </div>
                    <div class="d-flex justify-content-between mt-3">
                        ${actionButtons} 
                    </div>
                </div>
            `;
            goalList.innerHTML += goalCard;
        });
    });
}


function openAddSavingsModal(goalId) {
    document.getElementById("confirmAddSavings").setAttribute("data-goal-id", goalId);
    document.getElementById("savingsAmountInput").value = "";
    let modalElement = document.getElementById("addSavingsModal");
    let modalInstance = new bootstrap.Modal(modalElement, { keyboard: true });
    modalInstance.show();
}

document.getElementById("confirmAddSavings").addEventListener("click", () => {
    let goalId = document.getElementById("confirmAddSavings").getAttribute("data-goal-id");
    let additionalSavings = parseFloat(document.getElementById("savingsAmountInput").value);
    const user = firebase.auth().currentUser;
    const userGoalsRef = db.ref(`users/${user.uid}/goals`);

    if (isNaN(additionalSavings) || additionalSavings <= 0) {
        alert("Please enter a valid amount.");
        return;
    }

    userGoalsRef.child(goalId).once("value", snapshot => {
        let goal = snapshot.val();
        if (goal) {
            if (goal.saved + additionalSavings > goal.amount) {
                let modalInstance = bootstrap.Modal.getInstance(document.getElementById("addSavingsModal"));
                modalInstance.hide();
                setTimeout(() => showExceedLimitPopup(additionalSavings), 500);
                return;
            }
            goal.saved += additionalSavings;
            userGoalsRef.child(goalId).update({ saved: goal.saved })
                .then(() => {
                    let modalInstance = bootstrap.Modal.getInstance(document.getElementById("addSavingsModal"));
                    modalInstance.hide();
                    if (goal.saved >= goal.amount) {
                        setTimeout(() => showGoalReachedPopup(additionalSavings), 500);
                    }
                })
                .catch(error => console.error("Error updating savings:", error));
        }
    });
});

// function deleteGoal(goalId) {
//     const user = firebase.auth().currentUser;
//     const userGoalsRef = db.ref(`users/${user.uid}/goals`);
//     userGoalsRef.child(goalId).remove()
//         .then(() => console.log("Goal deleted successfully!"))
//         .catch(error => console.error("Error deleting goal:", error));
// }

// function deleteGoal(goalId) {
//     const user = firebase.auth().currentUser;
//     const userGoalsRef = db.ref(`users/${user.uid}/goals`);
//     userGoalsRef.child(goalId).remove()
//         .then(() => {
//             console.log("Goal deleted successfully!");
//             completedGoals = completedGoals.filter(goal => goal.id !== goalId);
//             showCompletedGoalsPopup();
//         })
//         .catch(error => console.error("Error deleting goal:", error));
// }
function deleteGoal(goalId) {
    const user = firebase.auth().currentUser;
    const userGoalsRef = db.ref(`users/${user.uid}/goals`);

    userGoalsRef.child(goalId).remove()
        .then(() => {
            console.log("Goal deleted successfully!");
            completedGoals = completedGoals.filter(goal => goal.id !== goalId);

            // ✅ Close and refresh the popup to avoid stale UI state
            let modalElement = document.getElementById("completedGoalsModal");
            let modalInstance = bootstrap.Modal.getInstance(modalElement);
            if (modalInstance) {
                modalInstance.hide();
            }

            setTimeout(() => showCompletedGoalsPopup(), 300); // ✅ Delay re-opening to allow UI update
        })
        .catch(error => console.error("Error deleting goal:", error));
}


function showGoalReachedPopup(amount) {
    document.getElementById("goalReachedAmount").innerText = amount;
    let modalInstance = new bootstrap.Modal(document.getElementById("goalReachedModal"), { keyboard: true });
    modalInstance.show();
}

function showExceedLimitPopup(amount) {
    document.getElementById("exceedLimitAmount").innerText = amount;
    let modalInstance = new bootstrap.Modal(document.getElementById("exceedLimitModal"), { keyboard: true });
    modalInstance.show();
}

function showCompletedGoalsPopup(completedGoals) {
    const completedGoalsList = document.getElementById("completedGoalsList");
    completedGoalsList.innerHTML = "";

    completedGoals.forEach(goal => {
        let goalItem = `
            <div class="card p-2 mb-2">
                <h6>${goal.name}</h6>
                <p>Target: ₹${goal.amount} | Deadline: ${goal.deadline}</p>
                <button class="btn btn-danger btn-sm" onclick="deleteGoal('${goal.id}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        `;
        completedGoalsList.innerHTML += goalItem;
    });

    let modalInstance = new bootstrap.Modal(document.getElementById("completedGoalsModal"), { keyboard: true });
    modalInstance.show();
}

document.getElementById("viewHistoryBtn").addEventListener("click", () => {
    showCompletedGoalsPopup();
});

// function showCompletedGoalsPopup() {
//     const completedGoalsList = document.getElementById("completedGoalsList");
//     completedGoalsList.innerHTML = "";

//     if (completedGoals.length === 0) {
//         completedGoalsList.innerHTML = `<p style="color: white">No completed goals yet.</p>`;
//     } else {
//         completedGoals.forEach(goal => {
//             let goalItem = `
//                 <div class="card p-2 mb-2">
//                     <h6 style="color: white">${goal.name}</h6>
//                     <p style="color: white">Target: ₹${goal.amount} | Deadline: ${goal.deadline}</p>
//                     <button class="btn btn-danger btn-sm" onclick="deleteGoal('${goal.id}')">
//                         <i class="fas fa-trash"></i> Delete
//                     </button>
//                 </div>
//             `;
//             completedGoalsList.innerHTML += goalItem;
//         });
//     }


    // let modalInstance = new bootstrap.Modal(document.getElementById("completedGoalsModal"), { keyboard: true });
    // modalInstance.show();
//     let modalElement = document.getElementById("completedGoalsModal");
//     let modalInstance = new bootstrap.Modal(modalElement, { keyboard: true });
//     modalElement.addEventListener("hidden.bs.modal", function () {
//         document.body.classList.remove("modal-open");  
//         document.querySelectorAll(".modal-backdrop").forEach(backdrop => backdrop.remove());
//     });
//     modalInstance.show();
// }

function showCompletedGoalsPopup() {
    const completedGoalsList = document.getElementById("completedGoalsList");
    completedGoalsList.innerHTML = "";

    if (completedGoals.length === 0) {
        completedGoalsList.innerHTML = `<p style="color: white">No completed goals yet.</p>`;
    } else {
        completedGoals.forEach(goal => {
            let goalItem = `
                <div class="card p-2 mb-2">
                    <h6 style="color: white">${goal.name}</h6>
                    <p style="color: white">Target: ₹${goal.amount} | Deadline: ${goal.deadline}</p>
                    <button class="btn btn-danger btn-sm" onclick="deleteGoal('${goal.id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            `;
            completedGoalsList.innerHTML += goalItem;
        });
    }

    let modalElement = document.getElementById("completedGoalsModal");
    let modalInstance = new bootstrap.Modal(modalElement, { keyboard: true });

    // ✅ Ensure proper cleanup when modal is closed
    modalElement.addEventListener("hidden.bs.modal", function () {
        document.body.classList.remove("modal-open");
        document.querySelectorAll(".modal-backdrop").forEach(backdrop => backdrop.remove());
    });

    modalInstance.show();
}