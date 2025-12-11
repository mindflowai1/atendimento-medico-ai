import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    Calendar,
    MessageSquare,
    Settings,
    LogOut,
    Menu,
    X,
    Bell,
    ChevronDown,
    User,
    Users,
    Link2,
    Smartphone
} from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';

import logo from '../assets/logo.png';

const SidebarLink = ({ to, icon: Icon, label, onClick, end }) => (
    <NavLink
        to={to}
        onClick={onClick}
        end={end}
        className={({ isActive }) => `
            flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
            ${isActive
                ? 'bg-primary/10 text-primary-light font-medium'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'}
        `}
    >
        <Icon className="w-5 h-5" />
        <span>{label}</span>
    </NavLink>
);

import { supabase } from '../lib/supabase'; // Make sure path is correct

const DashboardLayout = () => {
    // ... (existing state) ...
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [clinicName, setClinicName] = useState(null);
    const [isLoadingUserData, setIsLoadingUserData] = useState(true);
    const navigate = useNavigate();

    // ... (existing useEffects & getClinicInfo) ...
    React.useEffect(() => {
        // 1. Setup Auth Listener for Global Token Capture
        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
            if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED') && session) {

                // Refresh Clinic Info
                getClinicInfo(session);

                // Check for Provider Tokens (Google Calendar)
                // specific check for REFRESH token to avoid overwriting with null on page reloads
                const providerRefreshToken = session.provider_refresh_token;

                if (providerRefreshToken) {
                    console.log("Global Listener: New Provider Refresh Token found. Updating clinic credentials...");
                    try {
                        const { error } = await supabase
                            .from('clinics')
                            .upsert({
                                owner_id: session.user.id,
                                gcal_refresh_token: providerRefreshToken,
                                gcal_email: session.user.email,
                                updated_at: new Date().toISOString(),
                            }, { onConflict: 'owner_id' });

                        if (error) {
                            console.error('Error saving token:', error);
                        } else {
                            console.log("Global Listener: Tokens saved successfully.");
                        }
                    } catch (err) {
                        console.error('Global Listener Error:', err);
                    }
                }
            } else if (event === 'SIGNED_OUT') {
                navigate('/');
            }
        });

        // 2. Initial Fetch
        getClinicInfo();

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    const getClinicInfo = async (session = null) => {
        try {
            let currentUser = session?.user;

            if (!currentUser) {
                const { data } = await supabase.auth.getUser();
                currentUser = data?.user;
            }

            if (!currentUser) {
                console.warn("getClinicInfo: No user found. Redirecting.");
                setIsLoadingUserData(false);
                navigate('/');
                return;
            }

            console.log("getClinicInfo: User found:", currentUser.id);
            setUser(currentUser);

            // Try to get clinic name
            const { data, error } = await supabase
                .from('clinics')
                .select('name')
                .eq('owner_id', currentUser.id)
                .maybeSingle();

            if (error) console.error("getClinicInfo DB Error:", error);

            if (data && data.name) {
                console.log("getClinicInfo: Name found in DB:", data.name);
                setClinicName(data.name);
            } else {
                console.log("getClinicInfo: Using fallback name.");
                const fallbackName = currentUser.user_metadata?.name || currentUser.email || 'Minha Clínica';
                setClinicName(fallbackName);
            }
        } catch (error) {
            console.error('Error fetching clinic info:', error);
            setClinicName('Minha Clínica');
        } finally {
            setIsLoadingUserData(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 flex overflow-hidden">
            {/* ... Sidebar code remains same ... */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsSidebarOpen(false)}
                        className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
                    />
                )}
            </AnimatePresence>

            <aside className={`
                fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 transform transition-transform duration-300 ease-in-out
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="h-full flex flex-col p-6">
                    {/* Logo */}
                    <div className="relative flex items-center justify-center mb-10 px-2 py-4">
                        <div
                            className="cursor-pointer"
                            onClick={() => {
                                navigate('/dashboard');
                                setIsSidebarOpen(false);
                            }}
                        >
                            <img
                                src={logo}
                                alt="Warley AI Logo"
                                className="w-32 h-auto object-contain transition-transform duration-300 hover:scale-105 drop-shadow-lg"
                            />
                        </div>
                        <button
                            onClick={() => setIsSidebarOpen(false)}
                            className="lg:hidden absolute right-0 top-0 text-slate-400 hover:text-white"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 space-y-2">
                        <SidebarLink to="/dashboard" icon={LayoutDashboard} label="Visão Geral" end={true} onClick={() => setIsSidebarOpen(false)} />
                        <SidebarLink to="/dashboard/agenda" icon={Calendar} label="Agenda" onClick={() => setIsSidebarOpen(false)} />
                        <SidebarLink to="/dashboard/crm" icon={Users} label="CRM" onClick={() => setIsSidebarOpen(false)} />
                        <SidebarLink to="/dashboard/mensagens" icon={MessageSquare} label="Atendimentos" onClick={() => setIsSidebarOpen(false)} />

                        <div className="pt-8">
                            <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Sistema</p>
                            <SidebarLink to="/dashboard/configuracoes" icon={Settings} label="Configurações" onClick={() => setIsSidebarOpen(false)} />
                            <SidebarLink to="/dashboard/integracoes" icon={Link2} label="Conectar Agenda" onClick={() => setIsSidebarOpen(false)} />
                            <SidebarLink to="/conectar" icon={Smartphone} label="Conexão WhatsApp" onClick={() => setIsSidebarOpen(false)} />
                        </div>
                    </nav>

                    {/* User Profile / Logout */}
                    <div className="pt-6 border-t border-slate-800">
                        <button
                            onClick={handleLogout}
                            className="flex items-center justify-center gap-3 w-full px-4 py-3.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-red-500/20 active:scale-[0.98]"
                        >
                            <LogOut className="w-5 h-5" />
                            <span>Sair da Conta</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">

                {/* Topbar */}
                <header className="h-16 bg-slate-900/50 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-6 z-30">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="lg:hidden p-2 text-slate-400 hover:text-white"
                    >
                        <Menu className="w-6 h-6" />
                    </button>

                    <div className="ml-auto flex items-center gap-4">
                        <button className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-slate-900"></span>
                        </button>

                        <div className="relative border-l border-slate-800 pl-4 ml-4">
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="flex items-center gap-3 hover:bg-slate-800/50 p-2 rounded-xl transition-all"
                            >
                                {user?.user_metadata?.avatar_url ? (
                                    <img
                                        src={user.user_metadata.avatar_url}
                                        alt="User Avatar"
                                        className="w-8 h-8 rounded-full border border-slate-700"
                                    />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                                        <User className="w-4 h-4 text-slate-400" />
                                    </div>
                                )}
                                <div className="hidden md:block text-right">
                                    <p className="text-sm font-medium text-white">
                                        {isLoadingUserData ? 'Carregando...' : (clinicName || user?.user_metadata?.name || user?.email || 'Usuário')}
                                    </p>
                                    {user?.email && !isLoadingUserData && (
                                        <p className="text-xs text-slate-500">
                                            {user.email}
                                        </p>
                                    )}
                                </div>
                                <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
                            </button>

                            <AnimatePresence>
                                {isProfileOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        transition={{ duration: 0.2 }}
                                        className="absolute right-0 top-full mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-xl overflow-hidden z-50"
                                    >
                                        <div className="p-1">
                                            <NavLink
                                                to="/dashboard/configuracoes"
                                                onClick={() => setIsProfileOpen(false)}
                                                className="flex items-center gap-2 px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                                            >
                                                <Settings className="w-4 h-4" />
                                                Configurações
                                            </NavLink>
                                            <div className="h-px bg-slate-800 my-1"></div>
                                            <button
                                                onClick={() => {
                                                    setIsProfileOpen(false);
                                                    handleLogout();
                                                }}
                                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                                            >
                                                <LogOut className="w-4 h-4" />
                                                Sair da Conta
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </header>

                {/* Page Content Scrollable Area */}
                {/* Page Content Scrollable Area */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-950 p-6 lg:p-8 flex flex-col">
                    <div className="flex-1">
                        <Outlet />
                    </div>

                    {/* Dashboard Footer */}
                    <footer className="mt-12 pt-6 border-t border-slate-900 text-center text-xs text-slate-600">
                        <p>
                            &copy; {new Date().getFullYear()} Warley AI.
                            <NavLink to="/privacidade" className="ml-4 hover:text-slate-400 transition-colors">Política de Privacidade</NavLink>
                            <span className="mx-2">|</span>
                            <a href="#" className="hover:text-slate-400 transition-colors">Termos de Uso</a>
                        </p>
                    </footer>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
