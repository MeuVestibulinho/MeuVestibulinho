"use client";

import * as React from "react";
import { TRPCClientError } from "@trpc/client";

import { api, type RouterInputs } from "~/trpc/react";

const DEFAULT_LETTERS = ["A", "B", "C", "D", "E"] as const;

export type CreateQuestaoInput = RouterInputs["questao"]["create"];
export type DisciplinaOption = CreateQuestaoInput["disciplina"];
export type GrauOption = CreateQuestaoInput["grauDificuldade"];
export type LetraOption = CreateQuestaoInput["alternativas"][number]["letra"];

export type QuestaoFormAlternativa = {
  letra: LetraOption;
  texto: string;
  correta: boolean;
};

export type QuestaoFormInitialValues = {
  enunciado: string;
  disciplina: DisciplinaOption;
  grauDificuldade: GrauOption;
  ano: number | null;
  fonteUrl: string | null;
  imagemUrl: string | null;
  habilidades: string;
  conteudo: string;
  subconteudo: string;
  alternativas: QuestaoFormAlternativa[];
};

export type QuestaoFormSubmitPayload = Omit<CreateQuestaoInput, "alternativas"> & {
  alternativas: CreateQuestaoInput["alternativas"];
};

type QuestionFormProps = {
  initialValues: QuestaoFormInitialValues;
  disciplinaOptions: DisciplinaOption[];
  grauOptions: GrauOption[];
  letraOptions: LetraOption[];
  onSubmit: (payload: QuestaoFormSubmitPayload) => Promise<void>;
  submitLabel: string;
  isSubmitting: boolean;
  successMessage?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  resetAfterSubmit?: boolean;
};

function normalizeAlternatives(
  alternativas: QuestaoFormAlternativa[] | undefined,
  letters: readonly LetraOption[],
): QuestaoFormAlternativa[] {
  if (!alternativas || alternativas.length < 2) {
    const first = letters[0] ?? letters[letters.length - 1] ?? ("A" as LetraOption);
    const second = letters[1] ?? first;
    return [
      { letra: first, texto: "", correta: false },
      { letra: second, texto: "", correta: false },
    ];
  }

  return alternativas.map((alt, index) => {
    const fallbackLetter =
      letters[index % letters.length] ?? letters[0] ?? DEFAULT_LETTERS[0];

    return {
      letra: alt.letra ?? fallbackLetter,
      texto: alt.texto ?? "",
      correta: Boolean(alt.correta),
    };
  });
}

function buildLetters(baseLetters: LetraOption[]): LetraOption[] {
  const seen = new Set<LetraOption>();
  const merged = [...baseLetters, ...(DEFAULT_LETTERS as readonly LetraOption[])];
  const unique: LetraOption[] = [];
  for (const letter of merged) {
    if (!seen.has(letter)) {
      seen.add(letter);
      unique.push(letter);
    }
  }
  return unique;
}

function toStringOrEmpty(value: string | null | undefined): string {
  return value?.trim() ?? "";
}

function formatAno(value: number | null | undefined): string {
  return typeof value === "number" && Number.isFinite(value) ? String(value) : "";
}

function sanitizeUrl(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}

export function useInvalidateQuestoes() {
  const utils = api.useUtils();
  return React.useCallback(async () => {
    await Promise.all([
      utils.questao.list.invalidate(),
      utils.questao.recent.invalidate(),
    ]);
  }, [utils.questao.list, utils.questao.recent]);
}

