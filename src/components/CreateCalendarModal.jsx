import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Palette, Calendar } from 'lucide-react';

const CALENDAR_COLORS = [
    { id: '1', name: 'Azul', color: '#3b82f6' },
    { id: '2', name: 'Verde', color: '#22c55e' },
    { id: '3', name: 'Roxo', color: '#a855f7' },
    { id: '4', name: 'Rosa', color: '#ec4899' },
    { id: '5', name: 'Laranja', color: '#f97316' },
    { id: '6', name: 'Amarelo', color: '#eab308' },
    { id: '7', name: 'Vermelho', color: '#ef4444' },
    { id: '8', name: 'Cinza', color: '#6b7280' },
];

const CreateCalendarModal = ({ isOpen, onClose, onSave }) => {
    const [calendarName, setCalendarName] = useState('');
    const [selectedColor, setSelectedColor] = useState(CALENDAR_COLORS[0]);
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!calendarName.trim()) {
            alert('Por favor, digite um nome para a agenda.');
            return;
        }

        setIsSaving(true);
        try {
            await onSave({ name: calendarName, color: selectedColor });
            setCalendarName('');
            setSelectedColor(CALENDAR_COLORS[0]);
            onClose();
        } catch (error) {
            console.error('Error creating calendar:', error);
            alert('Erro ao criar agenda: ' + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
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
                className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-purple-50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                            <Calendar className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800">Nova Agenda</h2>
                            <p className="text-sm text-slate-500">Criar calendário no Google</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-800 hover:bg-white rounded-full transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Calendar Name */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Nome da Agenda *
                        </label>
                        <input
                            type="text"
                            value={calendarName}
                            onChange={(e) => setCalendarName(e.target.value)}
                            placeholder="Ex: Dr. Pedro Cardiologista, Emergências..."
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                            autoFocus
                        />
                    </div>

                    {/* Color Selection */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                            <Palette className="w-4 h-4" />
                            Cor da Agenda
                        </label>
                        <div className="grid grid-cols-4 gap-3">
                            {CALENDAR_COLORS.map((color) => (
                                <button
                                    key={color.id}
                                    type="button"
                                    onClick={() => setSelectedColor(color)}
                                    className={`p-3 rounded-xl border-2 transition-all hover:scale-105 ${selectedColor.id === color.id
                                            ? 'border-blue-500 shadow-lg'
                                            : 'border-slate-200'
                                        }`}
                                >
                                    <div
                                        className="w-full h-8 rounded-lg"
                                        style={{ backgroundColor: color.color }}
                                    />
                                    <p className="text-xs text-slate-600 mt-2 text-center font-medium">
                                        {color.name}
                                    </p>
                                </button>
                            ))}
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2.5 text-slate-600 hover:text-slate-800 font-medium transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSaving || !calendarName.trim()}
                        className="px-8 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-semibold shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isSaving ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Criando...
                            </>
                        ) : (
                            <>
                                <Calendar className="w-4 h-4" />
                                Criar Agenda
                            </>
                        )}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default CreateCalendarModal;
