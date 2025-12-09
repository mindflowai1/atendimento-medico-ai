import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Save, Loader2, Camera } from 'lucide-react';

const ConfiguracoesPage = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null); // { type: 'success' | 'error', text: '' }

    // Form State
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
        address: '',
        avatar_url: ''
    });

    useEffect(() => {
        getProfile();
    }, []);

    const getProfile = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                // Should not happen if protected
                return;
            }

            const meta = user.user_metadata || {};

            setFormData({
                full_name: meta.full_name || meta.name || '',
                email: user.email || '',
                phone: meta.phone || '',
                address: meta.address || '',
                avatar_url: meta.avatar_url || ''
            });
        } catch (error) {
            console.error('Error loading profile:', error);
            setMessage({ type: 'error', text: 'Erro ao carregar perfil.' });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);

        try {
            const { error } = await supabase.auth.updateUser({
                data: {
                    full_name: formData.full_name,
                    phone: formData.phone,
                    address: formData.address,
                    // We don't update email here as it requires re-verification flow usually
                }
            });

            if (error) throw error;

            setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
        } catch (error) {
            console.error('Error updating profile:', error);
            setMessage({ type: 'error', text: 'Erro ao salvar alterações.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Configurações de Perfil</h1>
                <p className="text-slate-400">Gerencie suas informações pessoais e de contato.</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl">
                <form onSubmit={handleUpdateProfile} className="space-y-8">

                    {/* Header / Avatar Section */}
                    <div className="flex flex-col md:flex-row items-center gap-6 pb-8 border-b border-slate-800">
                        <div className="relative group">
                            <div className="w-24 h-24 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center overflow-hidden">
                                {formData.avatar_url ? (
                                    <img src={formData.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-10 h-10 text-slate-500" />
                                )}
                            </div>
                            <button
                                type="button"
                                className="absolute bottom-0 right-0 p-2 bg-primary rounded-full text-white shadow-lg hover:bg-primary-dark transition-colors"
                                title="Alterar foto (em breve)"
                            >
                                <Camera className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="text-center md:text-left">
                            <h2 className="text-xl font-semibold text-white">{formData.full_name || 'Usuário'}</h2>
                            <p className="text-slate-400 text-sm">{formData.email}</p>
                        </div>
                    </div>

                    {/* Form Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                <User className="w-4 h-4 text-primary" />
                                Nome Completo
                            </label>
                            <input
                                type="text"
                                value={formData.full_name}
                                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                placeholder="Seu nome completo"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 flex items-center gap-2 opacity-70">
                                <Mail className="w-4 h-4 text-primary" />
                                E-mail (Não editável)
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                disabled
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-slate-500 cursor-not-allowed"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                <Phone className="w-4 h-4 text-primary" />
                                Telefone / WhatsApp
                            </label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                placeholder="(00) 00000-0000"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-primary" />
                                Endereço
                            </label>
                            <input
                                type="text"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                placeholder="Seu endereço completo"
                            />
                        </div>

                    </div>

                    {message && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`p-4 rounded-xl text-center text-sm font-medium ${message.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                }`}
                        >
                            {message.text}
                        </motion.div>
                    )}

                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={saving}
                            className={`
                                px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg hover:shadow-primary/25
                                ${saving ? 'bg-slate-700 text-slate-400 cursor-not-allowed' : 'bg-primary hover:bg-primary-dark text-white hover:-translate-y-1'}
                            `}
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Salvando...
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    Salvar Alterações
                                </>
                            )}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default ConfiguracoesPage;
