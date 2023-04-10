import express, { NextFunction, Request, Response } from "express";
import { getAllGroup, membersOfGroup } from "../../controllers";

export const router = express.Router();

router.get("/", async (req: Request, _: Response, next: NextFunction) => {
    const tenant = req.query.tenant as string | undefined;
    const result = await getAllGroup({ tenant });
    next(result);
});

router.get(
    "/:groupId/members",
    async (req: Request, _: Response, next: NextFunction) => {
        const tenant = req.query.tenant as string | undefined;
        const groupId: string = req.params.groupId;
        const result = await membersOfGroup({ groupId, tenant });
        next(result);
    }
);
