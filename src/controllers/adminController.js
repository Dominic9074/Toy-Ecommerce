import adminServices from '../services/adminServices.js'


const loadUsers = async (req,res) => {
  try {

    const search = req.query.search || "";
    const status=req.query.status || 'all';
    const page = parseInt(req.query.page) || 1;
    const limit = 10;

    const { users, totalUsers ,totalPages } = await adminServices.getUsersService(
      search,
      page,
      limit,
      status
    );

    res.render('admin/users', {
      title:'user management',
      bodyClass:'admin-body',
      cssFile: "admin.css",
      users,
      search,
      status,
      page,
      totalPages
    });

  } catch(error) {

    res.render('admin/users', {
      title:'user management',
      bodyClass:'admin-body',
      cssFile: "admin.css",
      users: [],
      search: "",     
      error: error.message
    });

  }
};

const toggleUserStatus=async (req,res)=>{
    try{
        const {id,action}=req.params;

        const newStatus=action=='block'?'blocked':'active';
        await adminServices.toggleUserStatus(id,newStatus);

        return res.json({
            success: true,
            message: `User ${newStatus} successfully`
            });

    }catch(error){
       return  res.json({
            success: false,
            message: error.message
            });
    }
}

const loadSignin=(req,res)=>{
    res.render('admin/signin',{title:'admin signin',bodyClass:'signin-body',cssFile:'style.css'});
}

const adminSignin=(req,res)=>{
    const {email,password}=req.body;

    if(email!=process.env.ADMIN_EMAIL){
        return res.render('admin/signin',{title:'admin signin',bodyClass:'signin-body',cssFile:'style.css',error:'This Email Does Not Exist As Admin'})
    }
    if(password!=process.env.ADMIN_PASSWORD){
        return res.render('admin/signin',{title:'admin signin',bodyClass:'signin-body',cssFile:'style.css',error:'Password Does Not Match'})
    }
    req.session.admin={
        email:email
    }
    
    return res.redirect('/admin/users')

}

const loadCategory=(req,res)=>{
  res.render('admin/categoryManagement',{title:'Category',bodyClass:'',cssFile:'admin.css'})
}

export default {
    loadUsers,toggleUserStatus,loadSignin,adminSignin,loadCategory
}


