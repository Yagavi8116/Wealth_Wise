// Firebase configuration
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

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// Get Firebase services
const auth = firebase.auth();
const db = firebase.database();

// Track authentication state
auth.onAuthStateChanged(user => {
    if (user) {
        localStorage.setItem("userId", user.uid);
        console.log("User is logged in:", user.uid);
        document.getElementById("subscriptionForm").style.display = "block";
    } else {
        localStorage.removeItem("userId");
        console.log("User is logged out");
        document.getElementById("subscriptionForm").style.display = "none";
        showPopupMessage("Please log in to manage subscriptions.", "#ff4444");
    }
});

// Notification system
const notifications = [];
const notificationButton = document.getElementById("notificationButton");
const notificationPopup = document.getElementById("notificationPopup");
const notificationCount = document.getElementById("notificationCount");
const notificationList = document.getElementById("notificationList");

// Notification button click handler
notificationButton.addEventListener('click', function(e) {
    e.stopPropagation();
    
    // Toggle the notification popup visibility
    if (notificationPopup.style.display === 'block') {
        notificationPopup.style.display = 'none';
    } else {
        notificationPopup.style.display = 'block';
        
        // Mark all notifications as read when popup is opened
        notifications.forEach(notification => {
            notification.read = true;
        });
        notificationCount.style.display = 'none';
        updateNotificationUI();
    }
});

// Close notification popup when clicking outside
document.addEventListener('click', function(event) {
    if (!notificationButton.contains(event.target) && !notificationPopup.contains(event.target)) {
        notificationPopup.style.display = 'none';
    }
});

function addNotification(message) {
    // Check if this notification already exists
    if (!notifications.some(n => n.message === message)) {
        const notification = {
            message: message,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            read: false
        };
        
        notifications.unshift(notification); // Add to beginning of array
        updateNotificationUI();
        
        // Update notification count (only unread)
        const unreadCount = notifications.filter(n => !n.read).length;
        notificationCount.textContent = unreadCount;
        
        if (unreadCount > 0) {
            notificationCount.style.display = 'inline';
            
            // Briefly highlight the notification button
            notificationButton.style.animation = 'pulse 0.5s 2';
            setTimeout(() => {
                notificationButton.style.animation = '';
            }, 1000);
        }
    }
}

function updateNotificationUI() {
    notificationList.innerHTML = '';
    
    if (notifications.length === 0) {
        notificationList.innerHTML = '<div class="notification-item">No notifications</div>';
        return;
    }
    
    notifications.forEach(notification => {
        const item = document.createElement('div');
        item.className = `notification-item ${notification.read ? 'read' : 'unread'}`;
        
        item.innerHTML = `
            <div class="notification-message">${notification.message}</div>
            <div class="notification-time">${notification.timestamp}</div>
        `;
        
        notificationList.appendChild(item);
    });
}

// Logo mapping for services
const logoMap = {
    'spotify': '../static/logos/spotify.png',
    'youtube': '../static/logos/youtube.png',
    'google-drive': '../static/logos/google-drive.png',
    'netflix': '../static/logos/netflix.png',
    'amazon-prime': '../static/logos/amazon-prime.png',
    'linkedin': '../static/logos/linkedin.png'
};

