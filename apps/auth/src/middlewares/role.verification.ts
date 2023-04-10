import { error } from "app";
import { NextFunction, Request, RequestHandler, Response } from "express";

export function verifySystemAdmin(
    req: Request,
    _: Response,
    next: NextFunction
): void {
    const errorResult = error.actionNotAllowed();
    if (!req.payload) {
        return next(errorResult);
    }

    const { roles } = req.payload;
    if (roles.includes("SA")) {
        return next();
    } else {
        return next(errorResult);
    }
}

export function verifyTenantUser(
    req: Request,
    _: Response,
    next: NextFunction
): void {
    const errorResult = error.actionNotAllowed();
    if (!req.payload) {
        return next(errorResult);
    }

    const { roles } = req.payload;
    const isTenantUser = ["TA", "L1", "L2", "EU"].some((value) =>
        roles.includes(value)
    );
    if (isTenantUser) {
        return next();
    } else {
        return next(errorResult);
    }
}

export function verifyRole(...roles: string[]): RequestHandler {
    if (roles.includes("*")) {
        roles.push("SA", "TA", "EU", "L*");
    }

    if (roles.includes("L*")) {
        roles.push("L1", "L2");
    }

    return (req: Request, _: Response, next: NextFunction) => {
        const errorResult = error.actionNotAllowed();
        if (!req.payload) {
            return next(errorResult);
        }

        const { roles } = req.payload;
        const isRoleOke = roles.some((r) => roles.includes(r));
        if (isRoleOke) {
            return next();
        }
        return next(errorResult);
    };
}
