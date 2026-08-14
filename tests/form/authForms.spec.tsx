// Codigo Aurelio - mantiene secretos fuera del copy y hace visibles los rechazos de auth.
//
// Los formularios deben frenar datos inválidos antes de la red y presentar los
// errores del backend sin imprimir la contraseña como texto ni mandarla a logs.

import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import LoginFrom from '@/form/LoginFrom';
import RegisterForm from '@/form/RegisterForm';
import ForgotForm from '@/form/ForgotForm';
import { ApiError, ApiFetch } from '@/utils/Api';
import { renderConProviders } from '../helpers/renderConProviders';

vi.mock('@/utils/Api', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/utils/Api')>();
  return {
    ApiError: original.ApiError,
    ApiFetch: {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    },
  };
});

vi.mock('@/hooks/api/useHandle', () => ({
  useCheckHandle: () => ({ data: undefined }),
  useHandleSuggestions: () => ({ data: undefined }),
}));

vi.mock('react-toastify', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), warning: vi.fn() },
}));

describe('formularios de autenticación', () => {
  test('login muestra la validación y no llama al backend con datos inválidos', async () => {
    const { container } = renderConProviders(<LoginFrom />);
    const email = container.querySelector<HTMLInputElement>('input[name="email"]');
    const password = container.querySelector<HTMLInputElement>('input[name="password"]');
    expect(email).not.toBeNull();
    expect(password).not.toBeNull();

    fireEvent.change(email as HTMLInputElement, { target: { value: 'correo-invalido' } });
    fireEvent.blur(email as HTMLInputElement);
    fireEvent.change(password as HTMLInputElement, { target: { value: '123' } });
    fireEvent.blur(password as HTMLInputElement);
    fireEvent.click(screen.getByRole('button', { name: 'login.submitLong' }));

    await waitFor(() => {
      expect(screen.getByText(/Email must be a valid email/i)).toBeTruthy();
      expect(screen.getByText(/Password must be at least 6 characters/i)).toBeTruthy();
    });
    expect(ApiFetch.post).not.toHaveBeenCalled();
  });

  // ── EL TEST QUE IMPORTA ──────────────────────────────────────────────────
  test('login muestra el error de negocio sin exponer la contraseña en texto o logs', async () => {
    const secret = 'NoPublicar123!';
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const { toast } = await import('react-toastify');
    vi.mocked(ApiFetch.post).mockRejectedValue(
      new ApiError(400, 'Credenciales inválidas', { code: 'auth.invalid_credentials' }),
    );
    const { container } = renderConProviders(<LoginFrom />);
    const email = container.querySelector<HTMLInputElement>('input[name="email"]');
    const password = container.querySelector<HTMLInputElement>('input[name="password"]');
    expect(email).not.toBeNull();
    expect(password).not.toBeNull();

    fireEvent.change(email as HTMLInputElement, { target: { value: 'aurelio@test.com' } });
    fireEvent.change(password as HTMLInputElement, { target: { value: secret } });
    fireEvent.click(screen.getByRole('button', { name: 'login.submitLong' }));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Credenciales inválidas'));
    expect(password?.getAttribute('type')).toBe('password');
    expect(container.textContent).not.toContain(secret);
    expect(JSON.stringify(consoleError.mock.calls)).not.toContain(secret);
  });

  test('registro rechaza una contraseña débil antes de habilitar el envío', async () => {
    renderConProviders(<RegisterForm />);
    const password = document.querySelector<HTMLInputElement>('input[name="password"]');
    expect(password).not.toBeNull();

    fireEvent.change(password as HTMLInputElement, { target: { value: 'abc' } });
    fireEvent.blur(password as HTMLInputElement);

    expect(await screen.findByText('validation.passwordLength')).toBeTruthy();
    expect(document.body.textContent).not.toContain('abc');
  });

  test('recuperación rechaza un correo inválido sin llamar al backend', async () => {
    const { container } = renderConProviders(<ForgotForm />);
    const email = container.querySelector<HTMLInputElement>('input[name="email"]');
    expect(email).not.toBeNull();

    fireEvent.change(email as HTMLInputElement, { target: { value: 'sin-arroba' } });
    fireEvent.blur(email as HTMLInputElement);
    fireEvent.click(screen.getByRole('button', { name: 'forgot.sendLink' }));

    expect(await screen.findByText('validation.invalidEmailDomain')).toBeTruthy();
    expect(ApiFetch.post).not.toHaveBeenCalled();
  });
});