export default function QuestionForm({
  initialValues,
  disciplinaOptions,
  grauOptions,
  letraOptions,
  onSubmit,
  submitLabel,
  isSubmitting,
  successMessage = "Operação realizada com sucesso!",
  onSuccess,
  onCancel,
  resetAfterSubmit = false,
}: QuestionFormProps) {
  const letters = React.useMemo(() => buildLetters(letraOptions), [letraOptions]);

  const normalizedInitial = React.useMemo(() => {
    return {
      enunciado: initialValues.enunciado ?? "",
      disciplina: initialValues.disciplina,
      grauDificuldade: initialValues.grauDificuldade,
      ano: formatAno(initialValues.ano),
      fonteUrl: toStringOrEmpty(initialValues.fonteUrl),
      imagemUrl: toStringOrEmpty(initialValues.imagemUrl),
      habilidades: initialValues.habilidades ?? "",
      conteudo: initialValues.conteudo ?? "",
      subconteudo: initialValues.subconteudo ?? "",
      alternativas: normalizeAlternatives(initialValues.alternativas, letters),
    };
  }, [initialValues, letters]);

  const [enunciado, setEnunciado] = React.useState(normalizedInitial.enunciado);
  const [disciplina, setDisciplina] = React.useState<DisciplinaOption>(
    normalizedInitial.disciplina,
  );
  const [grau, setGrau] = React.useState<GrauOption>(normalizedInitial.grauDificuldade);
  const [ano, setAno] = React.useState(normalizedInitial.ano);
  const [fonteUrl, setFonteUrl] = React.useState(normalizedInitial.fonteUrl);
  const [imagemUrl, setImagemUrl] = React.useState(normalizedInitial.imagemUrl);
  const [habilidades, setHabilidades] = React.useState(normalizedInitial.habilidades);
  const [conteudo, setConteudo] = React.useState(normalizedInitial.conteudo);
  const [subconteudo, setSubconteudo] = React.useState(normalizedInitial.subconteudo);
  const [alternativas, setAlternativas] = React.useState<QuestaoFormAlternativa[]>(
    normalizedInitial.alternativas,
  );
  const [msg, setMsg] = React.useState<string | null>(null);
  const [err, setErr] = React.useState<string | null>(null);

  React.useEffect(() => {
    setEnunciado(normalizedInitial.enunciado);
    setDisciplina(normalizedInitial.disciplina);
    setGrau(normalizedInitial.grauDificuldade);
    setAno(normalizedInitial.ano);
    setFonteUrl(normalizedInitial.fonteUrl);
    setImagemUrl(normalizedInitial.imagemUrl);
    setHabilidades(normalizedInitial.habilidades);
    setConteudo(normalizedInitial.conteudo);
    setSubconteudo(normalizedInitial.subconteudo);
    setAlternativas(normalizedInitial.alternativas);
    setMsg(null);
    setErr(null);
  }, [normalizedInitial]);

  const lettersForIndex = React.useCallback(
    (idx: number) => {
      const usedByOthers = new Set<LetraOption>(
        alternativas.filter((_, i) => i !== idx).map((a) => a.letra),
      );
      const self = alternativas[idx]?.letra;
      return letters.filter((l) => l === self || !usedByOthers.has(l));
    },
    [alternativas, letters],
  );

  const setAlt = React.useCallback(
    (idx: number, patch: Partial<QuestaoFormAlternativa>) => {
      setAlternativas((prev) => {
        const current = prev[idx];
        if (!current) return prev;
        const nextAlt: QuestaoFormAlternativa = {
          letra: patch.letra ?? current.letra,
          texto:
            typeof patch.texto === "string" ? patch.texto : current.texto,
          correta:
            typeof patch.correta === "boolean" ? patch.correta : current.correta,
        };
        const next = [...prev];
        next[idx] = nextAlt;
        return next;
      });
    },
    [],
  );

  const addAlt = React.useCallback(() => {
    setAlternativas((prev) => {
      if (prev.length >= 5) return prev;
      const used = new Set<LetraOption>(prev.map((a) => a.letra));
      const nextLetter = letters.find((l) => !used.has(l)) ?? letters[0];
      return [...prev, { letra: nextLetter ?? ("A" as LetraOption), texto: "", correta: false }];
    });
  }, [letters]);

  const rmAlt = React.useCallback((idx: number) => {
    setAlternativas((prev) => {
      if (prev.length <= 2) return prev;
      return prev.filter((_, i) => i !== idx);
    });
  }, []);

  const markAsCorrect = React.useCallback((idx: number) => {
    setAlternativas((prev) => prev.map((a, i) => ({ ...a, correta: i === idx })));
  }, []);

  const handleSubmit = React.useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setMsg(null);
      setErr(null);

      const trimmedEnunciado = enunciado.trim();
      if (trimmedEnunciado.length < 10) {
        setErr("Enunciado muito curto (mín. 10 caracteres).");
        return;
      }

      const trimmedHabilidades = habilidades.trim();
      const trimmedConteudo = conteudo.trim();
      const trimmedSubconteudo = subconteudo.trim();

      if (trimmedHabilidades.length < 3) {
        setErr("Informe as habilidades necessárias.");
        return;
      }

      if (trimmedConteudo.length < 3) {
        setErr("Informe o conteúdo principal.");
        return;
      }

      if (trimmedSubconteudo.length < 3) {
        setErr("Informe o subconteúdo.");
        return;
      }

      if (alternativas.length < 2) {
        setErr("Inclua pelo menos 2 alternativas.");
        return;
      }

      const textsOK = alternativas.every((a) => a.texto.trim().length > 0);
      if (!textsOK) {
        setErr("Todas as alternativas devem ter texto.");
        return;
      }

      const lettersSet = new Set(alternativas.map((a) => a.letra));
      if (lettersSet.size !== alternativas.length) {
        setErr("Não repita letras nas alternativas.");
        return;
      }

      if (!alternativas.some((a) => a.correta)) {
        setErr("Marque pelo menos uma alternativa como correta.");
        return;
      }

      let anoNum: number | undefined;
      const trimmedAno = ano.trim();
      if (trimmedAno !== "") {
        const parsed = Number.parseInt(trimmedAno, 10);
        if (!Number.isFinite(parsed) || parsed < 1900 || parsed > 2100) {
          setErr("Ano inválido. Use um valor entre 1900 e 2100.");
          return;
        }
        anoNum = parsed;
      }

      const payload: QuestaoFormSubmitPayload = {
        enunciado: trimmedEnunciado,
        disciplina,
        grauDificuldade: grau,
        ano: anoNum,
        fonteUrl: sanitizeUrl(fonteUrl),
        imagemUrl: sanitizeUrl(imagemUrl),
        habilidades: trimmedHabilidades,
        conteudo: trimmedConteudo,
        subconteudo: trimmedSubconteudo,
        alternativas: alternativas.map((a) => ({
          letra: a.letra,
          texto: a.texto.trim(),
          correta: a.correta,
        })),
      };

      try {
        await onSubmit(payload);
        setMsg(successMessage);
        if (resetAfterSubmit) {
          setEnunciado(normalizedInitial.enunciado);
          setDisciplina(normalizedInitial.disciplina);
          setGrau(normalizedInitial.grauDificuldade);
          setAno(normalizedInitial.ano);
          setFonteUrl(normalizedInitial.fonteUrl);
          setImagemUrl(normalizedInitial.imagemUrl);
          setHabilidades(normalizedInitial.habilidades);
          setConteudo(normalizedInitial.conteudo);
          setSubconteudo(normalizedInitial.subconteudo);
          setAlternativas(normalizedInitial.alternativas);
        }
        onSuccess?.();
      } catch (error) {
        if (error instanceof TRPCClientError) {
          setErr(error.message);
          return;
        }
        setErr("Erro inesperado. Tente novamente.");
      }
    },
    [
      alternativas,
      ano,
      conteudo,
      disciplina,
      enunciado,
      fonteUrl,
      grau,
      habilidades,
      imagemUrl,
      normalizedInitial,
      onSubmit,
      onSuccess,
      resetAfterSubmit,
      subconteudo,
      successMessage,
    ],
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {msg && <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">{msg}</div>}
      {err && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{err}</div>}

      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700">Enunciado</label>
        <textarea
          className="w-full rounded-lg border border-gray-200 bg-white/90 p-3 text-sm shadow-sm focus:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-200"
          rows={4}
          value={enunciado}
          onChange={(e) => setEnunciado(e.target.value)}
          placeholder="Digite o enunciado completo da questão"
          required
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">Disciplina</label>
          <select
            className="w-full rounded-lg border border-gray-200 bg-white/90 p-2 text-sm shadow-sm focus:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-200"
            value={disciplina}
            onChange={(e) => setDisciplina(e.target.value as DisciplinaOption)}
          >
            {disciplinaOptions.map((d) => (
              <option key={`d-${d}`} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">Dificuldade</label>
          <select
            className="w-full rounded-lg border border-gray-200 bg-white/90 p-2 text-sm shadow-sm focus:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-200"
            value={grau}
            onChange={(e) => setGrau(e.target.value as GrauOption)}
          >
            {grauOptions.map((g) => (
              <option key={`g-${g}`} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">Ano</label>
          <input
            type="number"
            className="w-full rounded-lg border border-gray-200 bg-white/90 p-2 text-sm shadow-sm focus:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-200"
            value={ano}
            onChange={(e) => setAno(e.target.value)}
            min={1900}
            max={2100}
            placeholder="2024"
            inputMode="numeric"
            pattern="[0-9]*"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">Fonte (URL)</label>
          <input
            type="url"
            className="w-full rounded-lg border border-gray-200 bg-white/90 p-2 text-sm shadow-sm focus:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-200"
            value={fonteUrl}
            onChange={(e) => setFonteUrl(e.target.value)}
            placeholder="https://..."
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">Imagem (URL)</label>
          <input
            type="url"
            className="w-full rounded-lg border border-gray-200 bg-white/90 p-2 text-sm shadow-sm focus:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-200"
            value={imagemUrl}
            onChange={(e) => setImagemUrl(e.target.value)}
            placeholder="https://..."
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="space-y-2 md:col-span-1">
          <label className="block text-sm font-semibold text-gray-700">Habilidades necessárias</label>
          <textarea
            className="h-24 w-full rounded-lg border border-gray-200 bg-white/90 p-3 text-sm shadow-sm focus:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-200"
            value={habilidades}
            onChange={(e) => setHabilidades(e.target.value)}
            placeholder="Ex.: interpretação de texto, análise de gráficos"
            required
          />
        </div>
        <div className="space-y-2 md:col-span-1">
          <label className="block text-sm font-semibold text-gray-700">Conteúdo principal</label>
          <textarea
            className="h-24 w-full rounded-lg border border-gray-200 bg-white/90 p-3 text-sm shadow-sm focus:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-200"
            value={conteudo}
            onChange={(e) => setConteudo(e.target.value)}
            placeholder="Ex.: porcentagem, funções do 1º grau"
            required
          />
        </div>
        <div className="space-y-2 md:col-span-1">
          <label className="block text-sm font-semibold text-gray-700">Subconteúdo</label>
          <textarea
            className="h-24 w-full rounded-lg border border-gray-200 bg-white/90 p-3 text-sm shadow-sm focus:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-200"
            value={subconteudo}
            onChange={(e) => setSubconteudo(e.target.value)}
            placeholder="Ex.: regra de três simples, leitura de tabelas"
            required
          />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-700">Alternativas</span>
          <button
            type="button"
            onClick={addAlt}
            disabled={alternativas.length >= 5}
            className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-1 text-sm font-medium text-red-600 transition hover:border-red-300 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            + Adicionar alternativa
          </button>
        </div>

        <div className="space-y-3">
          {alternativas.map((alt, idx) => {
            const options = lettersForIndex(idx);
            return (
              <div
                key={`alt-${idx}`}
                className="rounded-xl border border-gray-200 bg-white/80 p-3 shadow-sm transition hover:border-red-200"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                  <select
                    className="rounded-lg border border-gray-200 bg-white p-2 text-sm shadow-sm focus:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-200"
                    value={alt.letra}
                    onChange={(e) => setAlt(idx, { letra: e.target.value as LetraOption })}
                  >
                    {options.map((l) => (
                      <option key={`opt-${l}`} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>

                  <input
                    className="flex-1 rounded-lg border border-gray-200 bg-white p-2 text-sm shadow-sm focus:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-200"
                    placeholder={`Texto da alternativa ${alt.letra}`}
                    value={alt.texto}
                    onChange={(e) => setAlt(idx, { texto: e.target.value })}
                    required
                  />

                  <label className="flex items-center gap-2 text-xs font-medium text-gray-700">
                    <input
                      type="radio"
                      name="correta"
                      checked={alt.correta}
                      onChange={() => markAsCorrect(idx)}
                    />
                    correta
                  </label>

                  <button
                    type="button"
                    onClick={() => rmAlt(idx)}
                    className="text-xs font-medium text-gray-500 transition hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                    title="Remover alternativa"
                    disabled={alternativas.length <= 2}
                  >
                    Remover
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition hover:border-gray-300 hover:bg-gray-50"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center rounded-lg bg-red-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300 disabled:opacity-60"
        >
          {isSubmitting ? "Salvando..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