document.addEventListener("DOMContentLoaded", function () {
    // Form submission handler
    document.getElementById("subscriptionForm").addEventListener("submit", async function (e) {
        e.preventDefault();
        
        const userId = localStorage.getItem("userId");
        if (!userId) {
            showPopupMessage("Please log in to add subscriptions.", "#ff4444");
            return;
        }
        
        const serviceName = document.getElementById("serviceName").value;
        const startDate = document.getElementById("startDate").value;
        const endDate = document.getElementById("endDate").value;
        const cost = document.getElementById("cost").value;

        // Validation
        if (!serviceName || !startDate || !endDate || !cost) {
            showPopupMessage("Please fill all fields!", "#ff4444");
            return;
        }

        if (new Date(endDate) <= new Date(startDate)) {
            showPopupMessage("End date must be after start date", "#ff4444");
            return;
        }

        try {
            const subscriptionData = {
                serviceName,
                startDate,
                endDate,
                cost: parseFloat(cost),
                createdAt: firebase.database.ServerValue.TIMESTAMP
            };

            // Save to Firebase
            const newSubscriptionRef = db.ref(`users/${userId}/Subscriptions`).push();
            await newSubscriptionRef.set(subscriptionData);
            
            // Add subscription ID to the data
            subscriptionData.id = newSubscriptionRef.key;
            
            // Add to UI
            //addSubscriptionToUI(subscriptionData);
            
            // Check for ending subscription
            checkForEndingSubscription(serviceName, endDate);
            
            // Reset form
            e.target.reset();
            showPopupMessage("Subscription added!", "#4CAF50");
             const subscriptionList = document.getElementById("subscriptionList");
        subscriptionList.scrollIntoView({ behavior: 'smooth', block: 'end' });

        } catch (error) {
            console.error("Error saving subscription:", error);
            showPopupMessage("Failed to save subscription", "#ff4444");
        }
    });

    // Function to add subscription to UI
    function addSubscriptionToUI(subscription) {
        const subscriptionList = document.getElementById("subscriptionList");
        const li = document.createElement("li");
        li.setAttribute('data-id', subscription.id);
        
        const startDate = new Date(subscription.startDate);
        const endDate = new Date(subscription.endDate);
        const today = new Date();
        
        const totalDuration = (endDate - startDate) / (1000 * 60 * 60 * 24);
        const elapsedDays = (today - startDate) / (1000 * 60 * 60 * 24);
        let progressPercent = Math.max(0, Math.min(100, (elapsedDays / totalDuration) * 100));
        let progressColor = getProgressColor(progressPercent);

        li.innerHTML = `
            <img src="${logoMap[subscription.serviceName] || '../static/logos/default.png'}" 
                 alt="${subscription.serviceName}" 
                 class="subscription-logo">
            <div class="subscription-info">
                <strong>${subscription.serviceName.toUpperCase()}</strong>
                <br>
                <span>Start: ${formatDate(startDate)} → End: ${formatDate(endDate)}</span>
                <br>
                <span>Cost: ₹${subscription.cost}</span>
            </div>
            <div class="progress-bar-container">
                <div class="progress-bar" style="width: ${progressPercent}%; background-color: ${progressColor}">
                    ${Math.round(progressPercent)}% (Today: ${formatDate(today)})
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
        
        // Add event listeners for action buttons
        li.querySelector('.action-btn').addEventListener('click', function (e) {
            e.stopPropagation();
            const popup = li.querySelector('.action-popup');
            popup.style.display = popup.style.display === 'block' ? 'none' : 'block';
        });
        
        li.querySelector('.terminate-btn').addEventListener('click', async function (e) {
            e.stopPropagation();
            showConfirmationPopup("Are you sure you want to terminate?", "#ff4444", async () => {
                try {
                    const userId = localStorage.getItem("userId");
                    if (!userId) {
                        showPopupMessage("Please log in to perform this action.", "#ff4444");
                        return;
                    }
                    
                    await db.ref(`users/${userId}/Subscriptions/${subscription.id}`).remove();
                    li.remove();
                    showPopupMessage("Subscription terminated!", "#ff4444");
                } catch (error) {
                    console.error("Error deleting subscription:", error);
                    showPopupMessage("Failed to terminate subscription", "#ff4444");
                }
            });
        });
        
        li.querySelector('.renew-btn').addEventListener('click', function (e) {
            e.stopPropagation();
            showConfirmationPopup("Renew for another month?", "#4CAF50", async () => {
                try {
                    await renewSubscription(li, subscription);
                } catch (error) {
                    console.error("Error renewing subscription:", error);
                    showPopupMessage("Failed to renew subscription", "#ff4444");
                }
            });
        });
    }

    // Check if subscription is ending soon (7 days or less)
    function checkForEndingSubscription(serviceName, endDate) {
        const today = new Date();
        const end = new Date(endDate);
        const daysRemaining = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
        
        if (daysRemaining <= 7 && daysRemaining > 0) {
            addNotification(`${serviceName.toUpperCase()} ends in ${daysRemaining} day${daysRemaining === 1 ? '' : 's'}!`);
        }
    }

    // Function to renew a subscription
    async function renewSubscription(liElement, subscription) {
        const userId = localStorage.getItem("userId");
        if (!userId) {
            showPopupMessage("Please log in to perform this action.", "#ff4444");
            return;
        }
        
        const newStartDate = new Date();
        const newEndDate = new Date(newStartDate);
        newEndDate.setMonth(newEndDate.getMonth() + 1);
        
        // Update in Firebase
        await db.ref(`users/${userId}/Subscriptions/${subscription.id}`).update({
            startDate: newStartDate.toISOString().split('T')[0],
            endDate: newEndDate.toISOString().split('T')[0]
        });
        
        // Update UI
        liElement.querySelector('.subscription-info').innerHTML = `
            <strong>${subscription.serviceName.toUpperCase()}</strong>
            <br>
            <span>Start: ${formatDate(newStartDate)} → End: ${formatDate(newEndDate)}</span>
            <br>
            <span>Cost: ₹${subscription.cost}</span>
        `;
        
        const progressBar = liElement.querySelector('.progress-bar');
        progressBar.style.width = "0%";
        progressBar.style.backgroundColor = getProgressColor(0);
        progressBar.textContent = `0% (Today: ${formatDate(newStartDate)})`;
        
        showPopupMessage("Subscription renewed!", "#4CAF50");
    }

    // Helper function to format dates
    function formatDate(date) {
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    }

    // Progress bar color based on percentage
    function getProgressColor(percent) {
        if (percent <= 50) return "#4caf50";
        if (percent <= 75) return "#ffcc00";
        return "#ff4444";
    }

    // Update all progress bars and check for ending subscriptions
    function updateProgressBars() {
        document.querySelectorAll("#subscriptionList li").forEach(li => {
            const infoDiv = li.querySelector('.subscription-info');
            if (!infoDiv) return;
            
            // Extract dates from the formatted text
            const dateText = infoDiv.textContent;
            const dateMatches = dateText.match(/(Start: )(.+?)( → End: )(.+?)(\n|$)/);
            
            if (!dateMatches || dateMatches.length < 5) return;
            
            const startDateStr = dateMatches[2];
            const endDateStr = dateMatches[4];
            const startDate = new Date(startDateStr);
            const endDate = new Date(endDateStr);
            const today = new Date();
            
            // Calculate days remaining for notification
            const daysRemaining = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
            
            // Add notification if subscription is ending soon (7 days or less)
            if (daysRemaining <= 7 && daysRemaining > 0) {
                const serviceName = li.querySelector('strong').textContent.trim();
                addNotification(`${serviceName} ends in ${daysRemaining} day${daysRemaining === 1 ? '' : 's'}!`);
            }
            
            // Update progress bar
            const totalDuration = (endDate - startDate) / (1000 * 60 * 60 * 24);
            const elapsedDays = (today - startDate) / (1000 * 60 * 60 * 24);
            let progressPercent = Math.max(0, Math.min(100, (elapsedDays / totalDuration) * 100));
            
            const progressBar = li.querySelector('.progress-bar');
            if (progressBar) {
                progressBar.style.width = `${progressPercent}%`;
                progressBar.style.backgroundColor = getProgressColor(progressPercent);
                progressBar.textContent = `${Math.round(progressPercent)}% (Today: ${formatDate(today)})`;
            }
        });
    }

    // Load user's subscriptions from Firebase
    function loadSubscriptions() {
        const userId = localStorage.getItem("userId");
        if (!userId) return;
        
        db.ref(`users/${userId}/Subscriptions`).on('value', snapshot => {
            const subscriptions = snapshot.val() || {};
            document.getElementById("subscriptionList").innerHTML = '';
            
            Object.entries(subscriptions).forEach(([id, sub]) => {
                const subscriptionWithId = {...sub, id};
                addSubscriptionToUI(subscriptionWithId);
                
                // Check for ending subscriptions when loading
                checkForEndingSubscription(sub.serviceName, sub.endDate);
            });
        }, error => {
            console.error("Error loading subscriptions:", error);
            showPopupMessage("Failed to load subscriptions", "#ff4444");
        });
    }

    // Initialize
    loadSubscriptions();
    updateProgressBars();
    setInterval(updateProgressBars, 86400000); // Update daily
});

// Popup message functions
function showPopupMessage(message, bgColor) {
    const popup = document.createElement('div');
    popup.className = 'popup-message';
    popup.textContent = message;
    popup.style.background = bgColor;
    document.body.appendChild(popup);
    
    setTimeout(() => popup.classList.add('show'), 10);
    setTimeout(() => {
        popup.classList.remove('show');
        setTimeout(() => popup.remove(), 300);
    }, 3000);
}

function showConfirmationPopup(message, bgColor, confirmCallback) {
    const popup = document.createElement('div');
    popup.className = 'popup-message popup-confirm';
    popup.style.background = bgColor;
    
    popup.innerHTML = `
        <p>${message}</p>
        <div class="popup-btn-container">
            <button class="popup-btn yes-btn">Yes ✅</button>
            <button class="popup-btn no-btn">No ❌</button>
        </div>
    `;
    
    document.body.appendChild(popup);
    setTimeout(() => popup.classList.add('show'), 10);
    
    popup.querySelector('.yes-btn').addEventListener('click', () => {
        confirmCallback();
        closePopup(popup);
    });
    
    popup.querySelector('.no-btn').addEventListener('click', () => closePopup(popup));
}

function closePopup(popup) {
    popup.classList.remove('show');
    setTimeout(() => popup.remove(), 300);
}

// Add CSS styles
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); }
    }
    
    .subscription-logo {
        width: 40px;
        height: 40px;
        object-fit: contain;
        margin-right: 15px;
    }
    
    #subscriptionList {
        list-style: none;
        padding: 0;
        margin-top: 20px;
    }
    
    #subscriptionList li {
        display: flex;
        align-items: center;
        background: rgba(255, 255, 255, 0.1);
        padding: 15px;
        margin-bottom: 15px;
        border-radius: 10px;
        position: relative;
    }
    
    .subscription-info {
        flex: 1;
        color: white;
        font-family: 'Playfair Display', serif;
    }
    
    .progress-bar-container {
        width: 30%;
        height: 20px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 10px;
        overflow: hidden;
        margin: 0 15px;
    }
    
    .progress-bar {
        height: 100%;
        transition: width 0.3s ease;
        color: white;
        font-size: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        white-space: nowrap;
    }
    
    .action-btn {
        background: rgba(255, 255, 255, 0.2);
        border: none;
        color: white;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        cursor: pointer;
        font-weight: bold;
    }
    
    .action-popup {
        display: none;
        position: absolute;
        right: 50px;
        top: 50%;
        transform: translateY(-50%);
        background: rgba(0, 0, 0, 0.9);
        padding: 10px;
        border-radius: 5px;
        z-index: 10;
    }
    
    .action-popup p {
        margin: 0 0 5px 0;
        color: white;
    }
    
    .terminate-btn, .renew-btn {
        padding: 5px 10px;
        margin: 2px;
        border: none;
        border-radius: 3px;
        cursor: pointer;
    }
    
    .terminate-btn {
        background: #ff4444;
        color: white;
    }
    
    .renew-btn {
        background: #4CAF50;
        color: white;
    }
    
    .popup-message {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 15px 30px;
        border-radius: 8px;
        font-size: 16px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        opacity: 0;
        transition: opacity 0.3s, transform 0.3s;
        z-index: 1000;
    }
    
    .popup-message.show {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1.05);
    }
    
    .popup-confirm {
        text-align: center;
    }
    
    .popup-btn-container {
        display: flex;
        justify-content: center;
        gap: 10px;
        margin-top: 10px;
    }
    
    .popup-btn {
        padding: 5px 15px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    }
    
    .yes-btn {
        background: #4CAF50;
        color: white;
    }
    
    .no-btn {
        background: #ff4444;
        color: white;
    }
    
    .notification-button {
        position: relative;
        background: none;
        border: none;
        color: white;
        font-size: 1.2rem;
        cursor: pointer;
        padding: 0.5rem;
    }
    
    .notification-popup {
        right: 25px;
        top: 100px;
        position: fixed;  
        background: #2c3e50;
        color: white;
        width: 300px;
        max-height: 400px;
        overflow-y: auto;
        border-radius: 5px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        z-index: 1000;
    }
    
    .notification-popup h6 {
        padding: 10px;
        margin: 0;
        background: #34495e;
        position: sticky;
        top: 0;
        z-index: 1;
    }
    
    .notification-item {
        padding: 10px;
        border-bottom: 1px solid #34495e;
        cursor: pointer;
        transition: background 0.2s;
    }
    
    .notification-item:hover {
        background: #34495e;
    }
    
    .notification-item.unread {
        background: rgba(52, 152, 219, 0.1);
        font-weight: bold;
    }
    
    .notification-item.read {
        opacity: 0.8;
    }
    
    .notification-message {
        margin-bottom: 5px;
    }
    
    .notification-time {
        font-size: 0.8rem;
        color: #bdc3c7;
    }
    
    #notificationCount {
        position: absolute;
        top: -5px;
        right: -5px;
        background: #e74c3c;
        color: white;
        border-radius: 50%;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.7rem;
    }
    
    /* Responsive adjustments */
    @media (max-width: 768px) {
        #subscriptionList li {
            flex-direction: column;
            align-items: flex-start;
        }
        
        .progress-bar-container {
            width: 100%;
            margin: 10px 0;
        }
        
        .action-btn {
            position: absolute;
            right: 15px;
            top: 15px;
        }
        
        .action-popup {
            right: 50px;
            top: 15px;
            transform: none;
        }
        
        .notification-popup {
            width: 250px;
            right: -20px;
        }
    }
`;
document.head.appendChild(style);