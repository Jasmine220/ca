import { v1 } from "uuid";
import { getTenantByCode, getTenantByCodes, increaseUser } from "../services";
import { error, HttpError, HttpStatus, Result, success } from "app";
import { IUser, UserAction } from "../interfaces/models";
import mongoose, { FilterQuery, PipelineStage } from "mongoose";
import { createAccount, updateAccountActivation } from "./account.controller";
import { parseQuery, parseSort, ParseSyntaxError } from "mquery";
import { Account, User } from "../models";
import { ImportUserReqBody } from "../interfaces/request";

export async function createUser(params: {
    email: string;
    fullname?: string;
    password: string;
    phone?: string;
    tenant?: string;
    roles: string[];
    department?: string;
    position?: string;
    is_active: boolean;
    userRoles: string[];
    userId: string;
}): Promise<Result> {

    if (!params.userRoles.includes("SA")) {
        if (params.roles?.includes("SA")) {
            return error.actionNotAllowed();
        }
    } else if (params.tenant) {
        await checkTenantByCode(params.tenant);
    }

    await checkEmailExists(params.email);
    if (params.tenant) {
        await increaseUser([
            {
                tenant: params.tenant,
                amount: 1,
            },
        ]);
    }

    if (params.roles.length > 1 && params.roles.includes("SA")) {
        return error.actionNotAllowed();
    }
    const user = new User({
        id: v1(),
        fullname: params.fullname,
        email: params.email,
        phone: params.phone,
        tenant: params.tenant,
        position: params.position,
        department: params.department,
        created_time: new Date(),
        is_active: params.is_active,
        activities: [
            {
                action: UserAction.CREATE,
                actor: params.userId,
                time: new Date(),
            },
        ],
    });
    await Promise.all([
        createAccount([
            {
                id: user.id,
                email: params.email,
                password: params.password,
                is_active: params.is_active,
                roles: params.roles,
                tenant: params.tenant,
            },
        ]),
        user.save(),
    ]);
    const data = {
        ...user.toJSON(),
        _id: undefined,
        is_active: undefined,
        activities: undefined,
    };
    return success.created(data);
}

export async function updateUser(params: {
    id: string;
    fullname?: string;
    phone?: string;
    roles?: string[];
    department?: string;
    position?: string;
    is_active?: boolean;
    userId: string;
    userRoles: string[];
}): Promise<Result> {
    if (!params.userRoles.includes("SA")) {
        if (params.roles?.includes("SA")) {
            return error.actionNotAllowed();
        }
    }
    if ((params.roles as unknown as string[]).length > 1 && params.roles?.includes("SA")) {
        return error.actionNotAllowed();
    }
    const [user, account] = await Promise.all([
        User.findOneAndUpdate(
            { id: params.id },
            {
                $set: {
                    fullname: params.fullname,
                    phone: params.phone,
                    position: params.position,
                    department: params.department,
                    is_active: params.is_active,
                    updated_time: new Date(),
                },
                $push: {
                    activities: {
                        action: UserAction.UPDATE,
                        actor: params.userId,
                        time: new Date(),
                    },
                },
            },
            { new: true, projection: { _id: 0, activities: 0 } }
        ),
        Account.findOneAndUpdate(
            { id: params.id },
            {
                $set: {
                    roles: params.roles,
                    is_active: params.is_active,
                },
            }
        ),
    ]);
    if (user && account) {
        const data = {
            ...user.toJSON(),
            roles: account?.roles,
        };
        return success.ok(data);
    } else {
        return error.notFound({
            location: "body",
            param: "id",
            value: params.id,
            message: "the user does not exist",
        });
    }
}

export async function findUser(params: {
    query?: string;
    sort?: string;
    size: number;
    page: number;
    userTenant?: string;
    userRoles: string[];
}): Promise<Result> {
    const pipeline: PipelineStage[] = [];
    const facetData =
        params.size == -1
            ? []
            : [
                { $skip: params.size * params.page },
                { $limit: params.size * 1 },
            ];
    const facet = {
        meta: [{ $count: "total" }],
        data: facetData,
    };
    try {
        let newQuery = params.query;
        if (!params.userRoles.includes("SA")) {
            newQuery = newQuery
                ? `and(eq(tenant,"${params.userTenant}")` + `,${newQuery})`
                : `and(eq(tenant,"${params.userTenant}"))`;
        }

        if (newQuery) {
            let filter: undefined | FilterQuery<IUser> = undefined;
            filter = parseQuery(newQuery);
            filter ? pipeline.push({ $match: filter }) : null;
        }
        if (params.sort) {
            let sort: undefined | Record<string, 1 | -1> = undefined;
            sort = parseSort(params.sort);
            sort ? pipeline.push({ $sort: sort }) : null;
        }
    } catch (e) {
        const err = e as unknown as ParseSyntaxError;
        const errorValue =
            err.message === params.sort ? params.sort : params.query;
        throw new HttpError(
            error.invalidData({
                location: "query",
                param: err.type,
                message: err.message,
                value: errorValue,
            })
        );
    }
    pipeline.push({ $project: { _id: 0, activities: 0 } }, { $facet: facet });
    const result = await User.aggregate(pipeline)
        .collation({ locale: "vi" })
        .then((res) => res[0])
        .then((res) => {
            const total = !(res.meta.length > 0) ? 0 : res.meta[0].total;
            let totalPage = Math.ceil(total / params.size);
            totalPage = totalPage > 0 ? totalPage : 1;
            return {
                page: Number(params.page),
                total: total,
                total_page: totalPage,
                data: res.data,
            };
        });

    return success.ok(result);
}

