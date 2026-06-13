import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

const ADMIN_PIN = (globalThis as typeof globalThis & {
  process?: { env?: { ADMIN_PIN?: string; DEMO_ORGANIZER_PINS?: string } };
}).process?.env?.ADMIN_PIN?.trim() || "1977";
const DEMO_ORGANIZER_PINS = (globalThis as typeof globalThis & {
  process?: { env?: { ADMIN_PIN?: string; DEMO_ORGANIZER_PINS?: string } };
}).process?.env?.DEMO_ORGANIZER_PINS?.split(",").map((pin) => pin.trim()).filter(Boolean) ?? [];

const normalizeText = (value: string) => value.trim().toLowerCase();
const providerStatusValidator = v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected"));
const listStatusValidator = v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected"));
const roleValidator = v.union(v.literal("attendee"), v.literal("organiser"), v.literal("organizer"), v.literal("admin"));
const memberCategoryValidator = v.optional(v.string());

const normalizeMobileNumbers = (values?: Array<string | undefined | null>) =>
  Array.from(new Set((values ?? []).map((value) => String(value ?? "").trim()).filter(Boolean)));

const looksLikePhoneNumber = (value?: string) => {
  const raw = String(value ?? "").trim();
  if (!raw) return false;
  if (/[a-zA-Z]/.test(raw)) return false;
  const digits = raw.replace(/\D/g, "");
  return digits.length >= 8;
};

const normalizeVipPhoneAndCity = (input: {
  phone?: string;
  mobileNumbers?: string[];
  attendeeCity?: string;
  city?: string;
}) => {
  const mobileNumbers = normalizeMobileNumbers(input.mobileNumbers);
  const cityCandidates = [input.city, input.attendeeCity].map((value) => String(value ?? "").trim()).filter(Boolean);
  const nonPhoneCity = cityCandidates.find((value) => !looksLikePhoneNumber(value));
  const phoneFromCity = cityCandidates.find((value) => looksLikePhoneNumber(value));
  const shouldMoveCityPhoneToPhone = !input.phone && !mobileNumbers.length && Boolean(phoneFromCity);
  return {
    phone: input.phone || (shouldMoveCityPhoneToPhone ? phoneFromCity : undefined),
    mobileNumbers: mobileNumbers.length ? mobileNumbers : shouldMoveCityPhoneToPhone && phoneFromCity ? [phoneFromCity] : undefined,
    attendeeCity: nonPhoneCity,
    city: nonPhoneCity,
  };
};

const vipNoiseTokens = new Set([
  "vip",
  "vvip",
  "yacht",
  "veuve",
  "vueve",
]);

const vipEventTypeTokens = new Map([
  ["yacht", "Yacht"],
  ["veuve", "Veuve"],
  ["vueve", "Veuve"],
]);

const normalizeVipName = (value: string) => {
  const source = String(value ?? "").trim();
  const replaced = source
    .replace(/[._/]+/g, " ")
    .replace(/\s*-\s*/g, " - ")
    .replace(/\s+/g, " ")
    .trim();

  if (!replaced) {
    return { name: "", attendeeFavouriteEventType: undefined as string | undefined };
  }

  const tokens = replaced.split(" ").filter(Boolean);
  const cleanedTokens: string[] = [];
  let attendeeFavouriteEventType: string | undefined;

  for (const token of tokens) {
    const normalized = token.toLowerCase().replace(/[^a-z]/g, "");
    if (!normalized) continue;
    if (vipNoiseTokens.has(normalized)) {
      const mappedEventType = vipEventTypeTokens.get(normalized);
      if (mappedEventType && !attendeeFavouriteEventType) attendeeFavouriteEventType = mappedEventType;
      continue;
    }
    cleanedTokens.push(token);
  }

  return {
    name: cleanedTokens.join(" ").replace(/\s+/g, " ").trim(),
    attendeeFavouriteEventType,
  };
};

const sanitizeVipMemberFields = (input: {
  name?: string;
  companyName?: string;
  attendeeCompanyName?: string;
  attendeeFavouriteEventType?: string;
}) => {
  const patch: Record<string, string> = {};
  if (input.name !== undefined) {
    const normalized = normalizeVipName(input.name);
    if (normalized.name) patch.name = normalized.name;
    if (!input.attendeeFavouriteEventType && normalized.attendeeFavouriteEventType) {
      patch.attendeeFavouriteEventType = normalized.attendeeFavouriteEventType;
    }
  }
  if (input.companyName === undefined && input.attendeeCompanyName !== undefined) {
    patch.companyName = input.attendeeCompanyName;
  }
  return patch;
};

