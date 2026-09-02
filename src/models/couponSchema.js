import mongoose from "mongoose";


const couponSchema=new mongoose.Schema({
    code:{
        type:String,
        required:true,
        unique:true,
    },
    discountType:{
        type:String,
        enum:['percentage','fixed'],
        required:true
    },
    discountValue:{
        type:Number,
        required:true
    },
    minOrderAmount:{
        type:Number,
        default:0
    },
    maxDiscount:{
        type:Number,
        default:0
    },
    expiryDate:{
        type:Date,
        required:true
    },
    isActive:{
        type:Boolean,
        default:true
    }
},{timestamps:true})

export default mongoose.model('coupon',couponSchema)
