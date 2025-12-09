import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { QrCode, Smartphone, Loader2, CheckCircle, AlertCircle, LogOut, ArrowLeft } from 'lucide-react';
import { apiService } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const ConnectionPage = () => {
    const navigate = useNavigate();
    const [instanceName, setInstanceName] = useState(''); // Start empty to wait for fetch
    const [loading, setLoading] = useState(false);
    const [qrCode, setQrCode] = useState(null);
    const [status, setStatus] = useState('idle');
    const [errorMsg, setErrorMsg] = useState('');

    // Fetch existing instance name from DB on mount
    React.useEffect(() => {
        const fetchInstanceInfo = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const { data } = await supabase
                        .from('clinics')
                        .select('instance_name')
                        .eq('owner_id', user.id)
                        .maybeSingle();

                    // Logic to check if we should use the DB name or generate a new "friendly" one
                    // We overwrite if it's the old "instancia-UUID" format (approx check) to give them the new friendly format
                    const currentDbName = data?.instance_name;
                    const isLegacyName = currentDbName && currentDbName.startsWith(`instancia-${user.id.slice(0, 8)}`);

                    if (currentDbName && !isLegacyName) {
                        setInstanceName(currentDbName);
                    } else {
                        // Generate friendly name
                        const userName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'user';
                        const sanitizedName = userName.toLowerCase().replace(/[^a-z0-9]/g, '');
                        const shortId = user.id.slice(0, 4);
                        setInstanceName(`instancia-${sanitizedName}-${shortId}`);
                    }
                }
            } catch (error) {
                console.error("Error fetching instance info:", error);
            }
        };
        fetchInstanceInfo();
    }, []);

    const handleCreateAndConnect = async () => {
        setLoading(true);
        setStatus('creating');
        setErrorMsg('');
        setQrCode(null);

        try {
            // Save/Update instance name in DB first
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                await supabase
                    .from('clinics')
                    .upsert({
                        owner_id: user.id,
                        instance_name: instanceName
                    }, { onConflict: 'owner_id' });
            }

            // 1. Create Instance
            try {
                await apiService.createInstance(instanceName);
            } catch (err) {
                console.warn("Instance creation warning:", err);
            }

            setStatus('ready');

            // 2. Fetch QR Code
            const connectRes = await apiService.connectInstance(instanceName);

            if (connectRes.base64) {
                setQrCode(connectRes.base64);
            } else if (connectRes.qrcode && connectRes.qrcode.base64) {
                setQrCode(connectRes.qrcode.base64);
            } else {
                throw new Error("Formato de QR Code não reconhecido na resposta.");
            }

        } catch (error) {
            console.error(error);
            setStatus('error');
            // Show more detailed error message if available
            setErrorMsg(error.message || 'Falha ao criar/conectar instância. Verifique a API Key e o console.');
        } finally {
            setLoading(false);
        }
    };

    // Check status on mount (only if we have an instance name)
    React.useEffect(() => {
        if (!instanceName) return;

        const checkInitialStatus = async () => {
            setLoading(true); // Reuse loading state or add specific 'isChecking' if preferred. Reuse is fine for blocking.
            console.log(`Checking connection status for: ${instanceName}`);
            try {
                const stateData = await apiService.fetchConnectionState(instanceName);
                console.log("Connection State Data:", stateData);

                const connectionState = stateData?.instance?.state || stateData?.state;
                if (connectionState === 'open') {
                    setStatus('connected');
                } else {
                    console.log("Instance exists but not connected:", connectionState);
                    // If instance exists but not connected, we stay in 'idle' to allow connecting.
                }
            } catch (err) {
                console.error("Failed to check initial status:", err);
                // Don't set errorMsg here to avoid blocking UI, but log it.
                // If it's a 403, we definitely want to know.
                if (err.message && err.message.includes('Forbidden')) {
                    console.warn("Auth Error during status check - check API Key");
                }
            } finally {
                setLoading(false);
            }
        };
        checkInitialStatus();
    }, [instanceName]);

    const handleDisconnect = async () => {
        if (!window.confirm("Tem certeza? Isso apagará a conexão atual para criar uma nova.")) return;

        setLoading(true);
        try {
            await apiService.deleteInstance(instanceName);
            // Reset State
            setQrCode(null);
            setStatus('idle');
            setErrorMsg('');
            alert("Instância desconectada/removida com sucesso.");
        } catch (error) {
            console.error("Error disconnecting:", error);
            // Even if error, we might want to reset local state to allow retry
            setQrCode(null);
            setStatus('idle');
            alert("Instância removida localmente (erro na API ou já removida).");
        } finally {
            setLoading(false);
        }
    };

    // Polling for Connection Status
    React.useEffect(() => {
        let intervalId;

        // Start polling if we have a QR Code displayed or we are in 'ready' state
        if ((qrCode || status === 'ready' || status === 'creating') && instanceName) {
            intervalId = setInterval(async () => {
                try {
                    const stateData = await apiService.fetchConnectionState(instanceName);
                    // Evolution API structure usually: { instance: { state: 'open' } } or just { state: 'open' } depending on version.
                    // Let's handle generic case or check specific path.
                    // Based on Evolution docs: response.instance.state

                    const connectionState = stateData?.instance?.state || stateData?.state;

                    if (connectionState === 'open') {
                        setStatus('connected');
                        clearInterval(intervalId);
                        // Optional: Small delay for UX
                        setTimeout(() => {
                            navigate('/dashboard');
                        }, 1500);
                    }
                } catch (err) {
                    // Ignore polling errors (e.g. 404 if instance not ready yet)
                }
            }, 3000); // Check every 3 seconds
        }

        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [qrCode, status, instanceName, navigate]);

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl p-8 relative overflow-hidden">

                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>

                <div className="text-center mb-8 relative z-10">
                    <div className="mx-auto w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                        <Smartphone className="w-8 h-8 text-primary-light" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Conectar Warley AI</h1>
                    <p className="text-slate-400">Escaneie o QR Code para conectar seu WhatsApp à inteligência artificial.</p>
                </div>

                <div className="space-y-6 relative z-10">

                    {/* Instance Name Input */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Nome da Instância</label>
                        <input
                            type="text"
                            value={instanceName}
                            onChange={(e) => setInstanceName(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            placeholder="Ex: clinica-vida"
                            disabled={loading || status === 'ready'}
                        />
                    </div>



                    {/* QR Code Display Area */}
                    <div className="bg-white rounded-xl p-4 flex flex-col items-center justify-center min-h-[250px] relative">
                        {loading ? (
                            <div className="flex flex-col items-center">
                                <Loader2 className="w-10 h-10 text-primary animate-spin mb-2" />
                                <span className="text-slate-500 text-sm animate-pulse">
                                    {status === 'creating' ? 'Criando instância...' : 'Gerando QR Code...'}
                                </span>
                            </div>
                        ) : qrCode ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center"
                            >
                                <img src={qrCode} alt="QR Code" className="w-64 h-64 object-contain mx-auto mb-2" />
                                <p className="text-slate-500 text-xs mt-2">Abra o WhatsApp {'>'} Aparelhos Conectados {'>'} Conectar</p>
                            </motion.div>
                        ) : status === 'connected' ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center text-green-500"
                            >
                                <CheckCircle className="w-20 h-20 mx-auto mb-4" />
                                <h3 className="text-xl font-bold mb-1">Conectado!</h3>
                            </motion.div>
                        ) : status === 'error' ? (
                            <div className="text-center text-red-500">
                                <AlertCircle className="w-10 h-10 mx-auto mb-2" />
                                <p className="text-sm">{errorMsg}</p>
                            </div>
                        ) : (
                            <div className="text-center text-slate-400">
                                <QrCode className="w-16 h-16 mx-auto mb-2 opacity-20" />
                                <p className="text-sm">O QR Code aparecerá aqui</p>
                            </div>
                        )}
                    </div>

                    {/* Action Button - Only show if NOT connected */}
                    {status !== 'connected' && (
                        <button
                            onClick={handleCreateAndConnect}
                            disabled={loading || (qrCode && status === 'ready') || !instanceName}
                            className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2
                                ${loading || (qrCode && status === 'ready') || !instanceName
                                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                                    : 'bg-primary hover:bg-primary-dark text-white shadow-lg hover:shadow-primary/25 hover:-translate-y-1'}
                            `}
                        >
                            {loading ? 'Processando...' : qrCode ? 'Aguardando Leitura...' : 'Gerar QR Code e Conectar'}
                        </button>
                    )}

                    {/* Disconnect Button - Main Area */}
                    {status === 'connected' && (
                        <button
                            onClick={handleDisconnect}
                            disabled={loading}
                            className="w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/50"
                        >
                            {loading ? 'Desconectando...' : 'Desconectar'}
                        </button>
                    )}

                    {qrCode && (
                        <div className="text-center text-xs text-slate-500 mt-4">
                            <p>Instância: <span className="text-primary-light font-mono">{instanceName}</span></p>
                        </div>
                    )}

                </div>

                {/* Footer Actions */}
                <div className="mt-6 space-y-3 pt-6 text-center border-t border-slate-800">
                    {/* Back Button - Prominent */}
                    <button
                        onClick={() => navigate(-1)}
                        className="w-full py-3 rounded-xl font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Voltar
                    </button>

                    {(qrCode || status === 'ready' || status === 'error') && (
                        <button
                            onClick={handleDisconnect}
                            disabled={loading}
                            className="text-red-400 hover:text-red-300 text-sm font-medium flex items-center justify-center gap-2 mx-auto transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            Cancelar / Nova Instância
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ConnectionPage;
