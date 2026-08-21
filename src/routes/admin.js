import express from 'express'
const router=express.Router();
import adminController from '../controllers/adminController.js'
import check from '../middleware/adminMiddleware.js'
import upload from '../middleware/upload.js'
import couponController from '../controllers/couponController.js'

router.get('/users',check.isLogedin,adminController.loadUsers)
router.patch("/users/:id/:action", adminController.toggleUserStatus);

router.get('/signin',check.isLoggedOut,adminController.loadSignin)
router.post('/signin',adminController.adminSignin);

//category
router.get('/category',check.isLogedin,adminController.loadCategory)
router.get('/addCategory',check.isLogedin,adminController.loadAddCategory)
router.post('/addCategory',check.isLogedin,upload.single('image'),adminController.createCategory)
router.get('/addCategory/:id/edit',check.isLogedin,adminController.loadEditCategory)
router.post('/addCategory/:id/edit',check.isLogedin,upload.single('image'),adminController.updateCategory)
router.patch('/addCategory/status/:id',check.isLogedin,adminController.updateStatus)

//product
router.get('/products',check.isLogedin,adminController.loadProducts)
router.get('/addProducts',check.isLogedin,adminController.loadAddproduct)
router.post('/addProduct',check.isLogedin,upload.array('images',5),adminController.addProduct)
router.get('/edit-product/:id',check.isLogedin,adminController.loadEditProduct);
router.post('/editProduct/:id',check.isLogedin,upload.array('images',5),adminController.editProduct);
router.patch('/addProduct/status/:id',check.isLogedin,adminController.updateProductStatus)

//order
router.get('/orders',check.isLogedin,adminController.loadOrders)
router.get('/orders/:id',check.isLogedin,adminController.loadOrderDetails)
router.post('/orders/:id/status',check.isLogedin,adminController.updateOrderStatus)
router.post('/update-return-status',check.isLogedin,adminController.updateReturnStatus)

//coupon
router.get('/coupons',check.isLogedin,couponController.loadCoupon);
router.post('/create-coupon',check.isLogedin,couponController.createCoupon);
router.patch('/coupon/status/:id',check.isLogedin,couponController.updateStatus);
router.patch('/coupon-update',check.isLogedin,couponController.updateCoupon);

//dashboard
router.get('/dashboard',check.isLogedin,adminController.loadDashboard)

//sales and report
router.get('/sales',check.isLogedin,adminController.loadSales)

//logout 
router.get('/logout',adminController.logout)

export default router;
