import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';
import { User } from './models/User';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log(__dirname);

export function updateUserView() {
    console.log("updateUserView");
    const user = localStorage.getItem('user');
    if (user) {
        try {
            const userObj = JSON.parse(user);
            console.log("Logged in user:", userObj);
            
            // Update UI elements based on user state
            const loginLink = document.querySelector('a[data-view="login"]') as HTMLElement;
            const registerLink = document.querySelector('a[data-view="register"]') as HTMLElement;
            const userDisplay = document.querySelector('.user-display') as HTMLElement;
            
            if (loginLink) loginLink.style.display = 'none';
            if (registerLink) registerLink.style.display = 'none';
            if (userDisplay) {
                userDisplay.textContent = `Welcome, ${userObj.username}`;
                userDisplay.style.display = 'block';
            }
        } catch (error) {
            console.error("Error parsing user data:", error);
            localStorage.removeItem('user');
        }
    } else {
        console.log("No user found");
        // Show login/register links when no user is logged in
        const loginLink = document.querySelector('a[data-view="login"]') as HTMLElement;
        const registerLink = document.querySelector('a[data-view="register"]') as HTMLElement;
        const userDisplay = document.querySelector('.user-display') as HTMLElement;
        
        if (loginLink) loginLink.style.display = 'block';
        if (registerLink) registerLink.style.display = 'block';
        if (userDisplay) userDisplay.style.display = 'none';
    }
}


