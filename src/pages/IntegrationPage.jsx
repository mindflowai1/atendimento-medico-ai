import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle, ExternalLink, RefreshCw, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';

const IntegrationPage = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [email, setEmail] = useState('');

    useEffect(() => {
        checkConnection();
    }, []);

    const checkConnection = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data, error } = await supabase
                    .from('clinics')
                    .select('id, gcal_refresh_token, gcal_email')
                    .eq('owner_id', user.id)
                    .maybeSingle();

                if (data && data.gcal_refresh_token) {
                    setIsConnected(true);
                    setEmail(data.gcal_email || user.email);
                } else {
                    setIsConnected(false);
                }
            }
        } catch (error) {
            console.error('Error checking connection:', error);
            setIsConnected(false);
        }
    };

    const handleReconnect = async () => {
        setIsLoading(true);
        // Re-trigger login flow to refresh scopes/tokens
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/dashboard/integracoes`,
                    scopes: 'https://www.googleapis.com/auth/calendar',
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    },
                },
            });
            if (error) throw error;
        } catch (error) {
            console.error("Error reconnecting", error);
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Integrações</h1>
                <p className="text-slate-400">Gerencie as conexões com serviços externos.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Google Calendar Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-slate-700 transition-colors"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Calendar className="w-24 h-24" />
                    </div>

                    <div className="flex items-start justify-between mb-6 relative z-10">
                        <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700">
                            <img
                                src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Google_Calendar_icon_%282020%29.svg/1024px-Google_Calendar_icon_%282020%29.svg.png" // Keep existing
                                alt="Google Calendar"
                                className="w-8 h-8"
                            />
                        </div>
                        {isConnected ? (
                            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-medium border border-green-500/20">
                                <CheckCircle className="w-3.5 h-3.5" />
                                Conectado
                            </span>
                        ) : (
                            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-500/10 text-yellow-400 text-xs font-medium border border-yellow-500/20">
                                Não Vinculado
                            </span>
                        )}
                    </div>

                    <div className="mb-6 relative z-10">
                        <h3 className="text-xl font-bold text-white mb-2">Google Calendar</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            {isConnected
                                ? `Sincronizado com ${email}`
                                : "Sua agenda será sincronizada automaticamente com seu login do Google."}
                        </p>
                    </div>

                    {/* Action Button */}
                    <button
                        onClick={handleReconnect}
                        disabled={isLoading}
                        className="relative z-10 w-full py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-medium transition-all bg-white text-slate-900 hover:bg-slate-100 hover:shadow-lg hover:shadow-white/5 active:scale-95"
                    >
                        {isLoading ? (
                            <RefreshCw className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                <RefreshCw className="w-4 h-4" />
                                {isConnected ? 'Atualizar Permissões' : 'Conectar Agora'}
                            </>
                        )}
                    </button>

                </motion.div>

                {/* Placeholder for future integrations */}
                <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-6 flex flex-col items-center justify-center text-center border-dashed">
                    <div className="p-4 bg-slate-800/30 rounded-full mb-4">
                        <ExternalLink className="w-6 h-6 text-slate-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-500 mb-1">Mais em breve</h3>
                    <p className="text-slate-600 text-sm">Novas integrações estão sendo desenvolvidas.</p>
                </div>
            </div>
        </div>
    );
};

export default IntegrationPage;
