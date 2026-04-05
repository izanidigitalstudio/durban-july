import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,
  users: defineTable({
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    profileImageId: v.optional(v.id("_storage")),
    displayName: v.optional(v.string()),
    bio: v.optional(v.string()),
  }).index("email", ["email"]),

  inquiries: defineTable({
    name: v.string(),
    email: v.string(),
    phone: v.string(),
    itemType: v.string(),
    itemId: v.string(),
    itemName: v.string(),
    guests: v.number(),
    message: v.string(),
    status: v.string(),
    userId: v.optional(v.string()),
  })
    .index("by_email", ["email"])
    .index("by_status", ["status"])
    .index("by_userId", ["userId"]),

  scheduleItems: defineTable({
    userId: v.id("users"),
    eventId: v.string(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_eventId", ["userId", "eventId"]),

  adminEvents: defineTable({
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
  })
    .index("by_isActive", ["isActive"])
    .index("by_date", ["date"]),

  members: defineTable({
    name: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    status: v.string(),
    notes: v.optional(v.string()),
  })
    .index("by_email", ["email"])
    .index("by_status", ["status"]),
});