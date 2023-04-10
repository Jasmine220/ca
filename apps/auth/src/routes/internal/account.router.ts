import { NextFunction, Request, Response, Router } from "express";
import { updateTenantActivation } from "../../controllers";
import { UpdateTenantActivationReqBody } from "../../interfaces/request";
import { updateTenantActivationValidator } from "../../validator";

export const router: Router = Router();

router.post(
    "/update-tenant-activation",
    updateTenantActivationValidator(),
    async (req: Request, _: Response, next: NextFunction) => {
        const body = req.body as UpdateTenantActivationReqBody;
        const result = await updateTenantActivation(body);
        next(result);
    }
);
