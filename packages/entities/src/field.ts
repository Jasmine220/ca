export interface IField {
    id: string;
    name: string;
    description: string;
    tenant?: string;
    title: string;
    type: "DEFAULT" | "CUSTOM";
    input_type: "COMBO_BOX";
    value_type: string;
    placeholder: string;
    is_active: boolean;
    datasource?: {
        href: string;
        dependencies: string[];
    };
}
