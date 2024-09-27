import React from "react";
import "./Popup.css"

const Popup = ({isOpen, onClose, children}) => {
    if (!isOpen) return null;
    return (
        <div className="popup-overlay reviews">
            <div className="popup-content reviews">{children}</div>
            <button className="close-btn" onClick={onClose}>
                Close
            </button>
        </div>
    );
};
export default Popup;
