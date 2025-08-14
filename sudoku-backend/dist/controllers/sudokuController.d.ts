import { Response } from 'express';
import { IAuthRequest } from '../types';
export declare const getUserPuzzles: (req: IAuthRequest, res: Response) => Promise<void>;
export declare const createPuzzle: (req: IAuthRequest, res: Response) => Promise<void>;
export declare const deletePuzzle: (req: IAuthRequest, res: Response) => Promise<void>;
export declare const getPuzzle: (req: IAuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=sudokuController.d.ts.map