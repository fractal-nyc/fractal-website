import type { IncomingMessage, ServerResponse } from "node:http";

import { handleNodeParlor } from "../../../src/parlor/node-adapter";

export default function handler(req: IncomingMessage, res: ServerResponse) {
  return handleNodeParlor(req, res);
}
