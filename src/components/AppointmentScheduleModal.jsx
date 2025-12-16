import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, MapPin, FileText, Check, Plus, Trash2, Calendar, Layout, Copy, Globe, ChevronRight, ArrowLeft } from 'lucide-react';

const DAYS_OF_WEEK = [
    { id: 1, label: 'Segunda', short: 'Seg' },
    { id: 2, label: 'Terça', short: 'Ter' },
    { id: 3, label: 'Quarta', short: 'Qua' },
    { id: 4, label: 'Quinta', short: 'Qui' },
    { id: 5, label: 'Sexta', short: 'Sex' },
    { id: 6, label: 'Sábado', short: 'Sáb' },
    { id: 0, label: 'Domingo', short: 'Dom' }
];

const DEFAULT_SCHEDULE = {
    schedule_name: '',
    duration_minutes: 60,
    timezone: 'America/Sao_Paulo',
    location_type: 'google_meet',
    location_details: '',
    description: '',
    schedule_type: 'internal', // 'internal' | 'external_google'
    external_link: '',
    availability_rules: {
        1: [{ start: '09:00', end: '17:00' }], // Seg
        2: [{ start: '09:00', end: '17:00' }], // Ter
        3: [{ start: '09:00', end: '17:00' }], // Qua
        4: [{ start: '09:00', end: '17:00' }], // Qui
        5: [{ start: '09:00', end: '17:00' }]  // Sex
    },
    booking_form_config: [
        { id: 'name', label: 'Nome Completo', required: true },
        { id: 'email', label: 'Email', required: true },
        { id: 'phone', label: 'Telefone', required: true },
        { id: 'notes', label: 'Observações', required: false }
    ]
};

