import { AST } from "../ast";

const value = {
    id: "a4477820-c94f-11ed-b76b-e9a5ddeb7644_binhlt",
    number: 3,
    name: "Nâng câp office 365",
    description: "Nâng cấp tài khoản office 365 từ gói E1 lên E2",
    tenant: "FIS.DTCM",
    creator: "1e642cc0-7546-11ed-a2dc-e7e7271cc147",
    requester: "1e642cc0-7546-11ed-a2dc-e7e7271cc147",
    status: {
        id: "2102d392-ad11-11ed-afa1-0242ac120002",
        name: "Open",
    },
    type: {
        id: "9ac44878-ad20-11ed-afa1-0242ac120002",
        name: "Hỗ trợ thông thường",
    },
    channel: {
        id: "3c24b230-ae97-11ed-afa1-0242ac120002",
        name: "Web portal",
    },
    group: {
        id: "6c262200-ac46-11ed-b7f6-4526bc2a7ae3",
        name: "Quản lý và phân phối tài chính113",
    },
    technician: {
        id: "0ba83b20-c7c6-11ed-9a39-d9c6964adcbc",
        name: "Nguyễn Văn An",
        email: "hungvm22@fpt.com.vn",
    },
    priority: {
        id: "9ad6099e-ae94-11ed-afa1-0242ac120002",
        name: "Khẩn cấp",
    },
    service: {
        id: "5c1d06b0-bc38-11ed-be7d-e785ec324cce",
        name: "Software",
    },
    sub_service: {
        id: "50edbec0-c24a-11ed-a3d3-a5ac5b3acf02",
        name: "test1test1",
    },
    category: {
        id: "9fb88af0-bc3a-11ed-96b5-1fca5aa9be48",
        name: "Category01",
    },
    sub_category: {
        id: "e07f8ea0-bc8d-11ed-a506-f11fa4a8a267",
        name: "Request Logistic Support and other issues",
    },
    ct_fields: {
        udf_req_0001: {
            title: "UDF 001",
            id: "",
            name: "Request Logistic Support and other issues",
        },
    },
};

const source = "resolution.solution.content != null";
const ast = new AST(source, "Root");

try {
    const status = ast.value(value);
    const reason = ast.getReason()

    console.log(ast.toString());
    console.log("Status: %o", status);
    console.log("Reason: %o", reason);
} catch (error) {
    console.log("error: %o", error);
}
