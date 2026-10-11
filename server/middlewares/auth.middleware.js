import jwt from "jsonwebtoken"
import { CustomerModel } from "../models/customer.model.js"
export const authMiddleware = async (req, res, next) => {
    try{
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized"
        })
    }
    const decoded = jwt.verify(token,process.env.JWT_SECRET)
    const customer = await CustomerModel.findById(decoded.userId);
    if(!customer){
        return res.status(401).json({
            success: false,
            message: "Unauthorized"
        })
    }
    req.user = customer;
    next();
}
catch(err){
    return res.status(401).json({
        success: false,
        message: "Unauthorized"
    });
}
}