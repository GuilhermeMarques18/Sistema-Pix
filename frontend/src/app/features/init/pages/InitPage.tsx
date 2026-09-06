import Image from 'next/image';
import { useNavigate } from 'react-router-dom';
import { Button, PixIcon } from '@/app/shared/components/ui';

/**
 * Tela inicial (splash) — mobile-first.
 * Wrapper externo: fundo neutro (bg-bg), centraliza a coluna.
 * Coluna interna (max-w-md): contém imagem de fundo + gradiente + conteúdo.
 */
export function InitPage() {
  const navigate = useNavigate();

  return (
    /* Wrapper externo: fundo neutro da app, só centraliza */
    <div className="flex h-[100dvh] w-full justify-center bg-bg">

      {/* Coluna central — fundo, imagem e conteúdo ficam aqui */}
      <div className="relative flex h-full w-full max-w-md flex-col justify-between overflow-hidden">

        {/* Imagem de fundo restrita à coluna */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/assets/images/init-background.png"
            alt=""
            fill
            priority
            className="object-cover object-center"
          />
          {/* Gradiente: escurece topo e fundo */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(to bottom, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.08) 42%, rgba(0,0,0,0.72) 100%)',
            }}
          />
        </div>

        {/* Topo: slogan (esquerda) + logo (direita) */}
        <div className="relative z-10 flex items-start justify-between px-5 pt-10">
          <h1 className="max-w-[200px] font-archivo-narrow text-3xl font-bold leading-[1.2] text-white">
            Seu dinheiro,<br />
            com segurança<br />
            e praticidade
          </h1>

          <div className="mt-1 shrink-0" aria-label="Logo Sistema Pix">
            <PixIcon size={40} />
          </div>
        </div>

        {/* Rodapé: botões */}
        <div className="relative z-10 flex flex-col gap-3 px-5 pb-10">
          <Button
            className="h-14 w-full rounded-2xl bg-brand-button text-[15px] font-semibold
                       text-white transition-all duration-150 hover:bg-brand-element active:scale-[0.98]"
            onClick={() => navigate('/login')}
          >
            Entrar
          </Button>

          <Button
            className="h-14 w-full rounded-2xl border border-white/30 bg-transparent
                       text-[15px] font-semibold text-white transition-all duration-150
                       hover:bg-white/10 active:scale-[0.98]"
            onClick={() => navigate('/register')}
          >
            Cadastre-se
          </Button>
        </div>

      </div>
    </div>
  );
}

/* nada — PixLogoMark removido, usando PixIcon do shared */
