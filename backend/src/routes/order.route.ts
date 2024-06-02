import { Router } from "express";
const app = Router()
import { adminOnly } from "../middlewares/auth.middleware.js";
import { newOrder, myOrders, allOrders, getSingleOrder, deleteOrder, processOrder } from "../controllers/order.controller.js";


app.post('/new', newOrder);

app.get('/my', myOrders)

app.get('/all', adminOnly, allOrders)

app
    .route("/:id")
    .get(getSingleOrder)
    .put(adminOnly, processOrder)
    .delete(adminOnly, deleteOrder)
export default app;