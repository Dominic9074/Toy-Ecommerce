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
    if(user.status!=='active'){
        throw  new Error('Your account has been blocked by admin')
    }

    const isMatched=await bcrypt.compare(password,user.password);

    if(!isMatched){
        throw new Error('Password Does Not Match')
    }
    return user;

}

const checkUser=async (email)=>{
    const user=await User.findOne({email})
    if(!user){
        throw new Error('Email does not Exist')
    }
    return user;
}

const resetPassword=async(password,email)=>{

    const hashedPassword=await bcrypt.hash(password,saltround)

    const user=await User.updateOne({email},{password:hashedPassword})
    if(user.matchedCount===0){
        throw new Error('User Not Found')
    }
    
}

const findUser=async (email)=>{
        const user=await User.findOne({email});
        return user;
}

const updateProfile=async(update,userId)=>{
    const user=await User.findByIdAndUpdate(userId,update);
    if(!user){
        throw new Error('User Not Found');
    }
    return;
}

const updateUserName=async (userId,update)=>{
    const user=await User.findByIdAndUpdate(userId,update);
    if(!user){
        throw new Error('User Not Found');
    }
    return;
}

const comparePasswordAndUpdate=async (userId,currentPassword,newPassword)=>{
    const user=await User.findById(userId)
    if(!user){
        throw new Error('User Not Found')
    }
    const isMatched=await bcrypt.compare(currentPassword,user.password)
    if(!isMatched){
        throw new Error('Current Password Does Not Match')
    }
    const hashedPassword=await bcrypt.hash(newPassword,saltround)
    await User.findByIdAndUpdate(userId,{password:hashedPassword})
}

const addAddress=async (userId,addressData)=>{
    const user=await User.findById(userId);
    if(!user){
        throw new Error("User Does Not Exist")
    }
    user.address.push(addressData);
    await user.save();
    console.log('serv wrk');
    return user.address;
}

const findUserById=async (userId)=>{
    const user=await User.findById(userId);
    if(!user){
        throw new Error('User Not Found');
    }
    return user;
}

const removeAddress=async (userId,addressId)=>{
    const result = await User.updateOne(
    { _id: userId },
    { $pull: { address: { _id: addressId } } }
  );

  if (result.modifiedCount === 0) {
    throw new Error("Address not found or already removed");
  }

  return true;
}

export default {signup,createUserAfterVerification,signIn,checkUser,resetPassword,findUser,updateProfile,updateUserName,
    comparePasswordAndUpdate,addAddress,findUserById,removeAddress
}