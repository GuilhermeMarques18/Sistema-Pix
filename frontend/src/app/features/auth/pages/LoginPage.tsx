'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeSlash } from '@phosphor-icons/react';
import { passwordLoginSchema, type PasswordLoginFormData } from '../schemas/passwordLogin.schema';
import { useLogin } from '../hooks/useLogin';
import { Button, Input, Label, PixIcon } from '@/app/shared/components/ui';

/**
 * Tela de login por senha — mobile-first.
 */
export function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading, error } = useLogin();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PasswordLoginFormData>({
    resolver: zodResolver(passwordLoginSchema),
  });

  function handleSubmitPassword(data: PasswordLoginFormData) {
    login({ email: data.email, password: data.password });
  }

  return (
    /* Wrapper externo: fundo neutro da app, só centraliza */
    <div className="flex h-[100dvh] w-full justify-center bg-bg">

      {/* Coluna central — degradê e conteúdo ficam aqui */}
      <div
        className="flex items-center h-full w-full max-w-md flex-col"
        style={{
          background: 'linear-gradient(180deg, #12372e 0%, #131A1F 50%, #131A1F 100%)',
        }}
      >

        {/* ── Seção superior: logo + identificação ── */}
        <div className="flex flex-1 flex-col items-center justify-center px-5 pb-8 pt-16">
          {/* Círculo com borda teal ao redor do logo */}
          <div
            className="mb-6 flex items-center justify-center rounded-full"
            style={{
              width: 76,
              height: 76,
              border: '1.5px solid rgba(50, 188, 169, 0.45)',
            }}
            aria-label="Logo Sistema Pix"
          >
            <PixIcon size={44} />
          </div>

          {/* Saudação */}
          <h1 className="mb-2 text-[22px] font-bold leading-tight text-white">
            Acesse sua conta
          </h1>

          {/* Trocar de conta */}
          <h2
            className="text-sm text-text-secondary transition-colors hover:text-white active:scale-95"
          >
            Para fazer transferências
          </h2>
        </div>

        {/* ── Card inferior de senha ── */}

        <div
          className="rounded-t-3xl px-6 py-10 h-1/2 w-11/12 border-[1px] border-x-slate-600 bg-bg-card"
        >
          <h2 className="mb-6 text-[17px] font-bold text-white">
            Entre na sua conta
          </h2>

          <form
            onSubmit={handleSubmit(handleSubmitPassword)}
            className="flex flex-col gap-4"
            noValidate
          >
            {/* Label + campo de e-mail */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="email" className="text-sm font-medium text-white">
                E-mail
              </Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="seu@email.com"
                className="h-12 w-full rounded-xl border-0 bg-bg-input text-base
                             text-white placeholder:text-text-secondary
                             focus:outline-none focus:ring-1 focus:ring-brand-logo"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-xs text-text-negative">{errors.email.message}</p>
              )}
            </div>

            {/* Label + campo de senha */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="password" className="text-sm font-medium text-white">
                Senha
              </Label>

              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className="h-12 w-full rounded-xl border-0 bg-bg-input pr-12 text-base
                               text-white placeholder:text-text-secondary
                               focus:outline-none focus:ring-1 focus:ring-brand-logo"
                  {...register('password')}
                />

                {/* Toggle de visibilidade */}
                <button
                  type="button"
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary
                               transition-colors hover:text-white"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword
                    ? <Eye size={20} weight="regular" />
                    : <EyeSlash size={20} weight="regular" />}
                </button>
              </div>

              {errors.password && (
                <p className="text-xs text-text-negative">{errors.password.message}</p>
              )}
            </div>

            {/* "Esqueceu sua senha?" — alinhado à direita */}
            <div className="flex justify-end">
              <button
                type="button"
                className="flex items-center gap-0.5 text-sm text-brand-element
                             transition-colors hover:underline active:scale-95"
                onClick={() => { /* TODO: navegar para recuperação de senha */ }}
              >
                Esqueceu sua senha?
                <span aria-hidden="true" className="ml-0.5 text-brand-element">›</span>
              </button>
            </div>

            {/* Erro HTTP */}
            {error && (
              <p className="text-xs text-text-negative">{error}</p>
            )}

            {/* Botão Entrar */}
            <Button
              type="submit"
              disabled={isLoading}
              className="mt-1 h-14 w-full rounded-2xl bg-brand-button text-[15px] font-semibold
                           text-white transition-all duration-150 hover:bg-brand-element
                           active:scale-[0.98] disabled:opacity-60"
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>

            {/* Link de cadastro */}
            <p className="text-center text-sm text-text-secondary">
              Não tem uma conta?{' '}
              <button
                type="button"
                className="font-medium text-brand-element transition-colors
                             hover:underline active:scale-95"
                onClick={() => navigate('/register')}
              >
                Cadastre-se
              </button>
            </p>
          </form>
        </div>


      </div>
    </div>
  );
}

/* nada — PixLogoMark removido, usando PixIcon do shared */
