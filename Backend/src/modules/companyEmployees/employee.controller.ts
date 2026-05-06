import { Request, Response } from "express";
import EmployeeService from './employee.services'
class EmployeeController {
    async getEmployees(req: Request, res: Response) {
        try {
            const { linkedinUrl } = req.body;

            if (!linkedinUrl) {
                return res.status(400).json({
                    success: false,
                    error: "linkedinUrl required",
                });
            }

            const result = await EmployeeService.getCompanyPeople(linkedinUrl);

            return res.status(200).json(result);

        } catch (err: any) {
            res.status(500).json({
                success: false,
                error: err.message,
            });
        }
    }
}

export default new EmployeeController();