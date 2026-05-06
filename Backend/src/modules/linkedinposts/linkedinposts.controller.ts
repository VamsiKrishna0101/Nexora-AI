import linkedinpostsServices from "./linkedinposts.services";
import { Request, Response } from "express";

class LinkedinPostsController {
    async getcompanyposts(req: Request, res: Response) {
        const { linkedinurl } = req.body
        try {
            if (!linkedinurl) {
                return res.status(400).json({ success: false, message: "linkedin url required" })
            }
            const result = await linkedinpostsServices.getCompanyPosts(linkedinurl)
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
export default new LinkedinPostsController();