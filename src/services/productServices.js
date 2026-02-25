import Category from "../models/categorySchema.js";
import slugify from "slugify";
import cloudinary from "../config/cloudinary.js";
import Product from '../models/productSchema.js';


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

const getAllProducts=async ()=>{
    const products=await Product.find();
    return products;
}

const findProductById=async (id)=>{
    const product =await Product.findById(id);
    if(!product){
        throw new Error('Product Not Found');
    }
    return product;
}

export default {
    createCategory,find,findCategoryById,updateCategory,getAllActiveCategories,createProduct,getAllProducts,findProductById
}

