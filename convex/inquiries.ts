import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createInquiry = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    phone: v.string(),
    itemType: v.string(),
    itemId: v.string(),
    itemName: v.string(),
    guests: v.number(),
    message: v.string(),
  },
  returns: v.id("inquiries"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("inquiries", {
      ...args,
      status: "pending",
    });
  },
});

export const getMyInquiries = query({
  args: {
    email: v.string(),
  },
  returns: v.array(
    v.object({
      _id: v.id("inquiries"),
      _creationTime: v.number(),
      name: v.string(),
      email: v.string(),
      phone: v.string(),
      itemType: v.string(),
      itemId: v.string(),
      itemName: v.string(),
      guests: v.number(),
      message: v.string(),
      status: v.string(),
    })
  ),
  handler: async (ctx, args) => {
    const inquiries = await ctx.db
      .query("inquiries")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .order("desc")
      .collect();
    return inquiries;
  },
});
