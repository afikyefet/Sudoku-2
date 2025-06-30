import { useSelector } from "react-redux";
import { Cell } from "../cmps/Cell";
import { resetSelectedCell, setSelectedCell } from "../store/actions/board.action";
import { ActionBar } from "../cmps/ActionBar";
import { useEffect, useRef } from "react";

export function Board() {

    const currentBoard = useSelector((store) => store.boardModule.board);
    const isLoading = useSelector((store) => store.boardModule.isLoading);
    const selectedCell = useSelector((store) => store.boardModule.selectedCell);

    const excludedRef = useRef([]);

    const addExcludedRef = (el) => {
        if (el && !excludedRef.current.includes(el)) {
            excludedRef.current.push(el);
        }
    };


    // useEffect(() => {
    //     function handleClickOutside() {
    //         const clickedInside = excludedRef.current.some((el) =>
    //             el.contains(event.target)
    //         );
    //         if (!clickedInside) {
    //             console.log('Clicked outside all protected elements!');
    //             resetSelectedCell();
    //         }
    //     }

    //     document.addEventListener('mousedown', handleClickOutside);
    //     return () => {
    //         document.removeEventListener('mousedown', handleClickOutside);
    //     };
    // }, []);

    function onCellClick(row, col) {
        if (currentBoard[row][col].isFixed) return;
        setSelectedCell(row, col);
    }

    const isSelected = (row, col) => {
        return selectedCell && selectedCell.row === row && selectedCell.col === col;
    }

    const renderBoard = () => {
        return currentBoard.map((row, rowIndex) => (
            row.map((cell, colIndex) => (
                <Cell ref={addExcludedRef} key={`${rowIndex}-${colIndex}`} row={rowIndex} col={colIndex} isFixed={cell.isFixed} isSelected={isSelected(rowIndex, colIndex)} onClick={() => onCellClick(rowIndex, colIndex)} />
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
            <section className="board-container">
                {
                    renderBoard()
                }
            </section>
            {selectedCell && <ActionBar selectedCell={selectedCell} />}
        </section>
    )
}