import userServices from "../services/userServices.js"
import nodemailer from "nodemailer"
import productServices from "../services/productServices.js"

//otp generation
function generateOtp(){
    return Math.floor(1000 + Math.random() * 9000)
}
//emailverification
async function sentVerificationEmail(email,otp){
    try {
        const transporter=nodemailer.createTransport({
            service:'gmail',
            port:587,
            sequre:false,
            requireTLS:true,
            auth:{
                user:process.env.NODEMAILER_EMAIL,
                pass:process.env.NODEMAILER_PASSWORD
            }
        })

        const info = await transporter.sendMail({
        from: process.env.NODEMAILER_EMAIL,
        to: email,
        subject: "OTP Verification - Wheelz",

        text: `Your OTP is ${otp}. It expires in 5 minutes. Do not share this OTP with anyone.`,

        html: `
            <p>Hello,</p>

            <p>Your OTP for verification is:</p>

            <h2>${otp}</h2>

            <p><strong>This OTP will expire in 5 minutes.</strong></p>

            <p style="color: red;">
                Please do NOT share this OTP with anyone.
            </p>

            <p>If you did not request this, please ignore this email.</p>

            <p>– Team Wheelz</p>`
    });

        return info.accepted.length>0

    } catch (error) {
        console.error('Error sending email',error)
        return false;
    }
}


const loadSignin=(req,res)=>{
    res.render('user/authentication/signin',{title:'signin',bodyClass:'signin-body',cssFile: "style.css"})
}

const loadOtp=(req,res)=>{
    const purpose=req.query.purpose;
    res.render('user/authentication/otp',{title: "OTP verification",bodyClass: "otp-body",purpose,cssFile: "style.css"});
}

const loadSignup=(req,res)=>{
    res.render('user/authentication/register',{title: "Register",bodyClass: "register-body",cssFile: "style.css"})
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
        req.session.otpExpires = Date.now() + (2 * 60 * 1000);
        req.session.userdata={username,email}

        console.log('OTP SENT:',otp)
       return res.redirect('/otppage?purpose=signup')

    }catch(err){
        console.log('signup ',err);
        return res.render('user/authentication/register',{title:'SignUp',error:err.message,bodyClass: "signup-body",cssFile: "style.css"})
    }
}

const verifyOtp=async (req,res)=>{
    const {otp}=req.body;
    if (!req.session.userOtp || !req.session.otpExpires) {
    return res.json({
        success: false,
        message: "OTP session expired. Please request again."
        });
    }

    if (Date.now() > req.session.otpExpires) {
            req.session.emailOtp = null;
            req.session.otpExpires = null;

            return res.json({
                success: false,
                message: "OTP has expired. Please request a new one."
            });
    }
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
    req.session.otpExpires=null;

    return res.json({
        success:true,
        message:'Accound Created Successfully'
    })

}

const signIn=async (req,res,next)=>{
    try{
    const user=await userServices.signIn(req.body);
    
    req.session.user={
        userId:user._id,
        email:user.email,
        username:user.name
    }
    res.redirect('/')

    }catch(error){
        console.log(error)
        res.render('user/authentication/signin',{title:'signin',bodyClass:'signin-body',error:error.message,cssFile: "style.css"})
    }
}

const loadHome=async (req,res)=>{
    try {
    const categories = await productServices.getAllActiveCategories(); // Get only active ones
    res.render('user/home', {title:'Home',bodyClass:'',cssFile: "style.css",categories,user: req.session.user || null});
  } catch (error) {
    console.log(error)
    res.render('user/home', {title:'Home',bodyClass:'',cssFile: "style.css",categories: [] });
  }
}

