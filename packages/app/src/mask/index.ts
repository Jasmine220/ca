import { Any } from "utils";

export function mask(x: Any, fields = ["password"]): Any {
    for (const k in x) {
        if (x[k] && typeof x[k].toObject === "function") {
            x[k] = x[k].toObject();
        }
        if (typeof x[k] === "object" && !Array.isArray(x[k])) {
            mask(x[k], fields);
        } else if (fields.includes(k)) {
            x[k] = "***";
        }
    }
}
