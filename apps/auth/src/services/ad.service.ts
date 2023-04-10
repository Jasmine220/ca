import { error } from "app";
import { configs } from "./../configs/index";
import axios from "axios";
import { VerifyCodeResBody } from "../interfaces/response";
import { HttpError } from "app";

export async function verifyAccessCode(params: {
    accessCode: string;
}): Promise<{ body?: VerifyCodeResBody; status?: number }> {
    const url = `${configs.services.ad.getUrl()}`;
    try {
        const res = await axios.post<VerifyCodeResBody>(`${url}verify`, params);
        return { body: res.data };
    } catch (e) {
        if (axios.isAxiosError(e) && e.response?.status) {
            return { status: e.response?.status };
        } else {
            throw new HttpError(error.service(url));
        }
    }
}