const resendOtp = async (req, res) => {
  try {
    let email;
    let purpose=req.query.purpose
    console.log(purpose)
   
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

    if(purpose==='signup'){
        req.session.userOtp=otp
    }else if(purpose=='forgot'){
        req.session.forgotOtp=otp
    }else{
        req.session.emailOtp=otp
    }
    req.session.otpExpires=Date.now()+(2*60*1000)

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
    res.render('user/authentication/forgot-password',{title:'forget-password',bodyClass:'otp-body',cssFile: "style.css"})
}

const loadForgetOtp=async (req,res)=>{
    try{
        const {email}=req.body;
        

        const user=await userServices.checkUser(email)
        const otp=generateOtp();

        const emailSent=await sentVerificationEmail(email,otp)
        if(!emailSent){
            res.render('user/authentication/forgot-password',{title:'forget-password',bodyClass:'otp-body',error:'OTP Not Send Something Went Wrong',cssFile: "style.css"})
        }

        req.session.forgotOtp=otp;
        req.session.resetdata={email}

        res.redirect('/otppage?purpose=forgot')

    }catch(error){
        console.log(error)
        res.render('user/authentication/forgot-password',{title:'forget-password',bodyClass:'otp-body',error:error.message,cssFile: "style.css"})
    }
}

const verifyForgotOtp=(req,res)=>{
   const {otp}=req.body;
   if (!req.session.forgotOtp || !req.session.otpExpires) {
    return res.json({
        success: false,
        message: "OTP session expired. Please request again."
        });
    }

    if (Date.now() > req.session.otpExpires) {
            req.session.emailOtp = null;
            req.session.otpExpires = null;

            return res.json({
                success: false,
                message: "OTP has expired. Please request a new one."
            });
    }
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
    req.session.forgotOtp=null;
    req.session.otpExpires=null;

    return res.json({
        success:true,
        message:'OTP Verified Successfully'
    })
}

const loadNewPassword=(req,res)=>{
    if(!req.session.resetdata){
        return res.redirect('/signin');
    }
    res.render('user/authentication/new-password',{title:'new-password',bodyClass:'otp-body',cssFile: "style.css"})
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


const loadProfile=async(req,res)=>{
    try{
        const userId=req.session.user.userId;

        const user=await userServices.findUserById(userId);

    res.render('user/profile',{title:'profile',bodyClass:'profile-body',address:user.address,cssFile: "style.css"});
    }catch(error){
        console.log(error);
    }
}

const updateProfile=async (req,res)=>{
   try{
     const {email,name}=req.body;

    const user=await userServices.findUser(req.session.user.email);
    let update={}
    let emailChanged=false;
    if (user.googleId) {
    return res.json({
        success: false,
        message: "Google login users cannot update profile manually"
    })}

    if(name && name!==user.name){
        update.name=name;
    }

    if(email && email!==user.email){
        emailChanged=true;
        update.email=email;
    }

    if(Object.keys(update).length===0){
        return res.json({
            success:false,
            message:'No Changes Detected'
        })
    }

    if(emailChanged){
        req.session.pendingProfileUpdates=update;
        const emailExists = await userServices.findUser(email);
        if (emailExists) {
            return res.json({
            success: false,
            message: "Email already in use"
            });
        }
        const otp=generateOtp();
        console.log(otp)
        const emailSend=await sentVerificationEmail(email,otp);
        if(!emailSend){
            return res.json({
                success:false,
                message:'OTP Not Send Something Went Wrong'
            });
        }
        req.session.emailOtp=otp;
        return res.json({
            success:true,
            message:'Verify New Email To Continue',
            redirect:'/otppage?purpose=email'
        })
    }
    await userServices.updateUserName(req.session.user.userId,update)

    req.session.user.username=update.name;

    return res.json({
        success:true,
        message:'Profile Updated Successfully'
    })
    

   }catch(error){
    console.log(error);
   }
}


const verifyEmail=async (req,res)=>{
   try{
     const {otp}=req.body;
    if(!otp){
        return res.json({
            success:false,
            message:'Otp Not Found'
        })
    }
    if(otp!=req.session.emailOtp){
        return res.json({
            success:false,
            message:'OTP Does Not Match'
        })
    }

    req.session.emailOtp=null;
    const userId=req.session.user.userId
    await userServices.updateProfile(req.session.pendingProfileUpdates,userId)
    req.session.user.email=req.session.pendingProfileUpdates.email;
    return res.json({
        success:true,
        message:'Email Changed Successfully'
    })
   }catch(error){
    console.log(error);
    return res.json({
        success:false,
        message:error.message
    })
   }
}

const changePassword=async (req,res)=>{
    try{
        const {currentPassword,newPassword}=req.body;
    const userId=req.session.user.userId;
    const user =await userServices.findUserById(userId)
    if(user.googleId){
        return res.json({
            success:false,
            message:'Google Users Cannot Change Password'
        })
    }
    if (!currentPassword || !newPassword) {
      return res.json({
        success: false,
        message: "All fields are required"
      });
    }
    await userServices.comparePasswordAndUpdate(userId,currentPassword,newPassword)

      return res.json({
      success: true,
      message: "Password changed successfully"});

    }catch(error){
        console.log(error);
        return res.json({
            success:false,
            message:error.message
        })
    }
}

const loadAddress=(req,res)=>{
    res.render('user/addAddress',{title:'Add Address',bodyClass:'address-body',cssFile: "style.css",isEdit:false,address:undefined})
}

const addAddress=async (req,res)=>{
    try{
        const userId=req.session.user.userId;
        const address=await userServices.addAddress(userId,req.body)
        return res.json({
            success:true,
            message:'Address Added Successfully',
            address
        })

    }catch(error){
        console.log(error);
        return res.json({
            success:false,
            message:error.message
        })
    }
}

const removeAddress=async (req,res)=>{
    try{
        const userId=req.session.user.userId;
        const addressId=req.query.addressId;
        console.log(userId,addressId)
        await userServices.removeAddress(userId,addressId);

        return res.json({
            success:true,
            message:'Address Removed Successfully'
        })

    }catch(error){
        console.log(error);
        return res.json({
            success:false,
            message:error.message
        })
    }
}

const logoutUser = (req, res) => {

    delete req.session.user

    return res.redirect("/signin");
    

};

const loadEditAddress=async (req,res)=>{
    const userId=req.session.user.userId
    const addressId=req.params.id;
    const user=await userServices.findUserById(userId)
    const address=user.address.id(addressId)
    console.log(addressId,address)
    if(!user){
        return res.json({
            success:false,
            message:'User Not Found'
        })
    }
    return res.render('user/addAddress',{address,addressId,isEdit:true,title:'Edit Address',bodyClass:'address-body',cssFile:'style.css'})
}

const updateAddress=async (req,res)=>{
    const userId=req.session.user.userId
    const addressId=req.params.addressId;

    const user=await userServices.findUserById(userId)
    const address=user.address.id(addressId)
    if(!user){
        return res.json({
            success:false,
            message:'User Not Found'
        })
    }

     const { fullname, phone, pincode, street, state, city,addressType} = req.body;

     if(address.fullname===fullname&&address.phone===phone&&address.pincode===pincode&&address.street===street
        &&address.state===state&&address.city===city&&address.addressType===addressType){
            return res.json({
                success:false,
                message:'No Changes Detected'
            })
     }

        address.fullname=fullname;
        address.phone = phone;
        address.pincode = pincode;
        address.street = street;
        address.state = state;
        address.city = city;
        address.addressType=addressType;

        user.save();

        return res.json({
            success:true,
            message:'Address Updated Successfully'
        })


}


export default {loadSignin,loadSignup,signup,verifyOtp,signIn,loadHome,resendOtp,loadForget,
    loadForgetOtp,verifyForgotOtp,loadNewPassword,resetPassword,loadProfile,updateProfile,verifyEmail,loadOtp,
    changePassword,loadAddress,addAddress,removeAddress,logoutUser,updateAddress,loadEditAddress
}