export async function getUserById(params: {
    id: string;
    tenant?: string;
    userId: string;
    userRoles: string[];
}): Promise<Result> {
    const filter: FilterQuery<IUser> = { id: params.id };
    if (!params.userRoles.includes("SA")) {
        filter["tenant"] = params.tenant;
        if (!params.userRoles.includes("TA") && params.id !== params.userId) {
            return error.actionNotAllowed();
        }
    }
    const [user, account] = await Promise.all([
        User.findOne(filter, { _id: 0, password: 0 }),
        Account.findOne(
            { id: params.id },
            { id: 1, email: 1, roles: 1, created_time: 1, updated_time: 1 }
        ),
    ]);
    if (user && account) {
        const data = {
            ...user.toJSON(),
            roles: account?.roles,
        };
        return success.ok(data);
    } else {
        return error.notFound({
            location: "body",
            param: "userId",
            value: params.id,
            message: "the user does not exist",
        });
    }
}

export async function _getUserById(userId: string): Promise<Result> {
    const user = await User.findOne(
        { id: userId },
        { _id: 0, password: 0 }
    ).lean();
    if (!user) {
        return error.notFound({
            param: "userId",
            value: userId,
            message: `the user does not exist`,
        });
    }
    return success.ok(user);
}

export async function updateUserActivity(params: {
    id: string;
    action: string;
    actor: string;
}): Promise<void> {
    const user = await User.findOneAndUpdate(
        { id: params.id, is_active: true },
        {
            $push: {
                activities: {
                    action: params.action,
                    actor: params.actor,
                    time: new Date(),
                },
            },
        },
        { projection: { _id: 0 } }
    ).lean();
    if (!user) {
        const err = error.notFound({
            param: "userId",
            value: params.id,
            message: `the user does not exist`,
        });
        throw new HttpError(err);
    }
}

export async function getUserByIds(ids: string[]): Promise<Result> {
    const users = await User.find(
        { id: { $in: ids } },
        { _id: 0, password: 0 }
    ).lean();
    return success.ok(users);
}

export async function updateUserActivation(params: {
    ids: string[];
    status: boolean;
    tenant?: string;
    userRoles: string[];
}): Promise<Result | Error> {
    const uniqueIds: string[] = [...new Set(params.ids)];
    const filter: FilterQuery<IUser> = {
        id: { $in: uniqueIds },
    };
    if (!params.userRoles.includes("SA")) {
        filter["tenant"] = params.tenant;
    }

    const session = await mongoose.startSession();
    session.startTransaction();
    const updateResult = await User.updateMany(
        filter,
        { $set: { is_active: params.status } },
        { new: true, session }
    );

    const abortTransaction = async (): Promise<void> => {
        await session.abortTransaction();
        await session.endSession();
    };

    const matched = updateResult.matchedCount;
    if (matched === uniqueIds.length) {
        try {
            await updateAccountActivation({
                ids: [...uniqueIds],
                status: params.status,
            });
        } catch (err) {
            await abortTransaction();
            throw err;
        }

        await session.commitTransaction();
        await session.endSession();
        return success.ok({ updated: matched });
    } else {
        await abortTransaction();
        return error.invalidData({
            location: "body",
            param: "ids",
            value: params.ids,
            message: "some user ids do not exist",
        });
    }
}

export async function importUser(params: {
    data: ImportUserReqBody;
    userRoles: string[];
    userId: string;
}): Promise<Result> {
    await validateImportData(params);
    const createUser = params.data.map(async (u) => {
        return {
            id: v1(),
            fullname: u.fullname,
            email: u.email,
            phone: u.phone,
            tenant: u.tenant,
            position: u.position,
            department: u.department,
            created_time: new Date(),
            activities: [
                {
                    action: UserAction.CREATE,
                    actor: params.userId,
                    time: new Date(),
                },
            ],
        };
    });
    const numberUserIncrease: {
        tenant: string;
        amount: number;
    }[] = [];
    params.data.forEach((u) => {
        if (u.tenant) {
            const record = numberUserIncrease.find(
                (item) => item.tenant === u.tenant
            );
            if (record) {
                record.amount += 1;
            } else {
                numberUserIncrease.push({
                    tenant: u.tenant,
                    amount: 1,
                });
            }
        }
    });

    const users = await Promise.all([...createUser]);
    const accounts = params.data.map((u) => {
        const id = users.find((m) => m.email === u.email)?.id;
        return {
            id: id as string,
            email: u.email,
            password: u.password,
            is_active: true,
            roles: ["EU"],
            tenant: u.tenant,
        };
    });
    await Promise.all([
        createAccount(accounts),
        increaseUser(numberUserIncrease),
        User.insertMany(users),
    ]);
    return success.created({ inserted: params.data.length });
}

