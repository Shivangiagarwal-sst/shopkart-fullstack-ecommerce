import express from "express"
import {registerCustomer,loginCustomer,mepage,logoutUser,changePassword} from "../controllers/customer.controller.js"
import { authMiddleware } from "../middlewares/auth.middleware.js";
export const CustomerRouter = express.Router();
CustomerRouter.post("/register",registerCustomer)
CustomerRouter.post("/login",loginCustomer);
CustomerRouter.get("/me",authMiddleware,mepage)
CustomerRouter.post("/logout",logoutUser);
CustomerRouter.patch("/change-password",authMiddleware,changePassword);
