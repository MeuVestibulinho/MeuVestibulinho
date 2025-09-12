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
      className="group relative bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100"
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
      <div className="p-6 space-y-2">
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
      <div
        className="absolute inset-0 bg-white/95 backdrop-blur-sm p-6 flex items-center 
        opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      >
        <p className="text-sm leading-relaxed text-gray-800">{member.story}</p>
      </div>
    </motion.div>
  );
}
