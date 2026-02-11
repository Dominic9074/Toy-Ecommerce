
const isLogedin=(req,res,next)=>{
    if(!req.session.admin){
       return res.redirect('/admin/signin')
    }
    next();
}
const isLoggedOut = (req, res, next) => {
    if (req.session.admin) {
        return res.redirect('/admin/dashboard');
    }
    next();
};


export default {isLogedin,isLoggedOut}