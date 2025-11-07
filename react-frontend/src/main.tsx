import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx'
import './global.css'; 

import '@mantine/core/styles.css'; 
import '@mantine/carousel/styles.css';
import '@mantine/charts/styles.css';
import '@gfazioli/mantine-marquee/styles.layer.css';
import '@gfazioli/mantine-text-animate/styles.layer.css';

// Define the common function for rendering
function renderApp(element: HTMLElement, config: any) {
    (window as any).PD_GLOBAL_CONFIG = config; 

    createRoot(element).render(
        <StrictMode>
            <App />
        </StrictMode>
    );
}

// ---------------------- DEVELOMENT MODE MOUNT ----------------------
if (import.meta.env.DEV) {
    const rootElement = document.getElementById('root');
    if (rootElement) {
        // Mock config for local dev only 
        const mockDevConfig = {
            docId: 9999, 
            restBase: '/mock/wp-json/',
            basePath: '/docs-viewer/'
        };

        console.log('Running in DEV MODE. Auto-mounting app...');
        renderApp(rootElement, mockDevConfig);
    } else {
        console.error("No root element with ID 'root' found in index.html");
    }
}
// -------------------- END DEVELOMENT MODE MOUNT --------------------

// This remains for the UMD production build integration via WordPress
(window as any).ProjectDocumentationApp = {
    renderApp: renderApp,
};

console.log('✅ ProjectDocumentationApp Bundle/Main Executed.');