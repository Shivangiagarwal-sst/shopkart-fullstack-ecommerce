import { CustomerModel } from "../models/customer.model.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken";
import { genToken } from "../utils/generateToken.js";
export const registerCustomer = async (req, res) => {
    try {
        const { fullName, email, password, phone } = req.body;
        if (!fullName || !email || !password || !phone) {
            return res.status(400).json({ "success": false, "message": "All Fields are required" });
        }
        if (password.length < 6) {
            return res.status(400).json({ "success": false, "message": "Password must be atleast 6 characters long" })
        }
        const user = await CustomerModel.findOne({ email });
        if (user) {
            return res.status(409).json({ "success": false, "message": "User Already Exists Plz Login" })
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const Customer = await CustomerModel.create({
            fullName, email, password: hashedPassword, phone
        })
        res.status(201).json({
            "success": true,
            "message": "Customer registered successfully",
            "customer": {
                "_id": Customer._id,
                "fullName": Customer.fullName,
                "email": Customer.email,
                "phone": Customer.phone
            }
        })
    }
    catch (err) {
        res.status(500).json({ message: 'Internal Server Errorr', error: err })
    }
}
export const loginCustomer = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await CustomerModel.findOne({ email });
        if (!user) {
            return res.status(401).send("Invalid credentials");
        }
        const check = await bcrypt.compare(password, user.password);
        if (!check) {
            return res.status(401).send("Invalid credentials");
        }
        const token = genToken(user._id);
        res.cookie("token", token, { httpOnly: true })
        res.status(200).json({
            "success": true,
            "message": "Login successful"
        })
    }
    catch (err) {
        res.status(500).json({ message: 'Internal Server Errorr', error: err })
    }
}
export const mepage = async (req, res) => {
    res.status(200).send({

        "_id": req.user._id,
        "fullName": req.user.fullName,
        "email": req.user.email,
        "phone": req.user.phone

    });
}

export const logoutUser = async (req, res) => {
    res.clearCookie("token");
    return res.status(200).json({
        success: true,
        message: "Logged out successfully"
    });
}

export const changePassword = async (req, res) => {
    try {
        const { oldp, newp } = req.body;
        const customerId = req.user._id;
        const Customer = await CustomerModel.findById(customerId);
        if (!Customer) {
            return res.status(404).json({
                message: "Customer not found"
            });
        }
        const check = await bcrypt.compare(oldp, Customer.password);
        if (!check) {
            return res.status(401).json({
                message: "Old password is incorrect"
            });
        }
        const hashedpassword = await bcrypt.hash(newp, 10);
        Customer.password = hashedpassword;
        await Customer.save();
        return res.status(200).json({
            message: "Password changed successfully"
        });
    }
    catch (err) {
        return res.status(500).json({
            message: "Internal server error"
        });
    }
}