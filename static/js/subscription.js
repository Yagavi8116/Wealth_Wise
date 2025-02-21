document.getElementById('subscriptionForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const serviceName = document.getElementById('serviceName').value;
    const startDate = new Date(document.getElementById('startDate').value);
    const endDate = new Date(document.getElementById('endDate').value);
    const cost = document.getElementById('cost').value;
    if (!serviceName || !startDate || !endDate || !cost) {
        alert("Please fill in all details.");
        return;
    }
    const logoMap = {
        'spotify': '../static/logos/spotify.png',
        'youtube': '../static/logos/youtube.png',
        'google-drive': '../static/logos/google-drive.png',
        'netflix': '../static/logos/netflix.png',
        'amazon-prime': '../static/logos/amazon-prime.png',
        'disney-hotstar': '../static/logos/disney-hotstar.png',
        'linkedin': '../static/logos/linkedin.png',
        'adobe': '../static/logos/adobe.png',
        'flipkart': '../static/logos/flipkart.png'
    };
    const subscriptionList = document.getElementById('subscriptionList');
    const li = document.createElement('li');
    let today = new Date();
    let totalDuration = (endDate - startDate) / (1000 * 60 * 60 * 24);
    let elapsedDays = (today - startDate) / (1000 * 60 * 60 * 24);
    let progressPercent = Math.max(0, Math.min(100, (elapsedDays / totalDuration) * 100));
    let progressColor = getProgressColor(progressPercent);
    li.innerHTML = `
        <img src="${logoMap[serviceName]}" alt="${serviceName}" class="subscription-logo">
        <div class="subscription-info">
            <strong>${serviceName.toUpperCase()}</strong>
            <br>
            <span>Start: ${startDate.toDateString()} → End: ${endDate.toDateString()}</span>
            <br>
            <span>Cost: $${cost}</span>
        </div>
        <div class="progress-bar-container">
            <div class="progress-bar" style="width: ${progressPercent}%; background-color: ${progressColor}">
                ${Math.round(progressPercent)}% (Today: ${today.toDateString()})
            </div>
        </div>
        <button class="action-btn">&gt;</button>
        <div class="action-popup">
            <p>Take Action</p>
            <button class="terminate-btn">Terminate</button>
            <button class="renew-btn">Renew</button>
        </div>
    `;
    subscriptionList.appendChild(li);
    document.getElementById('subscriptionForm').reset();
    li.querySelector('.action-btn').addEventListener('click', function () {
        const popup = li.querySelector('.action-popup');
        popup.style.display = popup.style.display === 'block' ? 'none' : 'block';
    });
    li.querySelector('.terminate-btn').addEventListener('click', function () {
        li.remove();
    });
    li.querySelector('.renew-btn').addEventListener('click', function () {
        let newStartDate = new Date();
        let newEndDate = new Date(newStartDate);
        newEndDate.setMonth(newEndDate.getMonth() + 1);
        let progressBar = li.querySelector(".progress-bar");
        progressBar.style.width = "0%";
        progressBar.style.backgroundColor = getProgressColor(0);
        progressBar.innerHTML = `0% (Today: ${newStartDate.toDateString()})`;
        li.querySelector('.subscription-info').innerHTML = `
            <strong>${serviceName.toUpperCase()}</strong>
            <br>
            <span>Start: ${newStartDate.toDateString()} → End: ${newEndDate.toDateString()}</span>
            <br>
            <span>Cost: $${cost}</span>
        `;
        alert(`${serviceName} subscription renewed until ${newEndDate.toDateString()}`);
    });
});

function getProgressColor(percent) {
    if (percent <= 50) {
        return "#4caf50"; 
    } else if (percent <= 75) {
        return "#ffcc00";
    } else {
        return "#ff4444"; 
    }
}


function updateProgressBars() {
    let today = new Date();
    document.querySelectorAll("#subscriptionList li").forEach(item => {
        let dateMatch = item.innerHTML.match(/\w{3} \d{2} \d{4}/g);
        if (dateMatch && dateMatch.length === 2) {
            let startDate = new Date(dateMatch[0]);
            let endDate = new Date(dateMatch[1]);
            let totalDuration = (endDate - startDate) / (1000 * 60 * 60 * 24);
            let elapsedDays = (today - startDate) / (1000 * 60 * 60 * 24);
            let progressPercent = Math.max(0, Math.min(100, (elapsedDays / totalDuration) * 100));
            let progressBar = item.querySelector(".progress-bar");
            let progressColor = getProgressColor(progressPercent);
            progressBar.style.width = `${progressPercent}%`;
            progressBar.style.backgroundColor = progressColor;
            progressBar.innerHTML = `${Math.round(progressPercent)}% (Today: ${today.toDateString()})`;
        }
    });
}

setInterval(updateProgressBars, 86400000);

