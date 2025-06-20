export function Cell(row, col) {

    console.log(row);


    return (
        <div className={`cell-container ${row.row == 2 || row.row == 5 ? 'bottom-gap' : ''} ${row.col == 2 || row.col == 5 ? 'right-gap' : ''}`}>

        </div>
    )
}