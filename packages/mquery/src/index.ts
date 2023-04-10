import { QuerySyntaxError, SortSyntaxError, ToManyLayerError } from "./error";

// const message = `and(eq(createdBy,123),not(eq(name,"Production%20Report")),or(eq(description,"Production%20Report"),like(name,"abc")).in(x,"abc","efg"))`
// eslint-disable-next-line
export function parseQuery(query: string, layer = 1): any {
    if (layer >= 5) {
        throw new ToManyLayerError(query);
    }

    // eslint-disable-next-line
    const result: any = {};
    const prefixRegrex = /^(and|or|eq|neq|like|in)\(/;
    if (isExpression(query)) {
        const matchedArray = query.match(prefixRegrex);
        if (!matchedArray || !matchedArray[0]) {
            throw new QuerySyntaxError(query);
        }

        const operator = matchedArray[0].slice(0, -1);
        const strParameters = query.replace(prefixRegrex, "").slice(0, -1);
        const parameters = getParameters(strParameters);
        switch (operator) {
            case "and":
            case "or": {
                if (parameters.some((p) => !isExpression(p))) {
                    throw new QuerySyntaxError(query);
                }

                result[`$${operator}`] = [];
                for (const param of parameters) {
                    const parsed = parseQuery(param, layer + 1);
                    result[`$${operator}`].push(parsed);
                }
                break;
            }
            case "eq": {
                if (
                    parameters.length !== 2 ||
                    containDoubleQuotes(parameters[0]) ||
                    isExpression(parameters[0]) ||
                    isExpression(parameters[1])
                ) {
                    throw new QuerySyntaxError(query);
                }

                const value = getValue(parameters[1], query);
                result[parameters[0]] = value;
                break;
            }
            case "neq": {
                if (
                    parameters.length !== 2 ||
                    containDoubleQuotes(parameters[0]) ||
                    isExpression(parameters[0]) ||
                    isExpression(parameters[1])
                ) {
                    throw new QuerySyntaxError(query);
                }

                const value = getValue(parameters[1], query);
                result[parameters[0]] = { $ne: value };
                break;
            }
            case "like": {
                if (
                    parameters.length !== 2 ||
                    containDoubleQuotes(parameters[0]) ||
                    isExpression(parameters[0]) ||
                    isExpression(parameters[1])
                ) {
                    throw new QuerySyntaxError(query);
                }

                const value = getValue(parameters[1], query);
                if (typeof value !== "string") {
                    throw new QuerySyntaxError(query);
                } else {
                    result[parameters[0]] = { $regex: value, $options: "i" };
                }

                break;
            }
            case "in": {
                if (parameters.some((p) => isExpression(p))) {
                    throw new QuerySyntaxError(query);
                }

                if (
                    parameters.length < 2 ||
                    containDoubleQuotes(parameters[0])
                ) {
                    throw new QuerySyntaxError(query);
                }

                const arr = [];
                for (let i = 1; i < parameters.length; i++) {
                    arr.push(getValue(parameters[i], query));
                }

                result[parameters[0]] = { $in: arr };
                break;
            }
            default: {
                throw new QuerySyntaxError(query);
            }
        }
        return result;
    } else {
        throw new QuerySyntaxError(query);
    }
}

function getParameters(strParameters: string): string[] {
    const prefixRegrex = /^(and|or|eq|neq|like|in)\(/;
    let str = strParameters;
    const params = [];
    while (str.length > 0) {
        if (prefixRegrex.test(str)) {
            let count = 0;
            const start = 0;
            let end = 0;
            for (let i = 0; i < str.length; i++) {
                if (str[i] === "(") {
                    count = count + 1.0;
                } else if (str[i] === ")") {
                    count = count - 1.0;
                    if (count === 0) {
                        end = i + 1;
                        break;
                    }
                }
            }

            params.push(str.substring(start, end));
            str = str.substring(end + 1);
        } else {
            const start = 0;
            const end = str.indexOf(",");
            let param = "";
            if (end !== -1) {
                param = str.substring(start, end);
                str = str.substring(end + 1);
            } else {
                param = str;
                str = "";
            }
            params.push(param);
        }
    }

    return params;
}

function isExpression(string: string): boolean {
    const pattern = /^(and|or|eq|neq|like|in)\(.*\)$/;
    return pattern.test(string);
}

function containDoubleQuotes(string: string): boolean {
    const pattern = /^"(.*)"$/;
    return pattern.test(string);
}

// eslint-disable-next-line
function getValue(string: string, query: string): any {
    try {
        const decodedString = decodeURI(string);
        const obj = JSON.parse(`{"x":${decodedString}}`);
        return obj.x;
    } catch (error) {
        throw new QuerySyntaxError(query);
    }
}
export const parseSort = (sort: string): Record<string, 1 | -1> => {
    const pattern = /^.+=(1|-1)*$/;
    const result = Object.create(null);
    const qs = sort.split(";");
    for (const q of qs) {
        if (!pattern.test(q)) {
            throw new SortSyntaxError(sort);
        }

        const objs = q.split("=");
        if (objs.length === 2) {
            result[objs[0]] = Number(objs[1]);
        }
    }
    return result;
};

export * from "./error";
