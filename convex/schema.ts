import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const roleValidator = v.optional(v.union(
  v.literal("attendee"),
  v.literal("organiser"),
  v.literal("organizer"),
  v.literal("admin"),
));

const organiserStatusValidator = v.optional(v.union(
  v.literal("pending"),
  v.literal("approved"),
  v.literal("rejected"),
));

const providerStatusValidator = v.union(
  v.literal("pending"),
  v.literal("approved"),
  v.literal("rejected"),
);

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
    role: roleValidator,
    organiserStatus: organiserStatusValidator,
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
    attendeeCompanyName: v.optional(v.string()),
    attendeeDesignation: v.optional(v.string()),
    attendeeAddress: v.optional(v.string()),
    attendeeCity: v.optional(v.string()),
    attendeeProvince: v.optional(v.string()),
    attendeeFavouriteEventType: v.optional(v.string()),
    organiserCompanyName: v.optional(v.string()),
    contactPerson: v.optional(v.string()),
    websiteOrSocialLink: v.optional(v.string()),
    organiserDescription: v.optional(v.string()),
    companyName: v.optional(v.string()),
    city: v.optional(v.string()),
  })
    .index("email", ["email"])
    .index("by_role", ["role"])
    .index("by_role_and_organiserStatus", ["role", "organiserStatus"]),

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

  registrations: defineTable({
    fullName: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    companyName: v.optional(v.string()),
    city: v.optional(v.string()),
    favouriteEventType: v.string(),
    notes: v.optional(v.string()),
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
    source: v.optional(v.string()),
    destination: v.optional(v.union(v.literal("web"), v.literal("beta"))),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  })
    .index("by_email", ["email"])
    .index("by_status", ["status"]),

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
    image: v.optional(v.string()),
    images: v.optional(v.array(v.string())),
    imageStorageIds: v.optional(v.array(v.union(v.id("_storage"), v.null()))),
    organizerId: v.optional(v.id("users")),
    updatedAt: v.optional(v.number()),
    isActive: v.boolean(),
  })
    .index("by_isActive", ["isActive"])
    .index("by_date", ["date"])
    .index("by_organizerId", ["organizerId"]),

  organizerRequests: defineTable({
    userId: v.id("users"),
    memberId: v.optional(v.id("members")),
    type: v.union(v.literal("claim"), v.literal("create")),
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
    eventId: v.optional(v.id("adminEvents")),
    eventName: v.optional(v.string()),
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
    images: v.optional(v.array(v.string())),
    imageStorageIds: v.optional(v.array(v.union(v.id("_storage"), v.null()))),
    adminNotes: v.optional(v.string()),
    resolvedEventId: v.optional(v.id("adminEvents")),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  })
    .index("by_userId", ["userId"])
    .index("by_status", ["status"])
    .index("by_eventId", ["eventId"])
    .index("by_userId_eventId", ["userId", "eventId"]),

  members: defineTable({
    name: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    mobileNumbers: v.optional(v.array(v.string())),
    status: v.string(),
    category: v.optional(v.string()),
    role: v.optional(v.union(
      v.literal("attendee"),
      v.literal("organiser"),
      v.literal("organizer"),
      v.literal("admin"),
    )),
    organiserStatus: v.optional(v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected"),
    )),
    accessPin: v.optional(v.string()),
    userId: v.optional(v.id("users")),
    assignedEventIds: v.optional(v.array(v.string())),
    approvedAt: v.optional(v.number()),
    notes: v.optional(v.string()),
    attendeeCompanyName: v.optional(v.string()),
    attendeeDesignation: v.optional(v.string()),
    attendeeAddress: v.optional(v.string()),
    attendeeCity: v.optional(v.string()),
    attendeeProvince: v.optional(v.string()),
    attendeeFavouriteEventType: v.optional(v.string()),
    organiserCompanyName: v.optional(v.string()),
    contactPerson: v.optional(v.string()),
    websiteOrSocialLink: v.optional(v.string()),
    organiserDescription: v.optional(v.string()),
    companyName: v.optional(v.string()),
    city: v.optional(v.string()),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  })
    .index("by_email", ["email"])
    .index("by_status", ["status"])
    .index("by_accessPin", ["accessPin"])
    .index("by_userId", ["userId"])
    .index("by_category", ["category"]),

  providers: defineTable({
    name: v.string(),
    companyName: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    services: v.optional(v.string()),
    websiteOrSocialLink: v.optional(v.string()),
    notes: v.optional(v.string()),
    status: providerStatusValidator,
    approvedAt: v.optional(v.number()),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  })
    .index("by_email", ["email"])
    .index("by_status", ["status"]),
});