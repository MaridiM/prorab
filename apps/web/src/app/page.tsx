import { ArrowRight, Database, Layers, Palette, Server } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: <Server className="h-5 w-5" />,
    title: "NestJS API",
    copy: "GraphQL + Prisma data layer, ready for Postgres.",
  },
  {
    icon: <Palette className="h-5 w-5" />,
    title: "Next.js 16 web",
    copy: "App Router, Tailwind, and shadcn/ui components.",
  },
  {
    icon: <Database className="h-5 w-5" />,
    title: "Postgres @5433",
    copy: "Docker compose connection pre-wired in .env.",
  },
  {
    icon: <Layers className="h-5 w-5" />,
    title: "Monorepo ready",
    copy: "pnpm workspaces with linked build + lint commands.",
  },
];

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-50">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.18),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(16,185,129,0.18),transparent_30%),linear-gradient(145deg,rgba(15,23,42,0.9),rgba(15,23,42,0.6))]" />
      <section className="container mx-auto px-6 py-16 lg:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-slate-200 ring-1 ring-white/20 backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Monorepo: Next.js 16 + NestJS GraphQL + Prisma + Postgres
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                Launch full-stack features without re-rolling the boilerplate.
              </h1>
              <p className="max-w-2xl text-lg text-slate-200/80">
                Web built with Tailwind & shadcn/ui; API ships with Apollo
                GraphQL, Prisma schema, and Postgres wired to docker-compose.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg">
                <a
                  href="http://localhost:3001/graphql"
                  target="_blank"
                  rel="noreferrer"
                >
                  Open GraphQL Playground
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <a href="https://ui.shadcn.com" target="_blank" rel="noreferrer">
                  shadcn/ui docs
                </a>
              </Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {features.map((item) => (
                <div
                  key={item.title}
                  className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-4 shadow-lg shadow-sky-900/20"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-sky-100">
                    {item.icon}
                  </div>
                  <div className="space-y-1">
                    <p className="text-base font-semibold">{item.title}</p>
                    <p className="text-sm text-slate-200/70">{item.copy}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-1 rounded-[32px] bg-gradient-to-tr from-sky-500/50 via-emerald-400/40 to-transparent blur-3xl" />
            <div className="relative space-y-4 rounded-[28px] border border-white/10 bg-slate-900/80 p-6 shadow-2xl shadow-sky-900/40 backdrop-blur">
              <div className="rounded-2xl border border-white/5 bg-gradient-to-br from-slate-900 to-slate-950 p-6 font-mono text-sm leading-relaxed text-slate-100">
                <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
                  GraphQL
                </p>
                <pre className="mt-3 whitespace-pre-wrap text-slate-50">
{`query Projects {
  projects {
    id
    name
    description
  }
}

mutation AddProject {
  createProject(input: {
    name: "Next + Nest starter"
    description: "GraphQL API backed by Prisma"
  }) {
    id
    name
  }
}`}
                </pre>
              </div>
              <div className="rounded-2xl border border-white/5 bg-slate-800/60 p-4 text-sm text-slate-100 shadow-inner shadow-black/30">
                <p className="font-semibold text-slate-50">
                  Connection string
                </p>
                <p className="mt-2 break-all font-mono text-xs text-emerald-200">
                  postgres://prorab:prorab@localhost:5433/prorab
                </p>
                <p className="mt-3 text-slate-200/80">
                  Update Prisma models in <code>apps/api/prisma/schema.prisma</code>,
                  then run <code>pnpm prisma:migrate</code> (filtered to <code>api</code>).
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
