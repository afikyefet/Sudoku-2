import { resetSelectedCell, setCell } from "../store/actions/board.action";

export function ActionBar({ selectedCell }) {



    return (
        <section className="action-bar">
            <div className="cell value" onClick={() => setCell(selectedCell.row, selectedCell.col, 1)}>1</div>
            <div className="cell value">2</div>
            <div className="cell value">3</div>
            <div className="cell value">4</div>
            <div className="cell value">5</div>
            <div className="cell value">6</div>
            <div className="cell value">7</div>
            <div className="cell value">8</div>
            <div className="cell value">9</div>
            <div className="cell value" onClick={() => resetSelectedCell()}>X</div>
        </section >
    )
}