import mongoose from "mongoose";

const orderItems= new mongoose.Schema({
    product:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'product',
    required:true 
    },
    name:String,
    image:String,
    price:Number,
    quantity:Number,
    itemTotal:Number,
    discount:Number,
    itemStatus:{
        type:String,
        enum:['Placed','Confirmed','Shipped','Delivered','Cancelled','Returned'],
        default:'Placed'
    },
    returnReason: String,
    returnDescription: String,
    refundStatus:{
        type:String,
        enum:['Pending','Processed','Not Applicable','Success'],
        default:'Not Applicable'
    }
},{_id:true,timestamps:true},);

const orderSchema=new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    orderId:{
        type:String,
        unique:true,
        required:true
    },
    items:[orderItems],
    addressSnapshot:{
        name:String,
        phone:String,
        pincode:String,
        city:String,
        state:String,
        addressType:String
    },
    subtotal:Number,
    discount:Number,
    finalAmount:Number,
    paymentMethod:{
        type:String,
        enum:['COD','Razorpay','Wallet'],
        default:'COD'
    },
    paymentStatus:{
        type:String,
        enum:['Pending','Paid','Failed'],
        default:'Pending'
    },
    orderStatus:{
        type:String,
        enum:['Placed','Shipped','Delivered','Cancelled','Returned','Out For Delivery'],
        default:'Placed'
    },
   cancelReason: String,
   cancelDescription: String
},{timestamps:true})


export default mongoose.model('order',orderSchema);