const resolveEventImages = async (ctx: any, event: any) => {
  const storageIds = Array.isArray(event.imageStorageIds) ? event.imageStorageIds : [];
  const fallbackImages = Array.isArray(event.images) ? event.images : [];
  const resolvedImages = await Promise.all(
    Array.from({ length: Math.max(storageIds.length, fallbackImages.length) }, async (_, index) => {
      const storageId = storageIds[index];
      if (storageId) {
        const url = await ctx.storage.getUrl(storageId);
        if (url) return url;
      }
      return fallbackImages[index] ?? "";
    })
  );
  const images = resolvedImages.filter((uri) => Boolean(uri?.trim()));
  const image = images[0] || event.image || "";
  return { image, images: images.length ? images : image ? [image] : [], imageStorageIds: storageIds.length ? storageIds : undefined };
};

const selectEventResult = async (ctx: any, event: any) => ({
  _id: event._id,
  _creationTime: event._creationTime,
  name: event.name,
  date: event.date,
  time: event.time,
  venue: event.venue,
  location: event.location,
  category: event.category,
  description: event.description,
  price: event.price,
  priceValue: event.priceValue,
  highlights: event.highlights,
  isActive: event.isActive,
  ...(await resolveEventImages(ctx, event)),
});

const selectMemberResult = (member: any) => ({
  _id: member._id,
  _creationTime: member._creationTime,
  name: member.name,
  email: member.email,
  phone: member.phone,
  mobileNumbers: member.mobileNumbers,
  status: member.status,
  category: member.category,
  role: member.role,
  accessPin: member.accessPin,
  assignedEventIds: member.assignedEventIds,
  approvedAt: member.approvedAt,
  notes: member.notes,
  organiserStatus: member.organiserStatus,
  userId: member.userId,
  attendeeCompanyName: member.attendeeCompanyName,
  attendeeDesignation: member.attendeeDesignation,
  attendeeAddress: member.attendeeAddress,
  attendeeCity: member.attendeeCity,
  attendeeProvince: member.attendeeProvince,
  attendeeFavouriteEventType: member.attendeeFavouriteEventType,
  organiserCompanyName: member.organiserCompanyName,
  contactPerson: member.contactPerson,
  websiteOrSocialLink: member.websiteOrSocialLink,
  organiserDescription: member.organiserDescription,
  companyName: member.companyName,
  city: member.city,
});

const selectProviderResult = (provider: any) => ({
  _id: provider._id,
  _creationTime: provider._creationTime,
  name: provider.name,
  companyName: provider.companyName,
  email: provider.email,
  phone: provider.phone,
  services: provider.services,
  websiteOrSocialLink: provider.websiteOrSocialLink,
  notes: provider.notes,
  status: provider.status,
  approvedAt: provider.approvedAt,
});

const selectOrganizerRequestResult = (request: any) => ({
  _id: request._id,
  _creationTime: request._creationTime,
  userId: request.userId,
  memberId: request.memberId,
  type: request.type,
  status: request.status,
  eventId: request.eventId,
  eventName: request.eventName,
  name: request.name,
  date: request.date,
  time: request.time,
  venue: request.venue,
  location: request.location,
  category: request.category,
  description: request.description,
  price: request.price,
  priceValue: request.priceValue,
  highlights: request.highlights,
  image: request.image,
  images: request.images,
  imageStorageIds: request.imageStorageIds,
  adminNotes: request.adminNotes,
  resolvedEventId: request.resolvedEventId,
  createdAt: request.createdAt,
  updatedAt: request.updatedAt,
});

const getCurrentUser = async (ctx: any) => {
  const userId = await getAuthUserId(ctx);
  if (!userId) return null;
  return await ctx.db.get(userId);
};

const getCurrentMember = async (ctx: any) => {
  const userId = await getAuthUserId(ctx);
  if (!userId) return null;
  const members = await ctx.db.query("members").withIndex("by_userId", (q: any) => q.eq("userId", userId)).take(1);
  return members[0] ?? null;
};

const isAdminUser = async (ctx: any) => {
  const user = await getCurrentUser(ctx);
  return user?.role === "admin";
};

const requireAdmin = async (ctx: any) => {
  if (!(await isAdminUser(ctx))) throw new Error("Unauthorized");
};

const applyVipFields = (input: {
  name?: string;
  email?: string;
  phone?: string;
  mobileNumbers?: string[];
  notes?: string;
  category?: string;
  attendeeCompanyName?: string;
  attendeeDesignation?: string;
  attendeeAddress?: string;
  attendeeCity?: string;
  attendeeProvince?: string;
  attendeeFavouriteEventType?: string;
  companyName?: string;
  city?: string;
}) => ({
  name: input.name,
  email: input.email,
  phone: input.phone,
  mobileNumbers: normalizeMobileNumbers(input.mobileNumbers),
  notes: input.notes,
  category: input.category,
  attendeeCompanyName: input.attendeeCompanyName,
  attendeeDesignation: input.attendeeDesignation,
  attendeeAddress: input.attendeeAddress,
  attendeeCity: input.attendeeCity,
  attendeeProvince: input.attendeeProvince,
  attendeeFavouriteEventType: input.attendeeFavouriteEventType,
  companyName: input.companyName ?? input.attendeeCompanyName,
  city: input.city ?? input.attendeeCity,
});

