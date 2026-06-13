import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

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
    const inquiryId = await ctx.db.insert("inquiries", {
      ...args,
      status: "pending",
    });
    await ctx.scheduler.runAfter(0, internal.email.sendInquiryEmail, {
      name: args.name,
      email: args.email,
      phone: args.phone,
      itemType: args.itemType,
      itemName: args.itemName,
      guests: args.guests,
      message: args.message,
    });
    return inquiryId;
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
