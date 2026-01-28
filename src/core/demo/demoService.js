/**
 * Demo Service - Wrapper for DemoManager
 * Handles demo mode entry and navigation
 */

import { enableDemoMode } from './demoManager';

export const startDemoMode = (businessType) => {
    // Enable demo mode using centralized manager
    enableDemoMode(businessType);

    // Navigate to the app
    window.location.href = '/app';
};

export { isDemoMode, exitDemoMode } from './demoManager';
