document.addEventListener("DOMContentLoaded", function () {
  const hamburger = document.getElementById("hamburger");
  const navLinks = document.querySelector(".nav-links");
  const userActions = document.querySelector(".user-actions");

  hamburger.addEventListener("click", function () {
    navLinks.classList.toggle("mobile-active");
    userActions.classList.toggle("mobile-active");
  });
});
document.addEventListener("DOMContentLoaded", function () {

  const hamburger = document.getElementById("hamburger");
  const navLinks = document.querySelector(".nav-links");
  const userActions = document.querySelector(".user-actions");

  const sidebar = document.querySelector(".profile-sidebar");
  const overlay = document.getElementById("sidebarOverlay");

  // Header dropdown (mobile)
  if (hamburger) {
    hamburger.addEventListener("click", function () {
      navLinks.classList.toggle("mobile-open");
      userActions.classList.toggle("mobile-open");

      // If profile page → open sidebar
      if (sidebar) {
        sidebar.classList.toggle("sidebar-open");
        overlay.classList.toggle("active");
      }
    });
  }

  // Click outside to close sidebar
  if (overlay) {
    overlay.addEventListener("click", function () {
      sidebar.classList.remove("sidebar-open");
      overlay.classList.remove("active");
    });
  }

});

