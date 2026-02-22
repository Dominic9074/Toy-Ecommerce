
//shop
const loadShop=(req,res)=>{
    res.render('user/shop',{title:'shop',bodyClass:'',cssFile:'style.css'})
}
//product details
const loadProductDetails=(req,res)=>{
    res.render('user/productDetails',{title:'Product',bodyClass:"",cssFile:'style.css'})
}
//cart
const loadCartPage=(req,res)=>{
    res.render('user/cart',{title:'Cart',bodyClass:"",cssFile:'style.css'})
}
//wishlist
const loadWishlist=(req,res)=>{
    res.render('user/wishlist',{title:'WishList',bodyClass:"",cssFile:'style.css'})
}

export default {loadShop,loadProductDetails,loadCartPage,loadWishlist,
    

}