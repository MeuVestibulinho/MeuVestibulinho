"use client";

import * as React from "react";
import clsx from "clsx";

import { api } from "~/trpc/react";
import type { AvatarEmoji } from "~/lib/profile";

type ProfileSnapshot = {
  name: string | null;
  email: string | null;
  username: string | null;
  avatarEmoji: AvatarEmoji;
};

type Props = {
  profile: ProfileSnapshot;
  emojiOptions: readonly AvatarEmoji[];
};

type FieldErrors = Partial<{
  name: string;
  username: string;
  avatarEmoji: string;
}>;

export default function ProfileSettingsCard({
  profile,
  emojiOptions,
}: Props) {
  const utils = api.useUtils();
  const [name, setName] = React.useState(profile.name ?? "");
  const [username, setUsername] = React.useState(profile.username ?? "");
  const [avatar, setAvatar] = React.useState<AvatarEmoji>(profile.avatarEmoji);
  const [feedback, setFeedback] = React.useState<
    { type: "success" | "error"; message: string } | null
  >(null);
  const [fieldErrors, setFieldErrors] = React.useState<FieldErrors>({});

  const updateProfile = api.profile.update.useMutation({
    onMutate: () => {
      setFeedback(null);
      setFieldErrors({});
    },
    onSuccess: (data) => {
      setName(data.name ?? "");
      setUsername(data.username ?? "");
      setAvatar(data.avatarEmoji);
      setFeedback({
        type: "success",
        message: "Preferências atualizadas com sucesso!",
      });
      void utils.profile.getCurrent.invalidate();
    },
    onError: (error) => {
      const zodError = error.data?.zodError?.fieldErrors;
      if (zodError) {
        setFieldErrors({
          name: zodError.name?.[0],
          username: zodError.username?.[0],
          avatarEmoji: zodError.avatarEmoji?.[0],
        });
        setFeedback({
          type: "error",
          message: "Não foi possível salvar. Verifique os campos destacados.",
        });
        return;
      }

      setFeedback({
        type: "error",
        message:
          error.message ?? "Não foi possível salvar suas preferências.",
      });
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = name.trim();
    const trimmedUsername = username.trim();

    updateProfile.mutate({
      name: trimmedName,
      username: trimmedUsername,
      avatarEmoji: avatar,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm"
    >
      <div>
        <h2 className="text-lg font-semibold text-gray-900">
          Preferências do perfil
        </h2>
        <p className="text-sm text-gray-500">
          Personalize como você aparece no Meu Espaço e nos simulados.
        </p>
      </div>

      <div className="grid gap-4">
        <label className="space-y-1 text-sm text-gray-600">
          <span className="font-medium text-gray-900">Nome para exibição</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Como deseja ser chamado(a)?"
            className={clsx(
              "w-full rounded-xl border px-4 py-2 text-sm shadow-sm focus:border-red-300 focus:outline-none focus:ring-1 focus:ring-red-300",
              fieldErrors.name &&
                "border-red-300 focus:border-red-300 focus:ring-red-200",
            )}
          />
          {fieldErrors.name ? (
            <span className="text-xs text-red-600">{fieldErrors.name}</span>
          ) : (
            <span className="text-xs text-gray-400">
              Opcional. Máximo de 80 caracteres.
            </span>
          )}
        </label>

        <label className="space-y-1 text-sm text-gray-600">
          <span className="font-medium text-gray-900">Nome de usuário</span>
          <input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="ex: estudante2025"
            className={clsx(
              "w-full rounded-xl border px-4 py-2 text-sm shadow-sm focus:border-red-300 focus:outline-none focus:ring-1 focus:ring-red-300",
              fieldErrors.username &&
                "border-red-300 focus:border-red-300 focus:ring-red-200",
            )}
          />
          {fieldErrors.username ? (
            <span className="text-xs text-red-600">
              {fieldErrors.username}
            </span>
          ) : (
            <span className="text-xs text-gray-400">
              Entre 3 e 24 caracteres. Use letras, números, pontos, hífen ou
              underline.
            </span>
          )}
        </label>

        <label className="space-y-1 text-sm text-gray-600">
          <span className="font-medium text-gray-900">E-mail cadastrado</span>
          <input
            value={profile.email ?? "—"}
            readOnly
            className="w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-600 shadow-inner"
          />
        </label>

        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-900">Escolha um emoji</p>
          <div className="grid grid-cols-5 gap-2 sm:grid-cols-6">
            {emojiOptions.map((emoji) => {
              const isActive = emoji === avatar;
              return (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setAvatar(emoji)}
                  className={clsx(
                    "flex h-12 items-center justify-center rounded-2xl border text-xl transition",
                    isActive
                      ? "border-red-300 bg-red-50 shadow-sm"
                      : "border-gray-200 bg-white hover:border-red-200 hover:bg-red-50",
                  )}
                  aria-pressed={isActive}
                >
                  {emoji}
                </button>
              );
            })}
          </div>
          {fieldErrors.avatarEmoji && (
            <span className="text-xs text-red-600">
              {fieldErrors.avatarEmoji}
            </span>
          )}
        </div>
      </div>

      {feedback && (
        <p
          className={clsx(
            "rounded-xl px-4 py-2 text-sm",
            feedback.type === "success"
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700",
          )}
        >
          {feedback.message}
        </p>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={updateProfile.isPending}
          className={clsx(
            "inline-flex items-center justify-center rounded-full px-6 py-2 text-sm font-semibold transition",
            updateProfile.isPending
              ? "cursor-not-allowed border border-gray-200 bg-gray-100 text-gray-400"
              : "border border-red-200 bg-red-500/10 text-red-700 hover:border-red-300 hover:bg-red-500/20",
          )}
        >
          {updateProfile.isPending ? "Salvando..." : "Salvar alterações"}
        </button>
      </div>
    </form>
  );
}
