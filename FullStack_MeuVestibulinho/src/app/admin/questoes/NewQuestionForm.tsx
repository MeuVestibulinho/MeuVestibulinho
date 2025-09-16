"use client";

import * as React from "react";

type Props = {
  disciplinaOptions: string[];
  grauOptions: string[];
  letraOptions: string[]; // ex.: ["A","B","C","D","E"]
};

type Alt = { letra: string; texto: string; correta: boolean };

const DEFAULT_LETTERS = ["A", "B", "C", "D", "E"];

// ---------- helpers p/ tratar respostas sem usar any ----------
type ApiErrorJson = { error?: string; issues?: unknown };
function isApiErrorJson(x: unknown): x is ApiErrorJson {
  return typeof x === "object" && x !== null && ("error" in x || "issues" in x);
}

export default function NewQuestionForm({
  disciplinaOptions,
  grauOptions,
  letraOptions,
}: Props) {
  // ---- opções seguras (fallback + dedupe) ----
  const letters = React.useMemo(() => {
    const uniq = new Set([...letraOptions, ...DEFAULT_LETTERS].filter(Boolean));
    return Array.from(uniq);
  }, [letraOptions]);

  // ---- estados do form ----
  const [enunciado, setEnunciado] = React.useState("");
  const [disciplina, setDisciplina] = React.useState(disciplinaOptions[0] ?? "");
  const [grau, setGrau] = React.useState(grauOptions[0] ?? "");
  const [ano, setAno] = React.useState<string>(""); // string para evitar NaN
  const [fonteUrl, setFonteUrl] = React.useState("");
  const [imagemUrl, setImagemUrl] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [msg, setMsg] = React.useState<string | null>(null);
  const [err, setErr] = React.useState<string | null>(null);

  // começa com 2 alternativas
  const initialAlts: Alt[] = [
    { letra: letters[0] ?? "A", texto: "", correta: false },
    { letra: letters[1] ?? "B", texto: "", correta: false },
  ];
  const [alternativas, setAlternativas] = React.useState<Alt[]>(initialAlts);

  // ------- utilidades -------
  function setAlt(idx: number, patch: Partial<Alt>) {
    setAlternativas((prev) => {
      const cur = prev[idx];
      if (!cur) return prev;
      // garante Alt completo (sem undefined)
      const nextAlt: Alt = {
        letra: typeof patch.letra === "string" ? patch.letra : cur.letra,
        texto: typeof patch.texto === "string" ? patch.texto : cur.texto,
        correta: typeof patch.correta === "boolean" ? patch.correta : cur.correta,
      };
      const next = [...prev];
      next[idx] = nextAlt;
      return next;
    });
  }

  function addAlt() {
    setAlternativas((prev) => {
      if (prev.length >= 5) return prev;
      const used = new Set(prev.map((a) => a.letra));
      const nextLetter = letters.find((l) => !used.has(l)) ?? letters[0] ?? "A";
      return [...prev, { letra: nextLetter, texto: "", correta: false }];
    });
  }

  function rmAlt(idx: number) {
    setAlternativas((prev) => (prev.length <= 2 ? prev : prev.filter((_, i) => i !== idx)));
  }

  // garante somente uma correta (ajuste se quiser múltiplas)
  function markAsCorrect(idx: number) {
    setAlternativas((prev) => prev.map((a, i) => ({ ...a, correta: i === idx })));
  }

  // letras para UM item (mantém a sua própria; evita chaves duplicadas)
  function lettersForIndex(idx: number) {
    const usedByOthers = new Set(
      alternativas.filter((_, i) => i !== idx).map((a) => a.letra),
    );
    const self = alternativas[idx]?.letra;
    return letters.filter((l) => l === self || !usedByOthers.has(l));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    setErr(null);

    // ---- validações de UX no cliente (falhar cedo) ----
    const enun = enunciado.trim();
    if (enun.length < 10) {
      setErr("Enunciado muito curto (mín. 10 caracteres).");
      setSaving(false);
      return;
    }

    if (alternativas.length < 2) {
      setErr("Inclua pelo menos 2 alternativas.");
      setSaving(false);
      return;
    }

    const textsOK = alternativas.every((a) => a.texto.trim().length > 0);
    if (!textsOK) {
      setErr("Todas as alternativas devem ter texto.");
      setSaving(false);
      return;
    }

    const lettersSet = new Set(alternativas.map((a) => a.letra));
    if (lettersSet.size !== alternativas.length) {
      setErr("Não repita letras nas alternativas.");
      setSaving(false);
      return;
    }

    if (!alternativas.some((a) => a.correta)) {
      setErr("Marque pelo menos uma alternativa como correta.");
      setSaving(false);
      return;
    }

    // ano: string -> number | undefined + faixa
    let anoNum: number | undefined = undefined;
    const trimmedAno = ano.trim();
    if (trimmedAno !== "") {
      const parsed = Number.parseInt(trimmedAno, 10);
      if (!Number.isFinite(parsed) || parsed < 1900 || parsed > 2100) {
        setErr("Ano inválido. Use um valor entre 1900 e 2100.");
        setSaving(false);
        return;
      }
      anoNum = parsed;
    }

    // ---- payload ----
    const payload = {
      enunciado: enun,
      disciplina,
      grauDificuldade: grau,
      ano: anoNum,
      fonteUrl: fonteUrl.trim() || undefined,
      imagemUrl: imagemUrl.trim() || undefined,
      alternativas: alternativas.map((a) => ({
        letra: a.letra,
        texto: a.texto.trim(),
        correta: a.correta,
      })),
    };

    try {
      const res = await fetch("/api/questoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // envia o cookie da sessão
        body: JSON.stringify(payload),
      });

      // parse seguro do body (sem any)
      const isJson = (res.headers.get("content-type") ?? "").includes("application/json");
      let body: unknown;
      try {
        body = isJson ? await res.json() : await res.text();
      } catch {
        // fallback se o servidor disser JSON mas vier inválido
        body = await res.text();
      }

      if (!res.ok) {
        const msg =
          typeof body === "string"
            ? body
            : isApiErrorJson(body) && typeof body.error === "string"
              ? body.error
              : "Falha ao criar. Verifique os campos (mín. 2 alternativas e 1 correta).";
        setErr(msg);
        setSaving(false);
        return;
      }

      setMsg("Questão criada!");
      // limpa, mantendo disciplina/grau
      setEnunciado("");
      setAno("");
      setFonteUrl("");
      setImagemUrl("");
      setAlternativas(initialAlts);
    } catch {
      setErr("Erro inesperado. Tente novamente.");
    } finally {
      setSaving(false);
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
            onChange={(e) => setDisciplina(e.target.value)}
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
            onChange={(e) => setGrau(e.target.value)}
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
                onChange={(e) => setAlt(idx, { letra: e.target.value })}
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
          disabled={saving}
          className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Salvando..." : "Salvar questão"}
        </button>
      </div>
    </form>
  );
}
