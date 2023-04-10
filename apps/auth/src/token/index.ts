import { Payload } from "app";
import jsonwebtoken, { SignOptions, VerifyOptions } from "jsonwebtoken";
import { configs } from "../configs";
import sha256 from "crypto-js/sha256";

if (!configs.keys.secret) {
    throw new Error("Missing secret key in environment variable");
}
if (!configs.keys.public) {
    throw new Error("Missing public key in environment variable");
}
const secretKey: string = configs.keys.secret;
const publicKey: string = configs.keys.public;

export function genAccessToken(payload: Omit<Payload, "type">): {
    token: string;
    expireAt: number;
} {
    const timestampInSec = new Date().getTime() / 1000;
    const expireAt = Math.floor(timestampInSec + 60 * 60);
    const signOptions = {
        expiresIn: "1h",
        algorithm: "RS256",
    } as SignOptions;
    const token = jsonwebtoken.sign(
        { ...payload, type: "ACCESS_TOKEN" },
        secretKey,
        signOptions
    );
    return { token, expireAt };
}

export function genRefreshToken(id: string): {
    token: string;
    expireAt: number;
} {
    const timestampInSec = new Date().getTime() / 1000;
    const expireAt = Math.floor(timestampInSec + 60 * 60);
    const signOptions = {
        expiresIn: "24h",
        algorithm: "RS256",
    } as SignOptions;
    const token = jsonwebtoken.sign(
        { id, type: "REFRESH_TOKEN" },
        secretKey,
        signOptions
    );
    return { token, expireAt };
}

export function getPayload(token: string): Payload | Error {
    const verifyOptions = {
        algorithm: "RS256",
    } as VerifyOptions;
    try {
        const payload = <Payload>(
            jsonwebtoken.verify(token, publicKey, verifyOptions)
        );
        return payload;
    } catch (error) {
        return error as Error;
    }
}

export function genResetPasswordToken(
    id: string,
    time: Date,
    password?: string
): string {
    return sha256(password || "" + id + time).toString();
}
