import axios from "axios";
import { IEdge, ITicket, IWorkflowDetail } from "entities";
import { sendMail } from '../services/mail.service'

export function actionSendMail(
    ticket: ITicket,
    sourceId: string,
    targetId: string,
    id: string,
    service_name: string,
    action_by: string
): void {
    const workflow: IWorkflowDetail = ticket.workflow;
    const egdes: IEdge[] = workflow.edges;
    if (ticket.technician) {
        const infoTech = {
            IDTicket: ticket.number,
            Subject: ticket.name,
            TicketLink: `https://fis-servicedesk.vnest.vn/request/ticket/${ticket.id}`,
        }
        sendMail({ email: ticket.technician.email as unknown as string[], code: "T003", service_name: "request", action_by, info: infoTech as object })
    }
    if (ticket.group) {
        const infoGroup = {
            IDTicket: ticket.number,
            Subject: ticket.name,
            GroupName: ticket.group.name,
            TicketLink: `https://fis-servicedesk.vnest.vn/request/ticket/${ticket.id}`,
            group: ticket.group.id
        }
        sendMail({ code: "T004", service_name: "request", action_by, info: infoGroup as object })
    }
    for (const edge of egdes) {
        if (edge.source === sourceId && edge.target === targetId) {
            if (edge?.actions) {
                edge.actions.forEach(async (e) => {
                    const email_template = e.email_template;
                    console.log(e.email_template);

                    if (e.type == "SendMail") {
                        const projectDetail: { [key: string]: unknown } = {
                            _id: 0,
                            id: "$id",
                        };
                        for (const p of e.params) {
                            if (p.type === "field") {
                                projectDetail[p.name] = p.value[0];
                            } else if (p.type === "concat") {
                                projectDetail[p.name] = { $concat: p.value };
                            }
                        }
                        const info = {
                            IDTicket: ticket.number,
                            RequesterName: ticket.requester?.fullname,
                            Subject: ticket.name,
                            TicketLink: `https://fis-servicedesk.vnest.vn/request/ticket/${ticket.id}`,
                            GroupName: ticket.group?.name,
                            Assignee: ticket.technician.fullname,
                        }
                        await sendMail({ email: ticket.requester?.email as unknown as string[], code: email_template, service_name, action_by, info: info as object })
                        if (ticket.group) {
                            const infoGroup = {
                                IDTicket: ticket.number,
                                Subject: ticket.name,
                                GroupName: ticket.group.name,
                                TicketLink: `https://fis-servicedesk.vnest.vn/request/ticket/${ticket.id}`,
                                group: ticket.group.id,
                            }
                            await sendMail({ code: "T006", service_name: "request", action_by, info: infoGroup as object })
                        }
                    }
                });
            }
        }
    }
}
