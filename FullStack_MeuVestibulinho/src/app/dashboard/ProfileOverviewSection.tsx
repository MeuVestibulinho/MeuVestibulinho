"use client";

import * as React from "react";

import ProfileSettingsCard, { type ProfileSnapshot } from "./ProfileSettingsCard";
import type { AvatarEmoji } from "~/lib/profile";
import type { StatisticsSummary } from "~/server/api/routers/_utils/statistics";

type Props = {
  stats: StatisticsSummary | null;
  initialProfile: ProfileSnapshot;
  emojiOptions: readonly AvatarEmoji[];
  fallbackDisplayName: string;
  usernameFallbackMessage: string;
};

export default function ProfileOverviewSection({
  stats,
  initialProfile,
  emojiOptions,
  fallbackDisplayName,
  usernameFallbackMessage,
}: Props) {
  const [profile, setProfile] = React.useState<ProfileSnapshot>(initialProfile);

  React.useEffect(() => {
    setProfile(initialProfile);
  }, [initialProfile]);

  const handleProfileChange = React.useCallback((snapshot: ProfileSnapshot) => {
    setProfile(snapshot);
  }, []);

  const displayName = profile.name && profile.name.trim().length > 0
    ? profile.name
    : fallbackDisplayName;

  const usernameLabel = profile.username && profile.username.trim().length > 0
    ? `@${profile.username}`
    : usernameFallbackMessage;

  const emailLabel = profile.email && profile.email.trim().length > 0 ? profile.email : "—";

  return (
    <section className="mb-12 grid gap-6 lg:grid-cols-[minmax(0,280px)_1fr]">
      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-red-50 text-4xl">
            {profile.avatarEmoji}
          </div>
          <div className="min-w-0 space-y-1">
            <p className="break-words text-base font-semibold text-gray-900">{displayName}</p>
            <p className="break-words text-sm text-gray-500">{usernameLabel}</p>
          </div>
        </div>
        <dl className="mt-6 space-y-3 text-sm text-gray-600">
          <div className="min-w-0">
            <dt className="font-semibold text-gray-800">E-mail</dt>
            <dd className="break-words text-gray-600">{emailLabel}</dd>
          </div>
          <div className="min-w-0">
            <dt className="font-semibold text-gray-800">Simulados concluídos</dt>
            <dd className="break-words text-gray-600">{stats?.simuladosConcluidos ?? 0}</dd>
          </div>
        </dl>
      </div>
      <ProfileSettingsCard
        profile={profile}
        emojiOptions={emojiOptions}
        onProfileChange={handleProfileChange}
      />
    </section>
  );
}
