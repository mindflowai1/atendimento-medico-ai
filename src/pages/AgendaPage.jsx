import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import EventModal from '../components/EventModal';
import CreateCalendarModal from '../components/CreateCalendarModal';
import {
    Calendar as CalendarIcon, Clock, RefreshCw,
    ChevronLeft, ChevronRight,
    Menu, Plus, MapPin, Video, ExternalLink, Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AgendaPage = () => {
    const [events, setEvents] = useState([]);
    const [calendars, setCalendars] = useState([]);
    const [selectedCalendar, setSelectedCalendar] = useState(null);

    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState('week');
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const [isLoading, setIsLoading] = useState(true);
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [needsGoogleConnect, setNeedsGoogleConnect] = useState(false);
    const [isCreatingCalendar, setIsCreatingCalendar] = useState(false);
    const [isDeletingCalendar, setIsDeletingCalendar] = useState(null);

    const scrollRef = useRef(null);

    // Helper to get valid token with auto-refresh
    const getValidToken = async () => {
        try {
            const { data: { session }, error } = await supabase.auth.getSession();

            if (error) {
                console.error('Error getting session:', error);
                throw error;
            }

            if (!session) {
                console.error('No session found');
                throw new Error('Sem sessão ativa');
            }

            // Check if token is expired or about to expire
            const expiresAt = session.expires_at;
            const now = Math.floor(Date.now() / 1000);
            const tokenExpiresIn = expiresAt - now;

            console.log('Token expires in:', tokenExpiresIn, 'seconds');

            // If token expires in less than 5 minutes, refresh it
            if (tokenExpiresIn < 300) {
                console.log('Token expiring soon, refreshing...');
                const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();

                if (refreshError) {
                    console.error('Error refreshing token:', refreshError);
                    throw refreshError;
                }

                if (!refreshData?.session?.provider_token) {
                    throw new Error('Erro ao renovar token do Google');
                }

                console.log('Token refreshed successfully');
                return refreshData.session.provider_token;
            }

            if (!session.provider_token) {
                console.warn('No provider_token found. User needs to connect Google Calendar.');
                setNeedsGoogleConnect(true);
                throw new Error('Token do Google não encontrado');
            }

            return session.provider_token;
        } catch (error) {
            console.error('getValidToken error:', error);
            throw error;
        }
    };

    useEffect(() => {
        fetchInitialData();

        // Auto-refresh token every 30 minutes to prevent expiration
        const tokenRefreshInterval = setInterval(async () => {
            try {
                console.log('Auto-refreshing token...');
                const { data, error } = await supabase.auth.refreshSession();
                if (error) {
                    console.error('Auto-refresh error:', error);
                } else {
                    console.log('Token auto-refreshed successfully');
                }
            } catch (e) {
                console.error('Token refresh failed:', e);
            }
        }, 30 * 60 * 1000); // 30 minutes

        return () => clearInterval(tokenRefreshInterval);
    }, []);

    useEffect(() => {
        fetchEvents();
    }, [currentDate, selectedCalendar]);

    useEffect(() => {
        if (viewMode === 'week' && scrollRef.current && !isLoading) {
            const now = new Date();
            const minutes = now.getHours() * 60 + now.getMinutes();
            const top = (minutes / 60) * 60; // 60px per hour now
            scrollRef.current.scrollTop = Math.max(0, top - 200);
        }
    }, [viewMode, isLoading]);

    const fetchInitialData = async () => {
        setIsLoading(true);
        try {
            await fetchCalendars();
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchCalendars = async () => {
        try {
            console.log('fetchCalendars: Starting...');
            const token = await getValidToken();
            console.log('fetchCalendars: Got token');

            // Add timestamp to prevent caching
            const timestamp = new Date().getTime();
            const res = await fetch(`https://www.googleapis.com/calendar/v3/users/me/calendarList?_=${timestamp}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            console.log('fetchCalendars: Response status:', res.status);

            if (res.ok) {
                const data = await res.json();
                console.log('fetchCalendars: Got', data.items?.length || 0, 'calendars');
                let cals = data.items || [];

                // Sort: primary calendar first, then others
                cals = cals.sort((a, b) => {
                    if (a.primary) return -1;
                    if (b.primary) return 1;
                    return a.summary.localeCompare(b.summary);
                });

                setCalendars(cals);
                if (cals.length > 0 && !selectedCalendar) {
                    setSelectedCalendar(cals[0].id);
                    console.log('fetchCalendars: Selected first calendar:', cals[0].summary);
                }
            } else {
                const error = await res.text();
                console.error('fetchCalendars: Error response:', error);
                throw new Error(`Erro ao carregar calendários: ${res.status}`);
            }
        } catch (e) {
            console.error('fetchCalendars error:', e);
            if (e.message.includes('Token do Google')) {
                setNeedsGoogleConnect(true);
            } else {
                alert('Erro ao carregar calendários: ' + e.message);
            }
        }
    };

    const fetchEvents = async () => {
        if (!selectedCalendar) return;

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.provider_token) return;

            const start = new Date(currentDate);
            start.setDate(start.getDate() - start.getDay() - 1);
            start.setHours(0, 0, 0, 0);

            const end = new Date(start);
            end.setDate(end.getDate() + 8);
            end.setHours(23, 59, 59, 999);

            const encoded = encodeURIComponent(selectedCalendar);
            const url = `https://www.googleapis.com/calendar/v3/calendars/${encoded}/events?singleEvents=true&orderBy=startTime&timeMin=${start.toISOString()}&timeMax=${end.toISOString()}&maxResults=200`;
            const res = await fetch(url, {
                headers: { 'Authorization': `Bearer ${session.provider_token}` }
            });

            if (res.ok) {
                const data = await res.json();
                setEvents((data.items || []).map(item => ({ ...item, calendarId: selectedCalendar })));
            } else {
                setEvents([]);
            }
        } catch (err) {
            console.error("Fetch events error", err);
            setEvents([]);
        }
    };

    const handleSaveEvent = async (eventData, eventId) => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.provider_token) throw new Error('No auth token');

        const payload = {
            summary: eventData.summary,
            description: eventData.description,
            start: { dateTime: new Date(eventData.start).toISOString() },
            end: { dateTime: new Date(eventData.end).toISOString() },
            location: eventData.location,
            colorId: eventData.colorId
        };

        // Add Google Meet if location indicates it
        if (eventData.location?.includes('Google Meet')) {
            payload.conferenceData = {
                createRequest: {
                    requestId: `meet-${Date.now()}`,
                    conferenceSolutionKey: { type: 'hangoutsMeet' }
                }
            };
        }

        const encoded = encodeURIComponent(selectedCalendar);
        const url = eventId
            ? `https://www.googleapis.com/calendar/v3/calendars/${encoded}/events/${eventId}`
            : `https://www.googleapis.com/calendar/v3/calendars/${encoded}/events?conferenceDataVersion=1`;

        const res = await fetch(url, {
            method: eventId ? 'PATCH' : 'POST',
            headers: {
                'Authorization': `Bearer ${session.provider_token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error?.message || 'Erro ao salvar evento');
        }

        await fetchEvents();
    };

    const handleDeleteEvent = async (eventId) => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.provider_token) throw new Error('No auth token');

        const encoded = encodeURIComponent(selectedCalendar);
        const url = `https://www.googleapis.com/calendar/v3/calendars/${encoded}/events/${eventId}`;

        const res = await fetch(url, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${session.provider_token}` }
        });

        if (!res.ok) throw new Error('Erro ao excluir evento');
        await fetchEvents();
    };

    const handleRenameCalendar = async (calendarId) => {
        const calendar = calendars.find(c => c.id === calendarId);
        const currentName = calendar.summary;
        const newName = prompt('Novo nome para o calendário:', currentName);
        if (!newName || newName === currentName) return;

        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.provider_token) return;

        const encoded = encodeURIComponent(calendarId);
        const url = `https://www.googleapis.com/calendar/v3/calendars/${encoded}`;

        const res = await fetch(url, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${session.provider_token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ summary: newName })
        });

        if (res.ok) {
            await fetchCalendars();
            alert('Calendário renomeado com sucesso!');
        } else if (res.status === 403 || res.status === 404) {
            alert('Este calendário não pode ser renomeado. Você só pode renomear calendários criados por você.\n\nPara alterar o nome na sua visualização, acesse o Google Calendar diretamente.');
        } else {
            alert('Erro ao renomear calendário');
        }
    };

    const handleDeleteCalendar = async (calendarId) => {
        const calendar = calendars.find(c => c.id === calendarId);
        if (!window.confirm(`Tem certeza que deseja deletar "${calendar.summary}"?\n\nAtenção: Isso removerá o calendário e TODOS os seus eventos!`)) return;

        setIsDeletingCalendar(calendarId);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.provider_token) return;

            const encoded = encodeURIComponent(calendarId);
            const url = `https://www.googleapis.com/calendar/v3/calendars/${encoded}`;

            const res = await fetch(url, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${session.provider_token}` }
            });

            if (res.ok) {
                if (selectedCalendar === calendarId) {
                    const remaining = calendars.filter(c => c.id !== calendarId);
                    setSelectedCalendar(remaining[0]?.id || null);
                }
                await fetchCalendars();
                alert('Calendário deletado com sucesso!');
            } else if (res.status === 403 || res.status === 404) {
                alert('Este calendário não pode ser deletado. Apenas calendários criados por você podem ser removidos.\n\nPara remover da lista, acesse o Google Calendar diretamente.');
            } else {
                alert('Erro ao deletar calendário.');
            }
        } finally {
            setIsDeletingCalendar(null);
        }
    };

    const handleCreateCalendar = async ({ name, color }) => {
        setIsCreatingCalendar(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.provider_token) throw new Error('No auth token');

            const payload = {
                summary: name,
                timeZone: 'America/Sao_Paulo',
                backgroundColor: color.color,
                foregroundColor: '#000000'
            };

            const res = await fetch('https://www.googleapis.com/calendar/v3/calendars', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${session.provider_token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error?.message || 'Erro ao criar agenda');
            }

            await fetchCalendars();
            alert('Agenda criada com sucesso!');
        } finally {
            setIsCreatingCalendar(false);
        }
    };

    const openEventInGoogle = (event) => {
        if (event.htmlLink) {
            window.open(event.htmlLink, '_blank');
        }
    };

    const weekDays = [];
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    for (let i = 0; i < 7; i++) {
        const d = new Date(startOfWeek);
        d.setDate(startOfWeek.getDate() + i);
        weekDays.push(d);
    }

    const isToday = (d) => {
        const now = new Date();
        return d.getDate() === now.getDate() &&
            d.getMonth() === now.getMonth() &&
            d.getFullYear() === now.getFullYear();
    };

    const getCalendarColor = () => {
        const cal = calendars.find(c => c.id === selectedCalendar);
        return cal?.backgroundColor || '#3b82f6';
    };

    const formatMonthYear = (date) => {
        const formatted = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(date);
        return formatted.charAt(0).toUpperCase() + formatted.slice(1);
    };

    const getWeekRange = () => {
        const start = weekDays[0];
        const end = weekDays[6];
        return `${start.getDate()} - ${end.getDate()} de ${new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(end)}`;
    };

    return (
        <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden">
            <EventModal
                isOpen={isEventModalOpen}
                onClose={() => { setIsEventModalOpen(false); setEditingEvent(null); }}
                event={editingEvent}
                selectedCalendar={selectedCalendar}
                calendars={calendars}
                onSave={handleSaveEvent}
                onDelete={handleDeleteEvent}
            />

            <CreateCalendarModal
                isOpen={isCalendarModalOpen}
                onClose={() => setIsCalendarModalOpen(false)}
                onSave={handleCreateCalendar}
            />

            {/* Sidebar */}
            <motion.div
                initial={false}
                animate={{ width: sidebarOpen ? 300 : 0, opacity: sidebarOpen ? 1 : 0 }}
                className="bg-slate-900 border-r border-slate-800 flex-shrink-0 flex flex-col overflow-hidden"
            >
                <div className="p-6 min-w-[300px]">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
                            <CalendarIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="font-bold text-lg leading-tight">Minha Agenda</h1>
                            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Profissional</p>
                        </div>
                    </div>

                    {/* Google Calendar Connect Button - shown when provider_token is missing */}
                    {needsGoogleConnect && (
                        <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                            <div className="flex items-start gap-3 mb-3">
                                <svg className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <div>
                                    <h4 className="font-semibold text-yellow-500 text-sm">Conectar Google Calendar</h4>
                                    <p className="text-xs text-slate-400 mt-1">
                                        Você precisa autorizar o acesso ao Google Calendar para visualizar e gerenciar suas agendas.
                                    </p>
                                </div>
                            </div>
                            <a
                                href="/conexao-agenda"
                                className="w-full py-2.5 px-4 bg-yellow-500 hover:bg-yellow-400 text-slate-900 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2"
                            >
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Conectar agora
                            </a>
                        </div>
                    )}

                    {/* New Agenda Button */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setIsCalendarModalOpen(true)}
                        disabled={needsGoogleConnect}
                        className={`w-full mb-6 py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-bold shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 ${needsGoogleConnect ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <Plus className="w-5 h-5" />
                        Nova Agenda
                    </motion.button>

                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Calendários</h3>
                        </div>
                        <div className="space-y-1">
                            {calendars.map(cal => {
                                const isSelected = selectedCalendar === cal.id;
                                return (
                                    <div key={cal.id} className="group relative">
                                        <motion.button
                                            onClick={() => setSelectedCalendar(cal.id)}
                                            whileHover={{ x: 4 }}
                                            whileTap={{ scale: 0.98 }}
                                            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${isSelected
                                                ? 'bg-slate-800 shadow-lg shadow-slate-900/50'
                                                : 'hover:bg-slate-800/50'
                                                }`}
                                        >
                                            <div
                                                className="w-3 h-3 rounded-full flex-shrink-0 shadow-lg"
                                                style={{ backgroundColor: cal.backgroundColor || '#3b82f6' }}
                                            />
                                            <span className={`text-sm font-medium flex-1 text-left truncate ${isSelected ? 'text-white' : 'text-slate-400'
                                                }`}>
                                                {cal.summary}
                                            </span>
                                            {isSelected && (
                                                <motion.div
                                                    layoutId="selected-indicator"
                                                    className="w-2 h-2 rounded-full bg-blue-500"
                                                />
                                            )}
                                        </motion.button>

                                        {/* Edit/Delete buttons - always visible with helpful tooltips */}
                                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1 z-20">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRenameCalendar(cal.id);
                                                }}
                                                className="p-1.5 bg-slate-900 hover:bg-blue-600 rounded-lg transition-colors shadow-lg"
                                                title="Renomear calendário"
                                            >
                                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                </svg>
                                            </button>
                                            {!cal.primary && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteCalendar(cal.id);
                                                    }}
                                                    disabled={isDeletingCalendar === cal.id}
                                                    className="p-1.5 bg-slate-900 hover:bg-red-600 rounded-lg transition-colors shadow-lg disabled:opacity-50 disabled:cursor-wait"
                                                    title={isDeletingCalendar === cal.id ? "Deletando..." : "Deletar calendário"}
                                                >
                                                    {isDeletingCalendar === cal.id ? (
                                                        <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                                                    ) : (
                                                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 bg-slate-950">
                {/* Toolbar */}
                <div className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900/50 backdrop-blur-sm z-10">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-2 -ml-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                        <div>
                            <h2 className="text-xl font-bold text-white">
                                {formatMonthYear(currentDate)}
                            </h2>
                            <p className="text-xs text-slate-500 font-medium">
                                Semana: {getWeekRange()}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center bg-slate-800 rounded-lg shadow-inner">
                            <button
                                onClick={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() - 7)))}
                                className="p-2 rounded-l-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                                title="Semana anterior"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setCurrentDate(new Date())}
                                className="px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-700 transition-colors border-x border-slate-700"
                            >
                                Esta Semana
                            </button>
                            <button
                                onClick={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() + 7)))}
                                className="p-2 rounded-r-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                                title="Próxima semana"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                        <button
                            onClick={fetchEvents}
                            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-all"
                            title="Atualizar eventos"
                        >
                            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>

                {/* Week Grid */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Days Header */}
                    <div className="grid border-b border-slate-800 bg-slate-900" style={{ gridTemplateColumns: '64px repeat(7, 1fr)' }}>
                        <div></div>
                        {weekDays.map((d, i) => (
                            <div
                                key={i}
                                className={`py-2 text-center border-r border-slate-800/30 ${isToday(d) ? 'bg-gradient-to-b from-blue-500/10 to-transparent' : ''
                                    }`}
                            >
                                <div className={`text-[10px] uppercase font-bold mb-1 ${isToday(d) ? 'text-blue-400' : 'text-slate-500'
                                    }`}>
                                    {d.toLocaleDateString('pt-BR', { weekday: 'short' })}
                                </div>
                                <div className={`text-xl font-bold ${isToday(d) ? 'text-blue-400' : 'text-slate-300'
                                    }`}>
                                    {d.getDate()}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Scrollable Grid */}
                    <div ref={scrollRef} className="flex-1 overflow-y-auto relative" style={{ scrollbarGutter: 'stable' }}>
                        <div className="grid relative" style={{ gridTemplateColumns: '64px repeat(7, 1fr)', minHeight: '1440px' }}>
                            {/* Time Column */}
                            <div className="border-r border-slate-800 bg-slate-900/50 text-[10px] text-slate-500 font-medium sticky left-0 z-10">
                                {Array.from({ length: 24 }).map((_, h) => (
                                    <div key={h} className="h-[60px] border-b border-slate-800/30 text-center pt-1">
                                        {h}:00
                                    </div>
                                ))}
                            </div>

                            {/* Event Columns */}
                            {weekDays.map((date, idx) => {
                                const dayEvents = events.filter(e => {
                                    const eDate = new Date(e.start.dateTime || e.start.date);
                                    return eDate.getDate() === date.getDate() &&
                                        eDate.getMonth() === date.getMonth();
                                });

                                return (
                                    <div
                                        key={idx}
                                        className={`relative border-r border-slate-800/30 ${isToday(date) ? 'bg-gradient-to-b from-blue-500/5 to-transparent' : ''
                                            }`}
                                    >
                                        {/* Grid Lines */}
                                        {Array.from({ length: 24 }).map((_, h) => (
                                            <div key={h} className="h-[60px] border-b border-slate-800/20" />
                                        ))}

                                        {/* Current Time Line */}
                                        {isToday(date) && (
                                            <div
                                                className="absolute w-full h-0.5 bg-red-500 z-30"
                                                style={{
                                                    top: `${(new Date().getHours() * 60 + new Date().getMinutes()) / (24 * 60) * 100}%`
                                                }}
                                            >
                                                <div className="w-3 h-3 rounded-full bg-red-500 -ml-1.5 -mt-1.5 shadow-[0_0_20px_rgba(239,68,68,0.8)]" />
                                            </div>
                                        )}

                                        {/* Events */}
                                        <AnimatePresence>
                                            {dayEvents.map(event => {
                                                const start = new Date(event.start.dateTime || event.start.date);
                                                const end = new Date(event.end.dateTime || event.end.date);

                                                if (event.start.date) return null; // Skip all-day for now

                                                const startMin = start.getHours() * 60 + start.getMinutes();
                                                const endMin = end.getHours() * 60 + end.getMinutes();
                                                const top = (startMin / 1440) * 100;
                                                const height = ((endMin - startMin) / 1440) * 100;

                                                return (
                                                    <motion.div
                                                        key={event.id}
                                                        initial={{ opacity: 0, scale: 0.9 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        exit={{ opacity: 0, scale: 0.9 }}
                                                        whileHover={{
                                                            scale: 1.02,
                                                            zIndex: 50,
                                                            boxShadow: '0 8px 24px rgba(0,0,0,0.3)'
                                                        }}
                                                        onClick={() => openEventInGoogle(event)}
                                                        className="absolute inset-x-1 rounded-lg p-2 border overflow-hidden cursor-pointer group bg-slate-800/90 border-slate-700 hover:bg-slate-700 transition-all"
                                                        style={{
                                                            top: `${top}%`,
                                                            height: `${Math.max(height, 3)}%`,
                                                            borderLeftWidth: '3px',
                                                            borderLeftColor: getCalendarColor()
                                                        }}
                                                    >
                                                        <div className="flex justify-between items-start gap-2">
                                                            <div className="flex-1 min-w-0">
                                                                <h4 className="text-xs font-bold text-white leading-tight truncate mb-0.5">
                                                                    {event.summary || '(Sem título)'}
                                                                </h4>
                                                                <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                                                                    <Clock className="w-3 h-3" />
                                                                    {start.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                                                </p>
                                                                {event.location && (
                                                                    <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                                                                        {event.location.includes('meet.google.com') ? (
                                                                            <Video className="w-3 h-3" />
                                                                        ) : (
                                                                            <MapPin className="w-3 h-3" />
                                                                        )}
                                                                        <span className="truncate">{event.location}</span>
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setEditingEvent(event);
                                                                    setIsEventModalOpen(true);
                                                                }}
                                                                className="opacity-0 group-hover:opacity-100 p-1 bg-slate-900 hover:bg-blue-600 rounded transition-all"
                                                            >
                                                                <ExternalLink className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    </motion.div>
                                                );
                                            })}
                                        </AnimatePresence>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* FAB - Floating Action Button */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => { setEditingEvent(null); setIsEventModalOpen(true); }}
                className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full shadow-2xl shadow-blue-600/40 flex items-center justify-center hover:shadow-blue-600/60 transition-all z-50"
            >
                <Plus className="w-8 h-8" />
            </motion.button>
        </div>
    );
};

export default AgendaPage;
