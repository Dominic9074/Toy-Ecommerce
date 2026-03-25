
const isLogedin=(req,res,next)=>{
    if(!req.session.admin){
       return res.redirect('/admin/signin')
    }
     res.locals.isAdmin = true;
    next();
}
const isLoggedOut = (req, res, next) => {
    if (req.session.admin) {
       
        return res.redirect('/admin/dashboard');
    }
    next();
};


export default {isLogedin,isLoggedOut}