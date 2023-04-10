import { error, HttpError, HttpStatus } from "app";
import axios from "axios";
import { configs } from "../configs";

export async function sendMailResetPassword(
    email: string,
    link: string
): Promise<void> {
    const url = `${configs.services.mail.getUrl()}`;
    const err = error.service(url);
    try {
        const { status } = await axios.post(`${url}/reset-password`, {
            email,
            link,
        });
        if (status !== HttpStatus.OK) {
            throw new HttpError(err);
        }
    } catch (e) {
        if (axios.isAxiosError(e) && e.response?.status) {
            if (e.response.status !== HttpStatus.OK) {
                throw new HttpError(err);
            }
        } else {
            throw new HttpError(err);
        }
    }
}
