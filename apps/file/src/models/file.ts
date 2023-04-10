import mongoose from "mongoose";
import { IFile } from "../interfaces/models/file";

const fileSchema = new mongoose.Schema(
    {
        object: {
            type: String,
            required: true,
        },
        bucket: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            require: false,
        },
        uploaded_by: {
            type: String,
            require: true,
        },
        tenant: {
            type: String,
            require: true,
        },
    },
    {
        versionKey: false,
    }
);

const File = mongoose.model<IFile>("File", fileSchema);
export default File;
