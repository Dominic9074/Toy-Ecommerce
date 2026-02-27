import userProductServices from '../services/userProductServices.js'
import Wishlist from '../models/wishListSchema.js';

//shop
const loadShop=async (req,res)=>{
   try {
    const categories = await userProductServices.getAllCategory();
    const {products,wishlistProductIds} = await userProductServices.getFilterProducts(req.query,req.session.user?.userId);
    console.log(req.query.search)

    // If request is AJAX
    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      return res.json({
        success: true,
        categories,
        selectedCategory: req.query.category || "all",
        products,
        wishlistProductIds
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
      wishlistProductIds
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
const loadCartPage=(req,res)=>{
    res.render('user/cart',{title:'Cart',bodyClass:"",cssFile:'style.css'})
}
//wishlist
const loadWishlist=async (req,res)=>{

    const products=await userProductServices.findWishlistProduct(req.session.user?.userId);
    console.log(products)

    res.render('user/wishlist',{title:'WishList',bodyClass:"",cssFile:'style.css',products})
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

export default {loadShop,loadProductDetails,loadCartPage,loadWishlist,addWishlist
    

}