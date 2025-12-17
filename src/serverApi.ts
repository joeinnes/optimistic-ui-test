import { experimental_defineRequest, z } from "jazz-tools";
import { Count, UpdateCountMessage } from "./schema";
const workerId = process.env.NEXT_PUBLIC_JAZZ_WORKER_ACCOUNT!;

export const slowReq = experimental_defineRequest({
  url: "/api/slow",
  workerId,
  request: {
    schema: {
      updateCountMessage: UpdateCountMessage,
    },
    resolve: {
      updateCountMessage: true,
    },
  },
  response: {
    schema: {
      count: Count,
    },
    resolve: {
      count: true,
    },
  },
});
