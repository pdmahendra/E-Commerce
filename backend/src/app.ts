import express from 'express';
import { connectDB } from './utils/features.js';
import { errorMiddleware } from './middlewares/error.js';
import NodeCache from 'node-cache';
import { config } from 'dotenv';
config({
    path: ""
})
import morgan from 'morgan';
import Stripe from 'stripe';

const app = express();

const port = process.env.PORT || 5000
const stripeKey = process.env.STRIPE_KEY || ""

export const stripe = new Stripe(stripeKey);
export const myCache = new NodeCache();

//middlewares
app.use(express.json());
app.use(morgan("dev"))

//import Routes
import userRoutes from './routes/user.route.js';
import productRoutes from './routes/product.route.js';
import orderRoutes from './routes/order.route.js';
import paymentRoutes from './routes/payment.route.js';
import dashboardRoutes from './routes/stats.route.js';


//config routes
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/product', productRoutes);
app.use('/api/v1/order', orderRoutes);
app.use('/api/v1/payment', paymentRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);


//multer middleware
app.use("/uploads", express.static("uploads"))
//error middleware
app.use(errorMiddleware)


connectDB()
    .then(() => {
        app.listen(port, () => {
            console.log(`Server is listening on port ${port}`);
        });
    })
    .catch(error => {
        console.error('Database connection failed:', error);
        process.exit(1); // Exit the process with failure
    });

