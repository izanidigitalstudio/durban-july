import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

export const createRegistration = mutation({
  args: {
    fullName: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    companyName: v.optional(v.string()),
    city: v.optional(v.string()),
    favouriteEventType: v.string(),
    notes: v.optional(v.string()),
    source: v.optional(v.string()),
    destination: v.optional(v.union(v.literal('web'), v.literal('beta'))),
  },
  returns: v.id("registrations"),
  handler: async (ctx, args) => {
    const now = Date.now();
    const registrationId = await ctx.db.insert("registrations", {
      fullName: args.fullName.trim(),
      email: args.email.trim().toLowerCase(),
      phone: args.phone?.trim() || undefined,
      companyName: args.companyName?.trim() || undefined,
      city: args.city?.trim() || undefined,
      favouriteEventType: args.favouriteEventType,
      notes: args.notes?.trim() || undefined,
      status: "pending",
      source: args.source?.trim() || 'public-registration-link',
      destination: args.destination,
      createdAt: now,
      updatedAt: now,
    });
    await ctx.scheduler.runAfter(0, internal.email.sendPublicRegistrationEmail, {
      name: args.fullName.trim(),
      email: args.email.trim().toLowerCase(),
      phone: args.phone?.trim() || "",
      companyName: args.companyName?.trim() || "",
      city: args.city?.trim() || "",
      favouriteEventType: args.favouriteEventType,
      notes: args.notes?.trim() || "",
    });
    return registrationId;
  },
});
