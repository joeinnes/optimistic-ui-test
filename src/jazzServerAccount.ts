import { startWorker } from "jazz-tools/worker";

export const jazzServerAccount = await startWorker({
  syncServer: "wss://cloud.jazz.tools/?key=jazz-optimistic-ui@garden.co ",
  accountID: process.env.NEXT_PUBLIC_JAZZ_WORKER_ACCOUNT,
  accountSecret: process.env.JAZZ_WORKER_SECRET,
});