document.getElementById("dropdownButton").addEventListener("click", function () {
  document.getElementById("dropdownList").classList.toggle("show");
});

document.querySelectorAll(".dropdown-options li").forEach(item => {
  item.addEventListener("click", function () {
      let selectedService = this.getAttribute("data-value");
      let selectedText = this.querySelector("span").innerText;
      let logoSrc = this.querySelector("img").src;
      console.log("Selected Text:", selectedText);
      console.log("Logo Source:", logoSrc);
      let dropdownButton = document.getElementById("dropdownButton");
      let serviceNameInput = document.getElementById("serviceName");
      let serviceDisplayInput = document.getElementById("serviceDisplay");
      if (!dropdownButton || !serviceNameInput || !serviceDisplayInput) {
          console.error("Dropdown elements missing! Check your HTML.");
          return;
      }
      serviceDisplayInput.value = selectedText; 
      serviceDisplayInput.style.background = `url('${logoSrc}') no-repeat left center`;
      serviceDisplayInput.style.backgroundSize = "20px 20px";
      serviceDisplayInput.style.paddingLeft = "30px";
      serviceNameInput.value = selectedService;
      document.getElementById("dropdownList").classList.remove("show");
  });
});

document.addEventListener("click", function (event) {
  if (!event.target.closest(".custom-dropdown")) {
      document.getElementById("dropdownList").classList.remove("show");
  }
});

document.addEventListener("DOMContentLoaded", function () {
  let dropdownButton = document.getElementById("dropdownButton");
  let serviceDisplay = document.getElementById("serviceDisplay");
  let serviceNameInput = document.getElementById("serviceName");
  let dropdownList = document.getElementById("dropdownList");
  let form = document.getElementById("subscriptionForm");
  serviceDisplay.style.display = "none";
  dropdownButton.style.display = "block";
  document.querySelectorAll(".dropdown-options li").forEach(item => {
      item.addEventListener("click", function () {
          let selectedService = this.getAttribute("data-value");
          let selectedText = this.querySelector("span").innerText;
          let logoSrc = this.querySelector("img").src;
          console.log("Selected Service:", selectedText);
          console.log("Logo Source:", logoSrc);
          serviceNameInput.value = selectedService;
          serviceDisplay.value = selectedText;
          serviceDisplay.style.background = `url('${logoSrc}') no-repeat left center`;
          serviceDisplay.style.backgroundSize = "20px 20px";
          serviceDisplay.style.paddingLeft = "30px";
          dropdownButton.style.display = "none";
          serviceDisplay.style.display = "block";
          dropdownList.classList.remove("show");
      });
  });
  form.addEventListener("submit", function (event) {
      event.preventDefault();
      console.log("Form submitted!");
      serviceDisplay.style.display = "none";
      dropdownButton.style.display = "block";
      serviceDisplay.value = "";
      serviceNameInput.value = "";
  });
});

document.getElementById("askAiButton").addEventListener("click", function () {
    document.getElementById("aiPopup").style.display = "block";
    let subscriptions = [];
    document.querySelectorAll("#subscriptionList li").forEach(item => {
        subscriptions.push(item.textContent);
    });
    localStorage.setItem("subscriptions", JSON.stringify(subscriptions));
});

document.getElementById("closeAiPopup").addEventListener("click", function () {
    document.getElementById("aiPopup").style.display = "none";
});

document.addEventListener("DOMContentLoaded", function () {
    const notificationButton = document.getElementById("notificationButton");
    const notificationPopup = document.getElementById("notificationPopup");
    const notificationCount = document.getElementById("notificationCount");
    const notificationList = document.getElementById("notificationList");
    let notifications = [
        "Spotify subscription due in 3 days!",
        "Netflix subscription renewed successfully.",
        "Amazon Prime payment failed! Update your payment details."
    ];
    function updateNotifications() {
        notificationList.innerHTML = ""; 
        if (notifications.length === 0) {
            notificationList.innerHTML = "<p>No new notifications</p>";
            notificationCount.style.display = "none";
        } else {
            notifications.forEach(notification => {
                let item = document.createElement("div");
                item.className = "notification-item";
                item.textContent = notification;
                notificationList.appendChild(item);
            });
            notificationCount.textContent = notifications.length;
            notificationCount.style.display = "inline"; 
        }
    }

    notificationButton.addEventListener("click", function () {
        notificationPopup.style.display = notificationPopup.style.display === "none" ? "block" : "none";
        updateNotifications();
    });

    document.addEventListener("click", function (event) {
        if (!notificationPopup.contains(event.target) && !notificationButton.contains(event.target)) {
            notificationPopup.style.display = "none";
        }
    });
    updateNotifications();
});

