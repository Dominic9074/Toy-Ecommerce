import express from "express";
const router=express.Router();
import userController from '../controllers/userController.js'
import userMiddleware from "../middleware/userMiddleware.js";


router.get('/signin',userMiddleware.checkUserSession,userController.loadSignin)
router.post('/signin',userController.signIn)

router.get('/signup',userController.loadSignup)
router.post('/signup',userController.signup)

router.post('/verify-otp',userController.verifyOtp)

router.get('/home',userController.loadHome)

router.post('/resendOtp',userController.resendOtp)

router.get('/forgot-password',userController.loadForget)
router.post('/forgot-password',userController.loadForgetOtp)
router.post('/verify-forgot',userController.verifyForgotOtp)
router.get('/new-password',userController.loadNewPassword)
router.post('/reset-password',userController.resetPassword)





export default router;

