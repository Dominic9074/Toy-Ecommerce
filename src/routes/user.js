import express from "express";
const router = express.Router();

import userController from "../controllers/userController.js";
import userMiddleware from "../middleware/userMiddleware.js";
import passport from "../config/passport.js";

// local auth
router.get("/signin", userMiddleware.checkUserSession, userController.loadSignin);
router.post("/signin", userController.signIn);

router.get("/signup", userController.loadSignup);
router.post("/signup", userController.signup);

router.get('/otppage',userController.loadOtp)

router.post("/verify-otp", userController.verifyOtp);

router.get("/home", userController.loadHome);

router.post("/resendOtp", userController.resendOtp);

router.get("/forgot-password", userController.loadForget);
router.post("/forgot-password", userController.loadForgetOtp);
router.post("/verify-forgot", userController.verifyForgotOtp);
router.get("/new-password", userController.loadNewPassword);
router.post("/reset-password", userController.resetPassword);

router.get('/user/profile',userMiddleware.islogedIn,userController.loadProfile)
router.post('/updateProfile',userController.updateProfile)
router.post('/verify-email',userController.verifyEmail)

router.post('/changePassword',userController.changePassword)

router.get('/addAddress',userController.loadAddress)
router.post('/addAddress',userController.addAddress)
router.post('/removeAddress',userController.removeAddress)

// 🔐 Google Auth
router.get("/auth/google",passport.authenticate("google", {scope: ["profile", "email"]}));

router.get("/auth/google/callback",passport.authenticate("google", {failureRedirect: "/signup"}),
  (req, res) => {
    req.session.user = {userId: req.user._id,email: req.user.email,username: req.user.name};
    res.redirect("/home");
  }
);

export default router;


