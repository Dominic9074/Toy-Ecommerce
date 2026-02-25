import adminServices from '../services/adminServices.js'
import productServices from "../services/productServices.js"

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
//LOAD CATEGORY
const loadCategory=async (req,res)=>{
    try{
      const search=req.query.search || '';
      const status=req.query.status || 'all';
      const page=parseInt(req.query.page) || 1;
      
          
        const categories=await productServices.find(search,status,page);

    res.render('admin/categoryManagement',{title:'addCategory',bodyClass:"",cssFile:'admin.css',categories,search,status,page})
    }catch(error){
        console.log(error)
    }
}
//load Addcategory
const loadAddCategory=async (req,res)=>{
  const purpose=req.query.purpose;
  const category=undefined;
  console.log(purpose)
    res.render('admin/addcategory',{title:'addCategory',bodyClass:"",cssFile:'admin.css',purpose,category})
}

//create Category
const createCategory=async (req,res)=>{
    try{
        if(!req.file){
            return res.json({
                success:false,
                message:'Image Is Required'
            })
        }

        const category=await productServices.createCategory(req.file,req.body)

        if(!category){
            return res.json({
                success:false,
                message:'Category Not Stored'
            })
        }

        return res.json({
            success:true,
            message:'Category Created Successfully'
        })
        

    }catch(error){
        console.log(error)
        return res.json({
            success:false,
            message:error.message
        })
    }
}

const loadEditCategory=async (req,res)=>{
    try{
      const purpose='edit'
    const categoryId=req.params.id;
    const category=await productServices.findCategoryById(categoryId);

    res.render('admin/addcategory',{title:'addCategory',bodyClass:"",cssFile:'admin.css',purpose,category})

    }catch(error){
      console.log(error);
    }
}

const updateCategory=async (req,res)=>{
    try{

      const categoryId=req.params.id;

      const category=await productServices.findCategoryById(categoryId);

      const {name,description}=req.body;

      const isImageChanged=req.file ? true : false;

      if(!isImageChanged && name===category.name && description===category.description){
          return res.json({
            success:false,
            message:'No Changes Dictated'
          })
      }

      const updateCategory=await productServices.updateCategory(name,description,categoryId,req.file);

      return res.json({
        success:true,
        message:'Category Updated Successfully'
      })

    }catch(error){
      console.log(error)
      return res.json({
        success:false,
        message:error.message
      })
    }
}

const updateStatus=async (req,res)=>{
    try{
        const categoryId=req.params.id;

        const category=await productServices.findCategoryById(categoryId);
        if(category.status==='Active'){
            category.status='Inactive'
        }else{
            category.status='Active'
        }
        await category.save();
        return res.json({
            success:true,
            message:'Status Updated Successfully'
        })

    }catch(error){
        console.log(error);
        return res.json({
            success:false,
            message:error.message 
        })
    }
}

const loadAddproduct=async (req,res)=>{
    try{
        const purpose='create';
        const categories=await productServices.getAllActiveCategories();
         res.render('admin/addProduct',{title:'Products',bodyClass:"",cssFile:'admin.css',categories,purpose,product:undefined})
    }catch(error){
        console.log(error)
    }
   
}

const addProduct=async (req,res)=>{
   try{
        if(!req.files){
            return res.json({
                success:false,
                message:'Image Is Required'
            })
        }

        const product=await productServices.createProduct(req.files,req.body)

        if(!product){
            return res.json({
                success:false,
                message:'Category Not Stored'
            })
        }

        return res.json({
            success:true,
            message:'Product Created Successfully'
        })
        

    }catch(error){
        console.log(error)
        return res.json({
            success:false,
            message:error.message
        })
    }
}

const loadProducts=async (req,res)=>{
   try{
     const products=await productServices.getAllProducts();
     if(!products){
        throw new Error('Products Not Fetched')
     }
    
    res.render('admin/productManagement',{title:'Products',bodyClass:"",cssFile:'admin.css',products})

   }catch(error){
    console.log(error)
    res.render('admin/productManagement',{title:'Products',bodyClass:"",cssFile:'admin.css',error:error.message})
   }
}

const loadEditProduct=async (req,res)=>{
   try{
     const productId=req.params.id;
    const product=await productServices.findProductById(productId);
    const categories=await productServices.getAllActiveCategories();
    const purpose='edit'

    return res.render('admin/addProduct',{title:'Products',bodyClass:"",cssFile:'admin.css',categories,product,purpose})
    
   }catch(error){
    console.log(error)
   }
}

export default {
    loadUsers,toggleUserStatus,loadSignin,adminSignin,createCategory,loadCategory,loadAddCategory,loadEditCategory,updateCategory,
    updateStatus,loadAddproduct,addProduct,loadProducts,loadEditProduct
}


