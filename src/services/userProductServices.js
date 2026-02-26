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

export default {getAllCategory,getFilterProducts}

