import userServices from "../services/userServices.js"
import nodemailer from "nodemailer"

//otp generation
function generateOtp(){
    return Math.floor(1000 + Math.random() * 9000)
}
//emailverification
async function sentVerificationEmail(email,otp){
    try {
        const transpoter=nodemailer.createTransport({
            service:'gmail',
            port:587,
            sequre:false,
            requireTLS:true,
            auth:{
                user:process.env.NODEMAILER_EMAIL,
                pass:process.env.NODEMAILER_PASSWORD
            }
        })

        const info=await transpoter.sendMail({
            from:process.env.NODEMAILER_EMAIL,
            to:email,
            subject:"Otp Verification For Accound Creation In Wheelz",
            text:`your otp is ${otp}`,
            html:`<b>Your OTP For Verification Is:${otp}</b>`
        })

        return info.accepted.length>0

    } catch (error) {
        console.error('Error sending email',error)
        return false;
    }
}


const loadSignin=(req,res)=>{
    res.render('user/authentication/signin',{title:'signin',bodyClass:'signin-body'})
}

const loadSignup=(req,res)=>{
    res.render('user/authentication/register',{title: "Register",bodyClass: "register-body"})
}

const signup=async (req,res,next)=>{
    try{
        const {username,email,password}=req.body;

        await userServices.signup(req.body)

        const otp=generateOtp();

        const emailSent=await sentVerificationEmail(email,otp)
        if(!emailSent){
            return res.json("email-error")
        }

        req.session.userOtp=otp;
        req.session.userdata={username,email,password}

        console.log('OTP SENT:',otp)
       return res.render('user/authentication/otp',{title: "OTP verification",bodyClass: "otp-body",purpose:'signin'})

    }catch(err){
        console.log('signup ',err);
        return res.render('user/authentication/register',{title:'SignUp',error:err.message,bodyClass: "signup-body"})
    }
}

const verifyOtp=async (req,res,next)=>{
    const {otp}=req.body;
    if(otp!=req.session.userOtp){
        return res.json({
            success:false,
            message:'OTP does not match'
        })
    }
    if(!otp){
        return res.json({
            success:false,
            message:'OTP required'
        })
    }

    const {username,email,password}=req.session.userdata;

    await userServices.createUserAfterVerification(username,email,password);

    req.session.userOtp=null;
    req.session.userdata=null;

    return res.json({
        success:true,
        message:'Accound Created Successfully'
    })

}

const signIn=async (req,res,next)=>{
    try{
    const user=await userServices.signIn(req.body);
    
    req.session.user={
        email:user.email,
        username:user.name
    }
    res.redirect('/home')

    }catch(error){
        console.log(error)
        res.render('user/authentication/signin',{title:'signin',bodyClass:'signin-body',error:error.message})
    }
}

const loadHome=(req,res,next)=>{
    res.render('user/home',{title:'Home',bodyClass:''})
}

const resendOtp = async (req, res) => {
  try {
    let email;
    let otpKey;

   
    if (req.session.userdata?.email) {
      email = req.session.userdata.email;
    } else if (req.session.resetdata?.email) {
      email = req.session.resetdata.email;
    } else {
      return res.json({
        success: false,
        message: "Session expired"
      });
    }

    const otp = generateOtp();

    const emailSent = await sentVerificationEmail(email, otp);
    if (!emailSent) {
      return res.json({
        success: false,
        message: "OTP not sent. Something went wrong"
      });
    }

    req.session.forgotOtp = otp;

    console.log("RESEND OTP:", otp, "FOR:", email);

    return res.json({
      success: true,
      message: "OTP sent successfully"
    });

  } catch (error) {
    console.log("Resend OTP error:", error);
    return res.json({
      success: false,
      message: "Something went wrong"
    });
  }
};


const loadForget=(req,res)=>{
    res.render('user/authentication/forgot-password',{title:'forget-password',bodyClass:'otp-body'})
}

const loadForgetOtp=async (req,res)=>{
    try{
        const {email}=req.body;
        

        const user=await userServices.checkUser(email)
        const otp=generateOtp();

        const emailSent=await sentVerificationEmail(email,otp)
        if(!emailSent){
            res.render('user/authentication/forgot-password',{title:'forget-password',bodyClass:'otp-body',error:'OTP Not Send Something Went Wrong'})
        }

        req.session.forgotOtp=otp;
        req.session.resetdata={email}

        res.render('user/authentication/otp',{title:'Otp-Verification',bodyClass:'otp-body',purpose:'forgot'})

    }catch(error){
        console.log(error)
        res.render('user/authentication/forgot-password',{title:'forget-password',bodyClass:'otp-body',error:error.message})
    }
}

const verifyForgotOtp=(req,res)=>{
   const {otp}=req.body;
    if(otp!=req.session.forgotOtp){
        return res.json({
            success:false,
            message:'OTP does not match'
        })
    }
    if(!otp){
        return res.json({
            success:false,
            message:'OTP required'
        })
    }

    return res.json({
        success:true,
        message:'OTP Verified Successfully'
    })
}

const loadNewPassword=(req,res)=>{
    if(!req.session.resetdata){
        return res.redirect('/signin');
    }
    res.render('user/authentication/new-password',{title:'new-password',bodyClass:'otp-body'})
}

const resetPassword=async (req,res)=>{
    try{
        const {password}=req.body;
        const email=req.session.resetdata.email;
        console.log(email,password)

    await userServices.resetPassword(password,email)

    req.session.resetdata=null;
    req.session.forgotOtp = null;

    return res.json({
        success:true,
        message:'Password Changed Successfully'
    })
    
    }catch(error){
        console.log(error)
        return res.json({
            success:false,
            message:error.message
        })

    }

}

export default {loadSignin,loadSignup,signup,verifyOtp,signIn,loadHome,resendOtp,loadForget,
    loadForgetOtp,verifyForgotOtp,loadNewPassword,resetPassword}