export const validateSuperAdminPin = mutation({
  args: {
    pin: v.string(),
  },
  returns: v.object({
    role: v.literal("admin"),
    accessPin: v.string(),
  }),
  handler: async (_ctx, { pin }) => {
    if (pin.trim() !== "1977") {
      throw new Error("Incorrect PIN");
    }

    return {
      role: "admin",
      accessPin: "1977",
    };
  },
});

const getApprovedOrganizerMember = async (ctx: any, accessPin?: string | null) => {
  const pin = accessPin?.trim();
  if (pin) {
    const members = await ctx.db.query("members").withIndex("by_accessPin", (q: any) => q.eq("accessPin", pin)).take(1);
    const member = members[0] ?? null;
    if (member && member.status === "approved") return member;
  }
  const member = await getCurrentMember(ctx);
  if (member && member.status === "approved" && (member.role === "organiser" || member.role === "organizer")) return member;
  return null;
};

const adminEventValidator = v.object({
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
  image: v.optional(v.string()),
  images: v.optional(v.array(v.string())),
  imageStorageIds: v.optional(v.array(v.union(v.id("_storage"), v.null()))),
  isActive: v.boolean(),
});

const memberValidator = v.object({
  _id: v.id("members"),
  _creationTime: v.number(),
  name: v.string(),
  email: v.optional(v.string()),
  phone: v.optional(v.string()),
  mobileNumbers: v.optional(v.array(v.string())),
  status: v.string(),
  category: v.optional(v.string()),
  role: v.optional(roleValidator),
  accessPin: v.optional(v.string()),
  assignedEventIds: v.optional(v.array(v.string())),
  approvedAt: v.optional(v.number()),
  notes: v.optional(v.string()),
  organiserStatus: v.optional(v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected"))),
  userId: v.optional(v.id("users")),
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
});

const providerValidator = v.object({
  _id: v.id("providers"),
  _creationTime: v.number(),
  name: v.string(),
  companyName: v.optional(v.string()),
  email: v.optional(v.string()),
  phone: v.optional(v.string()),
  services: v.optional(v.string()),
  websiteOrSocialLink: v.optional(v.string()),
  notes: v.optional(v.string()),
  status: providerStatusValidator,
  approvedAt: v.optional(v.number()),
});

const organizerRequestValidator = v.object({
  _id: v.id("organizerRequests"),
  _creationTime: v.number(),
  userId: v.id("users"),
  memberId: v.optional(v.id("members")),
  type: v.union(v.literal("claim"), v.literal("create")),
  status: listStatusValidator,
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
});

export const createOrganizerRequest = mutation({
  args: {
    type: v.union(v.literal("claim"), v.literal("create")),
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
  },
  returns: v.id("organizerRequests"),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const requestId = await ctx.db.insert("organizerRequests", {
      userId,
      type: args.type,
      status: "pending",
      eventId: args.eventId,
      eventName: args.eventName,
      name: args.name,
      date: args.date,
      time: args.time,
      venue: args.venue,
      location: args.location,
      category: args.category,
      description: args.description,
      price: args.price,
      priceValue: args.priceValue,
      highlights: args.highlights,
      image: args.image,
      images: args.images,
      imageStorageIds: args.imageStorageIds,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return requestId;
  },
});

const seedDemoOrganizersList = [
  { name: "Nomsa Dlamini", email: "nomsa.dlamini@demo.durbanjuly.co.za", phone: "+27 82 241 1977", notes: "Fashion and style lead for the Durban July week journey.", assignedEventNames: ["Road to Durban July Welcome Cocktail Party", "Durban July Fashion Preview and Designer Showcase", "Mzansi Sip and Paint Experience", "White Party Lifestyle by Universal Concerts", "Sunday Recovery Brunch"] },
  { name: "Sibusiso Mkhize", email: "sibusiso.mkhize@demo.durbanjuly.co.za", phone: "+27 82 242 1977", notes: "Race day operations lead for the core Durban July schedule.", assignedEventNames: ["Presidential Golf Day - Ballito Experience", "Durban July Week Opening Night", "Hollywoodbets Durban July 2026", "Durban July Debrief Lunch", "Monday Farewell Pool Party", "Makubenjalo Mogodu Monday"] },
  { name: "Zinhle Naidoo", email: "zinhle.naidoo@demo.durbanjuly.co.za", phone: "+27 82 243 1977", notes: "Nightlife and after-party lead with late-night Durban energy.", assignedEventNames: ["Durban July Eve: The Grand Pre-Party", "July Jive: Amapiano Takeover", "SoundLand Durban July After-Party", "Rockets Wonderland Party", "Ballito Experience Sunday Concert"] },
  { name: "Thando Cele", email: "thando.cele@demo.durbanjuly.co.za", phone: "+27 82 244 1977", notes: "VIP hospitality lead curating premium Sunday and Monday touchpoints.", assignedEventNames: ["Any Given Sunday", "KwaMax All White Sunday Party", "Lux Empire All White Yacht Party", "White Party Lifestyle by Universal Concerts", "Monday Farewell Pool Party"] },
  { name: "Ayanda Mbatha", email: "ayanda.mbatha@demo.durbanjuly.co.za", phone: "+27 82 245 1977", notes: "Community and travel liaison for the wider Durban July journey.", assignedEventNames: ["Umhlanga July Friday Sundowner", "Mzansi Sip and Paint Experience", "Sunday Recovery Brunch", "Durban July Debrief Lunch", "Monday Farewell Pool Party"] },
];

export const getEvents = query({
  args: {},
  returns: v.array(adminEventValidator),
  handler: async (ctx) => {
    const events = await ctx.db.query("adminEvents").collect();
    return Promise.all(events.map((event: any) => selectEventResult(ctx, event)));
  },
});

export const createEvent = mutation({
  args: {
    accessPin: v.optional(v.string()),
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
  },
  returns: v.id("adminEvents"),
  handler: async (ctx, { accessPin, ...args }) => {
    if (accessPin?.trim() === ADMIN_PIN) {
      return await ctx.db.insert("adminEvents", { ...args, isActive: true, updatedAt: Date.now() });
    }
    await requireAdmin(ctx);
    return await ctx.db.insert("adminEvents", { ...args, isActive: true, updatedAt: Date.now() });
  },
});

export const updateEvent = mutation({
  args: {
    accessPin: v.optional(v.string()),
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
    images: v.optional(v.array(v.string())),
    imageStorageIds: v.optional(v.array(v.union(v.id("_storage"), v.null()))),
    isActive: v.optional(v.boolean()),
  },
  returns: v.null(),
  handler: async (ctx, { accessPin, id, ...fields }) => {
    if (accessPin?.trim() !== ADMIN_PIN) await requireAdmin(ctx);
    const filtered: Record<string, any> = {};
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) filtered[key] = value;
    }
    await ctx.db.patch(id, { ...filtered, updatedAt: Date.now() });
    return null;
  },
});

