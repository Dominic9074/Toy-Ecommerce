

const checkUserSession=(req,res,next)=>{
    if(req.session.user){
        return res.redirect('/home')
    }
    next();
}

const islogedIn=(req,res,next)=>{
    if(!req.session.user){
        return res.redirect('/home')
    }
    next();
}

export default {checkUserSession,islogedIn}


