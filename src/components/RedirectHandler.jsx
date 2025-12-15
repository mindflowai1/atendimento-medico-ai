import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * RedirectHandler - Fixes incorrect OAuth redirects from Supabase/Google
 * 
 * Problem: Sometimes OAuth redirects to root /dashboard instead of /atendimento-medico-ai/dashboard
 * Solution: Detect this scenario and redirect to the correct path
 */
const RedirectHandler = () => {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        // Check if we're on GitHub Pages (not localhost)
        const isGitHubPages = window.location.hostname === 'mindflowai1.github.io';

        // Check if we have an OAuth code in the URL
        const urlParams = new URLSearchParams(location.search);
        const hasOAuthCode = urlParams.has('code');

        // Check if we're at the root path (not in the subpath)
        const isRootPath = window.location.pathname === '/dashboard';

        // If all conditions are met, redirect to the correct subpath
        if (isGitHubPages && hasOAuthCode && isRootPath) {
            console.log('🔄 Detected incorrect OAuth redirect. Correcting path...');
            const correctPath = `/atendimento-medico-ai/dashboard${location.search}`;
            window.location.href = `${window.location.origin}${correctPath}`;
        }
    }, [location, navigate]);

    return null; // This component doesn't render anything
};

export default RedirectHandler;
