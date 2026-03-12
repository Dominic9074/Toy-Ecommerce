import Wallet from "../models/walletSchema.js";

const getWalletById=async (userId)=>{
    let wallet=await Wallet.findOne({user:userId});
    if(!wallet){
        await Wallet.create({
            user:userId
        })
        wallet=await Wallet.findOne({user:userId});
    }
    console.log(wallet)
    return wallet;
}

export default {getWalletById}


