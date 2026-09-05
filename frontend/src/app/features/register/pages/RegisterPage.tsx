'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from '@phosphor-icons/react';
import { registerSchema, type RegisterFormData } from '../schemas/register.schema';
import { useRegister } from '../hooks/useRegister';
import { Button } from '@/app/shared/components/ui/button';
import { Input } from '@/app/shared/components/ui/input';
import { Label } from '@/app/shared/components/ui/label';

export function RegisterPage() {
  const navigate = useNavigate();
  const { register: submitRegister, isLoading, error } = useRegister();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      tipoPessoa: 'FISICA',
    },
  });

  const tipoPessoa = watch('tipoPessoa');

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm">

        {/* Header com voltar + stepper */}
        <div className="mb-6 flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate('/login')}
            aria-label="Voltar para o login"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-brand-element text-brand-element transition-colors hover:bg-brand-element/10 active:scale-95"
          >
            <ArrowLeft size={18} weight="bold" />
          </button>

          {/* Stepper — passo 1 de 2 */}
          <div className="flex flex-1 gap-2" aria-label="Passo 1 de 2">
            <div className="h-1 flex-1 rounded-full bg-brand-element" />
            <div className="h-1 flex-1 rounded-full bg-bg-input" />
          </div>
        </div>

        <h1 className="mb-6 text-[25px] font-semibold text-text">Comece por aqui</h1>

        <form onSubmit={handleSubmit(submitRegister)} className="space-y-4" noValidate>

          {/* Nome */}
          <div className="space-y-1.5">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              type="text"
              placeholder="Digite seu nome completo"
              autoComplete="name"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-xs text-text-negative">{errors.name.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Digite seu email"
              autoComplete="email"
              {...register('email')}
            />
            {errors.email && (
              <p className="text-xs text-text-negative">{errors.email.message}</p>
            )}
          </div>

          {/* Telefone */}
          <div className="space-y-1.5">
            <Label htmlFor="telefone">Telefone</Label>
            <Input
              id="telefone"
              type="tel"
              placeholder="Digite seu telefone"
              autoComplete="tel"
              {...register('telefone')}
            />
            {errors.telefone && (
              <p className="text-xs text-text-negative">{errors.telefone.message}</p>
            )}
          </div>

          {/* Tipo de pessoa */}
          <div className="flex gap-6">
            <button
              type="button"
              role="radio"
              aria-checked={tipoPessoa === 'FISICA'}
              onClick={() => setValue('tipoPessoa', 'FISICA', { shouldValidate: true })}
              className="flex items-center gap-2 text-sm text-text transition-opacity active:scale-95"
            >
              {/* Radio visual */}
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors ${
                  tipoPessoa === 'FISICA'
                    ? 'border-brand-element'
                    : 'border-text-secondary'
                }`}
              >
                {tipoPessoa === 'FISICA' && (
                  <span className="h-2.5 w-2.5 rounded-full bg-brand-element" />
                )}
              </span>
              Pessoa Física
            </button>

            <button
              type="button"
              role="radio"
              aria-checked={tipoPessoa === 'JURIDICA'}
              onClick={() => setValue('tipoPessoa', 'JURIDICA', { shouldValidate: true })}
              className="flex items-center gap-2 text-sm text-text transition-opacity active:scale-95"
            >
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors ${
                  tipoPessoa === 'JURIDICA'
                    ? 'border-brand-element'
                    : 'border-text-secondary'
                }`}
              >
                {tipoPessoa === 'JURIDICA' && (
                  <span className="h-2.5 w-2.5 rounded-full bg-brand-element" />
                )}
              </span>
              Pessoa Jurídica
            </button>
          </div>

          {/* CPF / CNPJ — label muda conforme tipo */}
          <div className="space-y-1.5">
            <Label htmlFor="documento">
              {tipoPessoa === 'FISICA' ? 'CPF' : 'CNPJ'}
            </Label>
            <Input
              id="documento"
              type="text"
              placeholder={tipoPessoa === 'FISICA' ? 'Digite seu CPF' : 'Digite seu CNPJ'}
              {...register('documento')}
            />
            {errors.documento && (
              <p className="text-xs text-text-negative">{errors.documento.message}</p>
            )}
          </div>

          {/* Senha */}
          <div className="space-y-1.5">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              placeholder="Crie uma senha"
              autoComplete="new-password"
              {...register('password')}
            />
            {errors.password && (
              <p className="text-xs text-text-negative">{errors.password.message}</p>
            )}
          </div>

          {/* Confirmação de senha */}
          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">Confirmação de senha</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirme a senha"
              autoComplete="new-password"
              {...register('confirmPassword')}
            />
            {errors.confirmPassword && (
              <p className="text-xs text-text-negative">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Erro global da API */}
          {error && (
            <p className="text-xs text-text-negative">{error}</p>
          )}

          <Button type="submit" className="mt-2 w-full rounded-xl" disabled={isLoading}>
            {isLoading ? 'Criando conta...' : 'Entrar'}
          </Button>
        </form>
      </div>
    </div>
  );
}
