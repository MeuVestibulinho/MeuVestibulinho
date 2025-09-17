import { TRPCError } from "@trpc/server";
import type { Prisma } from "@prisma/client";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { AVATAR_EMOJIS, normalizeAvatarEmoji } from "~/lib/profile";

const usernameSchema = z
  .string()
  .trim()
  .max(24, "Use no máximo 24 caracteres.")
  .superRefine((value, ctx) => {
    if (value === "") {
      return;
    }

    if (value.length < 3) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Use pelo menos 3 caracteres.",
      });
    }

    if (!/^[a-z0-9._-]+$/i.test(value)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Use apenas letras, números, pontos, hífen ou underline.",
      });
    }
  })
  .transform((value) => {
    const trimmed = value.trim();
    return trimmed === "" ? null : trimmed.toLowerCase();
  });

const displayNameSchema = z
  .string()
  .trim()
  .max(80, "Use no máximo 80 caracteres.")
  .transform((value) => (value === "" ? null : value))
  .optional();

const updateProfileInput = z.object({
  name: displayNameSchema,
  username: usernameSchema.optional(),
  avatarEmoji: z.enum(AVATAR_EMOJIS),
});

export const profileRouter = createTRPCRouter({
  getCurrent: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        avatarEmoji: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Usuário não encontrado." });
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
      avatarEmoji: normalizeAvatarEmoji(user.avatarEmoji),
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    } as const;
  }),

  update: protectedProcedure.input(updateProfileInput).mutation(async ({ ctx, input }) => {
    const userId = ctx.session.user.id;
    const username = input.username;

    if (typeof username !== "undefined" && username) {
      const existing = await ctx.db.user.findFirst({
        where: { username, NOT: { id: userId } },
        select: { id: true },
      });

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Este nome de usuário já está em uso.",
        });
      }
    }

    const data: Prisma.UserUpdateInput = {
      avatarEmoji: input.avatarEmoji,
    };

    if (typeof input.name !== "undefined") {
      data.name = input.name;
    }

    if (typeof username !== "undefined") {
      data.username = username;
    }

    const updated = await ctx.db.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        avatarEmoji: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      username: updated.username,
      avatarEmoji: normalizeAvatarEmoji(updated.avatarEmoji),
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    } as const;
  }),
});
