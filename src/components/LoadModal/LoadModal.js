import React from 'react';
import ClimbingBoxLoader from "react-spinners/ClimbingBoxLoader";
import './LoadModal.css';

function LoadModal({ loading }) {
  if (!loading) return null;

  return (
    <div className="load-modal">
      <ClimbingBoxLoader
        color={'#ffe500'}
        loading={loading}
        size={15}
        aria-label="Loading Spinner"
        data-testid="loader"
      />
    </div>
  );
}

export default LoadModal;