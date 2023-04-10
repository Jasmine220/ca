import mongoose from "mongoose";
import { IGroup } from "../interfaces/models";

const groupSchema = new mongoose.Schema(
    {
        id: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: false,
        },
        leader_id: {
            type: String,
            required: false,
        },
        tenant: {
            type: String,
            required: true,
        },
        created_time: {
            type: Date,
            required: true,
        },
        is_active: {
            type: Boolean,
            required: false,
            default: true,
        },
        members: [
            {
                type: String,
                requiredd: false,
            },
        ],
    },
    {
        versionKey: false,
    }
);

const Group = mongoose.model<IGroup>("Group", groupSchema);
export default Group;
