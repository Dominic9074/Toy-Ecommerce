import couponServices from '../services/couponServices.js'

const loadCoupon=async (req,res)=>{
    const coupons=await couponServices.getFilteredCoupon();
    res.render('admin/couponManagement',{title:'Coupon',bodyClass:'',cssFile:'admin.css',coupons})
}

const createCoupon=async (req,res)=>{
    try{
        const coupon=await couponServices.createCoupon(req.body)
        if(!coupon){
            return res.json({
                success:false,
                message:'Coupon Not Created'
            })
        }
        return res.json({
            success:true,
            message:'Coupon Created Successfully'
        })
    }catch(error){
        console.log(error);
        res.json({
            success:false,
            message:error.message
        })
    }
}

const updateStatus=async (req,res)=>{
    try{
        const couponCode=req.params.id;
        const coupon=await couponServices.updateCouponStatus(couponCode);
        if(!coupon){
            return res.json({
                success:false,
                message:"Coupon Not Found"
            })
        }
        res.json({
            success:true,
            message:'Status Changed Successfully'
        })
    }catch(error){
        console.log(error);
        res.json({
            success:false,
            message:error.message
        })
    }
}

const updateCoupon=async (req,res)=>{
      try{
        const updateCouponCode=req.body.updateCouponCode
        const coupon = await couponServices.updateCoupon(updateCouponCode,req.body)

        return res.json({
            success:true,
            message:"Coupon updated successfully"
        })

    }catch(error){
        console.log(error);

        return res.json({
            success:false,
            message:error.message
        })
    }
}

export default {loadCoupon,createCoupon,updateStatus,updateCoupon}