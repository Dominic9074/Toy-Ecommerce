import express from 'express'
const router=express.Router();
import adminController from '../controllers/adminController.js'
import check from '../middleware/adminMiddleware.js'
import upload from '../middleware/upload.js'
import couponController from '../controllers/couponController.js'

router.get('/admin/users',check.isLogedin,adminController.loadUsers)
router.patch("/admin/users/:id/:action", adminController.toggleUserStatus);

router.get('/admin/signin',check.isLoggedOut,adminController.loadSignin)
router.post('/admin/signin',adminController.adminSignin);

//category
router.get('/admin/category',check.isLogedin,adminController.loadCategory)
router.get('/admin/addCategory',check.isLogedin,adminController.loadAddCategory)
router.post('/admin/addCategory',check.isLogedin,upload.single('image'),adminController.createCategory)
router.get('/admin/addCategory/:id/edit',check.isLogedin,adminController.loadEditCategory)
router.post('/admin/addCategory/:id/edit',check.isLogedin,upload.single('image'),adminController.updateCategory)
router.patch('/admin/addCategory/status/:id',check.isLogedin,adminController.updateStatus)

//product
router.get('/admin/products',check.isLogedin,adminController.loadProducts)
router.get('/admin/addProducts',check.isLogedin,adminController.loadAddproduct)
router.post('/admin/addProduct',check.isLogedin,upload.array('images',5),adminController.addProduct)
router.get('/admin/edit-product/:id',check.isLogedin,adminController.loadEditProduct);
router.post('/admin/editProduct/:id',check.isLogedin,upload.array('images',5),adminController.editProduct);
router.patch('/admin/addProduct/status/:id',check.isLogedin,adminController.updateProductStatus)

//order
router.get('/admin/orders',check.isLogedin,adminController.loadOrders)
router.get('/admin/orders/:id',check.isLogedin,adminController.loadOrderDetails)
router.post('/admin/orders/:id/status',check.isLogedin,adminController.updateOrderStatus)
router.post('/admin/update-return-status',check.isLogedin,adminController.updateReturnStatus)

//coupon
router.get('/admin/coupons',check.isLogedin,couponController.loadCoupon);
router.post('/admin/create-coupon',check.isLogedin,couponController.createCoupon);
router.patch('/admin/coupon/status/:id',check.isLogedin,couponController.updateStatus);
router.patch('/admin/coupon-update',check.isLogedin,couponController.updateCoupon);

//dashboard
router.get('/admin/dashboard',check.isLogedin,adminController.loadDashboard)

//sales and report
router.get('/admin/sales',check.isLogedin,adminController.loadSales)

//logout 
router.get('/admin/logout',adminController.logout)

export default router;
