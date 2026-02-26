import Category from "../models/categorySchema.js";
import Product from '../models/productSchema.js'
const getAllCategory=async ()=>{
    const categories=await Category.find();
    return categories;
}

const getFilterProducts=async (filter)=>{
    const query={isActive:true};
    const sort={};
    
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

    const products=await Product.find(query).populate('category','name').sort(sort);
    return products;
}

const findProductById=async(slug)=>{
    console.log(slug);
    const product=await Product.findOne({slug}).populate('category','name')
    if(!product){
        throw new Error('Product Not Found')
    }
    const categoryId=product.category;
    const RelatedProducts=await Product.find({category:categoryId,_id: { $ne: product._id },isActive: true}).populate('category','name')
    return {product,RelatedProducts};
}

export default {getAllCategory,getFilterProducts,findProductById    
}