export const deleteEvent = mutation({
  args: { accessPin: v.optional(v.string()), id: v.id("adminEvents") },
  returns: v.null(),
  handler: async (ctx, { accessPin, id }) => {
    if (accessPin?.trim() !== ADMIN_PIN) await requireAdmin(ctx);
    await ctx.db.delete(id);
    return null;
  },
});

export const getOrganizerPortfolio = query({
  args: { accessPin: v.string() },
  returns: v.union(v.object({ member: memberValidator, events: v.array(adminEventValidator) }), v.null()),
  handler: async (ctx, { accessPin }) => {
    const member = await getApprovedOrganizerMember(ctx, accessPin);
    if (!member) return null;
    const assignedIds = member.assignedEventIds ?? [];
    const events = (await ctx.db.query("adminEvents").collect()).filter((event: any) => assignedIds.includes(event._id));
    return { member: selectMemberResult(member), events: await Promise.all(events.map((event: any) => selectEventResult(ctx, event))) };
  },
});

export const getOrganizerAccess = query({
  args: { accessPin: v.string() },
  returns: v.union(memberValidator, v.null()),
  handler: async (ctx, { accessPin }) => {
    const member = await getApprovedOrganizerMember(ctx, accessPin);
    return member ? selectMemberResult(member) : null;
  },
});

export const getMyOrganizerRequests = query({
  args: {},
  returns: v.array(organizerRequestValidator),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const requests = await ctx.db
      .query("organizerRequests")
      .withIndex("by_userId", (q: any) => q.eq("userId", userId))
      .collect();
    return requests.map((request: any) => selectOrganizerRequestResult(request));
  },
});

export const getOrganizerRequests = query({
  args: { accessPin: v.optional(v.string()) },
  returns: v.array(organizerRequestValidator),
  handler: async (ctx, { accessPin }) => {
    if (accessPin?.trim() !== ADMIN_PIN) await requireAdmin(ctx);
    const requests = await ctx.db.query("organizerRequests").collect();
    return requests.map((request: any) => selectOrganizerRequestResult(request));
  },
});

