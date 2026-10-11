
import express from "express";

import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProductImage,
} from "../controllers/product.controller.js";

import upload from "../middlewares/upload.js";

const router = express.Router();

router.post("/", upload.single("image"), createProduct);

router.get("/", getAllProducts);

router.patch("/:id/image", upload.single("image"), updateProductImage);

router.get("/:id", getProductById);

export default router;