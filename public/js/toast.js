const successSound = new Audio('/sounds/iphone.mp3')
const errorSound = new Audio('/sounds/fuh.mp3')

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
  successSound.currentTime=0;
  successSound.play().catch(()=>{})
  notyf.success(message);
};

window.showError = function (message) {
  successSound.currentTime=0;
  successSound.play().catch(()=>{})
  notyf.error(message);
};
