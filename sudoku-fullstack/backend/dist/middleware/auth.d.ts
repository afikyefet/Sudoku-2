import { Request, Response, NextFunction } from 'express';
import { IUserPayload } from '../types';
declare global {
    namespace Express {
        interface Request {
            user?: IUserPayload;
        }
    }
}
export declare const authenticateToken: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.d.ts.map