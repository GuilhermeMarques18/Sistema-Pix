import Image from 'next/image';
import { useNavigate } from 'react-router-dom';
import { Button, PixIcon } from '@/app/shared/components/ui';

/**
 * Tela inicial (splash).
 * Mobile: coluna única com imagem de fundo e botões no rodapé.
 * Desktop (md+): split — coluna esquerda com hero, coluna direita com card de CTA.
 */
export function InitPage() {
  const navigate = useNavigate();

  return (
    <div className="flex h-[100dvh] w-full justify-center bg-bg">

      {/* ── MOBILE: coluna única ── */}
      <div className="relative flex h-full w-full max-w-md flex-col justify-between overflow-hidden md:hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/assets/images/init-background.png"
            alt=""
            fill
            priority
            className="object-cover object-center"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(to bottom, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.02) 22%, rgba(0,0,0,0.30) 100%)',
            }}
          />
        </div>

        <div className="relative z-10 flex items-start justify-between px-5 pt-10">
          <h1 className="font-archivo-narrow text-4xl font-bold leading-[1.2] text-white">
            Seu dinheiro,<br />
            com segurança<br />
            e praticidade
          </h1>
          <div className="mt-1 shrink-0" aria-label="Logo Sistema Pix">
            <PixIcon size={40} />
          </div>
        </div>

        <div className="relative z-10 flex flex-col gap-3 px-5 pb-10">
          <Button
            className="h-14 w-full rounded-2xl bg-brand-button text-[15px] font-semibold
                       text-white transition-all duration-150 hover:bg-brand-element active:scale-[0.98]"
            onClick={() => navigate('/login')}
          >
            Entrar
          </Button>
          <Button
            className="h-14 w-full rounded-2xl border border-white/40 bg-transparent
                       text-[15px] font-semibold text-white transition-all duration-150
                       hover:bg-white/10 active:scale-[0.98]"
            onClick={() => navigate('/register')}
          >
            Cadastre-se
          </Button>
        </div>
      </div>

      {/* ── DESKTOP: split em duas colunas ── */}
      <div className="hidden md:flex w-full h-full">

        {/* Coluna esquerda — hero com imagem */}
        <div className="relative flex-1 flex flex-col justify-between overflow-hidden">
          <Image
            src="/assets/images/init-background.png"
            alt=""
            fill
            priority
            className="object-cover object-center"
          />
          {/* Gradiente escurece topo e rodapé */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(to bottom, rgba(0,0,0,0.70) 0%, rgba(0,0,0,0.05) 35%, rgba(0,0,0,0.50) 100%)',
            }}
          />

          {/* Slogan + logo */}
          <div className="relative z-10 flex items-start justify-between px-12 pt-14">
            <h1 className="font-archivo-narrow text-5xl font-bold leading-[1.15] text-white max-w-xs">
              Seu dinheiro,<br />
              com segurança<br />
              e praticidade
            </h1>
            <div className="mt-1 shrink-0" aria-label="Logo Sistema Pix">
              <PixIcon size={48} />
            </div>
          </div>

          {/* Tagline no rodapé da imagem */}
          <div className="relative z-10 px-12 pb-12">
            <p className="text-white/70 text-base max-w-sm leading-relaxed">
              Transferências instantâneas, seguras e sem custo. Disponível 24h por dia, 7 dias por semana.
            </p>
          </div>
        </div>

        {/* Coluna direita — card de CTA */}
        <div className="w-[420px] shrink-0 flex items-center justify-center bg-bg px-10">
          <div className="w-full max-w-sm">

            {/* Logo + título */}
            <div className="flex flex-col items-center mb-10">
              <div
                className="mb-5 flex items-center justify-center rounded-full"
                style={{
                  width: 72,
                  height: 72,
                  border: '1.5px solid rgba(50, 188, 169, 0.45)',
                }}
              >
                <PixIcon size={42} />
              </div>
              <h2 className="text-2xl font-bold text-text text-center leading-tight">
                Bem-vindo ao<br />Sistema Pix
              </h2>
              <p className="mt-2 text-sm text-text-secondary text-center">
                Acesse sua conta ou crie uma nova
              </p>
            </div>

            {/* Botões */}
            <div className="flex flex-col gap-3">
              <Button
                className="h-14 w-full rounded-2xl bg-brand-button text-[15px] font-semibold
                           text-white transition-all duration-150 hover:bg-brand-element active:scale-[0.98]"
                onClick={() => navigate('/login')}
              >
                Entrar
              </Button>
              <Button
                className="h-14 w-full rounded-2xl border border-bg-input bg-transparent
                           text-[15px] font-semibold text-text transition-all duration-150
                           hover:bg-bg-input active:scale-[0.98]"
                onClick={() => navigate('/register')}
              >
                Cadastre-se
              </Button>
            </div>

            {/* Rodapé */}
            <p className="mt-8 text-center text-xs text-text-secondary">
              Ao continuar, você concorda com os{' '}
              <span className="text-brand-element cursor-pointer hover:underline">
                Termos de uso
              </span>{' '}
              e{' '}
              <span className="text-brand-element cursor-pointer hover:underline">
                Política de privacidade
              </span>
              .
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}