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
        ref:'category'
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
    offer:{
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
    specifications:[
        String
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
    },
    shortName:{
        type:String,
        required:true
    }
},{timestamps:true})



export default mongoose.model('product',productSchema)
