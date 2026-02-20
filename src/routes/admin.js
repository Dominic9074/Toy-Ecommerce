import express from 'express'
const router=express.Router();
import adminController from '../controllers/adminController.js'
import check from '../middleware/adminMiddleware.js'

router.get('/admin/users',check.isLogedin,adminController.loadUsers)
router.patch("/admin/users/:id/:action", adminController.toggleUserStatus);

router.get('/admin/signin',check.isLoggedOut,adminController.loadSignin)
router.post('/admin/signin',adminController.adminSignin);

//catefory
router.get('/admin/category',adminController.loadCategory)
router.get('/admin/addCategory',(req,res)=>{res.render('admin/addCategory',{title:'addCategory',bodyClass:"",cssFile:'admin.css'})})

//product
router.get('/admin/product',(req,res)=>{res.render('admin/productManagement',{title:'Products',bodyClass:"",cssFile:'admin.css'})})
router.get('/admin/addProduct',(req,res)=>{res.render('admin/addProduct',{title:'addProduct',bodyClass:"",cssFile:'admin.css'})})

export default router;
