import { Router } from "express";
const app = Router()
import { getAllUsers, newUser, getUser, deleteUser } from "../controllers/user.controller.js";
import { adminOnly } from "../middlewares/auth.middleware.js";


app.post('/new', newUser);
app.get('/all', adminOnly, getAllUsers)
app.route('/:id').get(getUser).delete(adminOnly, deleteUser)


export default app;