async function checkTenantByCode(tenant: string): Promise<void> {
    const response = await getTenantByCode(tenant);
    if (
        response.status === HttpStatus.NOT_FOUND ||
        response.body?.is_active === false
    ) {
        throw new HttpError(
            error.invalidData({
                param: "tenant",
                value: tenant,
                message: `the tenant ${tenant} does not exist`,
            })
        );
    }
}

async function checkEmailExists(email: string): Promise<void> {
    const existedUser = await User.findOne({
        email: { $regex: `^${email}$`, $options: "i" },
    });
    if (existedUser) {
        throw new HttpError({
            status: HttpStatus.BAD_REQUEST,
            code: "REGISTERED_EMAIL",
            errors: [
                {
                    param: "email",
                    location: "body",
                    value: email,
                },
            ],
        });
    }
}

// check duplicate email
async function validateImportData(params: {
    data: ImportUserReqBody;
    userRoles: string[];
}): Promise<void> {
    const indexesEmailMissing: number[] = [];
    const indexesPasswordMissing: number[] = [];
    const indexesTenantMissing: number[] = [];
    const indexesTenantNotExist: number[] = [];
    const emails = params.data.map((u) => u.email);
    const tenants = params.data
        .map((u) => u.tenant)
        .filter((t) => t !== undefined) as string[];
    const uniqueTenant = [...new Set(tenants)];
    params.data.forEach((u) => {
        if (!u.email || u.email === "") {
            indexesEmailMissing.push(u.index);
        }

        if (u.password === "") {
            indexesPasswordMissing.push(u.index);
        }

        if (params.userRoles.includes("SA")) {
            if (!u.tenant || u.tenant === "") {
                indexesTenantMissing.push(u.index);
            }
        }
    });
    const users = await User.find({ email: { $in: emails } });
    const indexesEmailExisting = <number[]>params.data
        .map((e) => {
            const importUser = users.find((iu) => iu.email === e.email);
            return importUser ? e.index : null;
        })
        .filter((u) => u !== null);
    if (uniqueTenant && uniqueTenant.length > 0) {
        const response = await getTenantByCodes(uniqueTenant);
        const existedTenant = response.body
            ?.map((u) => u.code)
            .filter((t) => t !== undefined && t !== null);
        params.data.forEach((u) => {
            if (!existedTenant?.includes(u.tenant as string)) {
                indexesTenantNotExist.push(u.index);
            }
        });
    }

    const errors: {
        indexes: number[];
        code: string;
        description: {
            vi: string;
            en: string;
        };
    }[] = [];
    if (indexesEmailMissing.length !== 0) {
        errors.push({
            indexes: indexesEmailMissing,
            code: "EMAIL_IS_NOT_VALID",
            description: {
                vi: "Địa chỉ email không hợp lệ",
                en: "Email address is not valid",
            },
        });
    }

    if (indexesEmailExisting.length !== 0) {
        errors.push({
            indexes: indexesEmailExisting,
            code: "REGISTERED_EMAIL",
            description: {
                vi: "Địa chỉ email đã được sử dụng",
                en: "The email is used for registration",
            },
        });
    }

    if (indexesPasswordMissing.length !== 0) {
        errors.push({
            indexes: indexesPasswordMissing,
            code: "PASSWORD_IS_NOT_VALID",
            description: {
                vi: "Mật khẩu không hợp lệ",
                en: "Password is not valid",
            },
        });
    }

    if (indexesTenantMissing.length !== 0) {
        errors.push({
            indexes: indexesTenantMissing,
            code: "TENANT_IS_NOT_VALID",
            description: {
                vi: "Thông tin tenant không hợp lệ",
                en: "Tenant is not valid",
            },
        });
    }

    if (indexesTenantNotExist.length !== 0) {
        errors.push({
            indexes: indexesTenantNotExist,
            code: "TENANT_NOT_FOUND",
            description: {
                vi: "Thông tin tenant không tồn tại",
                en: "Tenant does not exist",
            },
        });
    }

    if (errors.length > 0) {
        throw new HttpError({
            status: HttpStatus.BAD_REQUEST,
            code: "INVALID_DATA",
            details: errors,
            description: {
                vi: "Tệp dữ liệu không hợp lệ",
                en: "File data is not valid",
            },
        });
    }
}
