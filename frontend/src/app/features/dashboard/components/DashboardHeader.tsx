"use client";

interface DashboardHeaderProps {
  userName: string;
}

/** Extrai a inicial do primeiro nome */
function getInitial(name: string): string {
  return name.trim().charAt(0).toUpperCase();
}

export function DashboardHeader({ userName }: DashboardHeaderProps) {
  return (
    <header
      className="relative w-full overflow-hidden"
      style={{ minHeight: "160px" }}
    >
      {/* Banner de fundo */}
      <img
        src="/assets/images/banner.svg"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Conteúdo sobre o banner */}
      <div className="relative z-10 flex items-center gap-4 px-5 pt-10 pb-8">
        {/* Avatar circular */}
        <div
          className="flex h-14 w-14 flex-shrink-0 items-center justify-center
            rounded-full bg-brand-element text-bg text-xl font-bold border-2 border-white/20 shadow-lg"
          aria-hidden="true"
        >
          {getInitial(userName)}
        </div>

        {/* Nome + conta */}
        <div>
          <p className="text-lg font-bold text-white leading-tight drop-shadow">
            Olá, {userName}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-white/80">Sua conta</span>
            <span
              className="rounded bg-brand-element/30 border border-brand-element/50
                px-2 py-0.5 text-[11px] font-semibold tracking-wider text-brand-element"
            >
              PIX
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
