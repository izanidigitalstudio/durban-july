import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

const roleValidator = v.union(
  v.literal("attendee"),
  v.literal("organiser"),
  v.literal("organizer"),
  v.literal("admin"),
);

const organiserStatusValidator = v.union(
  v.literal("pending"),
  v.literal("approved"),
  v.literal("rejected"),
);

const safeRole = (role: unknown) => (role === "admin" || role === "organiser" || role === "organizer" || role === "attendee" ? role : "attendee");
const safeStatus = (status: unknown) => (status === "pending" || status === "approved" || status === "rejected" ? status : "pending");

const buildMembershipState = (user: any) => {
  const role = safeRole(user?.role);
  const organiserStatus = safeStatus(user?.organiserStatus);
  return {
    role: role === "organizer" ? "organiser" : role,
    organiserStatus,
    needsRoleSelection: !user?.role,
    isApprovedOrganiser: (role === "organiser" || role === "organizer") && organiserStatus === "approved",
    isPendingOrganiser: (role === "organiser" || role === "organizer") && organiserStatus === "pending",
    isAdmin: role === "admin",
    isAttendee: role === "attendee",
  };
};

export const getProfile = query({
  args: {},
  returns: v.union(
    v.object({
      _id: v.id("users"),
      name: v.optional(v.string()),
      email: v.optional(v.string()),
      phone: v.optional(v.string()),
      image: v.optional(v.string()),
      displayName: v.optional(v.string()),
      bio: v.optional(v.string()),
      role: v.optional(roleValidator),
      organiserStatus: v.optional(organiserStatusValidator),
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
      profileImageUrl: v.optional(v.string()),
    }),
    v.null()
  ),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const user = await ctx.db.get(userId);
    if (!user) return null;

    let profileImageUrl: string | undefined = undefined;
    if (user.profileImageId) {
      const url = await ctx.storage.getUrl(user.profileImageId);
      if (url) profileImageUrl = url;
    }

    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      image: user.image,
      displayName: user.displayName,
      bio: user.bio,
      role: user.role,
      organiserStatus: user.organiserStatus,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      attendeeCompanyName: user.attendeeCompanyName,
      attendeeDesignation: user.attendeeDesignation,
      attendeeAddress: user.attendeeAddress,
      attendeeCity: user.attendeeCity,
      attendeeProvince: user.attendeeProvince,
      attendeeFavouriteEventType: user.attendeeFavouriteEventType,
      organiserCompanyName: user.organiserCompanyName,
      contactPerson: user.contactPerson,
      websiteOrSocialLink: user.websiteOrSocialLink,
      organiserDescription: user.organiserDescription,
      profileImageUrl,
    };
  },
});

export const getMembershipState = query({
  args: {},
  returns: v.union(
    v.object({
      role: v.union(v.literal("attendee"), v.literal("organiser"), v.literal("admin")),
      organiserStatus: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
      needsRoleSelection: v.boolean(),
      isApprovedOrganiser: v.boolean(),
      isPendingOrganiser: v.boolean(),
      isAdmin: v.boolean(),
      isAttendee: v.boolean(),
    }),
    v.null()
  ),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const user = await ctx.db.get(userId);
    if (!user) return null;
    return buildMembershipState(user);
  },
});

export const getVipMemberStats = query({
  args: {},
  returns: v.object({
    total: v.number(),
    approved: v.number(),
    pending: v.number(),
    rejected: v.number(),
  }),
  handler: async (ctx) => {
    let total = 0;
    let approved = 0;
    let pending = 0;
    let rejected = 0;

    for await (const member of ctx.db.query("members").withIndex("by_category", (q: any) => q.eq("category", "VIP Members"))) {
      total += 1;
      if (member.status === "approved") {
        approved += 1;
      } else if (member.status === "pending") {
        pending += 1;
      } else if (member.status === "rejected") {
        rejected += 1;
      }
    }

    return { total, approved, pending, rejected };
  },
});

