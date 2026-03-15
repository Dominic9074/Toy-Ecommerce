import Category from "../models/categorySchema.js";
import Product from '../models/productSchema.js'
import Wishlist from "../models/wishListSchema.js";
import Cart from "../models/cartSchema.js";
import User from "../models/userModal.js";
import Order from "../models/orderSchema.js";
import paymentServices from "./paymentServices.js";
import couponServices from "./couponServices.js";

//generate orderId
function generateOrderId() {
    const random = Math.floor(1000 + Math.random() * 9000); // Generates a 4-digit number
    return `#${random}`;
}


const getAllCategory=async ()=>{
    const categories=await Category.find();
    return categories;
}

const getFilterProducts=async (filter,userId)=>{
    const query={isActive:true};
    const sort={};
    const page=parseInt(filter.page) || 1;
    const limit=10;
    const skip = (page - 1) * limit >= 0 ? (page - 1) * limit : 0;
    
    let wishlistProductIds=[];
   if(userId){
     const wishlist=await Wishlist.findOne({user:userId});
     if(wishlist){
     wishlistProductIds=wishlist.products.map(id=>id.toString());
     }
    }
    
    if(filter.search !==''&&filter.search!==undefined){
        query.name={$regex:filter.search,$options:'i'}
    }
    if(filter.price ==='asc'){
        sort.price=1
    }else if(filter.price ==='dec'){
        sort.price=-1
    }
    
    if(filter.name==='asc'){
        sort.name=1
    }else if(filter.name==='dec'){
        sort.name=-1
    }
    const activeCategoryIds = await Category.find({ status: "Active" }).distinct("_id");
    if (filter.category && filter.category !== '' && filter.category !== 'all') {
                query.category = filter.category;
                console.log(filter.category)
        } else {
            // No specific category selected → show all active categories
            query.category = { $in: activeCategoryIds };
        }


    const totalProducts = await Product.countDocuments(query);
    const products=await Product.find(query).populate({ path: "category"}).sort(sort).skip(skip).limit(limit);
    const pageCount = Math.ceil(totalProducts / limit);
    
    return { products, wishlistProductIds,pageCount,currentPage:page};
}

const findProductById=async(slug,userId)=>{
    const product=await Product.findOne({slug}).populate('category','name')
    let wishlistProductIds=[];
    if(userId){
        const wishlist=await Wishlist.findOne({user:userId});
        if(wishlist){
        wishlistProductIds=wishlist.products.map(id=>id.toString());
        }
        }
    if(!product){
        throw new Error('Product Not Found')
    }
    const categoryId=product.category;
    const RelatedProducts=await Product.find({category:categoryId,_id: { $ne: product._id },isActive: true}).populate('category','name')
    return {product,RelatedProducts,wishlistProductIds};
}

const findWishlistProduct=async(userId,search)=>{
     if (!userId) return [];

    const wishlist = await Wishlist.findOne({ user: userId });

    if (!wishlist || !wishlist.products.length) {
        return [];
    }

    const query = {
        _id: { $in: wishlist.products },
        isActive: true
    };

    if (search && search.trim() !== "") {
        query.name = { $regex: search, $options: "i" };
    }

    const wishlistProducts = await Product.find(query)
        .populate("category", "name");

    return wishlistProducts;
}

const addToCart=async (productId,userId)=>{
    const product=await Product.findById(productId);

    await Wishlist.updateOne(
        { user: userId },
        { $pull: { products: productId } }
    );
        
    let cart=await Cart.findOne({user:userId});
    if(!cart){
        cart=new Cart({
            user:userId,
            items:[{
                product:productId,
                quantity:1
            }]
        })
        await cart.save();
        return {success:true,message:'Product Added Successfully'}
    }
    const productIndex=cart.items.findIndex(item=>item.product.toString()===productId);
    if(productIndex > -1){
        if(cart.items[productIndex].quantity>=5){
            return {success:false,message:'Quantity Limit Reached'}
        }
       if (cart.items[productIndex].quantity >= product.stock) {
            return { success: false, message: "Stock limit reached" };
        }
        cart.items[productIndex].quantity += 1;
    }else{
        if (product.stock === 0) {
            return { success: false, message: "No Stock Left" };
        }
        cart.items.push({
            product:productId,
            quantity:1
        })
    }
    await cart.save();
    return {success:true,message:'Product Added Successfully'}
}

