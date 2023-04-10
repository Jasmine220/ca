import { Payload } from "app";
import express, { NextFunction, Request, Response } from "express";
import { createLinkUpload } from "../../controllers/file.controller";
import { createLinkValidator } from "../../validator";
export const router = express.Router();

router.get(
    "/upload-link/:fileName",
    createLinkValidator(),
    async (req: Request, _: Response, next: NextFunction) => {
        const { id: userId } = req.payload as Payload;
        const fileName = req.params.fileName as string;
        const tenant = req.query.tenant as string;
        const type = req.query.type as string;
        const result = await createLinkUpload(fileName, type, tenant, userId);
        next(result);
    }
);
