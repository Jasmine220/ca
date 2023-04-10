import { error, HttpError, HttpStatus, Result, success } from "app";
import { FilterQuery, PipelineStage, Types } from "mongoose";
import { v1 } from "uuid";
import { IGroup, IUser } from "../interfaces/models";
import { getTenantByCode } from "../services";
import { parseQuery, parseSort, ParseSyntaxError } from "mquery";
import { Group, User } from "../models";

export async function createGroup(params: {
    name: string;
    description?: string;
    leaderId?: string;
    tenant: string;
    members: string[];
    userRoles: string[];
}): Promise<Result> {
    await Promise.all([
        checkTenantExist(params.tenant),
        checkGroupExists({
            name: params.name,
            tenant: params.tenant,
        }),
    ]);

    if (params.leaderId && params.members.includes(params.leaderId)) {
        return error.invalidData({
            value: params.leaderId,
            param: "leader_id",
            location: "body",
            message: `the leader ${params.leaderId} can't not be a member`,
        });
    }

    const group = new Group({
        id: v1(),
        name: params.name,
        members: params.members,
        description: params.description,
        tenant: params.tenant,
        leader_id: params.leaderId,
        created_time: new Date(),
    });

    const userIds = [...params.members];
    if (params.leaderId) {
        userIds.push(params.leaderId);
    }

    const uniqueIds: string[] = [...new Set(userIds)];
    const users = await User.find({ id: { $in: uniqueIds } });
    const leader = users.find((u) => u.id === params.leaderId);
    const result: Omit<IGroup, "members"> & {
        members: IUser[];
        leader?: IUser;
        _id?: Types.ObjectId;
    } = { ...group.toJSON(), members: [], leader };
    if (params.leaderId && !leader) {
        return error.invalidData({
            location: "body",
            param: "leader_id",
            value: params.leaderId,
            message: `the user ${params.leaderId} does not exist`,
        });
    }

    if (leader && leader.tenant !== params.tenant) {
        return error.invalidData({
            location: "body",
            param: "leader_id",
            value: params.leaderId,
            message: `the user ${params.leaderId} does not belong to the tenant ${params.tenant}`,
        });
    }

    for (const element of params.members) {
        const user = users.find((u) => u.id === element);
        if (!user) {
            return error.invalidData({
                location: "body",
                param: "members",
                value: element,
                message: `the user ${element} does not exist`,
            });
        } else {
            if (user.tenant !== params.tenant) {
                return error.invalidData({
                    location: "body",
                    param: "members",
                    value: element,
                    message: `the user ${element} does not belong to the tenant ${params.tenant}`,
                });
            }
            result.members.push(user);
        }
    }
    await group.save();
    delete result._id;
    delete result.leader_id;
    return success.created(result);
}

export async function updateGroup(params: {
    name?: string;
    tenant?: string;
    groupId: string;
    description?: string;
    leaderId?: string;
    members: string[];
    userId: string;
    userRoles: string[];
}): Promise<Result> {
    params.members = [...new Set(params.members)];
    const match: FilterQuery<IGroup> = {
        id: params.groupId,
        is_active: true,
    };
    params.tenant ? (match["tenant"] = params.tenant) : null;
    if (params.name) {
        await checkGroupExists({
            name: params.name,
            groupId: params.groupId,
        });
    }

    let group = await Group.findOne(match);
    if (!group) {
        return error.notFound({
            value: params.groupId,
            param: "groupId",
            location: "param",
            message: `the group ${params.groupId} does not exist`,
        });
    }

    if (
        !params.userRoles.includes("SA") &&
        !params.userRoles.includes("TA") &&
        group.leader_id !== params.userId
    ) {
        return error.actionNotAllowed();
    }

    params.tenant = group.tenant;
    if (!params.leaderId) {
        params.leaderId = group.leader_id;
    }

    if (params.leaderId && params.members.includes(params.leaderId)) {
        return error.invalidData({
            value: params.leaderId,
            param: "leader_id",
            location: "body",
            message: `the leader ${params.leaderId} can't not be a member`,
        });
    }

    const userIds = [...params.members];
    params.leaderId ? userIds.push(params.leaderId) : null;

    const uniqueIds: string[] = [...new Set(userIds)];
    const users = await User.find({ id: { $in: uniqueIds } });
    const leader = users.find((u) => u.id === params.leaderId);
    const members: IUser[] = [];

    if (!leader && params.leaderId) {
        return error.invalidData({
            location: "body",
            param: "leader_id",
            value: params.leaderId,
            message: `the user ${params.leaderId} does not exist`,
        });
    }

    if (leader && leader.tenant !== params.tenant) {
        return error.invalidData({
            location: "body",
            param: "leader_id",
            value: params.leaderId,
            message: `the user ${params.leaderId} does not belong to the tenant ${params.tenant}`,
        });
    }

    for (const element of params.members) {
        const user = users.find((u) => u.id === element);
        if (!user) {
            return error.invalidData({
                location: "body",
                param: "members",
                value: element,
                message: `the user ${element} does not exist`,
            });
        } else {
            if (user.tenant !== params.tenant) {
                return error.invalidData({
                    location: "body",
                    param: "members",
                    value: element,
                    message: `the user ${element} does not belong to the tenant ${params.tenant}`,
                });
            }
            members.push(user);
        }
    }

    group = await Group.findOneAndUpdate(
        match,
        {
            name: params.name,
            description: params.description,
            members: params.members,
            leader_id: params.leaderId,
        },
        { new: true, projection: { _id: 0 } }
    );
    const newGroup = group?.toJSON() as NonNullable<IGroup>;
    const result: Omit<IGroup, "members"> & {
        members: IUser[];
        leader?: IUser;
    } = { ...newGroup, members, leader };
    delete result.leader_id;
    return success.ok(result);
}

