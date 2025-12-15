import React from 'react';
import { Users, Filter, Plus, Search } from 'lucide-react';

const CRM = () => {
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">CRM de Pacientes</h1>
                    <p className="text-slate-400">Gerencie seus pacientes e leads</p>
                </div>
                <button className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Novo Paciente
                </button>
            </div>

            {/* Filters and Search */}
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Buscar por nome, email ou telefone..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-white focus:ring-2 focus:ring-primary/50 outline-none"
                    />
                </div>
                <button className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:text-white hover:bg-slate-700 transition-colors">
                    <Filter className="w-5 h-5" />
                    Filtros
                </button>
            </div>

            {/* Placeholder Content */}
            <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-12 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                    <Users className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Módulo CRM em Desenvolvimento</h3>
                <p className="text-slate-400 max-w-md">
                    Em breve você poderá gerenciar toda a jornada dos seus pacientes, histórico de conversas e agendamentos em um só lugar.
                </p>
            </div>
        </div>
    );
};

export default CRM;
