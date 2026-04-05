import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ============ EVENTS ============

export const getEvents = query({
  args: {},
  returns: v.array(v.object({
    _id: v.id("adminEvents"),
    _creationTime: v.number(),
    name: v.string(),
    date: v.string(),
    time: v.string(),
    venue: v.string(),
    location: v.string(),
    category: v.string(),
    description: v.string(),
    price: v.string(),
    priceValue: v.number(),
    highlights: v.array(v.string()),
    image: v.string(),
    isActive: v.boolean(),
  })),
  handler: async (ctx) => {
    return await ctx.db.query("adminEvents").collect();
  },
});

export const createEvent = mutation({
  args: {
    name: v.string(),
    date: v.string(),
    time: v.string(),
    venue: v.string(),
    location: v.string(),
    category: v.string(),
    description: v.string(),
    price: v.string(),
    priceValue: v.number(),
    highlights: v.array(v.string()),
    image: v.string(),
  },
  returns: v.id("adminEvents"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("adminEvents", { ...args, isActive: true });
  },
});

export const updateEvent = mutation({
  args: {
    id: v.id("adminEvents"),
    name: v.optional(v.string()),
    date: v.optional(v.string()),
    time: v.optional(v.string()),
    venue: v.optional(v.string()),
    location: v.optional(v.string()),
    category: v.optional(v.string()),
    description: v.optional(v.string()),
    price: v.optional(v.string()),
    priceValue: v.optional(v.number()),
    highlights: v.optional(v.array(v.string())),
    image: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  returns: v.null(),
  handler: async (ctx, { id, ...fields }) => {
    const filtered: Record<string, any> = {};
    for (const [k, val] of Object.entries(fields)) {
      if (val !== undefined) filtered[k] = val;
    }
    await ctx.db.patch(id, filtered);
    return null;
  },
});

export const deleteEvent = mutation({
  args: { id: v.id("adminEvents") },
  returns: v.null(),
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
    return null;
  },
});

export const seedEvents = mutation({
  args: {
    events: v.array(v.object({
      name: v.string(),
      date: v.string(),
      time: v.string(),
      venue: v.string(),
      location: v.string(),
      category: v.string(),
      description: v.string(),
      price: v.string(),
      priceValue: v.number(),
      highlights: v.array(v.string()),
      image: v.string(),
    })),
  },
  returns: v.number(),
  handler: async (ctx, { events }) => {
    const existing = await ctx.db.query("adminEvents").collect();
    if (existing.length > 0) return 0;
    let count = 0;
    for (const event of events) {
      await ctx.db.insert("adminEvents", { ...event, isActive: true });
      count++;
    }
    return count;
  },
});

// ============ MEMBERS ============

export const getMembers = query({
  args: {},
  returns: v.array(v.object({
    _id: v.id("members"),
    _creationTime: v.number(),
    name: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    status: v.string(),
    notes: v.optional(v.string()),
  })),
  handler: async (ctx) => {
    return await ctx.db.query("members").collect();
  },
});

export const addMember = mutation({
  args: {
    name: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  returns: v.id("members"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("members", { ...args, status: "active" });
  },
});

export const deleteMember = mutation({
  args: { id: v.id("members") },
  returns: v.null(),
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
    return null;
  },
});

export const bulkAddMembers = mutation({
  args: {
    members: v.array(v.object({
      name: v.string(),
      email: v.optional(v.string()),
      phone: v.optional(v.string()),
    })),
  },
  returns: v.number(),
  handler: async (ctx, { members }) => {
    let count = 0;
    for (const m of members) {
      await ctx.db.insert("members", { ...m, status: "active" });
      count++;
    }
    return count;
  },
});

export const updateMember = mutation({
  args: {
    id: v.id("members"),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    status: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, { id, ...fields }) => {
    const filtered: Record<string, any> = {};
    for (const [k, val] of Object.entries(fields)) {
      if (val !== undefined) filtered[k] = val;
    }
    await ctx.db.patch(id, filtered);
    return null;
  },
});
