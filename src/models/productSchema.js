import mongoose from "mongoose";


const productSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    description:{
        type:String,
        required:true
    },
    category:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'Category'
    },
    price:{
        type:Number,
        required:true,
        min:0
    },
    slug:{
        type:String,
        required:true,
        unique:true,
        index:true
    },
    offerPercentage:{
        type:Number,
        required:true,
        min:0,
        max:90
    },
    stock:{
        type:Number,
        required:true,
        min:0
    },
    specification:[
        {
            key:String,
            value:String
        }
    ],
    images:[
        {
            url:String,
            publicId:String
        }
    ],
    isActive:{
        type:Boolean,
        default:true
    }

},{timestamps:true})
