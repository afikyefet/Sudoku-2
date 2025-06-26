import { Cell } from "../cmps/Cell";

export function Board() {

    const cells = [];

    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            cells.push(<Cell key={`${row}-${col}`} row={row} col={col} />);
            console.log(row, col);

        }
    }

    return (
        <section className="board-container">
            {cells}
        </section>
    )
}