import productController from "./product.controller";
import express from 'express';
const router = express.Router();
router.post("/getproducts", productController.getProducts)
export default router;