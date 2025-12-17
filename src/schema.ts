import { co, z } from "jazz-tools";

export const Count = co.map({
  count: z.number(),
});

export const JazzAccount = co
  .account({
    profile: co.profile(),
    root: co.map({
      count: Count,
    }),
  })
  .withMigration(async (account) => {
    const globalGroup = co.group().create();
    // Let the server worker write
    globalGroup.addMember("everyone", "writer");
    account.$jazz.set("root", {
      count: Count.create({ count: 0 }, globalGroup),
    });
  });

export const UpdateCountMessage = co.map({
  type: z.literal("updateCount"),
  id: z.string(),
});
