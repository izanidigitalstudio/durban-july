import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password({
      profile(params) {
        return {
          email: String(params.email).trim().toLowerCase(),
          name: typeof params.name === "string" ? params.name.trim() : undefined,
        };
      },
    }),
  ],
  callbacks: {
    async afterUserCreatedOrUpdated(ctx, args) {
      if (args.existingUserId !== null || typeof args.profile.email !== "string") {
        return;
      }

      await ctx.scheduler.runAfter(0, internal.email.sendRegistrationEmail, {
        name: typeof args.profile.name === "string" ? args.profile.name : "VIP Member",
        email: args.profile.email,
      });
    },
  },
});