export const approveOrganizerRequest = mutation({
  args: { accessPin: v.optional(v.string()), requestId: v.id("organizerRequests"), adminNotes: v.optional(v.string()) },
  returns: v.null(),
  handler: async (ctx, { accessPin, requestId, adminNotes }) => {
    if (accessPin?.trim() !== ADMIN_PIN) await requireAdmin(ctx);
    const request = await ctx.db.get(requestId);
    if (!request) throw new Error("Request not found");
    let resolvedEventId = request.resolvedEventId;
    if (request.type === "claim") {
      if (!request.eventId) throw new Error("Event not found");
      const event = await ctx.db.get(request.eventId);
      if (!event) throw new Error("Event not found");
      resolvedEventId = event._id;
      await ctx.db.patch(event._id, { organizerId: request.userId, isActive: true, updatedAt: Date.now() });
      if (request.memberId) {
        const member = await ctx.db.get(request.memberId);
        if (member) {
          await ctx.db.patch(member._id, { assignedEventIds: Array.from(new Set([...(member.assignedEventIds ?? []), event._id])), updatedAt: Date.now() });
        }
      }
    } else if (request.type === "create") {
      const newEventId = await ctx.db.insert("adminEvents", {
        name: request.name || request.eventName || "Untitled Event",
        date: request.date || "",
        time: request.time || "",
        venue: request.venue || "",
        location: request.location || "",
        category: request.category || "Lifestyle",
        description: request.description || "",
        price: request.price || "Free",
        priceValue: request.priceValue || 0,
        highlights: request.highlights || [],
        image: request.image,
        images: request.images,
        imageStorageIds: request.imageStorageIds,
        organizerId: request.userId,
        isActive: true,
        updatedAt: Date.now(),
      });
      resolvedEventId = newEventId;
    }
    await ctx.db.patch(requestId, { status: "approved", adminNotes, resolvedEventId, updatedAt: Date.now() });
    return null;
  },
});

export const rejectOrganizerRequest = mutation({
  args: { accessPin: v.optional(v.string()), requestId: v.id("organizerRequests"), adminNotes: v.optional(v.string()) },
  returns: v.null(),
  handler: async (ctx, { accessPin, requestId, adminNotes }) => {
    if (accessPin?.trim() !== ADMIN_PIN) await requireAdmin(ctx);
    await ctx.db.patch(requestId, { status: "rejected", adminNotes, updatedAt: Date.now() });
    return null;
  },
});

export const getMembers = query({
  args: { accessPin: v.optional(v.string()) },
  returns: v.array(memberValidator),
  handler: async (ctx, { accessPin }) => {
    if (accessPin?.trim() !== ADMIN_PIN) await requireAdmin(ctx);
    const members = await ctx.db.query("members").collect();
    return members.map((member: any) => selectMemberResult(member));
  },
});

export const addMember = mutation({
  args: { accessPin: v.optional(v.string()), name: v.string(), email: v.optional(v.string()), phone: v.optional(v.string()), mobileNumbers: v.optional(v.array(v.string())), notes: v.optional(v.string()), category: memberCategoryValidator, attendeeCompanyName: v.optional(v.string()), attendeeDesignation: v.optional(v.string()), attendeeCity: v.optional(v.string()), companyName: v.optional(v.string()), city: v.optional(v.string()) },
  returns: v.id("members"),
  handler: async (ctx, { accessPin, ...args }) => {
    if (accessPin?.trim() !== ADMIN_PIN) await requireAdmin(ctx);
    const normalizedPhoneAndCity = normalizeVipPhoneAndCity({ phone: args.phone, mobileNumbers: args.mobileNumbers, attendeeCity: args.attendeeCity, city: args.city });
    const vipFields = sanitizeVipMemberFields({ name: args.name, companyName: args.companyName, attendeeCompanyName: args.attendeeCompanyName });
    return await ctx.db.insert("members", { ...args, ...normalizedPhoneAndCity, ...vipFields, status: "pending" });
  },
});

