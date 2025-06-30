import { useSelector } from "react-redux";
import { Cell } from "../cmps/Cell";
import { setSelectedCell } from "../store/actions/board.action";

export function Board() {

    const currentBoard = useSelector((store) => store.boardModule.board);
    const isLoading = useSelector((store) => store.boardModule.isLoading);
    const selectedCell = useSelector((store) => store.boardModule.selectedCell);

    function onCellClick(row, col) {
        if (currentBoard.cells[row][col].isFixed) return;
        setSelectedCell(row, col);
    }

    const isSelected = (row, col) => {
        return selectedCell && selectedCell.row === row && selectedCell.col === col;
    }

    const renderBoard = () => {
        return currentBoard.cells.map((row, rowIndex) => (
            row.map((cell, colIndex) => (
                <Cell key={`${rowIndex}-${colIndex}`} row={rowIndex} col={colIndex} value={cell.value} isFixed={cell.isFixed} isSelected={isSelected(rowIndex, colIndex)} onClick={() => onCellClick(rowIndex, colIndex)} />
            ))
        ))
    }


    if (!currentBoard || currentBoard.length === 0) {
        return (
            <section className="board-container">
                <div className="loading">Loading...</div>
            </section>
        );
    }
    if (isLoading) {
        return (
            <section className="board-container">
                <div className="loading">Loading...</div>
            </section>
        );
    }
    return (
        <section className="board-header">
            <h1>{currentBoard.title}</h1>
            <p>{currentBoard.description}</p>
            <p>Created by: {currentBoard.createdBy}</p>
            <p>Created at: {new Date(currentBoard.createdAt).toLocaleString()}</p>
            <p>Updated at: {new Date(currentBoard.updatedAt).toLocaleString()}</p>
            <section className="board-container">
                {
                    renderBoard()
                }
            </section>
        </section>
    )
}