import mongoose from "mongoose";


const couponUsageSchema=new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user',
        required:true
    },
    coupon:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'coupon',
        required:true
    },
    order:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'order',
        required:true
    }
},{timestamps:true})

couponUsageSchema.index({user:1,coupon:1},{unique:true})

export default mongoose.model('CouponUsage',couponUsageSchema)