export const bulkImportMembers = mutation({
  args: {
    accessPin: v.optional(v.string()),
    category: v.optional(v.string()),
    members: v.array(v.object({
      name: v.string(),
      email: v.optional(v.string()),
      phone: v.optional(v.string()),
      mobileNumbers: v.optional(v.array(v.string())),
      notes: v.optional(v.string()),
      category: v.optional(v.string()),
      attendeeCompanyName: v.optional(v.string()),
      attendeeDesignation: v.optional(v.string()),
      attendeeCity: v.optional(v.string()),
      attendeeProvince: v.optional(v.string()),
      attendeeFavouriteEventType: v.optional(v.string()),
      companyName: v.optional(v.string()),
      city: v.optional(v.string()),
    })),
  },
  returns: v.array(v.object({ _id: v.id("members"), name: v.string(), status: v.string() })),
  handler: async (ctx, { accessPin, category, members }) => {
    if (accessPin?.trim() !== ADMIN_PIN) await requireAdmin(ctx);
    const inserted = await Promise.all(
      members.map(async (member: { name: string; email?: string; phone?: string; mobileNumbers?: string[]; notes?: string; category?: string; attendeeCompanyName?: string; attendeeDesignation?: string; attendeeCity?: string; attendeeProvince?: string; attendeeFavouriteEventType?: string; companyName?: string; city?: string }) => {
        const normalizedPhoneAndCity = normalizeVipPhoneAndCity({ phone: member.phone, mobileNumbers: member.mobileNumbers, attendeeCity: member.attendeeCity, city: member.city });
        const vipFields = sanitizeVipMemberFields({ name: member.name, companyName: member.companyName, attendeeCompanyName: member.attendeeCompanyName, attendeeFavouriteEventType: member.attendeeFavouriteEventType });
        const _id = await ctx.db.insert("members", {
          ...applyVipFields({
            name: vipFields.name ?? member.name,
            email: member.email,
            phone: normalizedPhoneAndCity.phone,
            mobileNumbers: normalizedPhoneAndCity.mobileNumbers,
            notes: member.notes,
            category: member.category || category,
            attendeeCompanyName: member.attendeeCompanyName,
            attendeeDesignation: member.attendeeDesignation,
            attendeeCity: normalizedPhoneAndCity.attendeeCity,
            attendeeProvince: member.attendeeProvince,
            attendeeFavouriteEventType: member.attendeeFavouriteEventType || vipFields.attendeeFavouriteEventType,
            companyName: vipFields.companyName ?? member.companyName,
            city: normalizedPhoneAndCity.city,
          }),
          status: "pending",
        });
        return { _id, name: vipFields.name ?? member.name, status: "pending" };
      })
    );
    return inserted;
  },
});

export const updateMember = mutation({
  args: {
    accessPin: v.optional(v.string()),
    id: v.id("members"),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    mobileNumbers: v.optional(v.array(v.string())),
    status: v.optional(v.string()),
    role: v.optional(v.string()),
    category: v.optional(v.string()),
    assignedEventIds: v.optional(v.array(v.id("adminEvents"))),
    approvedAt: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, { accessPin, id, ...fields }) => {
    if (accessPin?.trim() !== ADMIN_PIN) await requireAdmin(ctx);
    const filtered: Record<string, any> = {};
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) filtered[key] = value;
    }
    if (filtered.mobileNumbers) filtered.mobileNumbers = normalizeMobileNumbers(filtered.mobileNumbers);
    if (!filtered.phone && filtered.mobileNumbers?.length) filtered.phone = filtered.mobileNumbers[0];
    if (filtered.name) {
      const vipFields = sanitizeVipMemberFields({ name: filtered.name, companyName: filtered.companyName, attendeeCompanyName: filtered.attendeeCompanyName });
      Object.assign(filtered, vipFields);
    }
    await ctx.db.patch(id, filtered);
    return null;
  },
});

export const deleteMember = mutation({
  args: { accessPin: v.optional(v.string()), id: v.id("members") },
  returns: v.null(),
  handler: async (ctx, { accessPin, id }) => {
    if (accessPin?.trim() !== ADMIN_PIN) await requireAdmin(ctx);
    await ctx.db.delete(id);
    return null;
  },
});

export const getProviders = query({
  args: { accessPin: v.optional(v.string()) },
  returns: v.array(providerValidator),
  handler: async (ctx, { accessPin }) => {
    if (accessPin?.trim() !== ADMIN_PIN) await requireAdmin(ctx);
    const providers = await ctx.db.query("providers").collect();
    return providers.map((provider: any) => selectProviderResult(provider));
  },
});

export const addProvider = mutation({
  args: {
    accessPin: v.optional(v.string()),
    name: v.string(),
    companyName: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    services: v.optional(v.string()),
    websiteOrSocialLink: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  returns: v.id("providers"),
  handler: async (ctx, { accessPin, ...args }) => {
    if (accessPin?.trim() !== ADMIN_PIN) await requireAdmin(ctx);
    return await ctx.db.insert("providers", { ...args, status: "pending", createdAt: Date.now(), updatedAt: Date.now() });
  },
});

export const updateProvider = mutation({
  args: {
    accessPin: v.optional(v.string()),
    id: v.id("providers"),
    name: v.optional(v.string()),
    companyName: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    services: v.optional(v.string()),
    websiteOrSocialLink: v.optional(v.string()),
    notes: v.optional(v.string()),
    status: v.optional(providerStatusValidator),
  },
  returns: v.null(),
  handler: async (ctx, { accessPin, id, ...fields }) => {
    if (accessPin?.trim() !== ADMIN_PIN) await requireAdmin(ctx);
    const filtered: Record<string, any> = {};
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) filtered[key] = value;
    }
    if (filtered.status === "approved") filtered.approvedAt = Date.now();
    filtered.updatedAt = Date.now();
    await ctx.db.patch(id, filtered);
    return null;
  },
});

