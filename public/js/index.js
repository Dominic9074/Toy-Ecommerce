document.addEventListener("DOMContentLoaded", function () {

  const hamburger = document.getElementById("hamburger");
  const navLinks = document.querySelector(".nav-links");
  const userActions = document.querySelector(".user-actions");

  const sidebar = document.querySelector(".profile-sidebar");
  const overlay = document.getElementById("sidebarOverlay");

  if (!hamburger) return;

  hamburger.addEventListener("click", function () {

    // ✅ If profile page (sidebar exists)
    if (sidebar) {

      sidebar.classList.toggle("sidebar-open");
      if (overlay) overlay.classList.toggle("active");

      // 🚫 Make sure navbar buttons NEVER open here
      if (navLinks) navLinks.classList.remove("mobile-open");
      if (userActions) userActions.classList.remove("mobile-open");

    } 
    // ✅ Other normal pages
    else {

      if (navLinks) navLinks.classList.toggle("mobile-open");
      if (userActions) userActions.classList.toggle("mobile-open");

    }

  });

  // Close sidebar when clicking overlay
  if (overlay && sidebar) {
    overlay.addEventListener("click", function () {
      sidebar.classList.remove("sidebar-open");
      overlay.classList.remove("active");
    });
  }

});
