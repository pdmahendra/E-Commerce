import { Request, Response, NextFunction } from 'express'
import { TryCatch } from '../middlewares/error.js'
import { Product } from '../models/product.model.js'
import { BaseQuery, NewProductRequestBody, SearchRequestQuery } from '../types/types.js'
import ErrorHandler from '../utils/utility-class.js'
import { rm } from 'fs'
import { myCache } from '../app.js'
import { invalidateCache } from '../utils/features.js'


//Revalidate on New, Update, Delete Product & ON nEW oRDER
export const getLatestProducts = TryCatch(
    async (req: Request, res: Response, next: NextFunction) => {

        let products = []

        if (myCache.has("latest-product")) {
            products = JSON.parse(myCache.get("latest-product") as string)
        } else {
            products = await Product.find({}).sort({ createdAt: -1 }).limit(5);
            myCache.set("latest-product", JSON.stringify(products))
        }


        return res.status(200).json({
            success: true,
            message: "Products retrived Successfully",
            products,
        })
    }
)

//Revalidate on New, Update, Delete Product & ON nEW oRDER
export const getAllCategories = TryCatch(
    async (req: Request, res: Response, next: NextFunction) => {

        let categories;

        if (myCache.has("categories")) {
            categories = JSON.parse(myCache.get("categories") as string);
        } else {
            categories = await Product.distinct("category");
            myCache.set("categories", JSON.stringify("categories"))
        }

        return res.status(200).json({
            success: true,
            message: "Products retrived Successfully",
            categories,
        })
    }
)

//Revalidate on New, Update, Delete Product & ON nEW oRDER
export const getAdminProducts = TryCatch(
    async (req: Request, res: Response, next: NextFunction) => {

        let products;

        if (myCache.has("all-products")) {
            products = JSON.parse(myCache.get("all-products") as string);
        } else {
            products = await Product.find({});
            myCache.set("all-products", JSON.stringify("all-products"));
        }

        return res.status(200).json({
            success: true,
            message: "Products retrived Successfully",
            products,
        })
    }
)

//Revalidate on New, Update, Delete Product & ON nEW oRDER
export const getSingleProduct = TryCatch(
    async (req: Request, res: Response, next: NextFunction) => {

        let product;

        const { id } = req.params

        if (myCache.has(`product-${id}`)) {
            product = JSON.parse(myCache.get(`product-${id}`) as string)
        } else {
            product = await Product.findById(id);
            if (!product) {
                return next(new ErrorHandler("Product Not Found", 404))
            }
            myCache.set(`product-${id}`, JSON.stringify(product));
        }

        return res.status(200).json({
            success: true,
            message: "Product retrived Successfully",
            product,
        })
    }
)


export const newProduct = TryCatch(
    async (req: Request<{}, {}, NewProductRequestBody>, res: Response, next: NextFunction) => {
        const { name, price, stock, category } = req.body;
        const photo = req.file;
        if (!photo) {
            return next(new ErrorHandler("Please Add Photo", 400))
        }

        if (!name || !price || !stock || !category) {
            rm(photo.path, () => {
                console.log("Deleted");
            })
            return next(new ErrorHandler("Please provide all required fields.", 400)
            )
        }

        const product = await Product.create({
            name,
            price,
            stock,
            category: category.toLowerCase(),
            photo: photo?.path,
        })

        invalidateCache({ product: true, admin: true });

        return res.status(201).json({
            success: true,
            message: "Product Created Successfully",
            product
        })
    }
)

export const updateProduct = TryCatch(
    async (req: Request<{ id: string }, {}, NewProductRequestBody>, res: Response, next: NextFunction) => {

        const { id } = req.params;
        const { name, price, stock, category } = req.body;
        const photo = req.file;

        const product = await Product.findById(id);

        if (!product) {
            return next(new ErrorHandler("Product Not Found", 404))
        }

        if (photo) {
            rm(product.photo, () => {
                console.log("Deleted");
            })
            product.photo = photo.path
        }

        if (name) product.name = name
        if (price) product.price = price
        if (stock) product.stock = stock
        if (category) product.category = category.toLowerCase();

        await product.save();

        invalidateCache({ product: true, productId: String(product._id), admin: true, });

        return res.status(201).json({
            success: true,
            message: "Product Updated Successfully",
            product
        })
    }
)

export const deleteProduct = TryCatch(
    async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params
        const product = await Product.findById(id);
        if (!product) {
            return next(new ErrorHandler("Product Not Found", 404))
        }

        rm(product.photo, () => {
            console.log("Product Photo Deleted");

        })

        await Product.deleteOne()

        invalidateCache({ product: true, productId: String(product._id), admin: true });

        return res.status(200).json({
            success: true,
            message: "Product Deleted Successfully",
            product,
        })
    }
)

export const getAllProducts = TryCatch(
    async (req: Request<{}, {}, {}, SearchRequestQuery>, res: Response, next: NextFunction) => {
        const { search, sort, category, price } = req.query;

        const page = Number(req.query.page) || 1;
        const limit = Number(process.env.PRODUCT_PER_PAGE) || 8;
        const skip = (page - 1) * limit;

        const baseQuery: BaseQuery = {}

        if (search) baseQuery.name = {
            $regex: search,
            $options: "i",
        }

        if (price) baseQuery.price = {
            $lte: Number(price)
        }

        if (category) baseQuery.category = category;

        const productPromise = Product.find(baseQuery)
            .sort(sort && { price: sort === "asc" ? 1 : -1 })
            .limit(limit)
            .skip(skip)

        const [products, filteredOnlyProduct] = await Promise.all([
            productPromise,
            Product.find(baseQuery),
        ])

        const totalPage = Math.ceil(filteredOnlyProduct.length / limit);

        return res.status(200).json({
            success: true,
            message: "Products retrived Successfully",
            products,
            totalPage
        })
    }
)