document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("subscriptionList").addEventListener("click", function (event) {
        if (event.target.classList.contains("terminate-btn")) {
            showPopupMessage("Good Decision! 👍", "#ff4d4d");
        } else if (event.target.classList.contains("renew-btn")) {
            // Find the closest subscription item container
            const subscriptionItem = event.target.closest("li");
            if (!subscriptionItem) {
                console.error("Subscription item not found!");
                return;
            }

            // Find the progress bar inside the subscription item
            const progressBar = subscriptionItem.querySelector(".progress-bar");
            if (!progressBar) {
                console.error("Progress bar not found inside subscription item!");
                return;
            }

            showConfirmationPopup("Are you sure you want to renew? 🤔", "#4CAF50", () => {
                renewSubscription(progressBar);
            });
        }
    });
});


// Function to show simple message pop-up
function showPopupMessage(message, bgColor) {
    const popup = document.createElement("div");
    popup.classList.add("popup-message");
    popup.textContent = message;
    popup.style.background = bgColor;

    document.body.appendChild(popup);

    setTimeout(() => {
        popup.classList.add("show");
    }, 100);

    setTimeout(() => {
        popup.classList.remove("show");
        setTimeout(() => popup.remove(), 300);
    }, 3000);
}

// Function to show Yes/No confirmation pop-up
function showConfirmationPopup(message, bgColor, onConfirm) {
    const existingPopup = document.querySelector(".popup-confirm");
    if (existingPopup) existingPopup.remove(); // Remove any existing pop-up

    const popup = document.createElement("div");
    popup.classList.add("popup-message", "popup-confirm");
    popup.style.background = bgColor;
    
    const text = document.createElement("p");
    text.textContent = message;
    
    const btnContainer = document.createElement("div");
    btnContainer.classList.add("popup-btn-container");

    const yesBtn = document.createElement("button");
    yesBtn.textContent = "Yes ✅";
    yesBtn.classList.add("popup-btn", "yes-btn");
    yesBtn.onclick = function () {
        onConfirm(); // Call the function if Yes is clicked
        closePopup(popup);
    };

    const noBtn = document.createElement("button");
    noBtn.textContent = "No ❌";
    noBtn.classList.add("popup-btn", "no-btn");
    noBtn.onclick = function () {
        closePopup(popup);
    };

    btnContainer.appendChild(yesBtn);
    btnContainer.appendChild(noBtn);
    
    popup.appendChild(text);
    popup.appendChild(btnContainer);
    
    document.body.appendChild(popup);
    
    setTimeout(() => {
        popup.classList.add("show");
    }, 100);
}

// Function to reset and restart the progress bar
function renewSubscription(progressBar) {
    if (progressBar) {
        progressBar.style.width = "0%"; // Reset progress
        showPopupMessage("Subscription Renewed! 🎉", "#008CBA");
        
        // Simulating progress increase
        let progress = 0;
        const interval = setInterval(() => {
            progress += 1;
            progressBar.style.width = progress + "%";
            if (progress >= 100) clearInterval(interval);
        }, 50); // Adjust speed as needed
    }
}

// Function to remove the pop-up
function closePopup(popup) {
    popup.classList.remove("show");
    setTimeout(() => popup.remove(), 300);
}

// Add styles for the pop-up and progress bar
const style = document.createElement("style");
style.innerHTML = `
    .popup-message {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(255, 255, 255, 0.15);
        backdrop-filter: blur(10px);
        color: white;
        padding: 20px 40px;
        border-radius: 12px;
        font-size: 18px;
        font-weight: bold;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
        opacity: 0;
        transition: opacity 0.3s ease, transform 0.3s ease;
        z-index: 1000;
        text-align: center;
        border: 2px solid rgba(255, 255, 255, 0.3);
    }

    .popup-message.show {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1.1);
    }

    .popup-confirm {
        padding: 25px;
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .popup-btn-container {
        display: flex;
        gap: 10px;
        margin-top: 15px;
    }

    .popup-btn {
        padding: 8px 15px;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 16px;
        font-weight: bold;
        transition: 0.2s;
    }

    .yes-btn {
        background-color: #28a745;
        color: white;
    }

    .yes-btn:hover {
        background-color: #218838;
    }

    .no-btn {
        background-color: #dc3545;
        color: white;
    }

    .no-btn:hover {
        background-color: #c82333;
    }

    /* Progress bar styles */
    .subscription-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: #222;
        color: white;
        padding: 10px;
        margin: 10px 0;
        border-radius: 10px;
    }

    .progress-container {
        width: 60%;
        height: 10px;
        background: #555;
        border-radius: 5px;
        overflow: hidden;
    }

    .progress-bar {
        height: 100%;
        width: 0%;
        background: #4CAF50;
        transition: width 0.5s ease;
    }

    .terminate-btn, .renew-btn {
        padding: 6px 12px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-weight: bold;
    }

    .terminate-btn {
        background: #ff4d4d;
        color: white;
    }

    .renew-btn {
        background: #008CBA;
        color: white;
    }
`;
document.head.appendChild(style);
