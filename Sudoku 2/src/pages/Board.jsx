import { useEffect } from "react";
import { useSelector } from "react-redux";
import { ActionBar } from "../cmps/ActionBar";
import { Cell } from "../cmps/Cell";
import { loadBoard, setCell, setSelectedCell } from "../store/actions/board.action";

export function Board() {

    const currentBoard = useSelector((store) => store.boardModule.board);
    const isLoading = useSelector((store) => store.boardModule.isLoading);
    const selectedCell = useSelector((store) => store.boardModule.selectedCell);


    useEffect(() => {
        console.log('Board component mounted');

        loadBoard();
        if (!currentBoard || currentBoard.length === 0) {
            console.log('No board found, fetching board...');
        }
    }, []);


    function onCellClick(row, col) {
        if (currentBoard.cells[row][col].isFixed) return;
        setSelectedCell(row, col);
    }

    const isSelected = (row, col) => {
        return selectedCell && selectedCell.row === row && selectedCell.col === col;
    }

    const onSetValue = (value) => {
        console.log('setting value', value);
        console.log('selectedCell', selectedCell);
        console.log('currentBoard', currentBoard);

        if (value == null) {
            setCell(null);
            return;
        }

        if (!selectedCell || selectedCell == null) return;

        const { row, col } = selectedCell;

        if (currentBoard.cells[row][col].isFixed) return;


        console.log('setting cell', row, col, value);
        setCell(row, col, value);
    }

    function toggleFixed() {
        if (!selectedCell || selectedCell == null) return;

        const { row, col } = selectedCell;

        if (currentBoard.cells[row][col].isFixed) {
            setCell(row, col, currentBoard.cells[row][col].value, false);
        } else {
            setCell(row, col, currentBoard.cells[row][col].value, true);
        }
    }

    const renderBoard = () => {
        if (!currentBoard || !currentBoard.cells || currentBoard.cells.length === 0) {
            return <div className="loading">Loading...</div>;
        }
        return currentBoard.cells.map((row, rowIndex) => (
            row.map((cell, colIndex) => (
                <Cell key={`${rowIndex}-${colIndex}`} row={rowIndex} col={colIndex} value={currentBoard.cells[rowIndex][colIndex].value} isFixed={cell.isFixed} isSelected={isSelected(rowIndex, colIndex)} onClick={() => onCellClick(rowIndex, colIndex)} />
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
        <section className="board">
            <h1>{currentBoard.title}</h1>
            <p>{currentBoard.description}</p>
            <p>Created by: {currentBoard.createdBy}</p>
            <p>Created at: {new Date(currentBoard.createdAt).toLocaleString()}</p>
            <p>Updated at: {new Date(currentBoard.updatedAt).toLocaleString()}</p>
            <p>id: {currentBoard._id}</p>
            <section className="board-container">
                {
                    renderBoard()
                }
            </section>
            {selectedCell && <ActionBar onSetValue={onSetValue} selectedCell={selectedCell} toggleFixed={toggleFixed} />}
        </section>
    )
}