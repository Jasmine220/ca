import { error, HttpError, Result, success } from "app";
import mongoose, { FilterQuery } from "mongoose";
import { configs } from "../configs";
import { AccountReqBody } from "../interfaces/request";
import Account from "../models/account";
import bcrypt from "bcrypt";
import { redis } from "../database";
import { IAccount } from "../interfaces/models";

export async function createAccount(
    accounts: {
        id: string;
        email: string;
        password?: string;
        is_active: boolean;
        tenant?: string;
        roles: string[];
    }[]
): Promise<void> {
    const session = await mongoose.startSession();
    session.startTransaction();
    type typeModel = Omit<AccountReqBody, "tenant"> & {
        created_time: Date;
        tenant?: {
            code: string;
            is_active: boolean;
        };
    };
    const uniqueAccounts: typeModel[] = [];
    const sr = Number(configs.saltRounds);
    for (let i = 0; i < accounts.length; i++) {
        const element = accounts[i];
        let hashedPassword = undefined;
        if (element.password) {
            hashedPassword = await bcrypt.hash(
                element.password,
                await bcrypt.genSalt(sr)
            );
        }
        element.password = hashedPassword;
        uniqueAccounts.push({
            ...element,
            tenant: element.tenant
                ? {
                      code: element.tenant,
                      is_active: true,
                  }
                : undefined,
            created_time: new Date(),
        });
    }
    const result = await Account.insertMany([...uniqueAccounts], { session });
    if (uniqueAccounts.length === result.length) {
        await session.commitTransaction();
        await session.endSession();
    } else {
        await session.abortTransaction();
        await session.endSession();
        const err = error.invalidData({
            location: "body",
            value: accounts,
            message: "some user ids already exists",
        });
        throw new HttpError(err);
    }
}

export async function updateAccountActivation(params: {
    ids: string[];
    status: boolean;
}): Promise<void> {
    const uniqueIds: string[] = [...new Set(params.ids)];
    const filter: FilterQuery<IAccount> = {
        id: { $in: uniqueIds },
    };

    const session = await mongoose.startSession();
    session.startTransaction();
    const updateResult = await Account.updateMany(
        filter,
        { $set: { is_active: params.status } },
        { new: true }
    );
    const keys = params.ids.map((id) => `ca:token:user:${id}`);
    const deletingKeys = keys.map((key) => redis.del(key));
    await Promise.all(deletingKeys);
    const matched = updateResult.matchedCount;
    if (matched === uniqueIds.length) {
        await session.commitTransaction();
        await session.endSession();
    } else {
        await session.abortTransaction();
        await session.endSession();
        const err = error.invalidData({
            location: "body",
            param: "ids",
            value: params.ids,
            message: "some account ids do not exist",
        });
        throw new HttpError(err);
    }
}

export async function updateTenantActivation(params: {
    tenants: string[];
    status: boolean;
}): Promise<Result | Error> {
    const uniqueCodes: string[] = [...new Set(params.tenants)];
    const filter: FilterQuery<IAccount> = {
        "tenant.code": { $in: uniqueCodes },
    };

    const [accounts, updateResult] = await Promise.all([
        Account.find(filter, { id: 1 }),
        Account.updateMany(
            filter,
            { $set: { "tenant.is_active": params.status } },
            { new: true }
        ),
    ]);
    const keys = accounts.map((a) => `ca:token:user:${a.id}`);
    const deletingKeys = keys.map((key) => redis.del(key));
    await Promise.all(deletingKeys);

    const matched = updateResult.matchedCount;
    return success.ok({ updated: matched });
}
