"use client";

import React, { useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  Search,
  BookOpen,
  Clock,
  Users,
  Star,
  Play,
  Filter,
  ChevronDown,
  CheckCircle,
  Lock,
  Award,
} from "lucide-react";

type Course = {
  id: string;
  title: string;
  description: string;
  duration: string;
  level: "Iniciante" | "Intermediário" | "Avançado";
  category:
    | "Matemática"
    | "Português"
    | "História"
    | "Geografia"
    | "Ciências"
    | "Redação";
  rating: number;
  students: number;
  isCompleted?: boolean;
  isLocked?: boolean;
  thumbnail: string;
  lessons: number;
  progress?: number;
};

const COURSES: Course[] = [
  {
    id: "1",
    title: "Matemática Básica para ETEC",
    description:
      "Conceitos fundamentais de matemática essenciais para o vestibulinho da ETEC",
    duration: "2h 30min",
    level: "Iniciante",
    category: "Matemática",
    rating: 4.8,
    students: 1250,
    isCompleted: false,
    isLocked: false,
    thumbnail: "/foto-hero.jpg",
    lessons: 12,
    progress: 0,
  },
  {
    id: "2",
    title: "Interpretação de Texto",
    description:
      "Técnicas para melhorar sua compreensão e interpretação de textos",
    duration: "1h 45min",
    level: "Iniciante",
    category: "Português",
    rating: 4.9,
    students: 980,
    isCompleted: true,
    isLocked: false,
    thumbnail: "/foto-hero.jpg",
    lessons: 8,
    progress: 100,
  },
  {
    id: "3",
    title: "História do Brasil - República",
    description:
      "Período republicano brasileiro com foco nos principais acontecimentos",
    duration: "3h 15min",
    level: "Intermediário",
    category: "História",
    rating: 4.7,
    students: 750,
    isCompleted: false,
    isLocked: false,
    thumbnail: "/foto-hero.jpg",
    lessons: 15,
    progress: 40,
  },
  {
    id: "4",
    title: "Geografia Física",
    description: "Relevo, clima, vegetação e hidrografia do Brasil",
    duration: "2h 10min",
    level: "Iniciante",
    category: "Geografia",
    rating: 4.6,
    students: 650,
    isCompleted: false,
    isLocked: false,
    thumbnail: "/foto-hero.jpg",
    lessons: 10,
    progress: 0,
  },
  {
    id: "5",
    title: "Química Orgânica",
    description: "Fundamentos da química orgânica para o vestibulinho",
    duration: "4h 20min",
    level: "Avançado",
    category: "Ciências",
    rating: 4.5,
    students: 420,
    isCompleted: false,
    isLocked: true,
    thumbnail: "/foto-hero.jpg",
    lessons: 18,
    progress: 0,
  },
  {
    id: "6",
    title: "Redação Dissertativa",
    description: "Estrutura e técnicas para escrever uma redação nota 10",
    duration: "2h 50min",
    level: "Intermediário",
    category: "Redação",
    rating: 4.9,
    students: 1100,
    isCompleted: false,
    isLocked: false,
    thumbnail: "/foto-hero.jpg",
    lessons: 14,
    progress: 0,
  },
];

const CATEGORIES = [
  "Todas",
  "Matemática",
  "Português",
  "História",
  "Geografia",
  "Ciências",
  "Redação",
];

const LEVELS = ["Todos", "Iniciante", "Intermediário", "Avançado"];

