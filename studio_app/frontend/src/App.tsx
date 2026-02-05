import React, { useEffect } from 'react';

// Routes
import { AppRoutes } from './app/routes';

// Components
import { JobMonitor } from './features/jobs/components/JobMonitor';
import { ReaderWindow } from '@features/reader';
import { PublicationWindow } from '@features/publication';

const App: React.FC = () => {
    // === GLOBAL STORES ===
    // Legacy support only - Ideally we remove these too once we confirm no deep dependencies
    // const { setProjects } = useProjectStore(); 
    // const { setFileSystem } = useFileSystemStore();

    useEffect(() => {
        if (window.resizeTo) window.resizeTo(window.screen.availWidth, window.screen.availHeight);
    }, []);

    return (
        <>
            <AppRoutes />
            <JobMonitor />
            {/* Global Reader Window - works from any screen */}
            <ReaderWindow />
            {/* Global Publication Window - works from any screen */}
            <PublicationWindow />
        </>
    );
};

export default App;