const getCartProducts=async (userId)=>{
    let cart=await Cart.findOne({user:userId}).populate({path:'items.product'});
    if(!cart || !cart.items || cart.items.length === 0){
        return []
    };
    return cart.items
}

const updateQuantityCount = async (userId,productId,change) => {

    const cart = await Cart.findOne({ user: userId });
    const product = await Product.findById(productId);

    if (!cart || !product) {
        return { success: false, message: "Invalid request" }
    }

    const itemIndex = cart.items.findIndex(
        item => item.product.toString() === productId
    );

    if (itemIndex === -1) {
        return { success: false, message: "Product not in cart" }
    }

    const newQty = cart.items[itemIndex].quantity + change;

    if (newQty < 1) {
        return { success: false, message: "Minimum quantity is 1" }
    }
    if(newQty >5){
        return { success: false, message: "Quantity limit reached" }
    }

    if (newQty > product.stock) {
        return { success: false, message: "Stock limit reached" }
    }

    cart.items[itemIndex].quantity = newQty;

    await cart.save();

    return { success: true }
};

const removeCart=async (productId,userId)=>{
    const cart = await Cart.findOne({user:userId});

    const productIndex=cart.items.findIndex(items=>items.product.toString()===productId);
    if (productIndex === -1) {
        return { success: false, message: "Product not in cart" };
    }
    cart.items.splice(productIndex, 1);
    await cart.save();

    return {success:true,message:'Deleted Successfully'}
}

const getUserInfo=async (userId)=>{
    const user=await User.findById(userId);
    if(!user){
        throw new Error('User Not Exist')
    }
    return user;
}

const getCheckoutProducts=async (temporaryCheckout)=>{
    const products=[];
    if(Array.isArray(temporaryCheckout)){
        for(const obj of temporaryCheckout){
            const product=await Product.findById(obj.productId);
            if(!product){
                throw new Error('Product Not Found');
            }

            products.push({
                product,
                quantity:obj.quantity
            })
        }
    }else{
        products.push({product:await Product.findById(temporaryCheckout.productId),quantity:temporaryCheckout.quantity})
    }
    return products;
}

const placeOrder = async (data, userId) => {

    const addressId = data.selectedAddress.toString();
    const paymentMethod = data.paymentMethod;
    const products = data.products;
    const couponCode = data.couponCode;

    let coupon = null;
    let discount = 0;

    if (couponCode) {
        coupon = await couponServices.getCouponByCode(couponCode);
    }

    const user = await User.findById(userId);

    const address = user.address.find(obj => {
        return obj._id.toString() === addressId
    });

    let newOrderId = generateOrderId();

    let existingOrder = await Order.findOne({ orderId: newOrderId });
    while (existingOrder) {
        newOrderId = generateOrderId();
        existingOrder = await Order.findOne({ orderId: newOrderId });
    }

    const orderItems = [];
    let subTotal = 0;

    for (const item of products) {

        if (item.quantity > item.product.stock) {
            throw new Error(`Insufficient Stock Quantity For ${item.product.shortName}`)
        }

        const discountedPrice =
            item.product.price - (item.product.price * item.product.offer / 100);

        const itemTotal = Math.ceil(discountedPrice * item.quantity);

        subTotal += itemTotal;

        orderItems.push({
            product: item.product._id,
            name: item.product.name,
            image: item.product.images[0].url,
            price: item.product.price,
            quantity: item.quantity,
            itemTotal,
            discount: item.product.offer
        });
    }

    if (coupon) {

        if (coupon.discountType === "percentage") {

            discount = Math.round((subTotal * coupon.discountValue) / 100);

            if (coupon.maxDiscount && discount > coupon.maxDiscount) {
                discount = coupon.maxDiscount;
            }

        } else {

            discount = coupon.discountValue;

        }

        if (discount > subTotal) {
            discount = subTotal;
        }
    }

    const finalAmount = subTotal - discount;

    const addressSnapshot = {
        name: address.fullname,
        phone: address.phone,
        pincode: address.pincode,
        state: address.state,
        city: address.city,
        addressType: address.addressType
    };

    const order = await Order.create({
        user: user._id,
        orderId: newOrderId,
        items: orderItems,
        addressSnapshot,
        subtotal: subTotal,
        discount,
        couponCode: couponCode || null,
        finalAmount,
        paymentMethod,
        paymentStatus: paymentMethod === 'COD' ? 'Pending' : 'Paid'
    });

    for (const item of products) {
        await Product.updateOne(
            { _id: item.product._id },
            { $inc: { stock: -item.quantity } }
        );
    }

    return order;
}

