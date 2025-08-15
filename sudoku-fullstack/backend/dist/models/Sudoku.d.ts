import { Model } from 'mongoose';
import { ISudoku } from '../types';
interface SudokuModel extends Model<ISudoku> {
    findTrending(limit?: number): Promise<any[]>;
}
export declare const Sudoku: SudokuModel;
export {};
//# sourceMappingURL=Sudoku.d.ts.map