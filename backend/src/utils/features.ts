import mongoose from 'mongoose';
import { InvalidateCacheProps, OrderItemType } from '../types/types.js';
import { Product } from '../models/product.model.js';
import { myCache } from '../app.js';
import { Document } from 'mongoose';
import { isLength } from 'validator';


export const connectDB = async () => {
    try {
        const connect = await mongoose.connect(`${process.env.MONGO_URI}/${process.env.DB_NAME}`)
        console.log("database connected", connect.connection.host)
    } catch (error) {
        console.log("MongoDB connection failed", error);
        process.exit(1);
    }
};


export const invalidateCache = ({ product, order, admin, userId, orderId, productId }: InvalidateCacheProps) => {
    if (product) {
        let productKeys: string[] = [
            "latest-product",
            "categories",
            "all-products",
            `product-${productId}`
        ];

        if (typeof productId === "string") productKeys.push(`product-${productId}`)

        if (typeof productId === "object") productId.forEach(i => productKeys.push(`product-${i}`));

        myCache.del(productKeys);
    };

    if (order) {
        const orderKeys: string[] = ["all-orders", `my-orders-${userId}`, `orders${orderId}`,];

        myCache.del(orderKeys);
    }
    if (admin) {
        myCache.del(["admin-stats", "admin-pie-charts", "admin-bar-charts", "admin-line-charts"])
    }
};

export const reduceStock = async (orderItems: OrderItemType[]) => {

    for (let i = 0; i < orderItems.length; i++) {
        const order = orderItems[i];
        const product = await Product.findById(order.productId)
        if (!product) {
            throw new Error("Product Not Found");
        }
        product.stock -= order.quantity;
        await product.save()

    }
};


export const calculatePercentage = (thisMonth: number, lastMonth: number) => {

    if (lastMonth === 0) return thisMonth * 100;
    const percent = (thisMonth / lastMonth) * 100;
    return String(percent.toFixed(0))
}


export type GetInventoriesType = {
    categories: string[];
    productsCount: number;
}
export const getInventories = async ({
    categories,
    productsCount
}: GetInventoriesType) => {
    const categoriesCountPromise = categories.map((category) => Product.countDocuments({ category }))

    const categoriesCount = await Promise.all(categoriesCountPromise);

    const categoryCount: Record<string, number>[] = [];

    categories.forEach((category, i) => {
        categoryCount.push({
            [category]: Math.round(categoriesCount[i] / productsCount * 100),
        })
    })
    return categoryCount
};



interface MyDocument extends Document {
    createdAt: Date;
    discount?: number;
    total?: number;
}

type FuncProps = {
    length: number;
    docArr: MyDocument[];
    today: Date;
    property?: "discount" | "total"
}
export const getChartData = ({ length, docArr, today, property }: FuncProps) => {
    const data = new Array(length).fill(0);

    docArr.forEach((i) => {
        const creationDate = i.createdAt;
        const monthDiff = (today.getMonth() - creationDate.getMonth() + 12) % 12;

        if (monthDiff < length) {
            data[length - monthDiff - 1] += property ? i[property]! : 1;
        }
    });

    return data;
}