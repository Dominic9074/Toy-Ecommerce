import Category from "../models/categorySchema.js";
import slugify from "slugify";
import cloudinary from "../config/cloudinary.js";
import Product from '../models/productSchema.js';
import { json } from "express";
import Order from "../models/orderSchema.js";
import paymentServices from "./paymentServices.js";


const createCategory=async (file,data)=>{
    const {name,description}=data;

    const existing=await Category.findOne({name:{$regex:`^${name}&`,$options:'i'}})
    if(existing){
        throw new Error('Category Already Exist')
    };

    const slug =slugify(name,{lower:true,strict:true})

    const uploadResult = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "categories" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
        }
        );

        stream.end(file.buffer);
    });


    //store 
    const category=await Category.create({
        name,
        description,
        slug,
        imageUrl: uploadResult.secure_url,
        imagePublicId: uploadResult.public_id
    })

    return category;

}

const find=async (search,status,page)=>{

    let skiper=page-1;
    let skip=10*skiper;
    const limit=10;

    let query={};
          if(search){
            query={name:{$regex:search,$options:'i'}}
          }
          if(status=='Active'){
            query.status='Active'
          }else if(status==='Inactive'){
                query.status='Inactive'
          }
    const categories=await Category.find(query).skip(skip).limit(limit);
    return categories;
}

const findCategoryById=async (Id)=>{
    const category=await Category.findById(Id)
    if(!category){
        throw new Error('Category Not Found')
    }
    return category;
}

const updateCategory=async (name,description,categoryId,file)=>{

    const category=await Category.findById(categoryId);

    if(!category){
        throw new Error('Category Does Not Exist')
    }

        const existing=await Category.findOne({name: { $regex: `^${name}$`, $options: "i" },_id: { $ne: categoryId }})
        if(existing){
            throw new Error("Category Already Exist");
        }

        if(file){

            if(category.imagePublicId){
                await cloudinary.uploader.destroy(category.imagePublicId)
            }

             const uploadResult = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                { folder: "categories" },
                (error, result) => {
                if (error) return reject(error);
                resolve(result);
                }
            );

            stream.end(file.buffer);
            });

            category.imageUrl = uploadResult.secure_url;
            category.imagePublicId = uploadResult.public_id;
        

        }

        category.name=name;
        category.description=description;

        await category.save();
        return category;
}

const getAllActiveCategories=async ()=>{
    const status='Active'
    const category=await Category.find({status});
    if(!category){
        throw new Error('Categories Not Fetched')
    }
    return category;
}

const createProduct=async (files,data)=>{
    const {name,category,price,stock,offer,description,shortName}=data;

    const rawSpec=data.specifications;
    const specifications=rawSpec.split('\n').map(s=>s.trim()).filter(s=>s.length > 0)
    

    const existing = await Product.findOne({
        name: { $regex: `^${name}$`, $options: "i" }
    });

    if (existing) {
        throw new Error("Product already exists");
    }
    const slug = slugify(name, { lower: true, strict: true });

    
    if (!files || files.length < 3) {
        throw new Error("Minimum 3 images required");
    }

    const uploadedImages = [];

    for (const file of files) {

        const uploadResult = await new Promise((resolve, reject) => {

            const stream = cloudinary.uploader.upload_stream(
                { folder: "products" },
                (error, result) => {
                    if (error) return reject(error);
                    resolve(result);
                }
            );

            stream.end(file.buffer);
        });

        uploadedImages.push({
            url: uploadResult.secure_url,
            publicId: uploadResult.public_id
        });
    }

   
    const product = await Product.create({
        name,
        category,
        price,
        stock,
        offer,
        specifications,
        description,
        shortName,
        slug,
        images: uploadedImages
    });

    return product;
};

const getFilterProducts=async (search,status,sort,page)=>{
    let filter={};
    let sortOption={createdAt:-1};
    let skiper=page-1;
    let skip=10*skiper;
    const limit=10;

    if(search && search.trim() !== ''){
        filter.name={$regex:search,$options:'i'}
    }

    if(status && status ==='Active'){
        filter.isActive=true;
    }else if(status==='Inactive'){
        filter.isActive=false
    }

    if(sort===''){
        sortOption.createdAt=1
    }
    if (sort === "price_asc") {
        sortOption.price = 1;
    }

    if (sort === "price_desc") {
        sortOption.price = -1;
    }

    if (sort === "stock_asc") {
        sortOption.stock = 1;
    }

    if (sort === "stock_desc") {
        sortOption.stock = -1;
    }
    const products=await Product.find(filter).populate('category','name').sort(sortOption).skip(skip).limit(limit)
    return products;
}

