import { error, HttpStatus, Result, ResultError, success } from "app";
import bcrypt from "bcrypt";
import logger from "logger";
import { configs } from "../configs";
import { redis } from "../database";
import { User } from "../models";
import Account from "../models/account";
import {
    verifyAccessCode,
    getTenantByCode,
    // getUserById,
    sendMailResetPassword,
    // updateUserActivity,
} from "../services";
import {
    genAccessToken,
    genRefreshToken,
    genResetPasswordToken,
    getPayload,
} from "../token";
import { updateUserActivity } from "./user.controller";

export async function login(params: {
    email: string;
    password: string;
}): Promise<Result> {
    try {
        const numberOfTried = 5;
        const [account, user] = await Promise.all([
            Account.findOne(
                { email: { $regex: `^${params.email}$`, $options: "i" } },
                { created_time: 0 }
            ),
            User.findOne(
                { email: { $regex: `^${params.email}$`, $options: "i" } },
                { _id: 0, activities: 0 }
            ).lean(),
        ]);
        if (account && account.password) {
            if (account.failed_login === numberOfTried - 1) {
                account.last_locked = new Date();
            } else if (account.failed_login === numberOfTried) {
                const lastLocked = account.last_locked
                    ? account.last_locked
                    : new Date();
                const now = new Date();
                const diffInMicrosecond = now.getTime() - lastLocked.getTime();
                const diffInMinutes = Math.ceil(diffInMicrosecond / (60 * 1000));
                if (diffInMinutes <= 30) {
                    return {
                        code: "ACCOUNT_IS_LOCKED",
                        status: HttpStatus.UNAUTHORIZED,
                        errors: [
                            {
                                location: "body",
                                param: "email",
                            },
                        ],
                    };
                } else {
                    account.failed_login = 0;
                }
            }
            const isPasswordOke = bcrypt.compareSync(
                params.password,
                account.password
            );
            if (isPasswordOke) {
                const isActive = account?.tenant
                    ? account.tenant?.is_active && account?.is_active
                    : account?.is_active;
                if (!isActive) {
                    return accountInactiveError();
                }
                if (account.roles.length === 0) {
                    return accountRolesEmpty();
                }
                const { id, roles, tenant, email } = account;
                const accessToken = genAccessToken({
                    id,
                    roles,
                    email,
                    tenant: tenant?.code,
                });
                const refreshToken = genRefreshToken(id);
                const data = {
                    ...{
                        ...user,
                        _id: undefined,
                    },
                    accessToken: accessToken.token,
                    refreshToken: refreshToken.token,
                    roles: account.roles,
                    activities: undefined,
                };
                account.failed_login = 0;
                await Promise.all([
                    saveTokenSignature({
                        userId: id,
                        token: accessToken.token,
                        expireAt: accessToken.expireAt,
                    }),
                    account.save(),
                ]);
                return success.ok(data);
            } else {
                account.failed_login += 1;
                await account.save();
                return wrongPasswordError();
            }
        } else {
            return accountNotFoundError();
        }
    } catch (err) {
        logger.debug("%o", err)
        throw err;
    }
}

export async function loginWithAccessCode(accessCode: string): Promise<Result> {
    const response = await verifyAccessCode({ accessCode });
    if (response.body) {
        const [account, user] = await Promise.all([
            Account.findOne(
                {
                    email: {
                        $regex: `^${response.body.email}$`,
                        $options: "i",
                    },
                },
                { created_time: 0 }
            ),
            User.findOne(
                {
                    email: {
                        $regex: `^${response.body.email}$`,
                        $options: "i",
                    },
                },
                { _id: 0, activities: 0 }
            ).lean(),
        ]);
        if (account) {
            const isActive = account?.tenant
                ? account.tenant?.is_active && account?.is_active
                : account?.is_active;
            if (!isActive) {
                return accountInactiveError();
            }
            if (account.roles.length === 0) {
                return accountRolesEmpty();
            }
            const { id, roles, tenant, email } = account;
            const accessToken = genAccessToken({
                id,
                roles,
                email,
                tenant: tenant?.code,
            });
            const refreshToken = genRefreshToken(id);
            const data = {
                ...{
                    ...user,
                    _id: undefined,
                },
                accessToken: accessToken.token,
                refreshToken: refreshToken.token,
                roles: account.roles,
                activities: undefined,
            };
            account.failed_login = 0;
            await Promise.all([
                saveTokenSignature({
                    userId: id,
                    token: accessToken.token,
                    expireAt: accessToken.expireAt,
                }),
                account.save(),
            ]);
            return success.ok(data);
        } else {
            return accountNotFoundError();
        }
    } else {
        return wrongPasswordError();
    }
}

