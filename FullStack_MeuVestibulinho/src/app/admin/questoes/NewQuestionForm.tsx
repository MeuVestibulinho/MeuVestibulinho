"use client";

import QuestionForm, {
  type DisciplinaOption,
  type GrauOption,
  type LetraOption,
  type QuestaoFormInitialValues,
  type QuestaoFormSubmitPayload,
  useInvalidateQuestoes,
} from "./QuestionForm";

import { api } from "~/trpc/react";

type Props = {
  disciplinaOptions: DisciplinaOption[];
  grauOptions: GrauOption[];
  letraOptions: LetraOption[];
};

const DEFAULT_INITIAL_VALUES: QuestaoFormInitialValues = {
  enunciado: "",
  disciplina: "PORTUGUES",
  grauDificuldade: "MEDIO",
  ano: null,
  fonteUrl: null,
  imagemUrl: null,
  habilidades: "",
  conteudo: "",
  subconteudo: "",
  alternativas: [],
};

export default function NewQuestionForm({
  disciplinaOptions,
  grauOptions,
  letraOptions,
}: Props) {
  const invalidateQuestoes = useInvalidateQuestoes();
  const createQuestao = api.questao.create.useMutation({
    onSuccess: async () => {
      await invalidateQuestoes();
    },
  });

  const initialValues: QuestaoFormInitialValues = {
    ...DEFAULT_INITIAL_VALUES,
    disciplina: disciplinaOptions[0] ?? DEFAULT_INITIAL_VALUES.disciplina,
    grauDificuldade: grauOptions[0] ?? DEFAULT_INITIAL_VALUES.grauDificuldade,
  };

  async function handleSubmit(payload: QuestaoFormSubmitPayload) {
    await createQuestao.mutateAsync(payload);
  }

  return (
    <QuestionForm
      initialValues={initialValues}
      disciplinaOptions={disciplinaOptions}
      grauOptions={grauOptions}
      letraOptions={letraOptions}
      onSubmit={handleSubmit}
      submitLabel="Salvar questão"
      isSubmitting={createQuestao.isPending}
      successMessage="Questão criada com sucesso!"
      resetAfterSubmit
    />
  );
}
