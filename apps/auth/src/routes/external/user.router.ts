import { error, HttpError, Payload } from "app";
import { NextFunction, Request, Response, Router } from "express";
import {
    createUser,
    findUser,
    getUserById,
    importUser,
    updateUserActivation,
    updateUser,
} from "../../controllers";
import {
    CreateUserReqBody,
    ImportUserReqBody,
    UpdateUserActivationReqBody,
    UpdateUserReqBody,
} from "../../interfaces/request";
import { FindReqQuery } from "../../interfaces/request";
import { verifyRole } from "../../middlewares";
import {
    createUserValidator,
    findUserValidator,
    importUserValidator,
    updateActivationValidator,
    updateUserValidator,
} from "../../validator";

export const router: Router = Router();

router.get(
    "/",
    verifyRole("SA", "TA"),
    findUserValidator(),
    async (req: Request, _: Response, next: NextFunction) => {
        const query = req.query as unknown as FindReqQuery;
        const payload = req.payload as Payload;
        const result = await findUser({
            ...query,
            userTenant: payload.tenant,
            userRoles: payload.roles,
        });
        next(result);
    }
);

router.post(
    "/",
    verifyRole("SA", "TA"),
    createUserValidator(),
    async (req: Request, _: Response, next: NextFunction) => {
        const body: CreateUserReqBody = req.body;
        const tenant = req.query.tenant as string | undefined;
        const payload = req.payload as Payload;
        const result = await createUser({
            ...body,
            userId: payload.id,
            userRoles: payload.roles,
            tenant,
        });
        next(result);
    }
);

router.post(
    "/import",
    verifyRole("SA", "TA"),
    importUserValidator(),
    async (req: Request, _: Response, next: NextFunction) => {
        if (!Array.isArray(req.body)) {
            throw new HttpError(
                error.invalidData({
                    location: "body",
                    value: req.body,
                    message: "request body must be an array",
                })
            );
        }

        const body: ImportUserReqBody = req.body;
        const payload = req.payload as Payload;
        if (!payload.roles.includes("SA")) {
            body.forEach((u) => (u.tenant = payload.tenant));
        }

        const result = await importUser({
            data: body,
            userId: payload.id,
            userRoles: payload.roles,
        });
        next(result);
    }
);

router.post(
    "/update-activation",
    verifyRole("SA", "TA"),
    updateActivationValidator(),
    async (req: Request, _: Response, next: NextFunction) => {
        const body = req.body as UpdateUserActivationReqBody;
        const payload = req.payload as Payload;
        const result = await updateUserActivation({
            ...body,
            userRoles: payload.roles,
            tenant: payload.tenant,
        });
        next(result);
    }
);

router.get(
    "/:userId",
    verifyRole("*"),
    async (req: Request, _: Response, next: NextFunction) => {
        const payload = req.payload as Payload;
        const { userId } = req.params;
        const result = await getUserById({
            id: userId,
            tenant: payload.tenant,
            userRoles: payload.roles,
            userId: payload.id,
        });
        next(result);
    }
);

router.put(
    "/:userId",
    verifyRole("SA", "TA"),
    updateUserValidator(),
    async (req: Request, _: Response, next: NextFunction) => {
        const body: UpdateUserReqBody = req.body;
        const payload = req.payload as Payload;
        const userId = req.params.userId as string;
        const result = await updateUser({
            ...body,
            id: userId,
            userId: payload.id,
            userRoles: payload.roles,
        });
        next(result);
    }
);
