// Define the global config object structure
interface GlobalConfig {
    docId: number;
    restBase: string;
    basePath: string;
}

// Define the structure of the UMD bundle's global object
interface UMDApp {
    renderApp: (element: HTMLElement, config: GlobalConfig) => void;
}

// Extend the Window interface
interface Window {
    PD_GLOBAL_CONFIG: GlobalConfig | undefined;
    ProjectDocumentationApp: UMDApp | undefined;
}