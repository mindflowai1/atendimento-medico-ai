import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import AppointmentScheduleModal from '../components/AppointmentScheduleModal';
import {
    Calendar as CalendarIcon, Clock, MapPin, AlertCircle, RefreshCw,
    ExternalLink, LayoutList, LayoutGrid, ChevronLeft, ChevronRight,
    Plus, Settings, MoreVertical, Trash2, Edit3, CheckSquare, Square,
    Menu, X, Link as LinkIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AgendaPage = () => {
    // --- State ---
    const [events, setEvents] = useState([]);
    const [schedules, setSchedules] = useState([]); // Our "Booking Types"
    const [calendars, setCalendars] = useState([]); // Google Calendars
    const [visibleCalendars, setVisibleCalendars] = useState(new Set(['primary']));

    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState('week'); // 'week' | 'list'
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState(null);

    const scrollRef = useRef(null);

    // --- Effects ---
    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        fetchEvents();
    }, [currentDate, visibleCalendars]);

    // Scroll to now on load
    useEffect(() => {
        if (viewMode === 'week' && scrollRef.current && !isLoading) {
            const now = new Date();
            const minutes = now.getHours() * 60 + now.getMinutes();
            // 80px per hour
            const top = (minutes / 60) * 80;
            scrollRef.current.scrollTop = Math.max(0, top - 300); // Center it a bit
        }
    }, [viewMode, isLoading]);

    // --- Actions ---

    const fetchInitialData = async () => {
        setIsLoading(true);
        try {
            await Promise.all([
                fetchCalendars(),
                fetchSchedules()
            ]);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchCalendars = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.provider_token) return;

        const res = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList', {
            headers: { 'Authorization': `Bearer ${session.provider_token}` }
        });
        if (res.ok) {
            const data = await res.json();
            setCalendars(data.items || []);
        }
    };

    const fetchSchedules = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
            .from('calendar_appointment_schedules')
            .select('*')
            .eq('user_id', user.id);

        if (!error) {
            setSchedules(data || []);
        }
    };

    const fetchEvents = async () => {
        // Simple fetch logic - optimized for demo
        // In prod, you'd handle pagination and multiple calendar syncs better
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.provider_token) return;

            const start = new Date(currentDate);
            start.setDate(start.getDate() - start.getDay() - 1); // Start a bit before
            start.setHours(0, 0, 0, 0);

            const end = new Date(start);
            end.setDate(end.getDate() + 8); // End a bit after
            end.setHours(23, 59, 59, 999);

            // Fetch primarily for the 'primary' calendar for now, 
            // handling multiple calendars involves Promise.all over visibleCalendars
            // For stability, let's stick to visible ones.

            const promises = Array.from(visibleCalendars).map(async (calId) => {
                const encoded = encodeURIComponent(calId);
                const url = `https://www.googleapis.com/calendar/v3/calendars/${encoded}/events?singleEvents=true&orderBy=startTime&timeMin=${start.toISOString()}&timeMax=${end.toISOString()}&maxResults=200`;
                const res = await fetch(url, {
                    headers: { 'Authorization': `Bearer ${session.provider_token}` }
                });
                if (!res.ok) return [];
                const data = await res.json();
                return data.items.map(item => ({ ...item, calendarId: calId, colorId: item.colorId || '1' }));
            });

            const results = await Promise.all(promises);
            setEvents(results.flat());

        } catch (err) {
            console.error("Fetch events error", err);
            // setError("Erro ao carregar eventos");
        }
    };

    const handleSaveSchedule = async (formData) => {
        const { data: { user } } = await supabase.auth.getUser();

        const payload = {
            user_id: user.id,
            schedule_name: formData.schedule_name,
            duration_minutes: formData.duration_minutes,
            location_type: formData.location_type,
            location_details: formData.location_details,
            description: formData.description,
            availability_rules: formData.availability_rules,
            booking_form_config: formData.booking_form_config,
            schedule_type: formData.schedule_type,     // New
            external_link: formData.external_link,     // New
            calendar_id: 'primary'
        };

        let error;
        if (editingSchedule) {
            const { error: err } = await supabase
                .from('calendar_appointment_schedules')
                .update(payload)
                .eq('id', editingSchedule.id);
            error = err;
        } else {
            const { error: err } = await supabase
                .from('calendar_appointment_schedules')
                .insert([payload]);
            error = err;
        }

        if (error) throw error;
        await fetchSchedules();
    };

    const handleDeleteSchedule = async (id) => {
        if (!window.confirm("Tem certeza que deseja excluir esta agenda?")) return;

        const { error } = await supabase
            .from('calendar_appointment_schedules')
            .delete()
            .eq('id', id);

        if (error) alert("Erro ao excluir");
        else fetchSchedules();
    };


    // --- Helpers ---
    const weekDays = [];
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay()); // Sunday
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

    // --- Renderers ---

    return (
        <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
            <AppointmentScheduleModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setEditingSchedule(null); }}
                initialData={editingSchedule}
                onSave={handleSaveSchedule}
            />

            {/* Sidebar */}
            <motion.div
                initial={false}
                animate={{ width: sidebarOpen ? 300 : 0, opacity: sidebarOpen ? 1 : 0 }}
                className="bg-slate-900 border-r border-slate-800 flex-shrink-0 flex flex-col overflow-hidden"
            >
                <div className="p-6 min-w-[300px]">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
                            <CalendarIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="font-bold text-lg leading-tight">Minha Agenda</h1>
                            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Profissional</p>
                        </div>
                    </div>

                    <button
                        onClick={() => { setEditingSchedule(null); setIsModalOpen(true); }}
                        className="w-full py-3 bg-white text-slate-900 rounded-xl font-bold text-sm shadow hover:bg-slate-100 transition-colors flex items-center justify-center gap-2 mb-8"
                    >
                        <Plus className="w-5 h-5" />
                        Criar Nova Agenda
                    </button>

                    {/* My Schedules List */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Meus Agendamentos</h3>
                        </div>
                        <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                            {schedules.map(schedule => (
                                <div key={schedule.id} className="group flex items-center justify-between p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-all cursor-pointer">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${schedule.schedule_type === 'external_google' ? 'bg-blue-500' : 'bg-emerald-500'}`} />
                                        <div className="truncate">
                                            <div className="text-sm font-medium text-slate-200 truncate">{schedule.schedule_name}</div>
                                            <div className="text-[10px] text-slate-500 truncate flex items-center gap-1">
                                                {schedule.schedule_type === 'external_google' ?
                                                    <><ExternalLink className="w-3 h-3" /> Google Link</> :
                                                    <><Clock className="w-3 h-3" /> {schedule.duration_minutes} min</>
                                                }
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setEditingSchedule(schedule); setIsModalOpen(true); }}
                                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded"
                                        >
                                            <Edit3 className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const link = schedule.schedule_type === 'external_google' ? schedule.external_link : schedule.booking_page_url;
                                                navigator.clipboard.writeText(link);
                                                alert("Link copiado!");
                                            }}
                                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded"
                                            title="Copiar Link"
                                        >
                                            <LinkIcon className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {schedules.length === 0 && (
                                <div className="text-xs text-slate-600 text-center py-4 border border-dashed border-slate-800 rounded-lg">
                                    Nenhuma agenda criada
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Google Calendars List */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Calendários Google</h3>
                        </div>
                        <div className="space-y-1">
                            {calendars.map(cal => {
                                const isVisible = visibleCalendars.has(cal.id);
                                return (
                                    <button
                                        key={cal.id}
                                        onClick={() => {
                                            const newSet = new Set(visibleCalendars);
                                            if (newSet.has(cal.id)) newSet.delete(cal.id);
                                            else newSet.add(cal.id);
                                            setVisibleCalendars(newSet);
                                        }}
                                        className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800/50 transition-colors text-left"
                                    >
                                        {isVisible ?
                                            <CheckSquare className="w-4 h-4 text-blue-500" /> :
                                            <Square className="w-4 h-4 text-slate-600" />
                                        }
                                        <span className={`text-sm ${isVisible ? 'text-slate-300' : 'text-slate-500'}`}>{cal.summary}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 bg-slate-950">
                {/* Toolbar */}
                <div className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-950/50 backdrop-blur-sm z-10">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 -ml-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800">
                            <Menu className="w-5 h-5" />
                        </button>
                        <div>
                            <h2 className="text-xl font-semibold text-white">
                                {new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(currentDate)}
                            </h2>
                        </div>
                        <div className="flex items-center bg-slate-800 rounded-lg p-1 ml-4 shadow-inner">
                            <button onClick={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() - 7)))} className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white"><ChevronLeft className="w-5 h-5" /></button>
                            <button onClick={() => setCurrentDate(new Date())} className="px-3 text-xs font-bold text-slate-300 hover:text-white">Hoje</button>
                            <button onClick={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() + 7)))} className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white"><ChevronRight className="w-5 h-5" /></button>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden md:flex bg-slate-800 p-1 rounded-lg">
                            <button onClick={() => setViewMode('list')} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === 'list' ? 'bg-slate-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}>Lista</button>
                            <button onClick={() => setViewMode('week')} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === 'week' ? 'bg-slate-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}>Semana</button>
                        </div>
                        <button onClick={fetchEvents} className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg shadow-blue-600/20 transition-all active:scale-95">
                            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>

                {/* Grid Area */}
                <div className="flex-1 overflow-hidden relative flex flex-col">
                    {viewMode === 'list' ? (
                        <div className="flex-1 overflow-y-auto p-8 space-y-4">
                            {events.length === 0 ? (
                                <div className="text-center py-20 text-slate-500">Nenhum evento encontrado.</div>
                            ) : events.map(event => (
                                <div key={event.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex gap-4 hover:border-slate-700 transition-colors">
                                    <div className="flex flex-col items-center justify-center w-14 h-14 bg-slate-800 rounded-lg border border-slate-700">
                                        <span className="text-xs font-bold text-slate-500 uppercase">{new Date(event.start.dateTime || event.start.date).toLocaleString('pt-BR', { weekday: 'short' })}</span>
                                        <span className="text-xl font-bold text-white">{new Date(event.start.dateTime || event.start.date).getDate()}</span>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg text-white">{event.summary || '(Sem título)'}</h3>
                                        <p className="text-slate-400 text-sm">{new Date(event.start.dateTime || event.start.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} - {new Date(event.end.dateTime || event.end.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        // Week Grid
                        <div className="flex-1 flex flex-col overflow-hidden bg-slate-950">
                            {/* Days Header */}
                            <div className="grid grid-cols-8 border-b border-slate-800 bg-slate-900">
                                <div className="w-16 border-r border-slate-800"></div>
                                {weekDays.map((d, i) => (
                                    <div key={i} className={`py-3 text-center border-r border-slate-800/50 ${isToday(d) ? 'bg-blue-500/5' : ''}`}>
                                        <div className={`text-xs uppercase font-bold mb-1 ${isToday(d) ? 'text-blue-400' : 'text-slate-500'}`}>
                                            {d.toLocaleDateString('pt-BR', { weekday: 'short' })}
                                        </div>
                                        <div className={`text-xl font-bold ${isToday(d) ? 'text-blue-400' : 'text-slate-300'}`}>
                                            {d.getDate()}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Scrollable Grid */}
                            <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar relative">
                                <div className="grid grid-cols-8 relative min-h-[1440px] bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTAwIDBMIHAgMCIgc3Ryb2tlPSIjM2UzZTRlIiBzdHJva2Utd2lkdGg9IjEiIG9wYWNpdHk9IjAuMSIgLz48L3N2Zz4=')]">
                                    {/* Time Column */}
                                    <div className="w-16 border-r border-slate-800 bg-slate-900/50 text-xs text-slate-500 font-medium">
                                        {Array.from({ length: 24 }).map((_, h) => (
                                            <div key={h} className="h-20 border-b border-slate-800/30 text-center pt-2">
                                                {h}:00
                                            </div>
                                        ))}
                                    </div>

                                    {/* Event Columns */}
                                    {weekDays.map((date, idx) => {
                                        // Filter events for this day
                                        const dayEvents = events.filter(e => {
                                            const eDate = new Date(e.start.dateTime || e.start.date);
                                            return eDate.getDate() === date.getDate() &&
                                                eDate.getMonth() === date.getMonth();
                                        });

                                        return (
                                            <div key={idx} className={`relative border-r border-slate-800/30 ${isToday(date) ? 'bg-blue-500/5' : ''}`}>
                                                {/* Grid Lines Overlay */}
                                                {Array.from({ length: 24 }).map((_, h) => (
                                                    <div key={h} className="h-20 border-b border-slate-800/10 pointer-events-none" />
                                                ))}

                                                {/* Current Time Line */}
                                                {isToday(date) && (
                                                    <div
                                                        className="absolute w-full h-px bg-red-500 z-30 pointer-events-none flex items-center"
                                                        style={{ top: `${(new Date().getHours() * 60 + new Date().getMinutes()) / (24 * 60) * 100}%` }}
                                                    >
                                                        <div className="w-2 h-2 rounded-full bg-red-500 -ml-1 shadow-[0_0_10px_red]" />
                                                    </div>
                                                )}

                                                {/* Events */}
                                                {dayEvents.map(event => {
                                                    const start = new Date(event.start.dateTime || event.start.date);
                                                    const end = new Date(event.end.dateTime || event.end.date);

                                                    let top = 0;
                                                    let height = 0;
                                                    let isAllDay = false;

                                                    if (event.start.date) {
                                                        isAllDay = true;
                                                        // All day logic simplified
                                                    } else {
                                                        const startMin = start.getHours() * 60 + start.getMinutes();
                                                        const endMin = end.getHours() * 60 + end.getMinutes();
                                                        top = (startMin / 1440) * 100;
                                                        height = ((endMin - startMin) / 1440) * 100;
                                                    }

                                                    if (isAllDay) return (
                                                        <div key={event.id} className="m-1 p-1 bg-purple-600 rounded text-[10px] text-white font-bold truncate">
                                                            {event.summary}
                                                        </div>
                                                    );

                                                    return (
                                                        <motion.div
                                                            key={event.id}
                                                            initial={{ opacity: 0, scale: 0.9 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            className="absolute inset-x-1 rounded-md p-2 border overflow-hidden hover:z-20 hover:scale-[1.02] hover:shadow-xl transition-all cursor-pointer bg-slate-800/90 border-slate-700 hover:bg-slate-800 group"
                                                            style={{
                                                                top: `${top}%`,
                                                                height: `${Math.max(height, 2.5)}%`, // min height
                                                                // Dynamic coloring based on calendar could go here
                                                            }}
                                                        >
                                                            <div className="w-1 h-full absolute left-0 top-0 bg-blue-500" />
                                                            <div className="pl-2">
                                                                <h4 className="text-xs font-bold text-white leading-tight mb-0.5 truncate">{event.summary || '(Sem título)'}</h4>
                                                                <p className="text-[10px] text-slate-400 font-medium truncate">
                                                                    {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
                                                                    {end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </p>
                                                            </div>
                                                        </motion.div>
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
            </div>
        </div>
    );
};

export default AgendaPage;
