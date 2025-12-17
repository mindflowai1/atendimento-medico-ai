import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, MapPin, FileText, Video, Check, Trash2 } from 'lucide-react';

const EventModal = ({ isOpen, onClose, event = null, selectedCalendar, calendars = [], onSave, onDelete }) => {
    const [formData, setFormData] = useState({
        summary: '',
        description: '',
        start: '',
        end: '',
        location: '',
        colorId: '1'
    });
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (event) {
                // Edit mode - populate with existing data
                const startDate = new Date(event.start.dateTime || event.start.date);
                const endDate = new Date(event.end.dateTime || event.end.date);

                setFormData({
                    summary: event.summary || '',
                    description: event.description || '',
                    start: formatDateTimeLocal(startDate),
                    end: formatDateTimeLocal(endDate),
                    location: event.location || '',
                    colorId: event.colorId || '1'
                });
            } else {
                // Create mode - set defaults
                const now = new Date();
                now.setMinutes(0);
                const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

                setFormData({
                    summary: '',
                    description: '',
                    start: formatDateTimeLocal(now),
                    end: formatDateTimeLocal(oneHourLater),
                    location: '',
                    colorId: '1'
                });
            }
            setShowSuccess(false);
        }
    }, [isOpen, event]);

    const formatDateTimeLocal = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.summary.trim()) {
            alert('Por favor, adicione um título para o evento.');
            return;
        }

        setIsSaving(true);
        try {
            await onSave(formData, event?.id);
            setShowSuccess(true);
            setTimeout(() => {
                onClose();
            }, 1500);
        } catch (error) {
            console.error('Error saving event:', error);
            alert('Erro ao salvar evento: ' + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Tem certeza que deseja excluir este evento?')) return;

        setIsSaving(true);
        try {
            await onDelete(event.id);
            onClose();
        } catch (error) {
            console.error('Error deleting event:', error);
            alert('Erro ao excluir evento: ' + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const addGoogleMeet = () => {
        setFormData(prev => ({
            ...prev,
            location: 'Google Meet (será gerado automaticamente)'
        }));
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {showSuccess ? (
                        <div className="flex flex-col items-center justify-center p-16 text-center">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 200 }}
                                className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 text-green-600"
                            >
                                <Check className="w-10 h-10" />
                            </motion.div>
                            <h2 className="text-2xl font-bold text-slate-800 mb-2">
                                {event ? 'Evento atualizado!' : 'Evento criado!'}
                            </h2>
                            <p className="text-slate-500">Sincronizando com Google Calendar...</p>
                        </div>
                    ) : (
                        <>
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-purple-50">
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-800">
                                        {event ? 'Editar Evento' : 'Novo Evento'}
                                    </h2>
                                    <p className="text-sm text-slate-500 mt-1">
                                        {calendars.find(c => c.id === selectedCalendar)?.summary || 'Google Calendar'}
                                    </p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 text-slate-400 hover:text-slate-800 hover:bg-white rounded-full transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
                                {/* Title */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Título do Evento *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.summary}
                                        onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                                        placeholder="Ex: Reunião com cliente, Consulta médica..."
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                                        autoFocus
                                    />
                                </div>

                                {/* Date & Time */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                                            <Clock className="w-4 h-4" />
                                            Início
                                        </label>
                                        <input
                                            type="datetime-local"
                                            value={formData.start}
                                            onChange={(e) => setFormData({ ...formData, start: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                                            <Clock className="w-4 h-4" />
                                            Fim
                                        </label>
                                        <input
                                            type="datetime-local"
                                            value={formData.end}
                                            onChange={(e) => setFormData({ ...formData, end: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Location */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                                        <MapPin className="w-4 h-4" />
                                        Local
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={formData.location}
                                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                            placeholder="Endereço ou link da reunião..."
                                            className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                                        />
                                        <button
                                            type="button"
                                            onClick={addGoogleMeet}
                                            className="px-4 py-3 bg-blue-50 text-blue-600 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors flex items-center gap-2 font-medium"
                                        >
                                            <Video className="w-4 h-4" />
                                            Meet
                                        </button>
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                                        <FileText className="w-4 h-4" />
                                        Descrição
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Adicione detalhes sobre o evento..."
                                        rows={4}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all resize-none"
                                    />
                                </div>
                            </form>

                            {/* Footer */}
                            <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                                {event ? (
                                    <button
                                        type="button"
                                        onClick={handleDelete}
                                        disabled={isSaving}
                                        className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Excluir
                                    </button>
                                ) : (
                                    <div />
                                )}

                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="px-6 py-2.5 text-slate-600 hover:text-slate-800 font-medium transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={isSaving}
                                        className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {isSaving ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Salvando...
                                            </>
                                        ) : (
                                            <>
                                                <Check className="w-4 h-4" />
                                                {event ? 'Atualizar' : 'Criar Evento'}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default EventModal;
