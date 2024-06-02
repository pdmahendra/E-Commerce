import { Router } from "express";
const app = Router()
import { adminOnly } from "../middlewares/auth.middleware.js";
import { allCoupons, applyDiscount, deleteCoupon, newCoupon, createPaymentIntent } from "../controllers/payment.controller.js";

app.post('/create', createPaymentIntent);
app.get('/discount', applyDiscount);
app.post('/coupon/new', adminOnly, newCoupon);
app.get('/coupons/all', adminOnly, allCoupons);
app.delete('/coupon/:id,', adminOnly, deleteCoupon);

export default app;