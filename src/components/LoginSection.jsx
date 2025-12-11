import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Loader2, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const LoginSection = ({ isOpen, onClose }) => {
    const [loading, setLoading] = useState(false);

    // Reset loading state when modal closes
    React.useEffect(() => {
        if (!isOpen) setLoading(false);
    }, [isOpen]);

    const handleGoogleLogin = async () => {
        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/dashboard`,
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
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.33, 1, 0.68, 1] }}
                    className="bg-slate-900/95 backdrop-blur-xl border-b border-slate-800 overflow-hidden relative z-40 shadow-2xl"
                >
                    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-full transition-all duration-200"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex flex-col items-center">
                            <div className="text-center mb-8">
                                <h2 className="text-2xl font-bold text-white mb-2">Acesse sua conta</h2>
                                <p className="text-slate-400 text-sm">Gerencie sua clínica inteligente com o Warley</p>
                            </div>

                            <div className="w-full max-w-sm space-y-4">
                                <button
                                    onClick={handleGoogleLogin}
                                    disabled={loading}
                                    className="w-full flex items-center justify-center gap-3 py-4 px-4 bg-white hover:bg-slate-100 text-slate-900 font-bold rounded-xl shadow-lg transform hover:-translate-y-0.5 transition-all text-sm group disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
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
                                            <ArrowRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>

                                <p className="text-center text-xs text-slate-500 mt-4 px-4">
                                    Ao entrar, você será redirecionado para o login seguro do Google e autorizará o acesso à sua agenda.
                                    <br />
                                    <Link to="/privacidade" className="inline-block mt-2 text-primary hover:text-primary-light underline decoration-slate-800 hover:decoration-primary transition-colors">
                                        Política de Privacidade
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default LoginSection;