export const deleteProvider = mutation({
  args: { accessPin: v.optional(v.string()), id: v.id("providers") },
  returns: v.null(),
  handler: async (ctx, { accessPin, id }) => {
    if (accessPin?.trim() !== ADMIN_PIN) await requireAdmin(ctx);
    await ctx.db.delete(id);
    return null;
  },
});

export const getVipMembers = query({
  args: { accessPin: v.optional(v.string()) },
  returns: v.array(memberValidator),
  handler: async (ctx, { accessPin }) => {
    if (accessPin?.trim() !== ADMIN_PIN) await requireAdmin(ctx);
    const members = await ctx.db
      .query("members")
      .withIndex("by_category", (q: any) => q.eq("category", "VIP Members"))
      .collect();
    return members.map((member: any) => selectMemberResult(member));
  },
});

export const cleanVipMembers = mutation({
  args: { accessPin: v.optional(v.string()) },
  returns: v.object({ examined: v.number(), updated: v.number() }),
  handler: async (ctx, { accessPin }) => {
    if (accessPin?.trim() !== ADMIN_PIN) await requireAdmin(ctx);
    let examined = 0;
    let updated = 0;
    for await (const member of ctx.db.query("members").withIndex("by_category", (q: any) => q.eq("category", "VIP Members"))) {
      examined += 1;
      const patch: Record<string, any> = {};
      const normalized = normalizeVipName(member.name);
      if (normalized.name && normalized.name !== member.name) patch.name = normalized.name;
      if (normalized.attendeeFavouriteEventType && !member.attendeeFavouriteEventType) {
        patch.attendeeFavouriteEventType = normalized.attendeeFavouriteEventType;
      }
      if (!member.companyName && member.attendeeCompanyName) {
        patch.companyName = member.attendeeCompanyName;
      }
      if (!member.city && member.attendeeCity) {
        patch.city = member.attendeeCity;
      }
      const normalizedPhoneAndCity = normalizeVipPhoneAndCity({ phone: member.phone, mobileNumbers: member.mobileNumbers, attendeeCity: member.attendeeCity, city: member.city });
      if (normalizedPhoneAndCity.phone && normalizedPhoneAndCity.phone !== member.phone) patch.phone = normalizedPhoneAndCity.phone;
      if (normalizedPhoneAndCity.mobileNumbers && JSON.stringify(normalizedPhoneAndCity.mobileNumbers) !== JSON.stringify(member.mobileNumbers ?? [])) {
        patch.mobileNumbers = normalizedPhoneAndCity.mobileNumbers;
      }
      if (normalizedPhoneAndCity.city !== member.city) patch.city = normalizedPhoneAndCity.city;
      if (normalizedPhoneAndCity.attendeeCity !== member.attendeeCity) patch.attendeeCity = normalizedPhoneAndCity.attendeeCity;
      if (Object.keys(patch).length > 0) {
        await ctx.db.patch(member._id, patch);
        updated += 1;
      }
    }
    return { examined, updated };
  },
});

export const updateVipMember = mutation({
  args: {
    accessPin: v.optional(v.string()),
    id: v.id("members"),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    mobileNumbers: v.optional(v.array(v.string())),
    status: v.optional(v.string()),
    category: v.optional(v.string()),
    notes: v.optional(v.string()),
    attendeeCompanyName: v.optional(v.string()),
    attendeeDesignation: v.optional(v.string()),
    attendeeAddress: v.optional(v.string()),
    attendeeCity: v.optional(v.string()),
    attendeeProvince: v.optional(v.string()),
    attendeeFavouriteEventType: v.optional(v.string()),
    companyName: v.optional(v.string()),
    city: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, { accessPin, id, ...fields }) => {
    if (accessPin?.trim() !== ADMIN_PIN) await requireAdmin(ctx);
    const filtered: Record<string, any> = {};
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) filtered[key] = value;
    }
    if (filtered.mobileNumbers) filtered.mobileNumbers = normalizeMobileNumbers(filtered.mobileNumbers);
    if (!filtered.phone && filtered.mobileNumbers?.length) filtered.phone = filtered.mobileNumbers[0];
    const normalizedPhoneAndCity = normalizeVipPhoneAndCity({ phone: filtered.phone, mobileNumbers: filtered.mobileNumbers, attendeeCity: filtered.attendeeCity, city: filtered.city });
    Object.assign(filtered, normalizedPhoneAndCity);
    if (filtered.attendeeCompanyName !== undefined && filtered.companyName === undefined) filtered.companyName = filtered.attendeeCompanyName;
    if (filtered.attendeeCity !== undefined && filtered.city === undefined) filtered.city = filtered.attendeeCity;
    if (filtered.name) {
      const vipFields = sanitizeVipMemberFields({ name: filtered.name, companyName: filtered.companyName, attendeeCompanyName: filtered.attendeeCompanyName, attendeeFavouriteEventType: filtered.attendeeFavouriteEventType });
      Object.assign(filtered, vipFields);
    }
    await ctx.db.patch(id, filtered);
    return null;
  },
});

