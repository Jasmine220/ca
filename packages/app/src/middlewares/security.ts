import cors from "cors";
import helmet from "helmet";
import { Middleware } from "./common";

export default [cors(), helmet()] as Middleware[];
