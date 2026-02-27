import express from "express";
const router = express.Router();

import userController from "../controllers/userController.js";
import userMiddleware from "../middleware/userMiddleware.js";
import passport from "../config/passport.js";
import productController from "../controllers/productController.js";

// local auth
router.get("/", userController.loadHome);

router.get("/signin", userMiddleware.isLoggedOut, userController.loadSignin);
router.post("/signin", userMiddleware.isLoggedOut, userController.signIn);
//signup
router.get("/signup", userMiddleware.isLoggedOut, userController.loadSignup);
router.post("/signup", userMiddleware.isLoggedOut, userController.signup);
//passwordChange
router.get("/forgot-password", userMiddleware.isLoggedOut, userController.loadForget);
router.post("/forgot-password", userMiddleware.isLoggedOut, userController.loadForgetOtp);
router.post("/verify-forgot", userMiddleware.isLoggedOut, userController.verifyForgotOtp);
router.get("/new-password", userMiddleware.isLoggedOut, userController.loadNewPassword);
router.post("/reset-password", userMiddleware.isLoggedOut, userController.resetPassword);
//otppage
router.get("/otppage", userController.loadOtp);
router.post("/verify-otp", userController.verifyOtp);
router.post("/resendOtp", userController.resendOtp);
//profile
router.get("/user/profile", userMiddleware.isLoggedIn, userController.loadProfile);
router.post("/updateProfile", userMiddleware.isLoggedIn, userController.updateProfile);
router.post("/verify-email", userMiddleware.isLoggedIn, userController.verifyEmail);
router.post("/changePassword", userMiddleware.isLoggedIn, userController.changePassword);
//addAddress
router.get("/addAddress", userMiddleware.isLoggedIn, userController.loadAddress);
router.post("/addAddress", userMiddleware.isLoggedIn, userController.addAddress);
router.post("/removeAddress", userMiddleware.isLoggedIn, userController.removeAddress);
router.get('/editAddress/:id',userController.loadEditAddress)
router.post('/updateAddress/:addressId',userController.updateAddress)
//logout
router.get("/logout", userMiddleware.isLoggedIn, userController.logoutUser);

//shop
router.get('/shop',productController.loadShop)

//productDetails
router.get('/product/:slug',productController.loadProductDetails)

//cartpage
router.get('/cart',productController.loadCartPage)

//wishlist
router.get('/wishlist',productController.loadWishlist)
router.post('/addWishlist',productController.addWishlist)



// 🔐 Google Auth
router.get("/auth/google",passport.authenticate("google", {scope: ["profile", "email"]}));

router.get("/auth/google/callback",passport.authenticate("google", {failureRedirect: "/signup"}),userMiddleware.googleUserStatus,
  (req, res) => {
    req.session.user = {userId: req.user._id,email: req.user.email,username: req.user.name};
    res.redirect("/");
  }
);

export default router;


