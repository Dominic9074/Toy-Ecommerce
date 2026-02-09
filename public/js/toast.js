const notyf = new Notyf({
  duration: 3000,
  position: {
    x: "right",
    y: "top"
  },
  dismissible: true,
  ripple: true
});

window.showSuccess = function (message) {
  notyf.success(message);
};

window.showError = function (message) {
  notyf.error(message);
};
