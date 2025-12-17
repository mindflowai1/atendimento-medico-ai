import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Users, Filter, Plus, Search, Phone, CreditCard, Building2, Calendar, Mail, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const PatientCard = ({ patient }) => {
    const formatPhone = (phone) => {
        if (!phone) return '-';
        // Format: +5511999999999 -> (11) 99999-9999
        const cleaned = phone.replace(/\D/g, '');
        const match = cleaned.match(/^55(\d{2})(\d{5})(\d{4})$/);
        if (match) {
            return `(${match[1]}) ${match[2]}-${match[3]}`;
        }
        return phone;
    };

    const formatCPF = (cpf) => {
        if (!cpf) return '-';
        // Format: 12345678900 -> 123.456.789-00
        const cleaned = cpf.replace(/\D/g, '');
        return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'inactive': return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
            case 'blocked': return 'bg-red-500/20 text-red-400 border-red-500/30';
            default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'active': return 'Ativo';
            case 'inactive': return 'Inativo';
            case 'blocked': return 'Bloqueado';
            default: return status;
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 rounded-xl p-4 hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 group h-full flex flex-col"
        >
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-600/20 group-hover:scale-105 transition-transform duration-300 shrink-0">
                    {patient.name?.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-white text-base leading-tight truncate" title={patient.name}>{patient.name}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded-full border ${getStatusColor(patient.status)}`}>
                            {getStatusLabel(patient.status)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Info Grid */}
            <div className="space-y-2.5 mb-4 flex-1">
                {patient.whatsapp && (
                    <div className="flex items-center gap-2 text-xs p-2 bg-slate-950/30 rounded-lg border border-slate-800/30 group-hover:border-slate-800/50 transition-colors">
                        <div className="p-1 bg-green-500/10 rounded">
                            <Phone className="w-3 h-3 text-green-400" />
                        </div>
                        <span className="text-white font-medium tracking-wide">{formatPhone(patient.whatsapp)}</span>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                    {patient.cpf && (
                        <div className="p-2 bg-slate-950/30 rounded-lg border border-slate-800/30">
                            <div className="flex items-center gap-1.5 mb-0.5">
                                <CreditCard className="w-3 h-3 text-blue-400" />
                                <span className="text-[10px] text-slate-500 font-medium uppercase">CPF</span>
                            </div>
                            <p className="text-slate-300 text-xs font-medium tracking-wide truncate">{formatCPF(patient.cpf)}</p>
                        </div>
                    )}

                    {patient.health_plan && (
                        <div className="p-2 bg-slate-950/30 rounded-lg border border-slate-800/30">
                            <div className="flex items-center gap-1.5 mb-0.5">
                                <Building2 className="w-3 h-3 text-yellow-400" />
                                <span className="text-[10px] text-slate-500 font-medium uppercase">Plano</span>
                            </div>
                            <p className="text-slate-300 text-xs font-medium truncate" title={patient.health_plan}>
                                {patient.health_plan}
                            </p>
                        </div>
                    )}
                </div>

                {patient.email && (
                    <div className="flex items-center gap-2 text-xs p-2 bg-purple-500/10 rounded-lg border border-purple-500/20 group-hover:border-purple-500/30 transition-colors">
                        <Mail className="w-3 h-3 text-purple-400 shrink-0" />
                        <span className="text-purple-200 truncate font-medium">{patient.email}</span>
                    </div>
                )}

                {patient.last_message_date && (
                    <div className="flex items-center gap-2 text-xs p-2 bg-blue-500/10 rounded-lg border border-blue-500/20 group-hover:border-blue-500/30 transition-colors">
                        <Clock className="w-3 h-3 text-blue-400 shrink-0" />
                        <span className="text-blue-200 truncate font-medium">
                            Último contato: {new Date(patient.last_message_date).toLocaleDateString('pt-BR')}
                            {' '}
                            <span className="text-blue-300/70">
                                às {new Date(patient.last_message_date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </span>
                    </div>
                )}
            </div>

            {/* Actions */}
            {patient.whatsapp && (
                <div className="pt-3 border-t border-slate-800/50 mt-auto">
                    <a
                        href={`https://wa.me/${patient.whatsapp.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2 px-4 bg-green-500/10 hover:bg-green-500/20 text-green-400 hover:text-green-300 border border-green-500/20 hover:border-green-500/30 font-semibold text-xs rounded-lg transition-all flex items-center justify-center gap-2 group/btn"
                    >
                        <Phone className="w-3.5 h-3.5 group-hover/btn:scale-110 transition-transform" />
                        Chamar no WhatsApp
                    </a>
                </div>
            )}
        </motion.div>
    );

};

const CRM = () => {
    const [patients, setPatients] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        try {
            setIsLoading(true);
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                console.error('No user found');
                return;
            }

            // Get user's clinic
            const { data: clinicData } = await supabase
                .from('clinics')
                .select('id')
                .eq('owner_id', user.id)
                .single();

            if (!clinicData) {
                console.error('No clinic found');
                return;
            }

            // Fetch patients for this clinic
            let query = supabase
                .from('patients')
                .select('*')
                .eq('clinic_id', clinicData.id)
                .order('created_at', { ascending: false });

            const { data, error } = await query;

            if (error) throw error;

            setPatients(data || []);
        } catch (error) {
            console.error('Error fetching patients:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredPatients = patients.filter(patient => {
        const matchesSearch = !searchQuery ||
            patient.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            patient.cpf?.includes(searchQuery) ||
            patient.whatsapp?.includes(searchQuery) ||
            patient.email?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === 'all' || patient.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">CRM de Pacientes</h1>
                    <p className="text-slate-400">Gerencie seus pacientes e histórico de atendimentos</p>
                </div>
                <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-lg shadow-blue-600/30 flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Novo Paciente
                </button>
            </div>

            {/* Search and Filters */}
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Buscar por nome, CPF, telefone ou email..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white focus:ring-2 focus:ring-blue-500/50 outline-none"
                >
                    <option value="all">Todos os Status</option>
                    <option value="active">Ativos</option>
                    <option value="inactive">Inativos</option>
                    <option value="blocked">Bloqueados</option>
                </select>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm">Total de Pacientes</p>
                            <p className="text-2xl font-bold text-white mt-1">{patients.length}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                            <Users className="w-6 h-6 text-blue-400" />
                        </div>
                    </div>
                </div>
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm">Ativos</p>
                            <p className="text-2xl font-bold text-green-400 mt-1">
                                {patients.filter(p => p.status === 'active').length}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                            <Users className="w-6 h-6 text-green-400" />
                        </div>
                    </div>
                </div>
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm">Novos (30 dias)</p>
                            <p className="text-2xl font-bold text-purple-400 mt-1">
                                {patients.filter(p => {
                                    const thirtyDaysAgo = new Date();
                                    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                                    return new Date(p.created_at) > thirtyDaysAgo;
                                }).length}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                            <Calendar className="w-6 h-6 text-purple-400" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Patients Grid */}
            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                </div>
            ) : filteredPatients.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredPatients.map((patient, index) => (
                        <motion.div
                            key={patient.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="h-full"
                        >
                            <PatientCard patient={patient} />
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-12 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                        <Users className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                        {searchQuery ? 'Nenhum paciente encontrado' : 'Nenhum paciente cadastrado'}
                    </h3>
                    <p className="text-slate-400 max-w-md">
                        {searchQuery
                            ? 'Tente ajustar os filtros ou buscar por outros termos.'
                            : 'Comece adicionando seus primeiros pacientes clicando no botão acima.'}
                    </p>
                </div>
            )}
        </div>
    );
};

export default CRM;
