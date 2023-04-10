import { error, HttpError } from "app";
import axios from "axios";
import { configs } from "../configs";
import { GetTenantResBody, TenantResBody } from "../interfaces/response";

export async function getTenantByCode(
    tenantCode: string
): Promise<{ body?: GetTenantResBody; status?: number }> {
    const url = `${configs.services.tenant.getUrl()}`;
    try {
        const res = await axios.get<GetTenantResBody>(
            `${url}/${tenantCode}?type=code`
        );
        return { body: res.data };
    } catch (e) {
        if (axios.isAxiosError(e) && e.response?.status) {
            return { status: e.response?.status };
        } else {
            throw new HttpError(error.service(url));
        }
    }
}

export async function getTenantByCodes(
    tenantCodes: string[]
): Promise<{ body?: TenantResBody[]; status?: number }> {
    const url = `${configs.services.tenant.getUrl()}/get-by-codes`;
    try {
        const res: {
            data: TenantResBody[];
        } = await axios.post(url, { codes: tenantCodes });
        return { body: res.data };
    } catch (e) {
        if (axios.isAxiosError(e) && e.response?.status) {
            return { status: e.response?.status };
        } else {
            throw new HttpError(error.service(url));
        }
    }
}

export async function increaseUser(
    data: {
        tenant: string;
        amount: number;
    }[]
): Promise<{ body?: unknown }> {
    const url = `${configs.services.tenant.getUrl()}/`;
    try {
        const body = await axios.put(`${url}/increase-user`, { data });
        return { body: body };
    } catch (e) {
        throw new HttpError(error.service(url));
    }
}