const getAllUserOrders=async (userId,query)=>{
    const user=await User.findById(userId);

    let filter={user:userId};
    if(query.filter==='shipped'){
        filter.orderStatus='Shipped'
    }else if(query.filter==='delivered'){
        filter.orderStatus='Delivered'
    }else if(query.filter==='cancelled'){
        filter.orderStatus='Cancelled'
    }

    if(!user){
        throw new Error('User Do Not Exist')
    };
    const orders=await Order.find(filter).sort({createdAt:-1})
    return orders
}

const getOrderById=async (orderId)=>{
    const order=await Order.findById(orderId).populate('user');
    if(!order){
        throw new Error('Order Not Found');
    }
    return order;
}

const returnOrder=async(orderId,reason,details,itemId)=>{
    const order=await Order.findById(orderId);
    
    if(!order){
        throw new Error('Order Not Found')
    }
     if(order.orderStatus !== "Delivered"){
        throw new Error("Return not allowed for this order");
    }
    let itemFound=false;
    for(let item of order.items){
        if(item._id.toString()===itemId){
            item.itemStatus='Returned';
            item.returnReason=reason.toString();
            item.returnDescription=details.toString();
            item.refundStatus='Pending'
            item.returnStatus='Requested'
            itemFound=true;
            break;
        }
    }
    if(!itemFound){
        throw new Error('Product Not Found')
    }

    await order.save();
    return order;
}

const cancelOrder=async (reason,details,orderId,userId)=>{
    const order=await Order.findById(orderId);
    if(!order){
        throw new Error('Order Not Found')
    }
    if(order.orderStatus === "Delivered"){
    throw new Error("Delivered orders cannot be cancelled");
    }
    if(order.paymentStatus ==='Paid'){
        const wallet=await paymentServices.getWalletById(userId);
        wallet.balance+=order.finalAmount;
        wallet.transactions.push({
            type:'credit',
            amount:order.finalAmount,
            reason:'Order Cancel Refund',
            orderId:order._id
        })
        await wallet.save();
    }
    order.cancelReason=reason;
    order.cancelDescription=details;
    order.orderStatus='Cancelled';

    for(let obj of order.items){
        const product=await Product.updateOne({_id:obj.product},{$inc:{stock:obj.quantity}})
    }

    await order.save();
    return order;
}

const getAllOrders=async (search,status,page)=>{

    const limit =10;
    const skip=(page-1)*limit;

   
    let query={};
    if(search){
         const user =await User.find({email:{$regex:search,$options:'i'}}).select('_id');
         const userIds = user.map(user=>user._id);
         query.user={$in:userIds};
    }
    if(status !=='all' && status !== undefined && status !== null){
        query.orderStatus=status;
    }
    const totalOrders=await Order.countDocuments(query);
    const orders=await Order.find(query).populate('user').sort({createdAt:-1}).skip(skip).limit(limit)
    const pageCount=Math.ceil(totalOrders/limit)
    return {orders,pageCount};
}

export default {getAllCategory,getFilterProducts,findProductById,findWishlistProduct,addToCart,getCartProducts,
    updateQuantityCount,removeCart,getUserInfo,getCheckoutProducts,placeOrder,getAllUserOrders,getOrderById,returnOrder,
    cancelOrder,getAllOrders
}

