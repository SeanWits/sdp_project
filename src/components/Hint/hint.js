import "./hint.css"

export function Hint({hintText, children}) {
    return (
        <div id="hint">
            {children}
            <span id="hint-text">
                {hintText}
            </span>
        </div>
    );
}