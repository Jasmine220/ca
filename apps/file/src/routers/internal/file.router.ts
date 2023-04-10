import express, { NextFunction, Request, Response } from "express";
import { getLinkDownload } from "../../controllers/file.controller";
import { getLinkValidator } from "../../validator";
export const router = express.Router();

router.post(
    "/download-links",
    getLinkValidator(),
    async (req: Request, _: Response, next: NextFunction) => {
        const objectNames: string[] = req.body;
        const result = await getLinkDownload(objectNames);
        next(result);
    }
);
