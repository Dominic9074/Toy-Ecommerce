import userProductServices from '../services/userProductServices.js'

//shop
const loadShop=async (req,res)=>{
   try {
    const categories = await userProductServices.getAllCategory();
    const products = await userProductServices.getFilterProducts(req.query);
    console.log(req.query.search)

    // If request is AJAX
    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      return res.json({
        success: true,
        categories,
        selectedCategory: req.query.category || "all",
        products
      });
    }

    // Normal page load
    res.render('user/shop', {
      title: 'shop',
      bodyClass: '',
      cssFile: 'style.css',
      categories,
      selectedCategory: req.query.category || "all",
      products
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }

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