import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getMySchedule = query({
  args: {},
  returns: v.array(v.string()),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const items = await ctx.db
      .query("scheduleItems")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
    return items.map((item) => item.eventId);
  },
});

export const toggleEvent = mutation({
  args: { eventId: v.string() },
  returns: v.object({ added: v.boolean() }),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Must be signed in to save schedule");

    const existing = await ctx.db
      .query("scheduleItems")
      .withIndex("by_userId_eventId", (q) =>
        q.eq("userId", userId).eq("eventId", args.eventId)
      )
      .unique();

    if (existing) {
      await ctx.db.delete(existing._id);
      return { added: false };
    } else {
      await ctx.db.insert("scheduleItems", {
        userId,
        eventId: args.eventId,
      });
      return { added: true };
    }
  },
});

export const clearSchedule = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Must be signed in");

    const items = await ctx.db
      .query("scheduleItems")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    for (const item of items) {
      await ctx.db.delete(item._id);
    }
    return null;
  },
});
