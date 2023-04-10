import { json, urlencoded } from "express";
import { Middleware } from "./common";

export default [json(), urlencoded({ extended: true })] as Middleware[];