const AppointmentScheduleModal = ({ isOpen, onClose, initialData = null, onSave, selectedCalendarId = 'primary' }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState(DEFAULT_SCHEDULE);
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({
                    ...DEFAULT_SCHEDULE,
                    ...initialData,
                    availability_rules: initialData.availability_rules || DEFAULT_SCHEDULE.availability_rules,
                    booking_form_config: initialData.booking_form_config || DEFAULT_SCHEDULE.booking_form_config,
                    schedule_type: initialData.schedule_type || 'internal',
                    external_link: initialData.external_link || ''
                });
            } else {
                setFormData({
                    ...DEFAULT_SCHEDULE,
                    calendar_id: selectedCalendarId,
                    schedule_type: 'internal'
                });
            }
            setStep(1);
            setShowSuccess(false);
        }
    }, [isOpen, initialData, selectedCalendarId]);

    const handleNext = () => setStep(prev => prev + 1);
    const handleBack = () => setStep(prev => prev - 1);

    const handleSave = async () => {
        if (!formData.schedule_name) {
            alert('Por favor, dê um título para o agendamento.');
            return;
        }

        if (formData.schedule_type === 'external_google' && !formData.external_link) {
            alert('Por favor, cole o link do Google Calendar.');
            return;
        }

        setIsSaving(true);
        try {
            await onSave(formData);
            setShowSuccess(true);
            setTimeout(() => {
                onClose();
            }, 2000);
        } catch (error) {
            console.error("Error saving schedule:", error);
            alert("Erro ao salvar: " + error.message);
        } finally {
            setIsSaving(false);
        }
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
                    className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[85vh] md:h-[800px] text-slate-800"
                >
                    {showSuccess ? (
                        <SuccessView onClose={onClose} />
                    ) : (
                        <>
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-white">
                                <div>
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                        {step > 1 && (
                                            <button onClick={handleBack} className="hover:text-slate-800 transition-colors">
                                                <ArrowLeft className="w-4 h-4" />
                                            </button>
                                        )}
                                        {formData.schedule_name || 'Novo Agendamento'}
                                    </span>
                                    <div className="flex gap-2 mt-2">
                                        <div className={`h-1.5 w-8 rounded-full transition-colors ${step >= 1 ? 'bg-blue-600' : 'bg-slate-200'}`} />
                                        <div className={`h-1.5 w-8 rounded-full transition-colors ${step >= 2 ? 'bg-blue-600' : 'bg-slate-200'}`} />
                                        {formData.schedule_type === 'internal' && (
                                            <div className={`h-1.5 w-8 rounded-full transition-colors ${step >= 3 ? 'bg-blue-600' : 'bg-slate-200'}`} />
                                        )}
                                    </div>
                                </div>
                                <button onClick={onClose} className="text-slate-400 hover:text-slate-800 transition-colors p-2 rounded-full hover:bg-slate-50">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto bg-slate-50">
                                <div className="max-w-3xl mx-auto p-8">
                                    {step === 1 && (
                                        <StepOneBasic
                                            formData={formData}
                                            setFormData={setFormData}
                                        />
                                    )}
                                    {step === 2 && (
                                        formData.schedule_type === 'internal' ? (
                                            <StepTwoAvailability
                                                formData={formData}
                                                setFormData={setFormData}
                                            />
                                        ) : (
                                            <StepExternalLink
                                                formData={formData}
                                                setFormData={setFormData}
                                            />
                                        )
                                    )}
                                    {step === 3 && formData.schedule_type === 'internal' && (
                                        <StepThreeForm
                                            formData={formData}
                                            setFormData={setFormData}
                                        />
                                    )}
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="p-6 border-t border-slate-100 bg-white flex justify-between items-center z-10">
                                <button
                                    onClick={onClose}
                                    className="px-6 py-2.5 text-slate-500 hover:text-slate-700 font-medium transition-colors"
                                >
                                    Cancelar
                                </button>

                                <div className="flex gap-3">
                                    {(step === 1 || (step === 2 && formData.schedule_type === 'internal')) ? (
                                        <button
                                            onClick={handleNext}
                                            className="px-8 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium shadow-lg shadow-slate-900/10 transition-all flex items-center gap-2 hover:-translate-y-0.5 active:translate-y-0"
                                        >
                                            Continuar <ChevronRight className="w-4 h-4" />
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleSave}
                                            disabled={isSaving}
                                            className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed"
                                        >
                                            {isSaving ? <Clock className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                            {isSaving ? 'Salvando...' : 'Finalizar e Salvar'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

// --- Wizard Steps ---

const StepOneBasic = ({ formData, setFormData }) => (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
        <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Vamos começar</h2>
            <p className="text-slate-500">Escolha como você quer gerenciar seus agendamentos.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
                onClick={() => setFormData({ ...formData, schedule_type: 'internal' })}
                className={`p-6 rounded-xl border-2 text-left transition-all ${formData.schedule_type === 'internal'
                    ? 'border-blue-600 bg-blue-50/50 ring-4 ring-blue-50'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'}`}
            >
                <div className={`p-3 rounded-lg w-fit mb-4 ${formData.schedule_type === 'internal' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                    <Layout className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-800 mb-1">Criar na Plataforma</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                    Use nossa agenda integrada. Defina horários, crie formulários e gerencie tudo por aqui.
                </p>
            </button>

            <button
                onClick={() => setFormData({ ...formData, schedule_type: 'external_google' })}
                className={`p-6 rounded-xl border-2 text-left transition-all ${formData.schedule_type === 'external_google'
                    ? 'border-blue-600 bg-blue-50/50 ring-4 ring-blue-50'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'}`}
            >
                <div className={`p-3 rounded-lg w-fit mb-4 ${formData.schedule_type === 'external_google' ? 'bg-white border border-slate-200' : 'bg-slate-100 text-slate-600'}`}>
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22 12V12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="#4285F4" strokeWidth="2" />
                        <path d="M12 7V12L15 15" stroke="#34A853" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
                <h3 className="font-bold text-slate-800 mb-1">Link do Google Agenda</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                    Já tem um "Appointment Schedule" no Google? Apenas cole o link e integre ao seu painel.
                </p>
            </button>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Nome do Agendamento</label>
                <input
                    type="text"
                    value={formData.schedule_name}
                    onChange={e => setFormData({ ...formData, schedule_name: e.target.value })}
                    placeholder="Ex: Consulta Inicial, Mentoria..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all placeholder:text-slate-400"
                    autoFocus
                />
            </div>

            {formData.schedule_type === 'internal' && (
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Duração (minutos)</label>
                        <select
                            value={formData.duration_minutes}
                            onChange={e => setFormData({ ...formData, duration_minutes: Number(e.target.value) })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value={15}>15 min</option>
                            <option value={30}>30 min</option>
                            <option value={45}>45 min</option>
                            <option value={60}>1 hora</option>
                            <option value={90}>1h 30min</option>
                        </select>
                    </div>
                </div>
            )}
        </div>
    </div>
);

const StepTwoAvailability = ({ formData, setFormData }) => {
    const updateAvailability = (dayId, rules) => {
        setFormData(prev => ({
            ...prev,
            availability_rules: {
                ...prev.availability_rules,
                [dayId]: rules
            }
        }));
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div>
                <h2 className="text-xl font-bold text-slate-800 mb-1">Defina sua disponibilidade</h2>
                <p className="text-slate-500 text-sm">Quais dias e horários os clientes podem agendar?</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
                {DAYS_OF_WEEK.map(day => {
                    const dayRules = formData.availability_rules[day.id] || [];
                    const isEnabled = dayRules.length > 0;

                    return (
                        <div key={day.id} className="p-4 flex items-start gap-4 hover:bg-slate-50 transition-colors">
                            <div className="w-12 pt-2 text-sm font-bold text-slate-400 uppercase">{day.short}</div>

                            <div className="flex-1">
                                {!isEnabled ? (
                                    <button
                                        onClick={() => updateAvailability(day.id, [{ start: '09:00', end: '17:00' }])}
                                        className="text-sm text-slate-400 font-medium hover:text-blue-600 py-2 flex items-center gap-2"
                                    >
                                        <Plus className="w-4 h-4" /> Adicionar horário
                                    </button>
                                ) : (
                                    <div className="space-y-3">
                                        {dayRules.map((rule, idx) => (
                                            <div key={idx} className="flex items-center gap-3">
                                                <div className="flex items-center bg-slate-100 rounded-lg px-3 py-1.5 border border-slate-200">
                                                    <input
                                                        type="time"
                                                        value={rule.start}
                                                        onChange={e => {
                                                            const newRules = [...dayRules];
                                                            newRules[idx].start = e.target.value;
                                                            updateAvailability(day.id, newRules);
                                                        }}
                                                        className="bg-transparent text-sm w-[4.5rem] outline-none text-slate-700 font-medium"
                                                    />
                                                    <span className="text-slate-400 mx-2">-</span>
                                                    <input
                                                        type="time"
                                                        value={rule.end}
                                                        onChange={e => {
                                                            const newRules = [...dayRules];
                                                            newRules[idx].end = e.target.value;
                                                            updateAvailability(day.id, newRules);
                                                        }}
                                                        className="bg-transparent text-sm w-[4.5rem] outline-none text-slate-700 font-medium"
                                                    />
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        const newRules = dayRules.filter((_, i) => i !== idx);
                                                        updateAvailability(day.id, newRules);
                                                    }}
                                                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                        <button
                                            onClick={() => updateAvailability(day.id, [...dayRules, { start: '13:00', end: '18:00' }])}
                                            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 mt-2"
                                        >
                                            <Plus className="w-3 h-3" /> Novo intervalo
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const StepExternalLink = ({ formData, setFormData }) => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-8 text-center">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-blue-600">
                <Globe className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Link do Google Appointment</h3>
            <p className="text-sm text-slate-600 mb-6 max-w-md mx-auto">
                No Google Calendar, vá em "Create" > "Appointment schedule", configure sua agenda e cole o link gerado abaixo.
            </p>

            <div className="max-w-lg mx-auto relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                </div>
                <input
                    type="url"
                    value={formData.external_link || ''}
                    onChange={e => setFormData({ ...formData, external_link: e.target.value })}
                    placeholder="https://calendar.app.google/..."
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-800 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-sm"
                />
            </div>
        </div>
    </div>
);

const StepThreeForm = ({ formData, setFormData }) => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
        <div>
            <h2 className="text-xl font-bold text-slate-800 mb-1">Perguntas do formulário</h2>
            <p className="text-slate-500 text-sm">O que o cliente precisa informar ao agendar?</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            {formData.booking_form_config.map((field, idx) => (
                <div key={idx} className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg border border-slate-100 group">
                    <div className="p-2 bg-white rounded border border-slate-200 text-slate-400">
                        <FileText className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                        <input
                            type="text"
                            value={field.label}
                            onChange={e => {
                                const newConfig = [...formData.booking_form_config];
                                newConfig[idx].label = e.target.value;
                                setFormData(prev => ({ ...prev, booking_form_config: newConfig }));
                            }}
                            className="bg-transparent border-none p-0 text-slate-800 font-medium focus:ring-0 w-full outline-none"
                        />
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-600">
                        <input
                            type="checkbox"
                            checked={field.required}
                            disabled={field.id === 'name' || field.id === 'email'}
                            onChange={e => {
                                const newConfig = [...formData.booking_form_config];
                                newConfig[idx].required = e.target.checked;
                                setFormData(prev => ({ ...prev, booking_form_config: newConfig }));
                            }}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        Obrigatório
                    </label>
                    {field.id !== 'name' && field.id !== 'email' && field.id !== 'phone' && (
                        <button
                            onClick={() => {
                                const newConfig = formData.booking_form_config.filter((_, i) => i !== idx);
                                setFormData(prev => ({ ...prev, booking_form_config: newConfig }));
                            }}
                            className="text-slate-400 hover:text-red-500 p-2"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                </div>
            ))}

            <button
                onClick={() => {
                    const newId = `field_${Date.now()}`;
                    setFormData(prev => ({
                        ...prev,
                        booking_form_config: [
                            ...prev.booking_form_config,
                            { id: newId, label: 'Nova Pergunta', required: false }
                        ]
                    }));
                }}
                className="w-full py-3 border-2 border-dashed border-slate-200 rounded-lg text-slate-500 font-medium hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
            >
                <Plus className="w-4 h-4" /> Adicionar campo personalizado
            </button>
        </div>
    </div>
);

const SuccessView = ({ onClose }) => (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 animate-in zoom-in duration-300">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 text-green-600 relative">
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
            >
                <Check className="w-10 h-10" />
            </motion.div>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="absolute inset-0 rounded-full border-2 border-green-500 opacity-20"
            />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Sucesso!</h2>
        <p className="text-slate-500">Sua agenda foi configurada corretamente.</p>
    </div>
);

export default AppointmentScheduleModal;
