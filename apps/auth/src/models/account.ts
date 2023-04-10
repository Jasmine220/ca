import mongoose from "mongoose";
import { IAccount } from "../interfaces/models";

const accountSchema = new mongoose.Schema(
    {
        id: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: false,
        },
        is_active: {
            type: Boolean,
            required: false,
            default: true,
        },
        updated_time: {
            type: Date,
            required: false,
        },
        created_time: {
            type: Date,
            required: true,
        },
        tenant: {
            type: {
                code: {
                    type: String,
                    required: true,
                },
                is_active: {
                    type: Boolean,
                    required: true,
                },
            },
            required: false,
            _id: false,
        },
        last_locked: {
            type: Date,
            required: false,
        },
        token_time: {
            type: Date,
            required: false,
        },
        password_token: {
            type: String,
            required: false,
        },
        failed_login: {
            type: Number,
            required: false,
            default: 0,
        },
        roles: [
            {
                type: String,
                required: false,
            },
        ],
    },
    {
        versionKey: false,
    }
);

const Account = mongoose.model<IAccount>("Account", accountSchema);
export default Account;
