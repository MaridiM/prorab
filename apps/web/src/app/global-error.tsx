"use client"

import { useEffect } from "react"

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error(error)
    }, [error])

    return (
        <html>
            <body>
                <div style={{
                    minHeight: "100vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "1rem",
                    backgroundColor: "#0f172a",
                    color: "#f1f5f9",
                    fontFamily: "system-ui, -apple-system, sans-serif"
                }}>
                    <div style={{ textAlign: "center", maxWidth: "400px" }}>
                        {/* Icon */}
                        <div style={{
                            width: "80px",
                            height: "80px",
                            margin: "0 auto 2rem",
                            borderRadius: "1rem",
                            background: "linear-gradient(135deg, #ef4444, #dc2626)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: "0 25px 50px -12px rgba(239, 68, 68, 0.3)"
                        }}>
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                                <line x1="12" y1="9" x2="12" y2="13" />
                                <line x1="12" y1="17" x2="12.01" y2="17" />
                            </svg>
                        </div>

                        <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1rem" }}>
                            Критическая ошибка
                        </h1>
                        <p style={{ color: "#94a3b8", marginBottom: "2rem" }}>
                            Приложение столкнулось с критической ошибкой. Попробуйте перезагрузить страницу.
                        </p>

                        <button
                            onClick={reset}
                            style={{
                                padding: "0.75rem 2rem",
                                borderRadius: "0.75rem",
                                background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                                color: "white",
                                fontWeight: "600",
                                border: "none",
                                cursor: "pointer",
                                boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.3)"
                            }}
                        >
                            Перезагрузить
                        </button>

                        {error.digest && (
                            <p style={{ marginTop: "2rem", fontSize: "0.75rem", color: "#64748b", fontFamily: "monospace" }}>
                                Код: {error.digest}
                            </p>
                        )}
                    </div>
                </div>
            </body>
        </html>
    )
}

