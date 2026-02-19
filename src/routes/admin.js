import express from 'express'
const router=express.Router();
import adminController from '../controllers/adminController.js'
import check from '../middleware/adminMiddleware.js'

router.get('/admin/users',check.isLogedin,adminController.loadUsers)
router.patch("/admin/users/:id/:action", adminController.toggleUserStatus);

router.get('/admin/signin',check.isLoggedOut,adminController.loadSignin)
router.post('/admin/signin',adminController.adminSignin);



export default router;