export async function deleteGroup(params: {
    tenant?: string;
    groupId: string;
    userId: string;
    userRoles: string[];
}): Promise<Result> {
    const match: FilterQuery<IGroup> = {
        id: params.groupId,
        is_active: true,
    };
    if (params.tenant) {
        match["tenant"] = params.tenant;
    }

    let group = await Group.findOne(match);
    if (!group) {
        return error.notFound({
            value: params.groupId,
            param: "groupId",
            location: "param",
            message: `the group ${params.groupId} does not exist`,
        });
    }

    if (
        !params.userRoles.includes("SA") &&
        !params.userRoles.includes("TA") &&
        group.leader_id !== params.userId
    ) {
        return error.actionNotAllowed();
    }

    group = await Group.findOneAndUpdate(
        match,
        { is_active: false },
        { new: true, projection: { _id: 0 } }
    );
    return success.ok(group);
}

export async function findGroup(params: {
    query?: string;
    sort?: string;
    size: number;
    page: number;
    userRoles: string[];
    userTenant?: string;
    userId: string;
}): Promise<Result> {
    const pipeline: PipelineStage[] = [];
    let match: undefined | FilterQuery<IGroup> = undefined;
    let sort: undefined | Record<string, 1 | -1> = undefined;

    try {
        let newQuery = params.query
            ? `and(eq(is_active,true),${params.query})`
            : "eq(is_active,true)";
        if (!params.userRoles.includes("SA")) {
            newQuery =
                `and(eq(tenant,"${params.userTenant}")` + `,${newQuery})`;
        }

        match = parseQuery(newQuery);
        params.sort ? (sort = parseSort(params.sort)) : null;
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
    if (!params.userRoles.includes("SA") && !params.userRoles.includes("TA")) {
        const tmpCondition = {
            $or: [{ members: params.userId }, { leader_id: params.userId }],
        };
        if (match?.$and && match.$and.length > 0) {
            match.$and.push(tmpCondition);
        } else if (match) {
            match = { $and: [match, tmpCondition] };
        }
    }
    match ? pipeline.push({ $match: match }) : null;
    sort ? pipeline.push({ $sort: sort }) : null;

    const project = {
        _id: 0,
        id: 1,
        name: 1,
        created_time: 1,
        tenant: 1,
        leader_id: 1,
        members: 1,
        number_of_user: {
            $cond: {
                if: { $ifNull: ["$leader_id", false] },
                then: { $add: [{ $size: "$members" }, 1] },
                else: { $size: "$members" },
            },
        },
    };
    const facet = {
        meta: [{ $count: "total" }],
        data: [
            { $skip: params.size * params.page },
            { $limit: params.size * 1 },
        ],
    };
    pipeline.push({ $project: project }, { $facet: facet });
    const result = await Group.aggregate(pipeline)
        .collation({ locale: "vi" })
        .then((res) => res[0])
        .then((res) => {
            const total = !(res.meta.length > 0) ? 0 : res.meta[0].total;
            return {
                page: Number(params.page),
                total: total,
                total_page: Math.ceil(total / params.size),
                data: res.data,
            };
        });
    return success.ok(result);
}

export async function getAllGroup(params: {
    tenant?: string;
}): Promise<Result> {
    const filter: FilterQuery<IGroup> = {
        is_active: true,
    };
    params.tenant ? (filter.tenant = params.tenant) : null;
    const result = await Group.find(filter, { _id: 0 });
    return success.ok(result);
}

export async function membersOfGroup(params: {
    groupId: string;
    tenant?: string;
}): Promise<Result> {
    const match: FilterQuery<IGroup> = {
        id: params.groupId,
        is_active: true,
    };
    params.tenant ? (match.tenant = params.tenant) : null;
    const lookup = (
        field: string,
        as?: string
    ): PipelineStage.Lookup["$lookup"] => {
        const newField = as ? as : field;
        return {
            from: "users",
            let: { id: `$${field}` },
            as: newField,
            pipeline: [
                { $match: { $expr: { $eq: ["$$id", "$id"] } } },
                { $project: { _id: 0, activities: 0 } },
            ],
        };
    };

    const project = {
        _id: 1,
        members: { $first: "$members" },
        leader: { $first: "$leader" },
    };

    const group = {
        _id: "$_id",
        members: { $push: "$members" },
        leader: { $first: "$leader" },
    };

    const result = await Group.aggregate([
        { $match: match },
        {
            $unwind: {
                path: "$members",
                preserveNullAndEmptyArrays: true,
            },
        },
        { $lookup: lookup("members") },
        { $lookup: lookup("leader_id", "leader") },
        { $project: project },
        { $group: group },
        { $project: { _id: 0 } },
    ]);
    if (result.length > 0) {
        const members = [...result[0].members];
        if (result[0].leader) {
            members.push(result[0].leader);
        }
        return success.ok(members);
    } else {
        return error.notFound({
            param: "groupId",
            value: params.groupId,
            location: "param",
            message: `the group ${params.groupId} does not exist`,
        });
    }
}

export async function getGroupById(params: {
    groupId: string;
    tenant?: string;
    userId: string;
    userRoles: string[];
}): Promise<Result> {
    const match: FilterQuery<IGroup> = {
        id: params.groupId,
        is_active: true,
    };
    params.tenant ? (match["tenant"] = params.tenant) : null;
    if (!params.userRoles.includes("TA") && !params.userRoles.includes("SA")) {
        match["$or"] = [
            { members: params.userId },
            { leader_id: params.userId },
        ];
    }

    const lookup = (
        field: string,
        as?: string
    ): PipelineStage.Lookup["$lookup"] => {
        const newField = as ? as : field;
        return {
            from: "users",
            let: { id: `$${field}` },
            as: newField,
            pipeline: [
                { $match: { $expr: { $eq: ["$$id", "$id"] } } },
                { $project: { _id: 0, activities: 0, tenant: 0 } },
            ],
        };
    };

    const project = {
        _id: 1,
        id: 1,
        name: 1,
        tenant: 1,
        description: 1,
        created_time: 1,
        is_active: 1,
        members: { $first: "$members" },
        leader: { $first: "$leader" },
    };

    const group = {
        _id: "$_id",
        id: { $first: "$id" },
        name: { $first: "$name" },
        description: { $first: "$description" },
        tenant: { $first: "$tenant" },
        created_time: { $first: "$created_time" },
        is_active: { $first: "$is_active" },
        members: { $push: "$members" },
        leader: { $first: "$leader" },
    };

    const groups = await Group.aggregate([
        { $match: match },
        {
            $unwind: {
                path: "$members",
                preserveNullAndEmptyArrays: true,
            },
        },
        { $lookup: lookup("members") },
        { $lookup: lookup("leader_id", "leader") },
        { $project: project },
        { $group: group },
        { $project: { _id: 0 } },
    ]);
    if (groups.length > 0) {
        return success.ok(groups[0]);
    } else {
        return error.notFound({
            param: "groupId",
            value: params.groupId,
            location: "param",
            message: `the group ${params.groupId} does not exist`,
        });
    }
}

async function checkGroupExists(params: {
    name: string;
    groupId?: string;
    tenant?: string;
}): Promise<void> {
    const match: FilterQuery<IGroup> = {
        name: {
            $regex: `^${params.name}$`,
            $options: "i",
        },
        is_active: true,
    };
    params.tenant ? (match.tenant = params.tenant) : null;
    const group = await Group.findOne(match);
    if (group) {
        if (params.groupId === group.id) {
            return;
        }
        throw new HttpError({
            status: HttpStatus.BAD_REQUEST,
            code: "INVALID_DATA",
            description: {
                en: "Group name already exists",
                vi: "Tên nhóm đã tồn tại",
            },
            errors: [
                {
                    param: "name",
                    location: "body",
                    value: params.name,
                },
            ],
        });
    }
}

async function checkTenantExist(tenant: string): Promise<void> {
    const response = await getTenantByCode(tenant);
    if (response.status === HttpStatus.NOT_FOUND || !response.body) {
        throw new HttpError(
            error.invalidData({
                value: tenant,
                param: "tenant",
                location: "query",
                message: `tenant with id: ${tenant} does not exists`,
            })
        );
    }

    if (response.body.is_active === false) {
        throw new HttpError(
            error.invalidData({
                value: tenant,
                param: "tenant",
                location: "query",
                message: `tenant with id: ${tenant} is inactive`,
            })
        );
    }
}
