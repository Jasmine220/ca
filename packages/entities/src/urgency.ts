export interface IUrgency {
    id: string;
    name: string;
    description: string;
    type: "DEFAULT" | "CUSTOM";
    created_time: Date;
    is_active: boolean;
    tenant?: string;
}
