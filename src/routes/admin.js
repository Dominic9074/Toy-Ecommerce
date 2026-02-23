import express from 'express'
const router=express.Router();
import adminController from '../controllers/adminController.js'
import check from '../middleware/adminMiddleware.js'
import upload from '../middleware/upload.js'

router.get('/admin/users',check.isLogedin,adminController.loadUsers)
router.patch("/admin/users/:id/:action", adminController.toggleUserStatus);

router.get('/admin/signin',check.isLoggedOut,adminController.loadSignin)
router.post('/admin/signin',adminController.adminSignin);

//category
router.get('/admin/category',adminController.loadCategory)
router.get('/admin/addCategory',adminController.loadAddCategory)
router.post('/admin/addCategory',upload.single('image'),adminController.createCategory)
router.get('/admin/addCategory/:id/edit',adminController.loadEditCategory)
router.post('/admin/addCategory/:id/edit',upload.single('image'),adminController.updateCategory)
router.patch('/admin/addCategory/status/:id',adminController.updateStatus)

//product
router.get('/admin/products',(req,res)=>{res.render('admin/productManagement',{title:'Products',bodyClass:"",cssFile:'admin.css'})})
router.get('/admin/addProducts',adminController.loadAddproduct)

export default router;
