import React from 'react'
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import IconButton from '@mui/material/IconButton';
import { useNavigate } from 'react-router-dom';
export const BackButton = () => {
  const navigate= useNavigate();
  const handleBackButton = ()=>{
    navigate("/");
  }
  return (
    <div className='back-button'>
        <IconButton onClick={handleBackButton}>
            <ArrowBackIcon className='text-white'/>
        </IconButton>
    </div>
  )
}
