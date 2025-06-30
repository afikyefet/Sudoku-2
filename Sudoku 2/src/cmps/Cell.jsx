export function Cell({ row, col, addExcludedRef, isSelected, isFixed, onClick }) {

    return (
        <div
            ref={addExcludedRef}
            className={`cell-container ${row == 2 || row == 5 ? 'bottom-gap' : ''} ${col == 2 || col == 5 ? 'right-gap' : ''} ${isSelected ? 'selected' : ''} ${isFixed ? 'fixed' : ''}`}
            onClick={() => !isFixed && onClick(row, col)}
            style={{
                backgroundColor: isSelected ? '#d1e7dd' : isFixed ? '#f8d7da' : '#999999',
                cursor: isFixed ? 'default' : 'pointer'
            }}
        >
        </div>
    )
}