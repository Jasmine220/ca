import { error, HttpError, HttpStatus, Result, success } from "app";
import File from "../models/file";
import * as crypto from "crypto";
import * as Minio from "minio";
import { configs } from "../configs";
import { v1 } from "uuid";

function generateObjectName(): string {
    const randomString = crypto.randomBytes(8).toString("hex");
    return `${v1()}-${randomString}`;
}

const minioClient = new Minio.Client({
    endPoint: configs.minio.ip as string,
    port: Number(configs.minio.port),
    accessKey: configs.minio.access as string,
    secretKey: configs.minio.secret as string,
    useSSL: false,
});

const mimeMap = {
    "text/plain": ".txt",
    "image/jpeg": ".jpeg",
    "image/png": ".png",
    "application/java-archive": ".jar",
    "application/pdf": ".pdf",
    "application/vnd.ms-excel": ".xls",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
        ".xlsx",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        ".docx",
    "application/msword": ".doc",
};

export async function createLinkUpload(
    filename: string,
    type: string,
    tenant: string,
    userId: string
): Promise<Result> {
    checkFileName(filename, type);
    const objectName = generateObjectName();
    const existingObject = await File.findOne({ object: objectName });
    if (existingObject) {
        return {
            status: HttpStatus.NOT_FOUND,
            code: "NOT_FOUND_OBJECT_FILE",
            errors: [
                {
                    location: "body",
                    param: "objectName",
                },
            ],
        };
    }

    const uploadExpiredTime = Number(configs.minio.uploadExpiredTime);
    const link = await minioClient.presignedPutObject(
        configs.minio.bucket,
        objectName,
        uploadExpiredTime
    );
    const file = new File({
        id: v1(),
        type,
        bucket: configs.minio.bucket,
        object: objectName,
        name: filename,
        uploaded_by: userId,
        tenant,
    });
    await file.save();
    return success.ok({
        object: file.object,
        link: link,
    });
}

export async function getLinkDownload(objectNames: string[]): Promise<Result> {
    const downloadExpiredTime = Number(configs.minio.downloadExpiredTime);
    const files = await File.find({ object: { $in: objectNames } });
    if (files.length != objectNames.length) {
        return {
            status: HttpStatus.NOT_FOUND,
            code: "NOT_FOUND_OBJECT_FILE",
            errors: [
                {
                    location: "body",
                    param: "objectName",
                },
            ],
        };
    }
    const headerKey = "response-content-disposition"
    const headerValue = (filename: string) =>
        `attachment; filename="${filename}"`;
    const result = files.map((file) =>
        minioClient
            .presignedGetObject(
                configs.minio.bucket,
                file.object,
                downloadExpiredTime,
                { [headerKey]: headerValue(file.name) }
            )
            .then((res) => ({
                ...file.toJSON(),
                _id: undefined,
                link: res,
            }))
    );
    return success.ok(await Promise.all(result));
}

function checkFileName(filename: string, type: string): void {
    const actualExt: string | undefined = mimeMap[<keyof typeof mimeMap>type];
    const dotIndex = filename.lastIndexOf(".");
    const ext = filename.substring(dotIndex);

    const hasExt = Object.keys(mimeMap).find((k) => {
        const key = <keyof typeof mimeMap>k;
        return mimeMap[key] === ext;
    });

    if (!actualExt || !hasExt) {
        throw new HttpError(
            error.invalidData({
                location: "query|param",
                param: "type|filename",
                value: `${filename}|${type}`,
                description: {
                    vi: "Hệ thống chỉ hỗ trợ các định dạng file doc, " +
                        "docx, xlsx, xls, csv, mp3, mp4, pnj, jpeg, pdf, " +
                        "ppt, pptx, zip, rar. Vui lòng kiểm tra lại định " +
                        "dạng file đính kèm của ban.",
                    en: "The system only supports doc, docx, xlsx, xls, csv, " +
                        "mp3, mp4, pnj, jpeg, pdf, ppt, pptx, zip, rar file " +
                        "formats. Please double check your attachment format.",
                },
            })
        );
    }
    if (actualExt !== ext) {
        throw new HttpError(
            error.invalidData({
                location: "query|param",
                param: "type|filename",
                value: `${filename}|${type}`,
                message: "file name or file type is not valid",
            })
        );
    }
}
