// import { ITicket } from "entities";
// import { ValidateResponse, verifyRequestTransformation } from ".";

// const value: ITicket = {
//     activities: [],
//     attachments: [],
//     watchers: [],
//     created_time: new Date(),
//     id: "a4477820-c94f-11ed-b76b-e9a5ddeb7644_binhlt",
//     number: 3,
//     name: "Nâng câp office 365",
//     description: "Nâng cấp tài khoản office 365 từ gói E1 lên E2",
//     tenant: "FIS.DTCM",
//     creator: {
//         title: "Creator",
//         id: "1e642cc0-7546-11ed-a2dc-e7e7271cc147",
//         name: "Nguyễn Văn An",
//         email: "hungvm22@fpt.com.vn",
//     },
//     requester: {
//         title: "Requester",
//         // "id":null,
//         id: "1e642cc0-7546-11ed-a2dc-e7e7271cc147",
//         name: "Nguyễn Văn An",
//         email: "hungvm22@fpt.com.vn",
//     },
//     status: {
//         title: "Status",
//         id: "2102d392-ad11-11ed-afa1-0242ac120002",
//         name: "Open",
//     },
//     type: {
//         title: "Type",
//         id: "9ac44878-ad20-11ed-afa1-0242ac120002",
//         name: "Hỗ trợ thông thường",
//     },
//     channel: {
//         title: "Channel",
//         id: "3c24b230-ae97-11ed-afa1-0242ac120002",
//         name: "Web portal",
//     },
//     group: {
//         title: "Group",
//         id: "6c262200-ac46-11ed-b7f6-4526bc2a7ae3",
//         name: "Quản lý và phân phối tài chính113",
//     },
//     technician: {
//         title: "Technician",
//         id: "0ba83b20-c7c6-11ed-9a39-d9c6964adcbc",
//         name: "Nguyễn Văn An",
//         email: "hungvm22@fpt.com.vn",
//     },
//     priority: {
//         title: "Priority",
//         id: "9ad6099e-ae94-11ed-afa1-0242ac120002",
//         name: "Khẩn cấp",
//     },
//     service: {
//         title: "Service",
//         id: "5c1d06b0-bc38-11ed-be7d-e785ec324cce",
//         name: "Software",
//     },
//     sub_service: {
//         title: "Sub Service",
//         id: "50edbec0-c24a-11ed-a3d3-a5ac5b3acf02",
//         name: "test1test1",
//     },
//     category: {
//         title: "Category",
//         id: "9fb88af0-bc3a-11ed-96b5-1fca5aa9be48",
//         name: "Category01",
//     },
//     sub_category: {
//         title: "Sub Category",
//         id: "e07f8ea0-bc8d-11ed-a506-f11fa4a8a267",
//         name: "Request Logistic Support and other issues",
//     },
//     fields: {
//         udf_req_0001: {
//             title: "UDF 001",
//             id: "",
//             name: "Request Logistic Support and other issues",
//         },
//     },
//     workflow: {
//         id: "fc21002c-b331-11ed-afa1-0242ac120002",
//         name: "Workflow mặc định",
//         type: "DEFAULT",
//         description: "Workflow mặc định không cho chỉnh sửa xóa",
//         tenant: undefined,
//         updated_time: undefined,
//         updated_by: undefined,
//         created_time: new Date(),
//         is_active: true,
//         nodes: [],
//         edges: [
//             {
//                 source: "afd502fa-b330-11ed-afa1-0242ac120002",
//                 target: "afd505b6-b330-11ed-afa1-0242ac120002",
//             },
//             {
//                 source: "afd505b6-b330-11ed-afa1-0242ac120002",
//                 target: "afd5082c-b330-11ed-afa1-0242ac120002",
//                 during_rule: "solution  != null",
//                 before_rule: `description != null && name != null && status.id != null && requester.id != null && type.id != null
//                                     && priority.id != null && group.id != null && technician.id != null  && service.id != null  && sub_service.id != null`,
//             },
//             {
//                 source: "afd505b6-b330-11ed-afa1-0242ac120002",
//                 target: "afd50700-b330-11ed-afa1-0242ac120002",
//                 before_rule: "requester.id != null ",
//                 during_rule: "comment != null",
//             },
//             {
//                 source: "afd50700-b330-11ed-afa1-0242ac120002",
//                 target: "afd51448-b330-11ed-afa1-0242ac120002",
//             },
//             {
//                 source: "afd5082c-b330-11ed-afa1-0242ac120002",
//                 target: "afd50962-b330-11ed-afa1-0242ac120002",
//                 during_rule: "comment  != null",
//             },
//             {
//                 source: "afd5082c-b330-11ed-afa1-0242ac120002",
//                 target: "afd50a84-b330-11ed-afa1-0242ac120002",
//                 during_rule: "solution  != null",
//             },
//             {
//                 source: "afd50962-b330-11ed-afa1-0242ac120002",
//                 target: "afd5082c-b330-11ed-afa1-0242ac120002",
//             },
//             {
//                 source: "afd50a84-b330-11ed-afa1-0242ac120002",
//                 target: "afd50bce-b330-11ed-afa1-0242ac120002",
//                 during_rule: "comment != null",
//             },
//             {
//                 source: "afd50bce-b330-11ed-afa1-0242ac120002",
//                 target: "afd5082c-b330-11ed-afa1-0242ac120002",
//             },
//             {
//                 source: "afd50a84-b330-11ed-afa1-0242ac120002",
//                 target: "afd5107e-b330-11ed-afa1-0242ac120002",
//             },
//             {
//                 source: "afd5107e-b330-11ed-afa1-0242ac120002",
//                 target: "afd51448-b330-11ed-afa1-0242ac120002",
//             },
//         ],
//     },
// };
// let ret: ValidateResponse = verifyRequestTransformation(
//     value,
//     { solution1: 1 },
//     "afd505b6-b330-11ed-afa1-0242ac120002",
//     "afd5082c-b330-11ed-afa1-0242ac120002"
// );
// console.log(ret);
