import { parse, find } from "abstract-syntax-tree";
import logger from "logger";
import { Any } from "utils";

export class AST {
    #source: string;
    #exp: string;
    #listParams: string[];
    #name: string;
    #values: Any;
    #reason?: string;
    #pathError?: string;
    constructor(source: string, name: string) {
        this.#name = name;
        this.#listParams = [];
        this.#source = source;
        this.#values = {};
        const tree = parse(this.#source);
        const vars = find(tree, "Identifier");
        for (const v of vars) {
            if (!this.#listParams.includes(v.name)) {
                this.#listParams.push(v.name);
            }
        }
        this.#exp = tree.body[0];
    }
    getPathError(): string | undefined {
        return this.#pathError;
    }
    getReason(): string | undefined {
        return this.#reason;
    }
    getName(): string {
        return this.#name;
    }
    getVars(): string[] {
        return this.#listParams;
    }
    toString(): string {
        return JSON.stringify(this.#exp);
    }
    setValues(values: Any): void {
        this.#values = values;
    }
    value(values: Any): boolean {
        if (values) {
            this.setValues(values);
        }
        return this.make(this.#exp);
    }
    make(node: Any): boolean {
        switch (node.type) {
            case "BinaryExpression": {
                const ret = this.makeBinary(node);
                if (!ret) {
                    this.#reason = this.toReason(node);
                }
                return ret;
            }
            case "LogicalExpression": {
                return this.makeLogical(node);
            }
            case "ExpressionStatement": {
                return this.make(node.expression);
            }
            default: {
                throw new Error(`make Not supported! ${node.type}`)
            }
        }
    }
    makeLogical(node: Any): boolean {
        const operator = node.operator;
        switch (operator) {
            case "||": {
                return this.make(node.left) || this.make(node.right);
            }
            case "&&": {
                return this.make(node.left) && this.make(node.right);
            }
            default: {
                throw new Error(`makeLogical Not supported! ${operator}`);
            }
        }
    }
    getRealValue(node: Any): Any {
        const type = node.type;
        switch (type) {
            case "Identifier": {
                if (this.#values[node.name]) {
                    return this.#values[node.name];
                } else {
                    return undefined;
                }
            }
            case "Literal": {
                return node.value === "" ? '""' : node.value;
            }
            case "MemberExpression": {
                return this.getRealValueMember(node, this.#values);
            }
            default: {
                throw { msg: `getRealValue Not supported! ${type}` };
            }
        }
    }
    getRealValueMember(node: Any, values: Any): Any {
        let propName;
        const type = node.property?.type;
        if (type === "Identifier") {
            propName = node.property.name;
        } else {
            throw new Error(`getRealValueMember Not supported! ${type}`);
        }
        let temp = undefined;

        const objectType = node.object?.type;
        if (objectType === "Identifier") {
            if (node.object && node.object.name) {
                temp = node.object.name in values
                    ? values[node.object?.name]
                    : undefined
            }
        } else if (objectType === "MemberExpression") {
            const childNode = node.object;
            temp = this.getRealValueMember(childNode, values);
        } else {
            throw new Error(`getRealValueMember Not supported! objectType =  ${objectType}`)
        }
        if (temp && propName in temp) {
            return temp[propName]
        } else {
            return temp
        }
    }
    makeBinary(node: Any): boolean {
        const rightVarValue = this.getRealValue(node.right);
        const leftVarValue = this.getRealValue(node.left);
        switch (node.operator) {
            case ">": {
                return leftVarValue > rightVarValue;
            }
            case "<": {
                return leftVarValue < rightVarValue;
            }
            case ">=": {
                return leftVarValue >= rightVarValue;
            }
            case "<=": {
                return leftVarValue <= rightVarValue;
            }
            case "!==": {
                return leftVarValue !== rightVarValue;
            }
            case "!=": {
                return leftVarValue != rightVarValue;
            }
            case "==": {
                return leftVarValue == rightVarValue;
            }
            case "===": {
                return leftVarValue === rightVarValue;
            }
            default: {
                throw { msg: `makeBinary Not supported! ${node.operator}` };
            }
        }
    }
    toReason(node: Any): string {
        const leftString: string = this.toReasonExpression(node.left);
        const rightString: string = this.toReasonExpression(node.right);
        const field = getConditionalField(leftString);
        this.#pathError = leftString;

        switch (node.operator) {
            case ">": {
                return `${field?.name ?? leftString} < ${rightString}`;
            }
            case "<": {
                return `${field?.name ?? leftString} > ${rightString}`;
            }
            case ">=": {
                return `${field?.name ?? leftString} < ${rightString}`;
            }
            case "<=": {
                return `${field?.name ?? leftString} > ${rightString}`;
            }
            case "!==":
            case "!=": {
                let reason = `Trường ${field?.name ?? leftString}`;
                if (rightString == null || rightString == undefined) {
                    reason = `${reason} không được bỏ trống.`
                } else {
                    reason = `${reason} không được bằng ${rightString}.`
                }
                return reason;
            }
            case "==":
            case "===": {
                return `${field?.name ?? leftString} <> ${rightString}`;
            }
            default: {
                throw { msg: `toReason Not supported! ${node.operator}` };
            }
        }
    }
    toReasonExpression(node: Any): string {
        if (node.type === "MemberExpression") {
            const path = this.getValuePath(node);
            if (path) {
                return path
            } else {
                throw new Error("AST syntax error")
            }
        } else if (node.type === "Literal") {
            return node.value;
        } else {
            throw { msg: `toReasonExpression Not supported! ${node.type}` };
        }
    }
    getValuePath(node: Any): string | undefined {
        if (!node) return undefined;
        switch (node.type) {
            case "MemberExpression": {
                const objectPath = this.getValuePath(node.object);
                const propertyName = this.getValuePath(node.property);
                if (!objectPath || !propertyName) {
                    throw new Error("AST syntax error")
                }
                return `${objectPath}.${propertyName}`
            }
            case "Identifier": {
                return node.name ? node.name : undefined;
            }
            default: {
                return undefined;
            }
        }
    }
}


const conditionalFields = [
    {
        path: "resolution.solution.content",
        name: "giải pháp"
    }
]

function getConditionalField(path: string): (typeof conditionalFields)[0] | undefined {
    return conditionalFields.find(f => f.path === path)
}