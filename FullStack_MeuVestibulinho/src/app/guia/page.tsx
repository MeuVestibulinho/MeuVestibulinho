'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

// Se estiver usando Next.js (App Router), para isso virar uma rota acessível em /guia
// mova este arquivo para: src/app/guia/page.tsx
// (um arquivo solto src/app/guia.tsx não gera rota sozinho)

export default function GuiaPage() {
    const [hora, setHora] = useState<string>('');
    const [mountTime, setMountTime] = useState<string>('');

    useEffect(() => {
        setHora(new Date().toLocaleTimeString());
        setMountTime(new Date().toISOString());
        const id = setInterval(() => setHora(new Date().toLocaleTimeString()), 1000);
        return () => clearInterval(id);
    }, []);

    return (
        <main
            style={{
                fontFamily: 'system-ui, Arial, sans-serif',
                padding: '2rem',
                maxWidth: 720,
                margin: '0 auto',
                lineHeight: 1.4,
            }}
        >
            <h1 style={{ marginBottom: '0.25rem' }}>Página Guia</h1>
            <p style={{ marginTop: 0, color: '#666' }}>
                Rota genérica para teste (OK se você está vendo isto).
            </p>

            <section
                style={{
                    marginTop: '1.5rem',
                    padding: '1rem 1.25rem',
                    border: '1px solid #ddd',
                    borderRadius: 8,
                    background: '#fafafa',
                }}
            >
                <h2 style={{ marginTop: 0, fontSize: '1.1rem' }}>Status</h2>
                <ul style={{ paddingLeft: '1.1rem', margin: 0 }}>
                    <li>Hora atual: {hora}</li>
                    <li>Montado em: {mountTime}</li>
                    <li>Environment: {process.env.NODE_ENV}</li>
                </ul>
            </section>

            <section style={{ marginTop: '1.5rem' }}>
                <h3 style={{ marginBottom: '0.5rem' }}>Checklist rápido</h3>
                <ol style={{ paddingLeft: '1.25rem', margin: 0 }}>
                    <li>Arquivo está em /src/app/guia/page.tsx ?</li>
                    <li>Servidor dev rodando? (npm run dev / yarn dev)</li>
                    <li>Acesse http://localhost:3000/guia</li>
                    <li>Ver console do navegador (F12) se algo falhar</li>
                </ol>
            </section>

            <section style={{ marginTop: '1.5rem' }}>
                <Link
                    href="/"
                    style={{
                        display: 'inline-block',
                        padding: '0.6rem 1rem',
                        background: '#0d66d0',
                        color: 'white',
                        borderRadius: 6,
                        textDecoration: 'none',
                    }}
                >
                    Voltar para Home
                </Link>
            </section>

            <footer style={{ marginTop: '2.5rem', fontSize: '.75rem', color: '#888' }}>
                Componente de teste de rota. Edite e salve para ver hot reload.
            </footer>
        </main>
    );
}

// (Opcional) Metadados se mover para page.tsx
// export const metadata = {
//   title: 'Guia | Teste de Rota',
//   description: 'Página genérica para validar rota.',
// };