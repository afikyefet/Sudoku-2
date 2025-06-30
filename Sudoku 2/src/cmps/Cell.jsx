export function Cell({ row, col, value, isSelected, isFixed, onClick }) {

    console.log('Cell rendered:', row, col, value, isSelected, isFixed);


    return (
        <div
            className={`cell-container ${row == 2 || row == 5 ? 'bottom-gap' : ''} ${col == 2 || col == 5 ? 'right-gap' : ''} ${isSelected ? 'selected' : ''} ${isFixed ? 'fixed' : ''}`}
            // onClick={() => !isFixed && onClick(row, col)}
            onClick={() => onClick(row, col)}
            style={{
                backgroundColor: isSelected ? '#d1e7dd' : isFixed ? '#f8d7da' : '#999999',
                cursor: isFixed ? 'default' : 'pointer'
            }}
        >
            <span className="cell-value">
                {!(value == 0) && value !== null && value !== undefined ? value : ''}
            </span>
        </div>
    )
}