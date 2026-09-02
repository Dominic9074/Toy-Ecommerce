import mongoose from "mongoose";

const walletTransactionSchema=new mongoose.Schema({
    type:{
        type:String,
        enum:['credit','debit'],
        required:true
    },
    amount:{
        type:Number,
        required:true,
    },
    reason:String,
    orderId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'order'
    }
},{timestamps:true})

const walletSchema=new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user',
        required:'true'
    },
    balance:{
        type:Number,
        default:0
    },
    transactions:[walletTransactionSchema]
})

export default mongoose.model('wallet',walletSchema)
