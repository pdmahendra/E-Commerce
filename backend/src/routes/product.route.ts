import { Router } from "express";
const app = Router()
import { adminOnly } from "../middlewares/auth.middleware.js";
import { getAllProducts, getAdminProducts, getAllCategories, getLatestProducts, getSingleProduct, updateProduct, newProduct, deleteProduct } from "../controllers/product.controller.js";
import { singleUpload } from "../middlewares/multer.middleware.js";


app.post('/new', adminOnly, singleUpload, newProduct)
app.get('/all', getAllProducts) //get all products with filters
app.get('/latest', getLatestProducts)
app.get('/categories', getAllCategories)
app.get('/admin-products', adminOnly, getAdminProducts)
app
    .route("/:id")
    .get(getSingleProduct)
    .put(adminOnly, singleUpload, updateProduct)
    .delete(adminOnly, deleteProduct)

export default app;