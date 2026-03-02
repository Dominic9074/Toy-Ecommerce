import userProductServices from '../services/userProductServices.js'
import Wishlist from '../models/wishListSchema.js';
import userController from './userController.js';

//shop
const loadShop=async (req,res)=>{
   try {
    const categories = await userProductServices.getAllCategory();
    const searchInput=req.query.search||"";
    const {products,wishlistProductIds,pageCount,currentPage} = await userProductServices.getFilterProducts(req.query,req.session.user?.userId);
    

    // If request is AJAX
    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      return res.json({
        success: true,
        categories,
        selectedCategory: req.query.category || "all",
        products,
        wishlistProductIds,
        searchInput,
        currentPage,
        pageCount
      });
    }

    // Normal page load
    res.render('user/shop', {
      title: 'shop',
      bodyClass: '',
      cssFile: 'style.css',
      categories,
      selectedCategory: req.query.category || "all",
      products,
      wishlistProductIds,
      searchInput,
      currentPage,
      pageCount
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }

}

//product details
const loadProductDetails=async (req,res)=>{
try{
    const slug=req.params.slug
    const {product,RelatedProducts}=await userProductServices.findProductById(slug);

    res.render('user/productDetails',{title:'Product',bodyClass:"",cssFile:'style.css',product,RelatedProducts})
}catch(error){
    console.log(error)
}
}
//cart
const loadCartPage=async (req,res)=>{
    const userId=req.session.user?.userId;
    const cartProducts=await userProductServices.getCartProducts(userId)

    res.render('user/cart',{title:'Cart',bodyClass:"",cssFile:'style.css',cartProducts})
}
//wishlist
const loadWishlist=async (req,res)=>{
    const searchInput=req.query.search||'';
    console.log(searchInput)
    const products=await userProductServices.findWishlistProduct(req.session.user?.userId,searchInput);

    res.render('user/wishlist',{title:'WishList',bodyClass:"",cssFile:'style.css',products,searchInput})
}

const addWishlist=async (req,res)=>{
    try{

        const userId=req.session.user?.userId
        if(!userId){
            return res.json({
                success:false,
                message:'SignIn Required'
            })
        }
        const {productId}=req.body;

        let wishlist=await Wishlist.findOne({user:userId});

        if(!wishlist){
            wishlist=new Wishlist({
                user:userId,
                products:[productId]
            })
        await wishlist.save();
        return res.json({success:true,message:'Product Added Successfully'})
        }
        
        const index=wishlist.products.findIndex(id=>id.toString()===productId);

        if(index >-1){
            wishlist.products.splice(index,1);
            wishlist.save();
            return res.json({
                success:true,
                message:'Product Removed Successfully'
            })
        }else{
            wishlist.products.push(productId);
            wishlist.save();
            return res.json({
                success:true,
                message:'Product Added Successfully'
            })
        }
        
    }catch(error){
        console.log(error);
        res.json({
            success:false,
            message:error.message
        })
    }
}

const addToCart=async (req,res)=>{
   try{
        const {productId}=req.body
        const userId=req.session.user?.userId;

        if(!userId){
            return res.json({success:false,message:'Sign In Required'})
        }

        const cart=await userProductServices.addToCart(productId,userId);

        return res.json(cart)

   }catch(error){
    console.log(error)
   }

}

const UpdateQuantityCount=async (req,res)=>{
    const {productId,change}=req.body;
    const userId=req.session.user?.userId;
    if(!userId){
        return res.json({success:false,message:'SignIn Required'})
    }
    const obj=await userProductServices.updateQuantityCount(userId,productId,change);

    return res.json(obj)
}

const removeCart=async (req,res)=>{
    const {productId}=req.body;
    const userId=req.session.user?.userId;

    const obj =await userProductServices.removeCart(productId,userId);
    return res.json(obj)
}

const loadCheckout=async (req,res)=>{
   try{
     const user=await userProductServices.getUserInfo(req.session.user?.userId);
     const temporaryCheckout = req.session.cartProducts;
     const products=await userProductServices.getCheckoutProducts(temporaryCheckout);

    res.render('user/checkout',{title:'checkout',bodyClass:'',cssFile:'style.css',addresses:user.address,products})
   }catch(error){
    console.log(error);
   }
}

const addOrder=async (req,res)=>{
    if(!req.body.Checkout){
        const {productId}=req.body;
        if(!productId)return res.json({success:false,message:'Product Not Found'});
        req.session.cartProducts={
            productId,
            quantity:1    
         }
    }else{
        const Checkout=req.body.Checkout;
        req.session.cartProducts=Checkout;
        console.log(Checkout)
    }

    if(!req.session.user?.userId) return res.json({success:false,message:'SignIn Required'})
        
    return res.json({
        success:true,
        message:'Session Added Successfully'
    })

}

export default {loadShop,loadProductDetails,loadCartPage,loadWishlist,addWishlist,addToCart,UpdateQuantityCount,removeCart,
    loadCheckout,addOrder

}