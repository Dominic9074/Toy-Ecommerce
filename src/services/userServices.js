import User from "../models/userModal.js"
import bcrypt from 'bcrypt'
const saltround=10;

const signup=async (data)=>{
    const {email,username,password}=data;
    
    const existingUser=await User.findOne({email})
    if(existingUser){
        throw new Error("Email Already Exist")
    }
    
}

const createUserAfterVerification=async (username,email,password,)=>{

    const hashedPassword=await bcrypt.hash(password,saltround)

    const user=await User.create({
        name:username,
        email,
        password:hashedPassword
    })


}

const signIn=async(data)=>{
    const {email,password}=data;

    const user=await User.findOne({email});

    if(!user){
        throw new Error('User Does Not Exist');
    }

    const isMatched=await bcrypt.compare(password,user.password);

    if(!isMatched){
        throw new Error('Password Does Not Match')
    }
    return user;

}




export default {signup,createUserAfterVerification,signIn}