import React, { useEffect, useRef } from "react";
import "./Popup.css"

const Popup = ({ isOpen, onClose, children }) => {
    const popupRef = useRef(null);

    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (popupRef.current && !popupRef.current.contains(event.target)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleOutsideClick);
        }

        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="popup-overlay reviews">
            <div className="popup-content reviews" ref={popupRef}>
                {children}
                <button className="close-btn" onClick={onClose}>
                    Close
                </button>
            </div>
        </div>
    );
};

export default Popup;