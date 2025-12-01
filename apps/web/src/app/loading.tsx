export default function Loading() {
    return (
        <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm flex items-center justify-center">
            <div className="flex flex-col items-center">
                {/* Logo */}
                <div className="relative">
                    <div className="absolute inset-0 rounded-2xl bg-amber-400/30 animate-ping" style={{ animationDuration: '1.5s' }} />
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/25 animate-pulse">
                        <span className="font-bold text-xl text-white">PR</span>
                    </div>
                </div>

                {/* Dots */}
                <div className="mt-6 flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms', animationDuration: '0.6s' }} />
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '150ms', animationDuration: '0.6s' }} />
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms', animationDuration: '0.6s' }} />
                </div>
            </div>
        </div>
    )
}
