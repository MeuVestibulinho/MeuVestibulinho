export const DEFAULT_AVATAR_EMOJI = "🎯" as const;

export const AVATAR_EMOJIS = [
  "🎯",
  "🚀",
  "📚",
  "💡",
  "🧠",
  "🌟",
  "🔥",
  "⚡️",
  "🎓",
  "📈",
] as const;

export type AvatarEmoji = (typeof AVATAR_EMOJIS)[number];

export function normalizeAvatarEmoji(value: string | null | undefined): AvatarEmoji {
  return AVATAR_EMOJIS.find((emoji) => emoji === value) ?? DEFAULT_AVATAR_EMOJI;
}
