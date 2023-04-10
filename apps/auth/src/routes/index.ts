import { Router } from "express";
import { configs } from "../configs";
import { verifyToken } from "../middlewares";

import { router as authRouter } from "./external/auth.router";
import { router as inAccountRouter } from "./internal/account.router";
import { router as groupRouter } from "./external/group.router";
import { router as inGroupRouter } from "./internal/group.router";
import { router as userRouter } from "./external/user.router";
import { router as inUserRouter } from "./internal/user.router";

export const router: Router = Router();
router.use(`${configs.api.prefix}/auth`, authRouter);
router.use(`${configs.api.prefix}/in/accounts`, inAccountRouter);

router.use(`${configs.api.prefix}/groups`, verifyToken, groupRouter);
router.use(`${configs.api.prefix}/in/groups`, inGroupRouter);
router.use(`${configs.api.prefix}/users`, verifyToken, userRouter);
router.use(`${configs.api.prefix}/in/users`, inUserRouter);
