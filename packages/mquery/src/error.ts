export class ParseSyntaxError extends Error {
    constructor(public type: string, public value: string) {
        super();
    }
}

export class QuerySyntaxError extends ParseSyntaxError {
    constructor(public value: string) {
        super("query", value);
        this.message = "has some error when parse query";
        this.name = "QuerySyntaxError";
    }
}

export class ToManyLayerError extends ParseSyntaxError {
    constructor(public value: string) {
        super("query", value);
        this.message = "query expression has to many layer";
        this.name = "QuerySyntaxError";
    }
}

export class SortSyntaxError extends ParseSyntaxError {
    constructor(public value: string) {
        super("sort", value);
        this.message = "has some error when parse sort";
        this.name = "SortSyntaxError";
    }
}
