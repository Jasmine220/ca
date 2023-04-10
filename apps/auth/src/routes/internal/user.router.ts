import { NextFunction, Request, Response, Router } from "express";
import { getUserByIds, _getUserById } from "../../controllers";
import { findUserByIdsValidator } from "../../validator";

export const router: Router = Router();

router.post(
    "/get-by-ids",
    findUserByIdsValidator(),
    async (req: Request, _: Response, next: NextFunction) => {
        const { ids } = req.body;
        const result = await getUserByIds(ids);
        next(result);
    }
);

router.get(
    "/:userId",
    async (req: Request, _: Response, next: NextFunction) => {
        const { userId } = req.params;
        const result = await _getUserById(userId);
        next(result);
    }
);
