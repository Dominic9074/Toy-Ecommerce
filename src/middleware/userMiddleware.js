

const checkUserSession=(req,res,next)=>{
    if(req.session.user){
        return res.redirect('/home')
    }
    next();
}


const isLoggedIn = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect("/signin");
    }
    next();
};

const isLoggedOut = (req, res, next) => {
    if (req.session.user) {
        return res.redirect("/");
    }
    next();
};


export default {checkUserSession,isLoggedIn,isLoggedOut}


