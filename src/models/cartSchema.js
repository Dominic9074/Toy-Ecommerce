import mongoose from "mongoose";

const cartItemSchema=new mongoose.Schema({
    product:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'product',
        required:true
    },
    quantity:{
        type:Number,
        default:1,
        min:1
    }
},{_id:false})

const cartSchema=new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user',
        required:true,
        unique:true
    },
    items:[cartItemSchema]
},{timestamps:true})

export default mongoose.model('cart',cartSchema)

