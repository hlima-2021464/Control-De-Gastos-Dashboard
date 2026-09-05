import { Request, Response, NextFunction } from 'express';
import { login } from '../services/auth.service';

/**
 * POST /api/auth/login
 * Body: { identifier: string, password: string }
 */
export async function loginHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { identifier, password } = req.body as {
      identifier?: string;
      password?:   string;
    };

    // Validación básica de campos
    if (!identifier || typeof identifier !== 'string' || identifier.trim() === '') {
      res.status(400).json({
        status:  'error',
        message: 'El campo identifier (email o username) es requerido.',
      });
      return;
    }

    if (!password || typeof password !== 'string' || password.trim() === '') {
      res.status(400).json({
        status:  'error',
        message: 'El campo password es requerido.',
      });
      return;
    }

    const result = await login(identifier.trim(), password);

    res.status(200).json({
      status:  'success',
      message: 'Login exitoso.',
      data: {
        user:  result.user,
        token: result.token,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'INVALID_CREDENTIALS') {
      res.status(401).json({
        status:  'error',
        message: 'Credenciales inválidas. Verifique su usuario o email y contraseña.',
      });
      return;
    }
    next(error);
  }
}

/**
 * POST /api/auth/refresh
 * Requiere header Authorization: Bearer <token>
 */
export async function refreshTokenHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        status: 'error',
        message: 'Usuario no autenticado para renovar el token.',
      });
      return;
    }

    const { signToken } = await import('../../../utils/jwt');
    const newToken = signToken({
      sub: req.user.sub,
      username: req.user.username,
      role: req.user.role,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token renovado con éxito.',
      data: {
        token: newToken,
        user: {
          id: req.user.sub,
          username: req.user.username,
          role: req.user.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}
