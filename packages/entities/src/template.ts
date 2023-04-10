import { IField } from "./field";

export interface ITemplate {
    id: string;
    name: string;
    description: string;
    type: "DEFAULT" | "CUSTOM";
    default_name?: string;
    default_description?: string;
    default_requester?: string;
    tenant?: string;
    workflow?: string;
    technician_layout: ILayoutItem[];
    enduser_layout: ILayoutItem[];
    created_by: string;
    updated_by?: string;
    created_time: Date;
    updated_time?: Date;
    is_active: boolean;
    has_enduser_layout: boolean;
}

export interface ILayoutItem {
    required: boolean;
    default?: string;
    field: string;
}

export type ILayoutItemDetail = Omit<ILayoutItem, "field"> & {
    field: IField;
};

export type ITemplateDetail = Omit<
    ITemplate,
    "technician_layout" | "enduser_layout"
> & {
    technician_layout: ILayoutItemDetail[];
    enduser_layout: ILayoutItemDetail[];
};
