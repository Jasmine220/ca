import { Router } from "express";
import { configs } from "../configs";
import { verifyToken } from "../middlewares";
import { router as fileRouter } from "./external/file.router";
import { router as inFileRouter } from "./internal/file.router";

export const router: Router = Router();
router.use(`${configs.api.prefix}/files/`, verifyToken, fileRouter);
router.use(`${configs.api.prefix}/in/files`, inFileRouter);
