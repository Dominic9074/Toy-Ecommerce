document.addEventListener("DOMContentLoaded", function () {

  const hamburger = document.getElementById("hamburger");
  const navLinks = document.querySelector(".nav-links");
  const userActions = document.querySelector(".user-actions");

  const sidebar = document.querySelector(".profile-sidebar");
  const overlay = document.getElementById("sidebarOverlay");

  // ✅ NEW — wallet sidebar
  const walletSidebar = document.querySelector(".w-sidebar");

  if (!hamburger) return;

  hamburger.addEventListener("click", function () {

    // ✅ Profile page
    if (sidebar) {
      sidebar.classList.toggle("sidebar-open");
      if (overlay) overlay.classList.toggle("active");
      if (navLinks) navLinks.classList.remove("mobile-open");
      if (userActions) userActions.classList.remove("mobile-open");

    }
    // ✅ NEW — Wallet page
    else if (walletSidebar) {
      walletSidebar.classList.toggle("open");
      if (overlay) overlay.classList.toggle("active");
      document.body.style.overflow = walletSidebar.classList.contains("open") ? "hidden" : "";
      if (navLinks) navLinks.classList.remove("mobile-open");
      if (userActions) userActions.classList.remove("mobile-open");

    }
    // ✅ All other normal pages
    else {
      if (navLinks) navLinks.classList.toggle("mobile-open");
      if (userActions) userActions.classList.toggle("mobile-open");
    }

  });

  // Close sidebar when clicking overlay
  if (overlay) {
    overlay.addEventListener("click", function () {
      if (sidebar) {
        sidebar.classList.remove("sidebar-open");
      }
      if (walletSidebar) {
        walletSidebar.classList.remove("open");
        document.body.style.overflow = "";
      }
      overlay.classList.remove("active");
    });
  }

});