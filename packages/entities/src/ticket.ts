import { ITemplateDetail } from "./template";
import { IWorkflowDetail } from "./workflow";

export interface ITicket {
    id: string;
    number: string;
    name: string;
    description: string;
    tenant: string;
    status?: IDefaultField;
    priority?: IDefaultField;
    type?: IDefaultField;
    group?: IDefaultField;
    service?: IDefaultField;
    channel?: IDefaultField;
    sub_service: IDefaultField;
    category: IDefaultField;
    sub_category: IDefaultField;
    creator: IPeople;
    requester: IPeople;
    technician: IPeople;
    overdue_time: Date;
    created_time: Date;
    updated_time: Date;
    closed_time: Date;
    resolved_time: Date;
    ct_fields: ICustomFields;
    attachments: string[];
    watchers: string[];
    workflow: IWorkflowDetail;
    template: ITemplateDetail;
    activities: ITicketActivityItem[];
    resolution?: ITicketResolution;
}

export interface ITicketResolution {
    cause?: {
        content: string;
        updated_time: Date;
        updated_by: IPeople;
        attchments: string[];
    };
    solution?: {
        content: string;
        updated_time: Date;
        updated_by: IPeople;
        attchments: string[];
    };
}

export type ITicketDetail = Omit<ITicket, "ct_fields"> & {
    ct_fields: Record<string, ICustomFieldData>;
};

export interface IPeople {
    id: string;
    fullname: string;
    email: string;
    department: string;
    position: string;
    phone: string;
    tenant?: string;
}

export interface IDefaultField {
    id: string;
    name: string;
}

export interface ICustomField {
    k: string;
    v: ICustomField;
}

export type ICustomFields = ICustomField[];

export interface ICustomFieldData {
    value: string;
    display: string;
}

export enum ETicketAction {
    CREATE = "CREATE",
    UPDATE = "UPDATE",
    EDIT = "EDIT",
    CREATE_COMMENT = "CREATE_COMMENT",
}
export enum ECommentAction {
    CREATE_COMMENT = "CREATE_COMMENT",
    UPDATE_COMMENT = "UPDATE_COMMENT",
    REPLY_COMMENT = "REPLY_COMMENT",
}

export interface ITicketActivityItem {
    action: ETicketAction;
    time: Date;
    actor: IPeople;
    note?: string;
    comment?: IComment;
}

export interface ICommentActivityItem {
    action: ECommentAction;
    time: Date;
    old?: string;
    new?: string;
}

export interface IComment {
    id: string;
    is_reply?: boolean;
    reply_comment?: string;
    attachments?: string[];
    content: string;
    created_time: Date;
    updated_time?: Date;
    is_view_eu?: boolean;
    creator?: IPeople;
    activities: ICommentActivityItem[];
}
