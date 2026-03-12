import razorpay from "../config/razorpay.js";
import Order from "../models/orderSchema.js";
import crypto from 'crypto';
import paymentServices from "../services/paymentServices.js";

const createRazorpayOrder=async (req,res,next)=>{
    try{
        const amount=req.body.amount;
        const options={
            amount:amount*100,
            currency:'INR',
            receipt:'order_'+Date.now()
        }
        const order=await razorpay.orders.create(options)

        res.json({
            success:true,
            order
        })

    }catch(error){
        console.log(error)
        next(error)
    }
}

const verifyPayment=async (req,res,next)=>{
    try{
        const {razorpay_order_id,razorpay_payment_id,razorpay_signature}=req.body;

        const body=razorpay_order_id + '|' + razorpay_payment_id;

        const expectedSignature=crypto.createHmac('sha256',process.env.RAZORPAY_KEY_SECRET).update(body).digest('hex');

        if(expectedSignature === razorpay_signature){
            res.json({
                success:true
            })
        }else{
            res.status(400).json({
                success:false,
                message:'Payment Verification Failed'
            })
        }

    }catch(error){
        next(error);
    }
}

const loadPaymentFailure=(req,res)=>{
    const totalAmount=req.query.Amount;
    res.render('user/paymentFailure',{title:'paymentFailure',bodyClass:'',cssFile:'style.css',totalAmount})
}

const loadWallet=async(req,res)=>{
    const userId=req.session.user?.userId;
    const wallet=await paymentServices.getWalletById(userId)
    res.render('user/wallet',{title:'wallet',cssFile:'style.css',bodyClass:'',wallet})
}

export default {createRazorpayOrder,verifyPayment,loadPaymentFailure,loadWallet}

