import { Request } from 'express';
import { Document } from 'mongoose';
export interface IUser extends Document {
    email: string;
    password: string;
    createdAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
}
export interface ISudoku extends Document {
    user: string;
    title: string;
    puzzleData: number[][];
    createdAt: Date;
}
export interface IJWTPayload {
    userId: string;
    email: string;
}
export interface IAuthRequest extends Request {
    user?: {
        userId: string;
        email: string;
    };
}
export interface IApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
}
export interface IAuthResponse {
    token: string;
    user: {
        id: string;
        email: string;
    };
}
//# sourceMappingURL=index.d.ts.map