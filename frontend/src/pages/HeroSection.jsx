import React from 'react'
import { Link } from 'react-router'

export const HeroSection = () => {
    return (
        <div className='hero-container pt-5 row-5'>
            <div className='hero-container-text'>
                <h4><span style={{color:"orange"}}>Conenct</span> with your friends</h4>
                <p>Cover a distance by Video Meet</p>
                <div className='btn'>
                    <Link to={'/home'}>Get Started</Link>
                </div>
            </div>
            <div className='hero-container-image'>
                <img src="/mobile.png" alt="mobile" />
            </div>
        </div>
    )
}
