import { NextFunction, Request, Response, Router } from "express";
import {
    newToken,
    login,
    forgotPassword,
    setPassword,
    updatePassword,
    checkAccount,
    loginWithAccessCode as loginWithCode,
} from "../../controllers";
import {
    CheckReqBody,
    LoginReqBody,
    UpdatePasswordReqBody,
} from "../../interfaces/request";
import { verifyToken } from "../../middlewares";
import {
    loginValidator,
    refreshTokenValidator,
    forgotPasswordValidator,
    setPasswordValidator,
    updatePasswordValidator,
    checkAccountValidator,
    loginWithCodeValidator,
} from "../../validator";

export const router: Router = Router();

router.post(
    "/login",
    loginValidator(),
    async (req: Request, _: Response, next: NextFunction) => {
        const body = req.body as LoginReqBody;
        const result = await login(body);
        next(result);
    }
);

router.post(
    "/login-ad",
    loginWithCodeValidator(),
    async (req: Request, _: Response, next: NextFunction) => {
        const accessCode = req.header("access-code") as string;
        const result = await loginWithCode(accessCode);
        next(result);
    }
);

router.post(
    "/check",
    checkAccountValidator(),
    async (req: Request, _: Response, next: NextFunction) => {
        const body = req.body as CheckReqBody;
        const result = await checkAccount(body);
        next(result);
    }
);

router.post(
    "/forgot-password",
    forgotPasswordValidator(),
    async (req: Request, _: Response, next: NextFunction) => {
        const domain = req.get("origin") || "http://localhost";
        const email = req.body.email as string;
        const result = await forgotPassword({ email, domain });
        next(result);
    }
);

router.post(
    "/set-password",
    setPasswordValidator(),
    async (req: Request, _: Response, next: NextFunction) => {
        const password = req.body.password as string;
        const token = req.header("reset-password-token") as string;
        const result = await setPassword({ token, password });
        next(result);
    }
);

router.post(
    "/refresh-token",
    refreshTokenValidator(),
    async (req: Request, _: Response, next: NextFunction) => {
        const token = req.header("refresh-token") as string;
        const result = await newToken(token);
        next(result);
    }
);

router.post(
    "/update-pasword",
    verifyToken,
    updatePasswordValidator(),
    async (req: Request, _: Response, next: NextFunction) => {
        const body = req.body as UpdatePasswordReqBody;
        const userId = req.payload?.id as string;
        const result = await updatePassword({
            userId,
            ...body,
        });
        next(result);
    }
);
