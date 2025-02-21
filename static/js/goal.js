document.addEventListener("DOMContentLoaded", () => {
    const goalForm = document.getElementById("goalForm");
    const goalList = document.getElementById("goalList");

    if (!goalForm || !goalList) {
        console.error("Error: Form or Goal List not found!");
        return;
    }

    console.log("JavaScript Loaded!");
    let goals = JSON.parse(localStorage.getItem("goals")) || [];
    function saveGoals() {
        localStorage.setItem("goals", JSON.stringify(goals));
        renderGoals();
    }

    function renderGoals() {
        goalList.innerHTML = "";
        goals.forEach((goal, index) => {
            if (goal.saved === undefined) {
                goal.saved = 0;
            }

            let progress = (goal.saved / goal.amount) * 100;
            let balance = goal.amount - goal.saved; 
            goalList.innerHTML += `
                <div class="card p-3 mt-2">
                    <h5 style="color: white; font-weight: bold;">${goal.name}</h5>
                    <p style="color: white;"> Target: ₹${goal.amount} | Deadline: ${goal.deadline} | Balance: ₹${balance.toFixed(2)}</p>
                    <div class="progress">
                        <div class="progress-bar progress-bar-success progress-bar-striped" role="progressbar" style="width: ${progress}%;"
                            aria-valuenow="${progress}" aria-valuemin="0" aria-valuemax="100">
                            <div class="progress-value">${progress.toFixed(2)}%</div>
                        </div>
                    </div>
                    <div class="d-flex justify-content-between mt-3">
                        <button type="submit" class="btn btn-primary fw-bold" onclick="updateSavings(${index})">
                            <i class="fas fa-plus"></i> Add Savings
                        </button>
                        <button type="button" class="btn btn-danger fw-bold" id="deleteGoal" onclick="deleteGoal(${index})">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            `;
        });
    }

    goalForm.addEventListener("submit", (event) => {
        event.preventDefault();
        let newGoal = {
            name: document.getElementById("goalName").value,
            amount: parseFloat(document.getElementById("goalAmount").value),
            deadline: document.getElementById("goalDeadline").value,
            saved: 0
        };
        goals.push(newGoal);
        saveGoals();
        goalForm.reset();
    });

    let selectedGoalIndex = null; // Stores which goal is being updated

    window.updateSavings = (index) => {
        selectedGoalIndex = index;
        document.getElementById("savingsAmountInput").value = ""; // Reset input
        let modalElement = document.getElementById("addSavingsModal");
        let modalInstance = new bootstrap.Modal(modalElement, { keyboard: true });
        modalInstance.show();
    };

    // Handle adding savings when user clicks "Add" in modal
    document.getElementById("confirmAddSavings").addEventListener("click", () => {
        let amountToAdd = parseFloat(document.getElementById("savingsAmountInput").value);
        let modalElement = document.getElementById("addSavingsModal");
        let modalInstance = bootstrap.Modal.getInstance(modalElement);
    
        if (!isNaN(amountToAdd) && amountToAdd > 0) {
            let goal = goals[selectedGoalIndex];
    
            if (goal.saved + amountToAdd > goal.amount) {
                modalInstance.hide(); // Close "Add Savings" modal before opening "Exceed Limit"
                setTimeout(() => showExceedLimitPopup(amountToAdd, goal), 500);
                return;
            }
    
            goal.saved += amountToAdd;
            saveGoals();
    
            if (goal.saved >= goal.amount) {
                modalInstance.hide();
                setTimeout(() => showGoalReachedPopup(amountToAdd, goal), 500);
            } else {
                modalInstance.hide();
            }
        } else {
            alert("Please enter a valid amount!");
        }
    });

    
    window.deleteGoal = (index) => {
        goals.splice(index, 1);
        saveGoals();
    };

    function showGoalReachedPopup(amount) {
        document.getElementById("goalReachedAmount").innerText = amount;
        let modalElement = document.getElementById("goalReachedModal");
        let modalInstance = new bootstrap.Modal(modalElement, { keyboard: true });
        modalInstance.show();
    }
    
    function showExceedLimitPopup(amount) {
        document.getElementById("exceedLimitAmount").innerText = amount;
        let modalElement = document.getElementById("exceedLimitModal");
        let modalInstance = new bootstrap.Modal(modalElement, { keyboard: true });
        modalInstance.show();
    }
    renderGoals();
});
