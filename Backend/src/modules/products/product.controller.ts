import productServices from "./product.services";
import { Request, Response } from "express";

class ProductController {
    async getProducts(req: Request, res: Response) {
        try {
            const { company_name, domain, description } = req.body;
            if (!company_name || !domain || !description) {
                return res.status(400).json({
                    success: false,
                    message: "company name,domain and description required"
                })
            }
            const result = await productServices.getCompanyProducts(company_name, domain, description);
            return res.status(200).json({
                success: true,
                data: result
            })
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Internal server error"
            })
        }

    }

}
export default new ProductController();