export const approveVipMember = mutation({
  args: { accessPin: v.optional(v.string()), id: v.id("members") },
  returns: v.null(),
  handler: async (ctx, { accessPin, id }) => {
    if (accessPin?.trim() !== ADMIN_PIN) await requireAdmin(ctx);
    await ctx.db.patch(id, { status: "approved", updatedAt: Date.now() });
    return null;
  },
});

export const declineVipMember = mutation({
  args: { accessPin: v.optional(v.string()), id: v.id("members") },
  returns: v.null(),
  handler: async (ctx, { accessPin, id }) => {
    if (accessPin?.trim() !== ADMIN_PIN) await requireAdmin(ctx);
    await ctx.db.patch(id, { status: "rejected", updatedAt: Date.now() });
    return null;
  },
});

export const approveMember = mutation({
  args: { accessPin: v.optional(v.string()), memberId: v.id("members"), role: v.optional(v.string()), accessPinValue: v.optional(v.string()) },
  returns: v.null(),
  handler: async (ctx, { accessPin, memberId, role, accessPinValue }) => {
    if (accessPin?.trim() !== ADMIN_PIN) await requireAdmin(ctx);
    await ctx.db.patch(memberId, { status: "approved", role: role || "organizer", accessPin: accessPinValue, approvedAt: Date.now() });
    return null;
  },
});

export const generateOrganizerPin = mutation({
  args: { accessPin: v.optional(v.string()), memberId: v.id("members"), accessPinValue: v.string() },
  returns: v.null(),
  handler: async (ctx, { accessPin, memberId, accessPinValue }) => {
    if (accessPin?.trim() !== ADMIN_PIN) await requireAdmin(ctx);
    await ctx.db.patch(memberId, { accessPin: accessPinValue, role: "organizer" });
    return null;
  },
});

export const seedDemoOrganizers = mutation({
  args: { accessPin: v.optional(v.string()) },
  returns: v.array(v.object({ _id: v.id("members"), name: v.string(), accessPin: v.string(), status: v.string(), role: v.optional(v.string()), assignedEventIds: v.array(v.string()) })),
  handler: async (ctx, { accessPin }) => {
    if (accessPin?.trim() !== ADMIN_PIN) await requireAdmin(ctx);
    const events = await ctx.db.query("adminEvents").collect();
    const members = await ctx.db.query("members").collect();
    if (DEMO_ORGANIZER_PINS.length < seedDemoOrganizersList.length) throw new Error("Missing DEMO_ORGANIZER_PINS environment configuration");
    const eventIdByName = new Map<string, string>();
    for (const event of events) eventIdByName.set(normalizeText(event.name), event._id);
    const memberByEmail = new Map<string, any>();
    const memberByPin = new Map<string, any>();
    for (const member of members) {
      if (member.email) memberByEmail.set(normalizeText(member.email), member);
      if (member.accessPin) memberByPin.set(member.accessPin, member);
    }
    const output: Array<{ _id: string; name: string; accessPin: string; status: string; role?: string; assignedEventIds: string[] }> = [];
    for (const [index, seed] of seedDemoOrganizersList.entries()) {
      const accessPin = DEMO_ORGANIZER_PINS[index];
      const assignedEventIds = seed.assignedEventNames.map((eventName) => eventIdByName.get(normalizeText(eventName))).filter((eventId): eventId is string => Boolean(eventId));
      const existing = memberByEmail.get(normalizeText(seed.email)) ?? memberByPin.get(accessPin);
      const patch = { name: seed.name, email: seed.email, phone: seed.phone, status: "approved", role: "organizer", accessPin, assignedEventIds, approvedAt: Date.now(), notes: seed.notes };
      if (existing) {
        await ctx.db.patch(existing._id, patch as any);
        output.push({ _id: existing._id, name: seed.name, accessPin, status: "approved", role: "organizer", assignedEventIds });
      } else {
        const _id = await ctx.db.insert("members", patch as any);
        output.push({ _id, name: seed.name, accessPin, status: "approved", role: "organizer", assignedEventIds });
      }
    }
    return output;
  },
});