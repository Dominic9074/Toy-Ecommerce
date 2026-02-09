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
       return res.render('user/authentication/otp',{title: "OTP verification",bodyClass: "otp-body"})

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

const resendOtp=async (req,res)=>{
    
    if(!req.session.userdata){
        return res.json({
            success:false,
            message:'Session Expired'
        })
    }


    const otp=generateOtp();
    
    const emailSent=await sentVerificationEmail(req.session.userdata.email,otp)
    if(!emailSent){
        return res.json({
            success:false,
            message:'OTP Not Sended.SomeThing Went Wrong'
        })
    }
        req.session.userOtp=otp;
        
        return res.json({
            success:true,
            message:'OTP Send Successfully'
        })
    


}

export default {loadSignin,loadSignup,signup,verifyOtp,signIn,loadHome,resendOtp}