export default function MiniCursosPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [selectedLevel, setSelectedLevel] = useState("Todos");
  const [showFilters, setShowFilters] = useState(false);

  const filteredCourses = useMemo(() => {
    return COURSES.filter((course) => {
      const matchesSearch =
        !searchQuery ||
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === "Todas" || course.category === selectedCategory;

      const matchesLevel =
        selectedLevel === "Todos" || course.level === selectedLevel;

      return matchesSearch && matchesCategory && matchesLevel;
    });
  }, [searchQuery, selectedCategory, selectedLevel]);

  const getLevelColor = (level: Course["level"]) => {
    switch (level) {
      case "Iniciante":
        return "bg-green-100 text-green-700";
      case "Intermediário":
        return "bg-yellow-100 text-yellow-700";
      case "Avançado":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getCategoryIcon = (category: Course["category"]) => {
    switch (category) {
      case "Matemática":
        return "📐";
      case "Português":
        return "📚";
      case "História":
        return "🏛️";
      case "Geografia":
        return "🌍";
      case "Ciências":
        return "🔬";
      case "Redação":
        return "✍️";
      default:
        return "📖";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
      <main className="container mx-auto px-4 py-24 md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-7xl"
        >
          {/* Header */}
          <div className="mx-auto mb-12 max-w-4xl text-center">
            <h1 className="mb-4 text-4xl font-bold text-gray-900 md:text-5xl">
              Mini Cursos
            </h1>
            <p className="text-xl leading-relaxed text-gray-600">
              Conteúdos objetivos e práticos para revisar os principais tópicos
              do vestibulinho da ETEC
            </p>
          </div>

          {/* Search and Filters */}
          <div className="mb-8">
            <div className="mb-6 flex flex-col gap-4 lg:flex-row">
              {/* Search Bar */}
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar mini-cursos..."
                  className="w-full rounded-2xl border border-gray-300 bg-white px-5 py-4 pr-12 text-gray-900 ring-red-200 outline-none focus:ring-2"
                />
                <Search
                  className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-400"
                  size={20}
                />
              </div>

              {/* Filter Toggle */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 rounded-2xl border border-gray-300 bg-white px-6 py-4 text-gray-700 transition-colors hover:border-red-400"
              >
                <Filter size={18} />
                <span>Filtros</span>
                <ChevronDown
                  size={16}
                  className={`transition-transform ${showFilters ? "rotate-180" : ""}`}
                />
              </motion.button>
            </div>

            {/* Filters */}
            <motion.div
              initial={false}
              animate={{
                height: showFilters ? "auto" : 0,
                opacity: showFilters ? 1 : 0,
              }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Category Filter */}
                  <div>
                    <h3 className="mb-3 font-semibold text-gray-900">
                      Categoria
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {CATEGORIES.map((category) => (
                        <button
                          key={category}
                          onClick={() => setSelectedCategory(category)}
                          className={`rounded-full px-4 py-2 text-sm transition ${
                            selectedCategory === category
                              ? "bg-red-500 text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Level Filter */}
                  <div>
                    <h3 className="mb-3 font-semibold text-gray-900">Nível</h3>
                    <div className="flex flex-wrap gap-2">
                      {LEVELS.map((level) => (
                        <button
                          key={level}
                          onClick={() => setSelectedLevel(level)}
                          className={`rounded-full px-4 py-2 text-sm transition ${
                            selectedLevel === level
                              ? "bg-orange-500 text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Courses Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredCourses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="group relative"
              >
                <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
                  {/* Course Thumbnail */}
                  <div className="relative h-48 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-red-100 to-orange-100" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-6xl">
                        {getCategoryIcon(course.category)}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    {course.progress !== undefined && course.progress > 0 && (
                      <div className="absolute right-0 bottom-0 left-0 h-1 bg-gray-200">
                        <div
                          className="h-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-500"
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                    )}

                    {/* Status Icons */}
                    <div className="absolute top-4 right-4 flex gap-2">
                      {course.isCompleted && (
                        <div className="rounded-full bg-green-500 p-2 text-white">
                          <CheckCircle size={16} />
                        </div>
                      )}
                      {course.isLocked && (
                        <div className="rounded-full bg-gray-500 p-2 text-white">
                          <Lock size={16} />
                        </div>
                      )}
                    </div>

                    {/* Level Badge */}
                    <div className="absolute top-4 left-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${getLevelColor(course.level)}`}
                      >
                        {course.level}
                      </span>
                    </div>
                  </div>

                  {/* Course Content */}
                  <div className="p-6">
                    <div className="mb-3 flex items-start justify-between">
                      <h3 className="text-xl font-bold text-gray-900 transition-colors group-hover:text-red-600">
                        {course.title}
                      </h3>
                    </div>

                    <p className="mb-4 line-clamp-2 text-sm text-gray-600">
                      {course.description}
                    </p>

                    {/* Course Stats */}
                    <div className="mb-4 flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock size={14} />
                        <span>{course.duration}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <BookOpen size={14} />
                        <span>{course.lessons} aulas</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users size={14} />
                        <span>{course.students.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="mb-4 flex items-center gap-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={16}
                            className={`${
                              i < Math.floor(course.rating)
                                ? "fill-current text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">
                        {course.rating} ({course.students} alunos)
                      </span>
                    </div>

                    {/* Action Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={course.isLocked}
                      className={`w-full rounded-xl px-4 py-3 font-medium transition-all duration-300 ${
                        course.isLocked
                          ? "cursor-not-allowed bg-gray-100 text-gray-400"
                          : course.isCompleted
                            ? "bg-green-500 text-white hover:bg-green-600"
                            : "bg-gradient-to-r from-red-500 to-orange-500 text-white hover:from-red-600 hover:to-orange-600"
                      }`}
                    >
                      {course.isLocked ? (
                        <div className="flex items-center justify-center gap-2">
                          <Lock size={16} />
                          <span>Bloqueado</span>
                        </div>
                      ) : course.isCompleted ? (
                        <div className="flex items-center justify-center gap-2">
                          <CheckCircle size={16} />
                          <span>Concluído</span>
                        </div>
                      ) : course.progress && course.progress > 0 ? (
                        <div className="flex items-center justify-center gap-2">
                          <Play size={16} />
                          <span>Continuar</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <Play size={16} />
                          <span>Começar</span>
                        </div>
                      )}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Empty State */}
          {filteredCourses.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-12 text-center"
            >
              <div className="mb-4 text-6xl">🔍</div>
              <h3 className="mb-2 text-xl font-semibold text-gray-900">
                Nenhum mini-curso encontrado
              </h3>
              <p className="mb-6 text-gray-600">
                Tente ajustar os filtros ou termos de busca
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("Todas");
                  setSelectedLevel("Todos");
                }}
                className="rounded-xl bg-red-500 px-6 py-3 text-white transition-colors hover:bg-red-600"
              >
                Limpar filtros
              </button>
            </motion.div>
          )}

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-16 text-center"
          >
            <div className="rounded-3xl bg-gradient-to-r from-red-500 to-orange-500 p-8 text-white md:p-12">
              <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                Pronto para começar?
              </h2>
              <p className="mb-6 text-xl opacity-90">
                Acesse todos os mini-cursos e prepare-se para o vestibulinho da
                ETEC
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="rounded-xl bg-white px-8 py-4 font-semibold text-red-600 transition-colors hover:bg-gray-100"
                >
                  Ver Trilha de Estudos
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="rounded-xl border-2 border-white px-8 py-4 font-semibold text-white transition-colors hover:bg-white hover:text-red-600"
                >
                  Fazer Simulado
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
