import userServices from '../services/userServices.js'


const isLoggedIn = async (req, res, next) => {
    if (!req.session.user) {
        return res.redirect("/signin");
    }
    const user =await userServices.findUserById(req.session.user.userId)
    if(user.status!=='active'){
        req.session.destroy();
        res.redirect('/');
    }
    next();
};

const isLoggedOut = (req, res, next) => {
    if (req.session.user) {
        return res.redirect("/");
    }
    next();
};

const googleUserStatus=async (req,res,next)=>{
   try{
    if(!req.user){
         return res.render('user/authentication/signin',{title:'signin',bodyClass:'signin-body',error:'User Request Not Working',cssFile: "style.css"})
    }
     const userId=req.user._id;
     const user=await userServices.findUserById(userId);
     if(user.status!=='active'){
       return res.render('user/authentication/signin',{title:'signin',bodyClass:'signin-body',error:'This Accound Is Blocked By Admin',cssFile: "style.css"})
     }
     next();
   }catch(error){
    console.log(error)
    return res.render('user/authentication/signin',{title:'signin',bodyClass:'signin-body',error:error.message,cssFile: "style.css"})
   }
}


export default {isLoggedIn,isLoggedOut,googleUserStatus}


