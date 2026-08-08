// path: src/routes/publish/index.tsx
import { createFileRoute } from "@tanstack/react-router";
import React from 'react';

export const Route = createFileRoute("/publish/")({
  component: PublishRoute,
});

export function PublishRoute() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <section className="max-w-lg text-center">
        <h1 className="text-3xl font-bold">Publisher API</h1>
        <p className="mt-3 text-muted-foreground">
          The publishing service is online and requires authentication.
        </p>
        <a href="/" className="inline-block mt-6 underline">กลับหน้าหลัก</a>
      </section>
    </main>
  );
}
