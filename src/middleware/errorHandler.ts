import { Request, Response, NextFunction } from 'express';
import { ValidationError, NotFoundError, ConflictError } from '../utils/errors';

export const errorHandler = (error: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('Error:', error);

    if (error instanceof ValidationError ||
        error instanceof NotFoundError ||
        error instanceof ConflictError) {
        return res.status(error.statusCode).json({ error: error.message });
    }

    return res.status(500).json({ error: 'Internal server error' });
}; 