"use client"
import React from 'react';
import { useTheme } from 'next-themes'

const ThemeChanger = () => {
    const { setTheme } = useTheme()

    return (
        <div className="mode-switch-wrapper my_switcher setting-option">
            <input type="checkbox" className="checkbox" id="chk" />
            <label className="label" htmlFor="chk">
                <i className="fas fa-moon setColor dark theme__switcher-btn" onClick={() => setTheme('dark')}></i>
                <i className="fas fa-sun setColor light theme__switcher-btn" onClick={() => setTheme('light')}></i>
                <span className="ball"></span>
            </label>
        </div>
    );
};

export default ThemeChanger;