export async function newToken(refreshToken: string): Promise<Result> {
    const payload = getPayload(refreshToken);
    const errors = [
        {
            param: "token",
            location: "header",
        },
    ];
    if (payload instanceof Error) {
        const err = payload;
        if (err.name && err.name === "TokenExpiredError") {
            return {
                status: HttpStatus.UNAUTHORIZED,
                code: "TOKEN_EXPIRED",
                errors: errors,
            };
        } else {
            return {
                status: HttpStatus.UNAUTHORIZED,
                code: "INVALID_TOKEN",
                errors: errors,
            };
        }
    }

    const [user, account] = await Promise.all([
        User.find({ id: payload.id }, { _id: 0, activities: 0 }),
        Account.findOne({ id: payload.id }, { _id: 0, password: 0 }),
    ]);

    if (account) {
        const isActive = account?.tenant
            ? account.tenant?.is_active && account?.is_active
            : account?.is_active;
        if (!isActive) {
            return accountInactiveError();
        }
        const { id, roles, tenant, email } = account;
        const accessToken = genAccessToken({
            id,
            roles,
            email,
            tenant: tenant?.code,
        });
        const refreshToken = genRefreshToken(id);
        const data = {
            ...{
                ...user,
                _id: undefined,
            },
            accessToken: accessToken.token,
            refreshToken: refreshToken.token,
            roles: account.roles,
            activities: undefined,
        };
        await saveTokenSignature({
            userId: id,
            token: accessToken.token,
            expireAt: accessToken.expireAt,
        });
        return { status: HttpStatus.OK, data };
    } else {
        return accountNotFoundError();
    }
}

export async function forgotPassword(params: {
    email: string;
    domain?: string;
}): Promise<Result> {
    const account = await Account.findOne(
        {
            email: { $regex: `^${params.email}$`, $options: "i" },
            is_active: true,
        },
        { created_time: 0, is_active: 0, activities: 0 }
    );
    if (!account) {
        return error.invalidData({
            location: "body",
            param: "email",
            value: params.email,
            message: "the email is not correct",
            description: {
                vi: "Địa chỉ email không tồn tại trong hệ thông, vui lòng kiểm tra lại.",
                en: "The email address does not exist in the system, please check again.",
            },
        });
    }

    account.token_time = new Date();
    const token = genResetPasswordToken(
        account.id,
        account.token_time,
        account.password
    );
    account.password_token = token;
    await account.save();
    const link = `${params.domain}/reset-password/${token}`;
    await sendMailResetPassword(account.email, link);
    return success.ok({ message: "success" });
}

export async function setPassword(params: {
    token: string;
    password: string;
}): Promise<Result> {
    const account = await Account.findOne({ password_token: params.token });
    const tokenInvalidError = error.invalidData({
        location: "header",
        param: "reset-password",
        value: params.token,
        message: "reset password token is not valid",
    });
    const tokenTime = account?.token_time ? account?.token_time : new Date();
    const now = new Date();
    const diffInMicrosecond = now.getTime() - tokenTime.getTime();
    const diffInMinutes = Math.ceil(diffInMicrosecond / (60 * 1000));
    if (!account || diffInMinutes > 10) {
        return tokenInvalidError;
    }

    const arePasswordsSame = account.password
        ? bcrypt.compareSync(params.password, account.password)
        : false;
    if (arePasswordsSame) {
        return error.invalidData({
            location: "body",
            param: "password",
            value: params.password,
            message: "the old password and the new password are same",
            description: {
                vi: "Mật khẩu mới không thể trùng với mật khẩu cũ",
                en: "The new password can not be same with the old password",
            },
        });
    }

    const sr = Number(configs.saltRounds);
    const hashedPassword = await bcrypt.hash(
        params.password,
        await bcrypt.genSalt(sr)
    );
    account.password = hashedPassword;
    account.password_token = undefined;
    await Promise.all([
        User.findOneAndUpdate(
            { id: account.id, is_active: true },
            {
                $push: {
                    activities: {
                        action: "RESET_PASSWORD",
                        actor: account.id,
                        time: new Date(),
                    },
                },
            },
            { projection: { _id: 0 } }
        ),
        account.save(),
    ]);
    return success.ok({ message: "success" });
}

