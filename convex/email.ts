"use node";

import { internalAction } from "./_generated/server";
import { v } from "convex/values";

const RESEND_API_URL = "https://api.resend.com/emails";
const DEFAULT_NOTIFICATION_EMAIL = "izanidigitalstudio@gmail.com";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function sendEmail(subject: string, html: string, replyTo?: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("Missing RESEND_API_KEY in the Convex environment.");
  }

  const response = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL ?? "Durban July VIP <onboarding@resend.dev>",
      to: [process.env.NOTIFICATION_EMAIL ?? DEFAULT_NOTIFICATION_EMAIL],
      subject,
      html,
      ...(replyTo ? { reply_to: replyTo } : {}),
    }),
  });

  const body = await response.text();
  if (!response.ok) {
    throw new Error(`Resend API error (${response.status}): ${body}`);
  }

  return body;
}

export const sendRegistrationEmail = internalAction({
  args: {
    name: v.string(),
    email: v.string(),
  },
  returns: v.null(),
  handler: async (_ctx, args) => {
    const name = escapeHtml(args.name);
    const email = escapeHtml(args.email);
    await sendEmail(
      `New Durban July VIP registration: ${args.name}`,
      `<h2>New registration</h2><p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p>`,
      args.email,
    );
    return null;
  },
});

export const sendInquiryEmail = internalAction({
  args: {
    name: v.string(),
    email: v.string(),
    phone: v.string(),
    itemType: v.string(),
    itemName: v.string(),
    guests: v.number(),
    message: v.string(),
  },
  returns: v.null(),
  handler: async (_ctx, args) => {
    await sendEmail(
      `New VIP booking inquiry: ${args.itemName}`,
      [
        "<h2>New booking inquiry</h2>",
        `<p><strong>Name:</strong> ${escapeHtml(args.name)}</p>`,
        `<p><strong>Email:</strong> ${escapeHtml(args.email)}</p>`,
        `<p><strong>Phone:</strong> ${escapeHtml(args.phone)}</p>`,
        `<p><strong>Type:</strong> ${escapeHtml(args.itemType)}</p>`,
        `<p><strong>Item:</strong> ${escapeHtml(args.itemName)}</p>`,
        `<p><strong>Guests:</strong> ${args.guests}</p>`,
        `<p><strong>Message:</strong><br>${escapeHtml(args.message || "None")}</p>`,
      ].join(""),
      args.email,
    );
    return null;
  },
});

export const sendPublicRegistrationEmail = internalAction({
  args: {
    name: v.string(),
    email: v.string(),
    phone: v.string(),
    companyName: v.string(),
    city: v.string(),
    favouriteEventType: v.string(),
    notes: v.string(),
  },
  returns: v.null(),
  handler: async (_ctx, args) => {
    await sendEmail(
      `New Durban July VIP registration: ${args.name}`,
      [
        "<h2>New public registration</h2>",
        `<p><strong>Name:</strong> ${escapeHtml(args.name)}</p>`,
        `<p><strong>Email:</strong> ${escapeHtml(args.email)}</p>`,
        `<p><strong>Phone:</strong> ${escapeHtml(args.phone || "Not supplied")}</p>`,
        `<p><strong>Company:</strong> ${escapeHtml(args.companyName || "Not supplied")}</p>`,
        `<p><strong>City:</strong> ${escapeHtml(args.city || "Not supplied")}</p>`,
        `<p><strong>Favourite event type:</strong> ${escapeHtml(args.favouriteEventType)}</p>`,
        `<p><strong>Notes:</strong><br>${escapeHtml(args.notes || "None")}</p>`,
      ].join(""),
      args.email,
    );
    return null;
  },
});
