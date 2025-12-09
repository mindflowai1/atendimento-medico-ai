import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Loader2, ArrowRight } from 'lucide-react';
import logo from '../assets/logo.png';

const LoginPage = () => {
    const [loading, setLoading] = useState(false);
    const [timeLeft, setTimeLeft] = useState(5);
    const navigate = useNavigate();

    React.useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    navigate('/');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [navigate]);

    const handleGoogleLogin = async () => {
        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}${import.meta.env.BASE_URL}dashboard`,
                    scopes: 'https://www.googleapis.com/auth/calendar',
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    },
                },
            });

            if (error) throw error;
        } catch (error) {
            console.error('Error logging in:', error.message);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">

            {/* Background Effects */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[128px] pointer-events-none mix-blend-screen"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-[128px] pointer-events-none mix-blend-screen"></div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-md w-full bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl p-8 relative z-10 text-center"
            >
                {/* Logo */}
                <>
                    <Loader2 className="animate-spin h-5 w-5 text-slate-600" />
                    <span>Redirecionando...</span>
                </>
                ) : (
                <>
                    <img
                        src="https://www.google.com/favicon.ico"
                        alt="Google"
                        className="w-5 h-5"
                    />
                    <span>Entrar com Google</span>
                    <ArrowRight className="h-5 w-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
                </>
                    )}
            </button>

            <div className="mt-8 text-sm text-slate-500 space-y-2">
                <p>Ao entrar, você autoriza o acesso à sua agenda para sincronização automática.</p>
                <p className="text-xs text-slate-600">Voltando para o início em {timeLeft}s...</p>
            </div>
        </motion.div>
        </div >
    );
};

export default LoginPage;