export async function updatePassword(params: {
    userId: string;
    old_password: string;
    new_password: string;
}): Promise<Result> {
    const account = await Account.findOne({ id: params.userId });
    if (!account) {
        return error.invalidData({
            location: "header",
            param: "token",
            value: params.userId,
            message: "access token is not valid",
        });
    }

    if (params.old_password == params.new_password) {
        return error.invalidData({
            location: "body",
            param: "old_password|new_password",
            value: `${params.old_password}|${params.new_password}`,
            message: "the old password and the new password are same",
            description: {
                vi: "Mật khẩu mới không thể trùng với mật khẩu cũ",
                en: "The new password can not be same with the old password",
            },
        });
    }

    const arePasswordsSame = account.password
        ? bcrypt.compareSync(params.old_password, account.password)
        : false;
    if (!arePasswordsSame && account.password) {
        return error.invalidData({
            location: "body",
            param: "old_password",
            value: params.old_password,
            message: "the old password is not correct",
            description: {
                vi: "Mật khẩu cũ không chính xác",
                en: "The old password is not correct",
            },
        });
    }

    const sr = Number(configs.saltRounds);
    const hashedPassword = await bcrypt.hash(
        params.new_password,
        await bcrypt.genSalt(sr)
    );
    account.password = hashedPassword;
    await Promise.all([
        updateUserActivity({
            id: account.id,
            action: "UPDATE_PASSWORD",
            actor: account.id,
        }),
        account.save(),
    ]);
    return success.ok({ message: "success" });
}

async function saveTokenSignature(params: {
    userId: string;
    token: string;
    expireAt: number;
}): Promise<void> {
    const now = Math.floor(new Date().getTime() / 1000);
    const key = `ca:token:user:${params.userId}`;
    if (redis.status !== "ready") {
        await redis.connect();
    }
    const signature: string = params.token.split(".")[2];
    await Promise.all([
        redis.zadd(key, params.expireAt + 1, signature),
        redis.expireat(key, params.expireAt + 1),
        redis.zremrangebyscore(key, "-inf", now),
    ]);
}

export async function checkAccount(params: { email: string }): Promise<Result> {
    const account = await Account.findOne(
        { email: { $regex: `^${params.email}$`, $options: "i" } },
        { created_time: 0, activities: 0 }
    );
    if (!account) {
        return accountNotFoundError();
    } else {
        const isActive = account?.tenant
            ? account.tenant?.is_active && account?.is_active
            : account?.is_active;
        if (!isActive) {
            return accountInactiveError();
        }
        if (account.password) {
            return success.ok({ type: "NORMAL" });
        } else {
            const tenant = await getTenantByCode(
                account?.tenant?.code as string
            );
            return success.ok({ url: tenant.body?.webconsent_url, type: "AD" });
        }
    }
}

const accountInactiveError = (): ResultError => {
    return {
        status: HttpStatus.UNAUTHORIZED,
        code: "ACCOUNT_IS_INACTIVE",
        errors: [
            {
                location: "body",
                param: "email",
            },
        ],
    };
};

const accountNotFoundError = (): ResultError => {
    return {
        status: HttpStatus.UNAUTHORIZED,
        code: "NOT_FOUND_EMAIL",
        errors: [
            {
                location: "body",
                param: "email|password",
            },
        ],
    };
};

const wrongPasswordError = (): ResultError => {
    return {
        status: HttpStatus.UNAUTHORIZED,
        code: "WRONG_EMAIL_OR_PASSWORD",
        errors: [
            {
                location: "body",
                param: "email|password",
            },
        ],
    };
};

const accountRolesEmpty = (): ResultError => {
    return {
        status: HttpStatus.UNAUTHORIZED,
        code: "ROLES_IS_EMPTY",
        errors: [
            {
                location: "body",
                param: "email|password",
            },
        ],
    };
};
