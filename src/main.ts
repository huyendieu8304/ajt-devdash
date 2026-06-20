import './style.css';
import { renderApp } from './ui';

// right after load page structure, run render UI
document.addEventListener('DOMContentLoaded', () => {
    renderApp();
});