import React from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Tooltip from '@mui/material/Tooltip';
import { useNavigate } from 'react-router-dom';

export const BackButton = () => {
  const navigate = useNavigate();
  const handleBackButton = () => {
    navigate('/');
  };

  return (
    <div className="back-button-wrapper">
      <Tooltip title="Back to Home" placement="right">
        <button onClick={handleBackButton} className="back-btn" aria-label="Back to home">
          <ArrowBackIcon fontSize="small" />
          <span className="back-btn-text">Home</span>
        </button>
      </Tooltip>
    </div>
  );
};

