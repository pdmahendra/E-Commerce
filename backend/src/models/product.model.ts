import mongoose, { Schema } from 'mongoose';

export const productSchema = new Schema({
    name: {
        type: String,
        required: [true, "please enter name"]
    },
    photo: {
        type: String,
        required: [true, "please enter Photo"]
    },
    price: {
        type: Number,
        required: [true, "please enter Price"]
    },
    stock: {
        type: Number,
        required: [true, "please enter Stock"]
    },
    category: {
        type: String,
        required: [true, "please enter Category"],
        trim: true,
    },

}, {
    timestamps: true
});

export const Product = mongoose.model("Product", productSchema)

