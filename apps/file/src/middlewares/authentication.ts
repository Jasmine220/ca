import jsonwebtoken, { VerifyOptions } from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import { ErrorDetail, HttpError } from "app";
import { Payload, HttpStatus } from "app";
import { configs } from "../configs";
import { redis } from "../database";

if (!configs.keys.public) {
    throw new Error("Missing public key in environment variable");
}
const publicKey: string = configs.keys.public;

export async function verifyToken(
    req: Request,
    _: Response,
    next: NextFunction
): Promise<void> {
    const option = { algorithm: "RS256" } as VerifyOptions;
    const token: string | undefined = req.header("token");
    const errors: ErrorDetail[] = [
        {
            param: "token",
            location: "header",
        },
    ];
    if (!token) {
        throw new HttpError({
            status: HttpStatus.UNAUTHORIZED,
            code: "NO_TOKEN",
            errors: errors,
        });
    }

    try {
        const payload = <Payload>jsonwebtoken.verify(token, publicKey, option);
        req.payload = payload;
        const expireAt = await getExpireTime({
            token,
            userId: payload.id,
        });
        if (payload.type !== "ACCESS_TOKEN" || expireAt === null) {
            return next({
                status: HttpStatus.UNAUTHORIZED,
                code: "INVALID_TOKEN",
                errors: errors,
            });
        }

        return next();
    } catch (error) {
        const e: Error = error as Error;
        if (e.name && e.name === "TokenExpiredError") {
            return next({
                status: HttpStatus.UNAUTHORIZED,
                code: "TOKEN_EXPIRED",
                errors: errors,
            });
        } else {
            return next({
                status: HttpStatus.UNAUTHORIZED,
                code: "INVALID_TOKEN",
                errors: errors,
            });
        }
    }
}

async function getExpireTime(params: {
    token: string;
    userId: string;
}): Promise<string | null> {
    if (redis.status !== "ready") {
        await redis.connect();
    }
    const tokenSignature = params.token.split(".")[2];
    const key = `ca:token:user:${params.userId}`;
    return await redis.zscore(key, tokenSignature);
}
