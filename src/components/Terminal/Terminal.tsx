import "./Terminal.css";
export default function Terminal() {
    return (
        <div className="terminal">
            <div className="prompt">
                <div>&gt;</div>
                <div>ctrl.altf.red</div>
                <div className="cursor"></div>
            </div>
        </div>
    )
}