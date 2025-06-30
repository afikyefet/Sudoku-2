
export function ActionBar({ onSetValue, selectedCell, toggleFixed }) {



    return (
        <section className="action-bar">
            {Array.from({ length: 9 }, (_, i) => (
                <div
                    key={i + 1}
                    className={`cell value ${selectedCell && selectedCell.value === i + 1 ? 'selected' : ''}`}
                    onClick={() => onSetValue(i + 1)}
                >
                    {i + 1}
                </div>
            ))}
            <div className="cell value" onClick={() => onSetValue(null)}>X</div>
            <div className="cell value" onClick={() => toggleFixed()}>F</div>
        </section >
    )
}