export const saveMembershipProfile = mutation({
  args: {
    role: roleValidator,
    name: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
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
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    const now = Date.now();
    const role = user.role === "admin" ? "admin" : args.role;
    const organiserStatus = role === "organiser" || role === "organizer" ? "pending" : "approved";
    const isAttendee = role === "attendee";
    const isOrganiser = role === "organiser" || role === "organizer";

    await ctx.db.patch(user._id, {
      name: args.name,
      email: args.email ?? user.email,
      phone: args.phone ?? user.phone,
      role: role === "organizer" ? "organiser" : role,
      organiserStatus,
      attendeeCompanyName: isAttendee ? args.attendeeCompanyName : undefined,
      attendeeDesignation: isAttendee ? args.attendeeDesignation : undefined,
      attendeeAddress: isAttendee ? args.attendeeAddress : undefined,
      attendeeCity: isAttendee ? args.attendeeCity : undefined,
      attendeeProvince: isAttendee ? args.attendeeProvince : undefined,
      attendeeFavouriteEventType: isAttendee ? args.attendeeFavouriteEventType : undefined,
      organiserCompanyName: isOrganiser ? args.organiserCompanyName : undefined,
      contactPerson: isOrganiser ? args.contactPerson : undefined,
      websiteOrSocialLink: isOrganiser ? args.websiteOrSocialLink : undefined,
      organiserDescription: isOrganiser ? args.organiserDescription : undefined,
      createdAt: user.createdAt ?? now,
      updatedAt: now,
    });

    const existingMember = await ctx.db
      .query("members")
      .withIndex("by_userId", (q: any) => q.eq("userId", userId))
      .take(1);
    const memberPayload = {
      name: args.name,
      email: args.email ?? user.email,
      phone: args.phone ?? user.phone,
      status: organiserStatus,
      role: role === "organizer" ? "organiser" : role,
      organiserStatus,
      userId,
      approvedAt: isOrganiser ? undefined : now,
      attendeeCompanyName: isAttendee ? args.attendeeCompanyName : undefined,
      attendeeDesignation: isAttendee ? args.attendeeDesignation : undefined,
      attendeeAddress: isAttendee ? args.attendeeAddress : undefined,
      attendeeCity: isAttendee ? args.attendeeCity : undefined,
      attendeeProvince: isAttendee ? args.attendeeProvince : undefined,
      attendeeFavouriteEventType: isAttendee ? args.attendeeFavouriteEventType : undefined,
      organiserCompanyName: isOrganiser ? args.organiserCompanyName : undefined,
      contactPerson: isOrganiser ? args.contactPerson : undefined,
      websiteOrSocialLink: isOrganiser ? args.websiteOrSocialLink : undefined,
      organiserDescription: isOrganiser ? args.organiserDescription : undefined,
      createdAt: existingMember[0]?.createdAt ?? now,
      updatedAt: now,
    };

    if (existingMember[0]) {
      await ctx.db.patch(existingMember[0]._id, memberPayload as any);
    } else {
      await ctx.db.insert("members", memberPayload as any);
    }

    return null;
  },
});

export const updateProfile = mutation({
  args: {
    displayName: v.optional(v.string()),
    bio: v.optional(v.string()),
    phone: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    const updates: Record<string, string | number | undefined> = { updatedAt: Date.now() };
    if (args.displayName !== undefined) updates.displayName = args.displayName;
    if (args.bio !== undefined) updates.bio = args.bio;
    if (args.phone !== undefined) updates.phone = args.phone;

    await ctx.db.patch(user._id, updates as any);
    return null;
  },
});

export const generateUploadUrl = mutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    return await ctx.storage.generateUploadUrl();
  },
});

export const saveProfileImage = mutation({
  args: {
    storageId: v.id("_storage"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    if (user.profileImageId) {
      await ctx.storage.delete(user.profileImageId);
    }

    await ctx.db.patch(user._id, { profileImageId: args.storageId, updatedAt: Date.now() });
    return null;
  },
});

export const deleteAccount = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    if (user.profileImageId) {
      await ctx.storage.delete(user.profileImageId);
    }

    const scheduleItems = await ctx.db
      .query("scheduleItems")
      .withIndex("by_userId", (q: any) => q.eq("userId", userId))
      .collect();
    for (const item of scheduleItems) {
      await ctx.db.delete(item._id);
    }

    await ctx.db.delete(userId);
    return null;
  },
});