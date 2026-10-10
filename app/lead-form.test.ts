import { describe, it, expect } from 'vitest';
import { isValidEmail, submitErrorMessage } from './lead-form';

describe('isValidEmail', () => {
  it.each(['andres@example.com', 'a.b+c@empresa.com.ec', '  ventas@corp.com  '])(
    'acepta %s',
    (email) => {
      expect(isValidEmail(email)).toBe(true);
    },
  );

  it.each(['', '   ', 'no-es-email', 'a@b', 'a@b.c', 'a b@c.com', '@empresa.com', 'ana@'])(
    'rechaza %j',
    (email) => {
      expect(isValidEmail(email)).toBe(false);
    },
  );
});

describe('submitErrorMessage', () => {
  it('explica los datos inválidos (400)', () => {
    expect(submitErrorMessage(400)).toMatch(/datos no son válidos/);
  });

  it('pide esperar si hay demasiados intentos (429)', () => {
    expect(submitErrorMessage(429)).toMatch(/demasiadas solicitudes/);
  });

  it.each([502, 503])('indica servicio no disponible (%i)', (status) => {
    expect(submitErrorMessage(status)).toMatch(/no está disponible/);
  });

  it('usa un mensaje genérico para otros códigos', () => {
    expect(submitErrorMessage(500)).toMatch(/Hubo un inconveniente/);
  });
});
