"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/packages/components";
import { cn } from "@/packages/utils";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password !== confirm) {
      setStatus("error");
      setMessage("Пароли не совпадают.");
      return;
    }
    setStatus("loading");
    setMessage("");

    try {
      // Placeholder request; replace with real API endpoint when available.
      await new Promise((resolve) => setTimeout(resolve, 700));
      setStatus("success");
      setMessage("Регистрация выполнена (demo). Подключите реальный API.");
    } catch (error) {
      console.error(error);
      setStatus("error");
      setMessage("Не удалось зарегистрироваться. Попробуйте ещё раз.");
    }
  };

  const disabled = status === "loading";

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 text-slate-50">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/80 p-8 shadow-2xl shadow-sky-900/40 backdrop-blur">
        <div className="mb-8 space-y-2 text-center">
          <p className="text-sm font-medium text-sky-200">Sign up</p>
          <h1 className="text-2xl font-semibold leading-tight">
            Регистрация по email и паролю
          </h1>
          <p className="text-sm text-slate-300">
            Демо-форма. Замените на вызов реального endpoint после готовности
            backend.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block space-y-2 text-sm">
            <span className="text-slate-200">Ф.И.О.</span>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-slate-800/60 px-3 py-2 text-slate-50 outline-none ring-1 ring-transparent transition focus:border-sky-500/60 focus:ring-sky-500/40"
              placeholder="Введите полное имя"
            />
          </label>

          <label className="block space-y-2 text-sm">
            <span className="text-slate-200">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-slate-800/60 px-3 py-2 text-slate-50 outline-none ring-1 ring-transparent transition focus:border-sky-500/60 focus:ring-sky-500/40"
              placeholder="you@example.com"
            />
          </label>

          <label className="block space-y-2 text-sm">
            <span className="text-slate-200">Пароль</span>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-slate-800/60 px-3 py-2 text-slate-50 outline-none ring-1 ring-transparent transition focus:border-sky-500/60 focus:ring-sky-500/40"
              placeholder="Минимум 6 символов"
            />
          </label>

          <label className="block space-y-2 text-sm">
            <span className="text-slate-200">Подтверждение пароля</span>
            <input
              type="password"
              required
              minLength={6}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-slate-800/60 px-3 py-2 text-slate-50 outline-none ring-1 ring-transparent transition focus:border-sky-500/60 focus:ring-sky-500/40"
              placeholder="Повторите пароль"
            />
          </label>

          <Button type="submit" className="w-full" disabled={disabled}>
            {disabled ? "Создаём..." : "Зарегистрироваться"}
          </Button>
        </form>

        {message && (
          <div
            className={cn(
              "mt-4 rounded-lg border px-3 py-2 text-sm",
              status === "success"
                ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-100"
                : "border-rose-400/40 bg-rose-500/10 text-rose-100",
            )}
          >
            {message}
          </div>
        )}

        <div className="mt-6 text-center text-sm text-slate-300">
          Уже есть аккаунт?{" "}
          <Link href="/login" className="text-sky-300 underline">
            Войти
          </Link>
        </div>
      </div>
    </div>
  );
}
