import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
    Calendar as CalendarIcon,
    Clock,
    MapPin,
    AlertCircle,
    RefreshCw,
    ExternalLink,
    LayoutList,
    LayoutGrid,
    ChevronLeft,
    ChevronDown,
    ChevronRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AgendaPage = () => {
    const [events, setEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [calendars, setCalendars] = useState([]);
    const [selectedCalendarId, setSelectedCalendarId] = useState('primary');
    const [viewMode, setViewMode] = useState('list'); // 'list' | 'week'
    const [currentDate, setCurrentDate] = useState(new Date());
    const [showPastEvents, setShowPastEvents] = useState(false);
    const scrollRef = React.useRef(null);

    useEffect(() => {
        fetchCalendars();
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        if (selectedCalendarId) {
            fetchEvents(controller.signal);
        }

        return () => {
            controller.abort();
        };
    }, [currentDate, selectedCalendarId]);

    useEffect(() => {
        if (viewMode === 'week' && scrollRef.current) {
            const now = new Date();
            const currentMinutesOfDay = now.getHours() * 60 + now.getMinutes();
            const pixelsPerHour = 80; // Must match the CSS grid row height

            // Calculate exact pixel position of "now"
            const currentPositionPx = (currentMinutesOfDay / 60) * pixelsPerHour;

            // Center the view: Scroll to (CurrentPos - HalfViewport)
            const containerHeight = scrollRef.current.clientHeight;
            const centeredScrollTop = currentPositionPx - (containerHeight / 2);

            // Scroll with behavior 'smooth' for better UX? No, instant is better for initial load.
            scrollRef.current.scrollTop = Math.max(0, centeredScrollTop);
        }
    }, [viewMode]);

    const fetchCalendars = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.provider_token) return;

            const response = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList', {
                headers: {
                    'Authorization': `Bearer ${session.provider_token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                const calendarList = data.items || [];
                setCalendars(calendarList);

                // If we have calendars and current selected is 'primary', try to find a better name or stick to primary logic
                // Actually, let's keep 'primary' as default but populate list so user can switch.
                console.log("Agenda: Calendars fetched:", calendarList.length);
            }
        } catch (error) {
            console.error("Error fetching calendars:", error);
        }
    };

    const fetchEvents = async (signal = null) => {
        setIsLoading(true);
        setError(null);

        let timeoutId;

        try {
            let { data: { session } } = await supabase.auth.getSession();

            // Loop Prevention Check
            const isRetry = sessionStorage.getItem('google_auth_retry');
            if (isRetry) {
                // ... (existing retry logic comments)
            }



            // FORCE REFRESH: User request to regenerate token on every agenda action
            // This ensures we don't use a stale 1-hour Google Token even if the session exists.
            console.log("Agenda: Force refreshing session to get fresh Provider Token...");
            const { data: refreshedData, error: refreshError } = await supabase.auth.refreshSession();

            if (refreshError) {
                console.error("Agenda: Session force refresh failed:", refreshError);
                // Fallback to existing session if available, or try normal getSession
            } else if (refreshedData.session) {
                session = refreshedData.session;
                console.log("Agenda: Session refreshed. New Provider Token obtained.");
            }

            if (!session?.provider_token) {
                // If still no token after refresh, try one more time or fail
                const { data: currentSession } = await supabase.auth.getSession();
                session = currentSession.session;
            }

            if (!session?.provider_token) {
                console.warn("Agenda: No provider_token found even after refresh.");
                setIsConnected(false);
                return;
            }

            console.log("Agenda: Token found, fetching events...");
            setIsConnected(true);

            // Fetch for the entire Month of the currentDate
            const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
            const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59);

            // Setup Timeout Race
            const controller = new AbortController();
            // Use passed signal if available, otherwise use local
            const finalSignal = signal || controller.signal;

            // Auto-abort after 10 seconds if network hangs
            timeoutId = setTimeout(() => controller.abort(), 10000);

            // Use 'primary' if selectedCalendarId is null/empty for some reason
            const targetCalendar = selectedCalendarId || 'primary';
            const encodedCalendarId = encodeURIComponent(targetCalendar);

            const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodedCalendarId}/events?orderBy=startTime&singleEvents=true&timeMin=${startOfMonth.toISOString()}&timeMax=${endOfMonth.toISOString()}&maxResults=250`, {
                headers: {
                    'Authorization': `Bearer ${session.provider_token}`
                },
                signal: finalSignal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                if (response.status === 401) {
                    console.warn("Agenda: 401 Unauthorized - Token Expired?");
                    setIsConnected(false);

                    // Auto-Reconnect Logic
                    if (!sessionStorage.getItem('google_auth_retry')) {
                        console.log("Agenda: Attempting Auto-Reconnect...");
                        sessionStorage.setItem('google_auth_retry', 'true');
                        await handleAutoReconnect();
                        return; // Stop here, we are redirecting
                    } else {
                        console.error("Agenda: Auto-Reconnect loop detected. Stopping.");
                        sessionStorage.removeItem('google_auth_retry'); // Reset so they can try manually
                    }
                }
                throw new Error(`Failed to fetch events: ${response.status}`);
            }

            const data = await response.json();
            console.log("Agenda: Events fetched successfully.", data.items?.length);
            setEvents(data.items || []);

        } catch (err) {
            console.error('Error fetching events:', err);

            if (err.name === 'AbortError') {
                setError('A conexão demorou muito. Tente novamente.');
            } else if (err.message.includes('401')) {
                // Handled above usually, but just in case
                setError('Sessão expirada. Reconecte a agenda.');
            } else {
                setError('Não foi possível carregar a agenda.');
            }
        } finally {
            if (timeoutId) clearTimeout(timeoutId);
            setIsLoading(false);
        }
    };



    const handleAutoReconnect = async () => {
        try {
            await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.href, // Come back right here
                    scopes: 'https://www.googleapis.com/auth/calendar',
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    },
                },
            });
        } catch (e) {
            console.error("Auto-reconnect failed:", e);
        }
    };

    // Helper to get week days
    const getWeekDays = (baseDate) => {
        const days = [];
        const start = new Date(baseDate);
        start.setDate(baseDate.getDate() - baseDate.getDay()); // Sunday start

        for (let i = 0; i < 7; i++) {
            const d = new Date(start);
            d.setDate(start.getDate() + i);
            days.push(d);
        }
        return days;
    };

    const weekDays = getWeekDays(currentDate);

    // Navigation
    const nextPeriod = () => {
        if (viewMode === 'list') {
            // Next Month
            const newDate = new Date(currentDate);
            newDate.setMonth(currentDate.getMonth() + 1);
            setCurrentDate(newDate);
        } else {
            // Next Week
            const newDate = new Date(currentDate);
            newDate.setDate(currentDate.getDate() + 7);
            setCurrentDate(newDate);
        }
    };

    const prevPeriod = () => {
        if (viewMode === 'list') {
            // Prev Month
            const newDate = new Date(currentDate);
            newDate.setMonth(currentDate.getMonth() - 1);
            setCurrentDate(newDate);
        } else {
            // Prev Week
            const newDate = new Date(currentDate);
            newDate.setDate(currentDate.getDate() - 7);
            setCurrentDate(newDate);
        }
    };

    const isToday = (date) => {
        const today = new Date();
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    };

    // Safe Date Helper
    const getEventDate = (eventStr) => {
        if (!eventStr) return new Date();
        const date = new Date(eventStr);
        // Correct timezone offset issues for YYYY-MM-DD all-day events if needed, 
        // but new Date('2023-12-25') usually defaults to UTC in JS, which might show as Dec 24 in negative timezones.
        // For simple display this is usually fine, but let's treat it safely.
        return date;
    };

    const getStartDate = (event) => event.start.dateTime || event.start.date;
    const getEndDate = (event) => event.end.dateTime || event.end.date;


    // Helper to categorize events
    const getGroupedEvents = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const groups = {
            past: [],
            today: [],
            upcoming: []
        };

        events.forEach(event => {
            const dateStr = getStartDate(event);
            if (!dateStr) return; // Skip invalid events

            const eventDate = new Date(dateStr);
            const eventDay = new Date(eventDate);
            // Fix for all-day events parsing as UTC but displaying in local
            if (event.start.date) {
                eventDay.setHours(0, 0, 0, 0);
                // We treat all-day dates as local day for comparison
                const [y, m, d] = event.start.date.split('-').map(Number);
                eventDay.setFullYear(y, m - 1, d);
            } else {
                eventDay.setHours(0, 0, 0, 0);
            }

            if (eventDay.getTime() < today.getTime()) {
                groups.past.push(event);
            } else if (eventDay.getTime() === today.getTime()) {
                groups.today.push(event);
            } else {
                groups.upcoming.push(event);
            }
        });

        return groups;
    };

    // ... (rest of component rendered same logic safe checks)

    const renderMagicCard = (event, type) => {
        const isTodayItem = type === 'today';
        const isPast = type === 'past';

        const startStr = getStartDate(event);
        const endStr = getEndDate(event);
        const startDate = new Date(startStr);
        const endDate = new Date(endStr);
        const isAllDay = !!event.start.date;

        return (
            <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`
                    relative group p-6 rounded-2xl border transition-all duration-300
                    ${isTodayItem
                        ? 'bg-gradient-to-br from-slate-900/90 to-primary/5 backdrop-blur-xl border-primary/50 shadow-[0_0_30px_-5px_rgba(var(--primary-rgb),0.15)] hover:shadow-[0_0_40px_-5px_rgba(var(--primary-rgb),0.25)] hover:border-primary/80 transform hover:-translate-y-1'
                        : isPast
                            ? 'bg-red-950/10 border-red-900/20 hover:bg-red-900/10 grayscale hover:grayscale-0 transition-all'
                            : 'bg-slate-900/60 backdrop-blur-md border-slate-700/50 hover:border-blue-500/50 hover:bg-slate-900/80 shadow-lg hover:shadow-blue-500/10'
                    }
                `}
            >
                {/* Glow Effect for Today */}
                {isTodayItem && (
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                )}

                <div className="relative flex flex-col md:flex-row gap-5 md:items-center justify-between">

                    {/* Date Box */}
                    <div className={`
                        hidden md:flex flex-col items-center justify-center w-20 h-20 rounded-2xl border shadow-inner
                        ${isTodayItem
                            ? 'bg-primary/10 border-primary/30 text-primary shadow-primary/10'
                            : isPast
                                ? 'bg-red-500/5 border-red-500/10 text-red-800/60 dark:text-red-400/50'
                                : 'bg-blue-500/10 border-blue-500/20 text-blue-400 shadow-blue-500/5'
                        }
                    `}>
                        <span className="text-xs font-bold uppercase tracking-widest opacity-80">
                            {new Intl.DateTimeFormat('pt-BR', { month: 'short', timeZone: 'UTC' }).format(isAllDay ? new Date(startStr + 'T00:00:00') : startDate).replace('.', '')}
                        </span>
                        <span className="text-3xl font-black leading-none mt-1">
                            {isAllDay ? new Date(startStr + 'T00:00:00').getDate() : startDate.getDate()}
                        </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            {/* Mobile Date Badge */}
                            <span className="md:hidden text-xs font-bold text-slate-500 bg-slate-800 px-2 py-1 rounded-md">
                                {new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'short', timeZone: 'UTC' }).format(isAllDay ? new Date(startStr + 'T00:00:00') : startDate)}
                            </span>

                            <h3 className={`text-lg font-semibold tracking-tight ${isPast ? 'text-slate-400' : 'text-white'}`}>
                                {event.summary || 'Sem título'}
                            </h3>

                            {event.status === 'confirmed' && !isPast && (
                                <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 shadow-sm">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                                    Confirmado
                                </span>
                            )}
                        </div>

                        <div className={`flex flex-wrap items-center gap-4 text-sm ${isPast ? 'text-slate-500' : 'text-slate-400'} font-medium`}>
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/30 border border-slate-800/50">
                                <Clock className={`w-4 h-4 ${isTodayItem ? 'text-primary' : 'text-slate-500'}`} />
                                {isAllDay ? (
                                    <span>Dia Inteiro</span>
                                ) : (
                                    <>
                                        {formatTime(startDate)} - {formatTime(endDate)}
                                    </>
                                )}
                            </div>

                            {event.location && (
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/30 border border-slate-800/50">
                                    <MapPin className="w-4 h-4 text-slate-500" />
                                    <span className="truncate max-w-[200px]">{event.location}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Action */}
                    {event.htmlLink && (
                        <a
                            href={event.htmlLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all hover:scale-105 active:scale-95"
                            title="Abrir no Google Calendar"
                        >
                            <ExternalLink className="w-5 h-5" />
                        </a>
                    )}
                </div>
            </motion.div>
        );
    };

    // ...

    return (
        // ... (render remains mostly same until dayEvents filter)
        <div className="space-y-6 h-[calc(100vh-140px)] flex flex-col">
            {/* Header, Title, etc - Unchanged */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                {/* ... (keep existing header content, I'll resume context copy below for exact match) */}
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Minha Agenda</h1>
                    <p className="text-slate-400 capitalize">
                        {new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(currentDate)}
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-4 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
                    <div className="flex items-center gap-2 mr-2 border-r border-slate-800 pr-4">
                        <button onClick={prevPeriod} className="p-1.5 hover:text-white text-slate-400 rounded-lg hover:bg-slate-800 transition-colors">
                            <ChevronLeft className="w-5 h-5" />
                        </button>

                        {/* Date Picker Trigger */}
                        <div className="relative group">
                            <input
                                type="month"
                                value={`${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`}
                                onChange={(e) => {
                                    const [y, m] = e.target.value.split('-');
                                    // Set to 1st of selected month
                                    setCurrentDate(new Date(parseInt(y), parseInt(m) - 1, 1));
                                }}
                                className="absolute inset-0 opacity-0 cursor-pointer z-10 w-full"
                            />
                            <button className="text-sm font-semibold px-2 hover:text-white text-slate-200 flex items-center gap-2 bg-slate-800/50 py-1 rounded-md border border-slate-700/50 group-hover:border-slate-600 transition-all">
                                {new Intl.DateTimeFormat('pt-BR', { month: 'short', year: 'numeric' }).format(currentDate).replace('.', '')}
                                <ChevronDown className="w-3 h-3 text-slate-400" />
                            </button>
                        </div>

                        <button onClick={nextPeriod} className="p-1.5 hover:text-white text-slate-400 rounded-lg hover:bg-slate-800 transition-colors">
                            <ChevronRight className="w-5 h-5" />
                        </button>

                        <button
                            onClick={() => setCurrentDate(new Date())}
                            className="text-xs font-medium text-slate-500 hover:text-white ml-2 transition-colors"
                            title="Voltar para Hoje"
                        >
                            Hoje
                        </button>
                    </div>

                    {/* Calendar Selector */}
                    {calendars.length > 0 && (
                        <div className="flex items-center gap-2 mr-4 border-r border-slate-800 pr-4">
                            <div className="relative group">
                                <select
                                    onClick={async () => {
                                        const calName = window.prompt("Nome da nova agenda:");
                                        if (!calName) return;

                                        try {
                                            setIsLoading(true);
                                            const { data: { session } } = await supabase.auth.getSession();
                                            if (!session?.provider_token) {
                                                alert("Erro de autenticação. Tente recarregar a página.");
                                                return;
                                            }

                                            const response = await fetch('https://www.googleapis.com/calendar/v3/calendars', {
                                                method: 'POST',
                                                headers: {
                                                    'Authorization': `Bearer ${session.provider_token}`,
                                                    'Content-Type': 'application/json'
                                                },
                                                body: JSON.stringify({ summary: calName })
                                            });

                                            if (!response.ok) throw new Error('Falha ao criar agenda');

                                            const newCal = await response.json();
                                            alert(`Agenda "${newCal.summary}" criada com sucesso!`);
                                            await fetchCalendars(); // Refresh list
                                            setSelectedCalendarId(newCal.id); // Select it
                                        } catch (err) {
                                            console.error(err);
                                            alert("Erro ao criar agenda: " + err.message);
                                        } finally {
                                            setIsLoading(false);
                                        }
                                    }}
                                    className="p-1.5 mr-4 hover:text-white text-slate-400 rounded-lg hover:bg-slate-800 transition-colors border border-dashed border-slate-700 hover:border-slate-500"
                                    title="Criar Nova Agenda"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
                                </button>

                                <div className="flex bg-slate-800/50 rounded-lg p-0.5 border border-slate-800">
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`p-1.5 rounded-md transition-all flex items-center gap-2 text-xs font-medium ${viewMode === 'list' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                                    >
                                        <LayoutList className="w-3.5 h-3.5" />
                                        Lista
                                    </button>
                                    <button
                                        onClick={() => setViewMode('week')}
                                        className={`p-1.5 rounded-md transition-all flex items-center gap-2 text-xs font-medium ${viewMode === 'week' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                                    >
                                        <LayoutGrid className="w-3.5 h-3.5" />
                                        Semana
                                    </button>
                                </div>

                                <button
                                    onClick={fetchEvents}
                                    className="ml-auto md:ml-2 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                                    title="Atualizar"
                                >
                                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                                </button>
                            </div>
                        </div>

            {
                        error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-3 shrink-0">
                                <AlertCircle className="w-5 h-5" />
                                {error}
                            </div>
                        )
                    }

                    {/* Content Area */}
                    <div className="flex-1 min-h-0 bg-slate-900/30 border border-slate-800 rounded-xl overflow-hidden relative">

                        {viewMode === 'list' ? (
                            <div className="h-full overflow-y-auto p-6 space-y-10 relative">
                                {/* Background Gradients for Aesthetics */}
                                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0 opacity-20">
                                    <div className="absolute top-10 left-10 w-64 h-64 bg-primary/20 rounded-full blur-3xl"></div>
                                    <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
                                </div>

                                {events.length === 0 ? (
                                    <div className="text-center py-20 relative z-10">
                                        <div className="inline-flex p-4 rounded-full bg-slate-900/50 border border-slate-800 mb-4 backdrop-blur-sm">
                                            <CalendarIcon className="w-8 h-8 text-slate-500" />
                                        </div>
                                        <h3 className="text-xl font-medium text-slate-300">Nenhum compromisso encontrado</h3>
                                        <p className="text-slate-500 mt-1">Sua agenda está livre para este mês.</p>
                                    </div>
                                ) : (
                                    <div className="relative z-10 space-y-10">
                                        <div className="relative z-10 space-y-12 pb-20">
                                            {/* Today's Events - Highlighted */}
                                            {groupedEvents.today.length > 0 && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ duration: 0.5 }}
                                                    className="space-y-6"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="p-2 bg-primary/20 rounded-lg border border-primary/30 text-primary">
                                                            <CalendarIcon className="w-6 h-6" />
                                                        </div>
                                                        <h2 className="text-2xl font-bold text-white tracking-tight">Eventos Hoje</h2>
                                                        <div className="h-px flex-1 bg-gradient-to-r from-primary/50 to-transparent"></div>
                                                    </div>
                                                    <div className="grid gap-4">
                                                        {groupedEvents.today.map((e, index) => (
                                                            <motion.div
                                                                key={e.id}
                                                                initial={{ opacity: 0, x: -20 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                transition={{ delay: index * 0.1 }}
                                                            >
                                                                {renderMagicCard(e, 'today')}
                                                            </motion.div>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            )}

                                            {/* Upcoming Events */}
                                            {groupedEvents.upcoming.length > 0 && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 30 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ duration: 0.5, delay: 0.2 }}
                                                    className="space-y-6"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20 text-blue-400">
                                                            <Clock className="w-6 h-6" />
                                                        </div>
                                                        <h2 className="text-xl font-bold text-slate-200 tracking-tight">Próximos Eventos</h2>
                                                        <div className="h-px flex-1 bg-gradient-to-r from-blue-500/30 to-transparent"></div>
                                                    </div>
                                                    <div className="grid gap-4">
                                                        {groupedEvents.upcoming.map((e, index) => (
                                                            <motion.div
                                                                key={e.id}
                                                                initial={{ opacity: 0 }}
                                                                animate={{ opacity: 1 }}
                                                                transition={{ delay: 0.3 + (index * 0.05) }}
                                                            >
                                                                {renderMagicCard(e, 'upcoming')}
                                                            </motion.div>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            )}


                                            {/* Past Events - Collapsible & Red Theme */}
                                            {groupedEvents.past.length > 0 && (
                                                <motion.div
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{ duration: 0.8, delay: 0.5 }}
                                                    className="space-y-4 pt-8 border-t border-slate-800/50"
                                                >
                                                    <button
                                                        onClick={() => setShowPastEvents(!showPastEvents)}
                                                        className="w-full flex items-center gap-4 opacity-80 hover:opacity-100 transition-opacity group"
                                                    >
                                                        <div className="p-2 bg-red-500/10 rounded-lg border border-red-500/20 text-red-400 group-hover:bg-red-500/20 transition-colors">
                                                            <RefreshCw className={`w-5 h-5 transition-transform duration-500 ${showPastEvents ? 'rotate-180' : ''}`} />
                                                        </div>
                                                        <h2 className="text-lg font-semibold text-red-200/80 tracking-tight group-hover:text-red-200">
                                                            Eventos Passados ({groupedEvents.past.length})
                                                        </h2>
                                                        <div className="h-px flex-1 bg-gradient-to-r from-red-500/20 to-transparent"></div>
                                                        <ChevronRight className={`w-5 h-5 text-red-400/50 transition-transform duration-300 ${showPastEvents ? 'rotate-90' : ''}`} />
                                                    </button>

                                                    <AnimatePresence>
                                                        {showPastEvents && (
                                                            <motion.div
                                                                initial={{ height: 0, opacity: 0 }}
                                                                animate={{ height: 'auto', opacity: 1 }}
                                                                exit={{ height: 0, opacity: 0 }}
                                                                transition={{ duration: 0.3, ease: 'easeInOut' }}
                                                                className="overflow-hidden"
                                                            >
                                                                <div className="grid gap-4 pt-2 opacity-80">
                                                                    {groupedEvents.past.map(e => renderMagicCard(e, 'past'))}
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </motion.div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="h-full flex flex-col">
                                {/* Header Days */}
                                <div className="grid grid-cols-8 border-b border-slate-800 bg-slate-900/50 shrink-0">
                                    <div className="p-3 border-r border-slate-800 text-xs text-slate-500 font-medium text-center py-4">
                                        Hora
                                    </div>
                                    {weekDays.map((day, i) => (
                                        <div key={i} className={`p-3 border-r border-slate-800 last:border-0 text-center ${isToday(day) ? 'bg-primary/5' : ''}`}>
                                            <div className={`text-xs uppercase mb-1 font-medium ${isToday(day) ? 'text-primary' : 'text-slate-500'}`}>
                                                {new Intl.DateTimeFormat('pt-BR', { weekday: 'short' }).format(day)}
                                            </div>
                                            <div className={`text-lg font-bold ${isToday(day) ? 'text-primary' : 'text-white'}`}>
                                                {day.getDate()}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Grid Scroll Area */}
                                <div ref={scrollRef} className="flex-1 overflow-y-auto relative no-scrollbar">
                                    <div className="grid grid-cols-8 min-h-[600px] relative">
                                        {/* Time Column */}
                                        <div className="border-r border-slate-800 bg-slate-900/20">
                                            {Array.from({ length: 24 }).map((_, hour) => (
                                                <div key={hour} className="h-20 border-b border-slate-800 text-xs text-slate-500 text-right pr-2 pt-2 relative">
                                                    {hour.toString().padStart(2, '0')}:00
                                                </div>
                                            ))}
                                        </div>

                                        {/* Days Columns */}
                                        {weekDays.map((day, dayIndex) => {
                                            // Get events for this day
                                            const dayEvents = events.filter(e => {
                                                const dateStr = getStartDate(e);
                                                if (!dateStr) return false;

                                                const eDate = new Date(dateStr);
                                                // Fix timezones for all-day events check
                                                if (e.start.date) {
                                                    const [y, m, d] = e.start.date.split('-').map(Number);
                                                    // Simple integer check for safety
                                                    return d === day.getDate() && (m - 1) === day.getMonth() && y === day.getFullYear();
                                                }

                                                return eDate.getDate() === day.getDate() &&
                                                    eDate.getMonth() === day.getMonth() &&
                                                    eDate.getFullYear() === day.getFullYear();
                                            });

                                            return (
                                                <div key={dayIndex} className="border-r border-slate-800 last:border-0 relative h-[1920px]">
                                                    {/* Grid Lines */}
                                                    {Array.from({ length: 24 }).map((_, h) => (
                                                        <div key={h} className="h-20 border-b border-slate-800/50" />
                                                    ))}

                                                    {/* Current Time Indicator (if today) */}
                                                    {isToday(day) && (
                                                        <div
                                                            className="absolute w-full border-t-2 border-red-500 z-20 pointer-events-none"
                                                            style={{
                                                                top: `${(new Date().getHours() * 60 + new Date().getMinutes()) / (24 * 60) * 100}%`
                                                            }}
                                                        >
                                                            <div className="w-2 h-2 bg-red-500 rounded-full -mt-[5px] -ml-[5px]" />
                                                        </div>
                                                    )}

                                                    {/* Events */}
                                                    {dayEvents.map(event => {
                                                        const startStr = getStartDate(event);
                                                        const endStr = getEndDate(event);

                                                        const start = new Date(startStr);
                                                        const end = new Date(endStr);

                                                        // Default for all-day
                                                        let topPercent = 0;
                                                        let heightPercent = 100;

                                                        if (!event.start.date) {
                                                            const startMinutes = start.getHours() * 60 + start.getMinutes();
                                                            const durationMinutes = (end - start) / (1000 * 60);
                                                            topPercent = (startMinutes / 1440) * 100;
                                                            heightPercent = (durationMinutes / 1440) * 100;
                                                        }

                                                        return (
                                                            <div
                                                                key={event.id}
                                                                className={`absolute inset-x-1 rounded-md bg-primary/20 border border-primary/40 p-1 text-xs overflow-hidden hover:z-10 hover:bg-primary/30 transition-colors cursor-pointer ${event.start.date ? 'bg-purple-500/20 border-purple-500/40 text-purple-200' : ''}`}
                                                                style={{
                                                                    top: event.start.date ? '0px' : `${topPercent}%`,
                                                                    height: event.start.date ? '20px' : `${Math.max(heightPercent, 2.5)}%`, // All day = small strip at top or full block? Usually a strip.
                                                                    position: event.start.date ? 'static' : 'absolute' // Stack all day events
                                                                }}
                                                                title={`${event.summary}\n${event.start.date ? 'Dia Inteiro' : formatTime(startStr) + ' - ' + formatTime(endStr)}`}
                                                            >
                                                                <div className="font-semibold truncate">
                                                                    {event.summary || '(Sem título)'}
                                                                </div>
                                                                {!event.start.date && (
                                                                    <div className="text-primary/70 text-[10px]">
                                                                        {formatTime(start)}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div >
                );

                function formatTime(date) {
    if (!date) return '';
                if (typeof date === 'string') date = new Date(date);
                return new Intl.DateTimeFormat('pt-BR', {hour: '2-digit', minute: '2-digit' }).format(date);
}
};

                export default AgendaPage;
