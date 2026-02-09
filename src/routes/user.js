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

router.get('/otp',(req,res)=>{
    res.render('user/authentication/otp',{title:'otp',bodyClass:'otp-body'})
})

router.post('/resendOtp',userController.resendOtp)




export default router;

