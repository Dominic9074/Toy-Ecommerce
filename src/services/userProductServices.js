import Category from "../models/categorySchema.js";
import Product from '../models/productSchema.js'
import Wishlist from "../models/wishListSchema.js";
import Cart from "../models/cartSchema.js";


const getAllCategory=async ()=>{
    const categories=await Category.find();
    return categories;
}

const getFilterProducts=async (filter,userId,page)=>{
    const query={isActive:true};
    const sort={createdAt:-1};
    let wishlistProductIds=[];
    const skipper=page-1;
    const limit=10;
    const skip=limit*skipper
    
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
    
    if(filter.category!=='' && filter.category!=='all' && filter.category!==undefined){
        query.category=filter.category
    }
    if(filter.name==='asc'){
        sort.name=1
    }else if(filter.name==='dec'){
        sort.name=-1
    }

    
    const products=await Product.find(query).populate({ path: "category", match: { status: "Active"}}).sort(sort).skip(skip).limit(limit);
     const filteredProducts = products.filter(
        product => product.category !== null
    );

    return { products: filteredProducts, wishlistProductIds };
}

const findProductById=async(slug)=>{
    const product=await Product.findOne({slug}).populate('category','name')
    if(!product){
        throw new Error('Product Not Found')
    }
    const categoryId=product.category;
    const RelatedProducts=await Product.find({category:categoryId,_id: { $ne: product._id },isActive: true}).populate('category','name')
    return {product,RelatedProducts};
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

export default {getAllCategory,getFilterProducts,findProductById,findWishlistProduct,addToCart,getCartProducts,
    updateQuantityCount,removeCart
}

