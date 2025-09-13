// app/_components/TeamCard.tsx
"use client";
import React from "react";
import Image from "next/image";
import { motion } from "motion/react";

type Member = {
  name: string;
  course: string;
  position: string;
  university: string;
  photo: string;
  story: string;
};

export function TeamCard({ member }: { member: Member }) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg"
    >
      {/* Imagem fixa */}
      <div className="relative h-64 w-full">
        <Image
          src={member.photo}
          alt={member.name}
          fill
          sizes="(max-width: 1024px) 100vw, 25vw"
          className="object-cover"
        />
      </div>

      {/* Info básica */}
      <div className="space-y-2 p-6">
        <h3 className="text-lg font-bold text-gray-900">{member.name}</h3>
        <p className="text-sm text-gray-700">
          <strong>Curso:</strong> {member.course}
        </p>
        <p className="text-sm text-gray-700">
          <strong>Posição na equipe:</strong> {member.position}
        </p>
        <p className="text-sm text-gray-700">
          <strong>Universidade:</strong> {member.university}
        </p>
      </div>

      {/* Texto que aparece só no hover */}
      <div className="absolute inset-0 flex items-start overflow-y-auto bg-white/95 p-6 opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
        <p className="text-sm leading-relaxed whitespace-normal text-gray-800">
          {member.story}
        </p>
      </div>
    </motion.div>
  );
}
