export interface IStatus {
    id: string;
    name: string;
    description: string;
    type: "DEFAULT" | "CUSTOM";
    count_time: boolean;
    created_time: Date;
    is_active: boolean;
    tenant?: string;
}
