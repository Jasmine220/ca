import { IStatus } from "./status";

export interface IWorkflow {
    id: string;
    name: string;
    description?: string;
    type: "DEFAULT" | "CUSTOM";
    created_time: Date;
    updated_time?: Date;
    updated_by?: string;
    is_active: boolean;
    tenant?: string;
    edges: IEdge[];
    nodes: INode[];
}

// type Item = {
//     type: string,
//     email_code: string,
//     params: [{ type: string, value: string[], name: string }],
// }

export interface IEdge {
    source: string;
    target: string;
    before_rule?: string;
    during_rule?: string;
    transition?: ITransition;
    actions?: [{
        type: string,
        email_template: string,
        params: {
            type: string,
            value: string[],
            name: string
        }[]
    }]
}

export interface INode {
    id: string;
    type: "START" | "END" | "OTHER";
    status?: string;
}

export interface ITransition {
    name?: string;
    rules: IRule[];
    triggers: ITrigger[];
}

export interface ITrigger {
    rules: IRule[];
    actions: IAction[];
}

export interface IRule {
    type: "AND" | "OR";
    condition: {
        type: "NOT_EMPTY" | "EMPTY" | "EQUAL" | "NOT_EQUAL";
        field: {
            title: string;
            name: string;
        };
        value?: {
            data: string;
            type: "NUMBER" | "STRING" | "BOOLEAN";
        };
    };
}

export interface IAction {
    type: "NOTIFICATION" | "UPDATE_FIELD";
    field?: string;
    value?: string;
}

export type INodeDetail = Omit<INode, "status"> & {
    status?: IStatus;
};

export type IWorkflowDetail = Omit<IWorkflow, "nodes"> & {
    nodes: INodeDetail[];
};
