import Coupon from "../models/couponSchema.js";

const createCoupon=async (data)=>{
    const {couponCode,discountValue,expiryDate,minOrder,maxDiscount,discountType}=data;
   const coupon= await Coupon.create({
        code:couponCode.toUpperCase(),
        discountType,
        discountValue,
        minOrderAmount:minOrder,
        maxDiscount,
        expiryDate,
    })
    return coupon;
}

const getFilteredCoupon=async (page,limit)=>{
    const skip = (page - 1) * limit;

    const totalCoupons = await Coupon.countDocuments();

    const coupons = await Coupon.find()
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }); // optional (latest first)

    return {
        coupons,
        totalCoupons
    };
}

const updateCouponStatus=async (couponCode)=>{
    const coupon=await Coupon.findOne({code:couponCode.toUpperCase()})
    if(!coupon){
        throw new Error('Coupon Not Found')
    }
    if(coupon.isActive===true){
        coupon.isActive=false
    }else{
        coupon.isActive=true
    }
    await coupon.save()
    return coupon;
}

const updateCoupon=async (updateCouponCode,data)=>{
    const {couponCode,discountValue,expiryDate,minOrder,maxDiscount,discountType} = data;

    const coupon=await Coupon.findOne({code:updateCouponCode});
    if(!coupon){
            throw new Error("Coupon Not Found")
        }
        console.log(coupon)

        let hasChanges = false;

        if(coupon.code !== couponCode.toUpperCase()){
            coupon.code = couponCode.toUpperCase();
            hasChanges = true;
        }

        if(coupon.discountValue !== Number(discountValue)){
            coupon.discountValue = discountValue;
            hasChanges = true;
        }

        if(coupon.discountType !== discountType){
            coupon.discountType = discountType;
            hasChanges = true;
        }

        if(coupon.minOrderAmount !== Number(minOrder)){
            coupon.minOrderAmount = minOrder;
            hasChanges = true;
        }

        if(coupon.maxDiscount !== Number(maxDiscount)){
            coupon.maxDiscount = maxDiscount;
            hasChanges = true;
        }

        const newExpiry = new Date(expiryDate);

        if(coupon.expiryDate.getTime() !== newExpiry.getTime()){
            coupon.expiryDate = newExpiry;
            hasChanges = true;
        }


        if(!hasChanges){
            throw new Error("No changes detected")
        }

        await coupon.save()
        return coupon;
}

const getCheckoutCoupons=async (subtotal)=>{
    const coupons = await Coupon.find({
        isActive: true,
        expiryDate: { $gt: new Date() },
        minOrderAmount: { $lte: subtotal }
    });

    return coupons;
}

const getCouponByCode=async (code)=>{
    const coupon=await Coupon.findOne({code});
    if(!coupon){
        throw new Error('Coupon Not Found')
    }
    return coupon;
}

export default {createCoupon,getFilteredCoupon,updateCouponStatus,updateCoupon,getCheckoutCoupons,getCouponByCode}

