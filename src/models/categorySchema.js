import mongoose from "mongoose";

const categorySchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true,
        unique:true
    },
    description:{
        type:String,
        required:true
    },
    imageUrl:{
        type:String,
        required:true
    },
    imagePublicId:{
        type:String,
        required:true
    },
    status:{
        type:String,
        enum:['Active','Inactive'],
        default:'Active'
    },
    slug:{
        type: String,
        required: true,
        unique: true,
        lowercase: true
    }
},
    {
        timestamps:true
    })

export default mongoose.model('category',categorySchema)
