import { Payload } from "app";
import express, { NextFunction, Request, Response } from "express";
import {
    createGroup,
    deleteGroup,
    findGroup,
    getGroupById,
    updateGroup,
} from "../../controllers";
import {
    CreateGroupReqBody,
    UpdateGroupReqBody,
} from "../../interfaces/request";
import { FindReqQuery } from "../../interfaces/request";
import { verifyRole } from "../../middlewares";
import {
    createGroupValidator,
    findGroupValidator,
    updateGroupValidator,
} from "../../validator";

export const router = express.Router();

router.get(
    "/",
    verifyRole("SA", "TA", "L*"),
    findGroupValidator(),
    async (req: Request, _: Response, next: NextFunction) => {
        const { roles, id, tenant } = req.payload as Payload;
        const query = req.query as unknown as FindReqQuery;
        const result = await findGroup({
            ...query,
            userId: id,
            userTenant: tenant,
            userRoles: roles,
        });
        next(result);
    }
);

router.post(
    "/",
    verifyRole("TA", "SA"),
    createGroupValidator(),
    async (req: Request, _: Response, next: NextFunction) => {
        const role = req.payload?.roles as string[];
        const body: CreateGroupReqBody = req.body;
        const tenant = req.query.tenant as string;
        const result = await createGroup({
            ...body,
            leaderId: body.leader_id,
            userRoles: role,
            tenant,
        });
        next(result);
    }
);

router.put(
    "/:groupId",
    verifyRole("TA", "SA", "L*"),
    updateGroupValidator(),
    async (req: Request, _: Response, next: NextFunction) => {
        const { tenant, id, roles } = req.payload as Payload;
        const { groupId } = req.params;
        const body: UpdateGroupReqBody = req.body;
        const result = await updateGroup({
            ...body,
            groupId,
            leaderId: body.leader_id,
            tenant: tenant,
            userRoles: roles,
            userId: id,
        });
        next(result);
    }
);

router.delete(
    "/:groupId",
    verifyRole("TA", "SA", "L*"),
    async (req: Request, _: Response, next: NextFunction) => {
        const { tenant, id, roles } = req.payload as Payload;
        const { groupId } = req.params;
        const result = await deleteGroup({
            groupId,
            tenant: tenant,
            userRoles: roles,
            userId: id,
        });
        next(result);
    }
);

router.get(
    "/:groupId",
    verifyRole("TA", "SA", "L*"),
    async (req: Request, _: Response, next: NextFunction) => {
        const { tenant, id, roles } = req.payload as Payload;
        const { groupId } = req.params;
        const result = await getGroupById({
            groupId,
            tenant: tenant,
            userRoles: roles,
            userId: id,
        });
        next(result);
    }
);
