import { Request, Response } from 'express'
import financeServices from './finance.services'

class FinanceController {
    async getFinancedata(req: Request, res: Response) {
        try {
            const { company_name, domain } = req.body

            const result = await financeServices.getFinancials(domain, company_name)

            return res.status(200).json({
                success: true,
                data: result.data
            })

        } catch (error) {
            console.error("FinanceController Error:", error)

            return res.status(500).json({
                success: false,
                message: "Internal server error"
            })
        }
    }
}

export default new FinanceController();