const findProductById=async (id)=>{
    const product =await Product.findById(id);
    if(!product){
        throw new Error('Product Not Found');
    }
    return product;
}

const editProduct=async (files,data,productId)=>{
    const {name,category,price,stock,offer,description,shortName}=data;
    const rawSpec=data.specifications;
    const product=await Product.findById(productId);

    if(!product){
        throw new Error('Product Does Not Exist ');
    }
    let existingImages=[];
    
    if(data.existingImages){
        existingImages=JSON.parse(data.existingImages);
    }

   

    const basicFieldUnchanged=name===product.name&&category===product.category.toString()&&Number(price)===product.price&&
        Number(stock)===product.stock && Number(offer)===product.offer
        &&description===product.description && shortName===product.shortName;

        const specifications=rawSpec.split('\n').map(s=>s.trim()).filter(s=>s.length > 0);

        const specUnchanged=JSON.stringify(specifications)===JSON.stringify(product.specifications);

        const oldPublicId=product.images.map(img=>img.publicId).sort();
        const newPublicId=existingImages.map(img=>img.publicId).sort();

        const imageUnchanged=oldPublicId.length===newPublicId.length && 
                                oldPublicId.every((id,index)=>id === newPublicId[index]) && files.length ===0;

        if(basicFieldUnchanged && specUnchanged && imageUnchanged){
            throw new Error('No Changes Detected');
        }

        const imagesToDelete=oldPublicId.filter(id=> !newPublicId.includes(id));

        for(const publicId of imagesToDelete){
            await cloudinary.uploader.destroy(publicId);
        }
  

        const uploadedImages=[];

        for(const file of files){
            const uploadResult=await new Promise((resolve,reject)=>{
                const stream=cloudinary.uploader.upload_stream(
                    {folder:'product'},
                    (error,result)=>{
                        if(error) return reject(error.message);
                        resolve(result);
                    }
                );
                stream.end(file.buffer)
            })
            uploadedImages.push({
                url:uploadResult.secure_url,
                publicId:uploadResult.public_id
            })
        }

        const finalImages=[...existingImages,...uploadedImages];

        product.name = name;
        product.category = category;
        product.price = price;
        product.stock = stock;
        product.offer = offer;
        product.description = description;
        product.shortName = shortName;
        product.specifications = specifications;
        product.images = finalImages;

        await product.save();

        return product;
}

const updateProductStatus=async(id)=>{
    const product=await Product.findById(id);
    if(!product){
        throw new Error('Product Not Found')
    }
    if(product.isActive===true){
        product.isActive=false
    }else{
        product.isActive=true
    }
    await product.save();
    return product;

}

const updateOrderStatus=async (orderId,data)=>{
    const order=await Order.findById(orderId);
    const {orderStatus}=data;
     if(!order){
        throw new Error('Order Not Found')
    }
    if(orderStatus==='Shipped'){
        order.orderStatus='Shipped'
    }else if(orderStatus==='Out For Delivery'){
        order.orderStatus='Out For Delivery'
    }else if(orderStatus==='Delivered'){
        order.orderStatus='Delivered'
    }
    await order.save();
    return order;
    }

const updateReturnStatus=async (data)=>{
    const {orderId,itemId,status}=data;
    const order=await Order.findById(orderId);
    if(!order){
        throw new Error('Order Not Found')
    }
    const userId=order.user;
    const item=order.items.id(itemId);
    item.returnStatus=status;
    if(status==='Approved'){
        item.refundStatus='Processed'
    }else if(status==='Completed'){
        item.refundStatus='Success'
        const wallet= await paymentServices.getWalletById(userId);
        wallet.balance+=item.itemTotal;
        wallet.transactions.push({
            type:'credit',
            amount:item.itemTotal,
            reason:'Order Return Refund',
            orderId:orderId
        })
        const productId=item.product;
        const product=await Product.findById(productId);
        product.stock+=item.quantity;
        await product.save();
        await wallet.save();
    }else if(status==='Rejected'){
        item.refundStatus='Not Applicable'
    }
    await order.save();
    return order;
}

export default {
    createCategory,find,findCategoryById,updateCategory,getAllActiveCategories,createProduct,getFilterProducts,findProductById,
    editProduct,updateProductStatus,updateOrderStatus,updateReturnStatus
}

