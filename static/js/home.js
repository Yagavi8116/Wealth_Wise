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

document.addEventListener("DOMContentLoaded", () => {
    // ✅ Retrieve userName from localStorage
    const displayName = localStorage.getItem("userName");

    if (displayName && displayName !== "User") {
        document.getElementById("displayName").textContent = displayName;
    } else {
        console.error("User name not found in localStorage!");
        document.getElementById("displayName").textContent = "Guest";
    }
});

console.log(localStorage.getItem("userName"));
