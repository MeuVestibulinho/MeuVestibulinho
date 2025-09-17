"use client";

import * as React from "react";
import { TRPCClientError } from "@trpc/client";

import { api, type RouterInputs } from "~/trpc/react";

type CreateQuestaoInput = RouterInputs["questao"]["create"];
type DisciplinaOption = CreateQuestaoInput["disciplina"];
type GrauOption = CreateQuestaoInput["grauDificuldade"];
type LetraOption = CreateQuestaoInput["alternativas"][number]["letra"];

type Props = {
  disciplinaOptions: DisciplinaOption[];
  grauOptions: GrauOption[];
  letraOptions: LetraOption[];
};

type Alt = { letra: LetraOption; texto: string; correta: boolean };

const DEFAULT_LETTERS = ["A", "B", "C", "D", "E"] as const;
const FALLBACK_LETTER = DEFAULT_LETTERS[0] as LetraOption;

export default function NewQuestionForm({
  disciplinaOptions,
  grauOptions,
  letraOptions,
}: Props) {
  const utils = api.useUtils();
  const createQuestao = api.questao.create.useMutation({
    onSuccess: () => {
      void utils.questao.list.invalidate();
      void utils.questao.recent.invalidate();
    },
  });

  const letters = React.useMemo<LetraOption[]>(() => {
    const all = [...letraOptions, ...(DEFAULT_LETTERS as readonly LetraOption[])];
    return Array.from(new Set(all));
  }, [letraOptions]);

  const makeInitialAlternatives = React.useCallback((): Alt[] => {
    const first = letters[0] ?? FALLBACK_LETTER;
    const second = letters[1] ?? first;
    return [
      { letra: first, texto: "", correta: false },
      { letra: second, texto: "", correta: false },
    ];
  }, [letters]);

  const [enunciado, setEnunciado] = React.useState("");
  const [disciplina, setDisciplina] = React.useState<DisciplinaOption>(
    disciplinaOptions[0] ?? ("PORTUGUES" as DisciplinaOption),
  );
  const [grau, setGrau] = React.useState<GrauOption>(
    grauOptions[0] ?? ("MEDIO" as GrauOption),
  );
  const [ano, setAno] = React.useState<string>("");
  const [fonteUrl, setFonteUrl] = React.useState("");
  const [imagemUrl, setImagemUrl] = React.useState("");
  const [alternativas, setAlternativas] = React.useState<Alt[]>(() => makeInitialAlternatives());
  const [msg, setMsg] = React.useState<string | null>(null);
  const [err, setErr] = React.useState<string | null>(null);

  React.useEffect(() => {
    setAlternativas((prev) => {
      if (prev.length >= 2 && prev.every((alt) => letters.includes(alt.letra))) {
        return prev;
      }
      return makeInitialAlternatives();
    });
  }, [letters, makeInitialAlternatives]);

  function setAlt(idx: number, patch: Partial<Alt>) {
    setAlternativas((prev) => {
      const current = prev[idx];
      if (!current) return prev;
      const nextAlt: Alt = {
        letra: patch.letra ?? current.letra,
        texto: typeof patch.texto === "string" ? patch.texto : current.texto,
        correta: typeof patch.correta === "boolean" ? patch.correta : current.correta,
      };
      const next = [...prev];
      next[idx] = nextAlt;
      return next;
    });
  }

  function addAlt() {
    setAlternativas((prev) => {
      if (prev.length >= 5) return prev;
      const used = new Set<LetraOption>(prev.map((a) => a.letra));
      const nextLetter = letters.find((l) => !used.has(l)) ?? letters[0] ?? FALLBACK_LETTER;
      return [...prev, { letra: nextLetter, texto: "", correta: false }];
    });
  }

  function rmAlt(idx: number) {
    setAlternativas((prev) => (prev.length <= 2 ? prev : prev.filter((_, i) => i !== idx)));
  }

  function markAsCorrect(idx: number) {
    setAlternativas((prev) => prev.map((a, i) => ({ ...a, correta: i === idx })));
  }

  function lettersForIndex(idx: number) {
    const usedByOthers = new Set<LetraOption>(
      alternativas.filter((_, i) => i !== idx).map((a) => a.letra),
    );
    const self = alternativas[idx]?.letra;
    return letters.filter((l) => l === self || !usedByOthers.has(l));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setErr(null);

    const enun = enunciado.trim();
    if (enun.length < 10) {
      setErr("Enunciado muito curto (mín. 10 caracteres).");
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

    const normalizedFonteUrl = fonteUrl.trim();
    const normalizedImagemUrl = imagemUrl.trim();

    const payload: CreateQuestaoInput = {
      enunciado: enun,
      disciplina,
      grauDificuldade: grau,
      ano: anoNum,
      fonteUrl: normalizedFonteUrl === "" ? undefined : normalizedFonteUrl,
      imagemUrl: normalizedImagemUrl === "" ? undefined : normalizedImagemUrl,
      alternativas: alternativas.map((a) => ({
        letra: a.letra,
        texto: a.texto.trim(),
        correta: a.correta,
      })),
    };

    try {
      await createQuestao.mutateAsync(payload);
      setMsg("Questão criada!");
      setEnunciado("");
      setAno("");
      setFonteUrl("");
      setImagemUrl("");
      setAlternativas(makeInitialAlternatives());
    } catch (error) {
      if (error instanceof TRPCClientError) {
        setErr(error.message);
        return;
      }
      setErr("Erro inesperado. Tente novamente.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {msg && <div className="rounded-md bg-green-50 p-3 text-green-700">{msg}</div>}
      {err && <div className="rounded-md bg-red-50 p-3 text-red-700">{err}</div>}

      <div className="space-y-1">
        <label className="block text-sm font-medium">Enunciado</label>
        <textarea
          className="w-full rounded-md border p-2"
          rows={4}
          value={enunciado}
          onChange={(e) => setEnunciado(e.target.value)}
          placeholder="Digite o enunciado da questão"
          required
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="space-y-1">
          <label className="block text-sm font-medium">Disciplina</label>
          <select
            className="w-full rounded-md border p-2"
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

        <div className="space-y-1">
          <label className="block text-sm font-medium">Dificuldade</label>
          <select
            className="w-full rounded-md border p-2"
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

        <div className="space-y-1">
          <label className="block text-sm font-medium">Ano</label>
          <input
            type="number"
            className="w-full rounded-md border p-2"
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

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="block text-sm font-medium">Fonte (URL)</label>
          <input
            type="url"
            className="w-full rounded-md border p-2"
            value={fonteUrl}
            onChange={(e) => setFonteUrl(e.target.value)}
            placeholder="https://..."
          />
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium">Imagem (URL)</label>
          <input
            type="url"
            className="w-full rounded-md border p-2"
            value={imagemUrl}
            onChange={(e) => setImagemUrl(e.target.value)}
            placeholder="https://..."
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-sm font-medium">Alternativas</div>

        {alternativas.map((alt, idx) => {
          const options = lettersForIndex(idx);
          return (
            <div key={`alt-${idx}`} className="flex items-start gap-2">
              <select
                className="rounded-md border p-2"
                value={alt.letra}
                onChange={(e) => setAlt(idx, { letra: e.target.value as LetraOption })}
              >
                {options.map((l, i) => (
                  <option key={`opt-${l}-${i}`} value={l}>
                    {l}
                  </option>
                ))}
              </select>

              <input
                className="flex-1 rounded-md border p-2"
                placeholder={`Texto da alternativa ${alt.letra}`}
                value={alt.texto}
                onChange={(e) => setAlt(idx, { texto: e.target.value })}
                required
              />

              <label className="flex items-center gap-1 text-sm">
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
                className="rounded-md border px-2 py-1 text-sm hover:bg-gray-50 disabled:opacity-50"
                title="Remover alternativa"
                disabled={alternativas.length <= 2}
              >
                Remover
              </button>
            </div>
          );
        })}

        <button
          type="button"
          onClick={addAlt}
          disabled={alternativas.length >= 5}
          className="rounded-md border px-3 py-1 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          + Adicionar alternativa
        </button>
      </div>

      <div>
        <button
          type="submit"
          disabled={createQuestao.isPending}
          className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {createQuestao.isPending ? "Salvando..." : "Salvar questão"}
        </button>
      </div>
    </form>
  );
}
