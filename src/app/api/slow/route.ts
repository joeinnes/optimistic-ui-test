import { Count } from "@/schema";
import { jazzServerAccount } from "../../../jazzServerAccount";
import { slowReq } from "../../../serverApi";
import { assertLoaded } from "jazz-tools";

export async function POST(request: Request) {
  // Wait for 5 seconds
  await new Promise((resolve) => setTimeout(resolve, 2000));
  if (Math.random() < 0.2) {
    console.log("Simulating error");
    throw new Error("Simulated error");
  }
  const response = await slowReq.handle(
    request,
    jazzServerAccount.worker,
    async (c) => {
      assertLoaded(c.updateCountMessage);
      const thisCount = await Count.load(c.updateCountMessage.id);
      assertLoaded(thisCount);
      thisCount.$jazz.set("count", thisCount.count + 1);
      return {
        count: thisCount,
      };
    },
  );

  return response;
}
