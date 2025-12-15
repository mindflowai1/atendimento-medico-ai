import React from 'react';
import { motion } from 'framer-motion';
import { Users, Calendar, MessageSquare, TrendingUp, Clock, CheckCircle2 } from 'lucide-react';

const MetricCard = ({ title, value, subtext, icon: Icon, colorClass, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: delay }}
        className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition-colors"
    >
        <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${colorClass}`}>
            <Icon className="w-24 h-24 -mr-8 -mt-8" />
        </div>

        <div className="relative z-10 flex items-start justify-between">
            <div>
                <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
                <h3 className="text-3xl font-bold text-white mb-2">{value}</h3>
                <div className="flex items-center gap-2">
                    <span className="text-emerald-400 text-xs font-bold bg-emerald-400/10 px-2 py-1 rounded-full flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        {subtext}
                    </span>
                    <span className="text-slate-500 text-xs">vs. mês anterior</span>
                </div>
            </div>
            <div className={`p-3 rounded-lg bg-slate-800 ${colorClass} bg-opacity-10 text-white`}>
                <Icon className={`w-6 h-6 ${colorClass.replace('text-', '')}`} /> {/* Trick to apply color */}
            </div>
        </div>
    </motion.div>
);

const ActivityItem = ({ title, time, type }) => (
    <div className="flex items-start gap-4 p-4 hover:bg-slate-800/50 rounded-xl transition-colors border-b border-slate-800/50 last:border-0">
        <div className={`mt-1 w-2 h-2 rounded-full ${type === 'booking' ? 'bg-emerald-500' : 'bg-blue-500'}`}></div>
        <div className="flex-1">
            <p className="text-slate-300 text-sm font-medium">{title}</p>
            <p className="text-slate-500 text-xs mt-1">{time}</p>
        </div>
    </div>
);

const Dashboard = () => {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white">Visão Geral</h1>
                <p className="text-slate-400">Bem-vindo de volta, Dr. Silva. Aqui está o resumo de hoje.</p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    title="Agendamentos"
                    value="42"
                    subtext="+12%"
                    icon={Calendar}
                    colorClass="text-emerald-500"
                    delay={0}
                />
                <MetricCard
                    title="Atendimentos IA"
                    value="156"
                    subtext="+28%"
                    icon={MessageSquare}
                    colorClass="text-blue-500"
                    delay={0.1}
                />
                <MetricCard
                    title="Novos Pacientes"
                    value="18"
                    subtext="+5%"
                    icon={Users}
                    colorClass="text-purple-500"
                    delay={0.2}
                />
                <MetricCard
                    title="Tempo Economizado"
                    value="14h"
                    subtext="2h/dia"
                    icon={Clock}
                    colorClass="text-amber-500"
                    delay={0.3}
                />
            </div>

            {/* Content Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Main Graph Area Placeholder */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 min-h-[300px] flex flex-col"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-white">Performance Semanal</h3>
                        <select className="bg-slate-800 text-slate-300 text-sm border-none rounded-lg focus:ring-1 focus:ring-primary px-3 py-1 outline-none">
                            <option>Últimos 7 dias</option>
                            <option>Este Mês</option>
                        </select>
                    </div>

                    {/* Fake Chart Visualization */}
                    <div className="flex-1 flex items-end justify-between gap-2 px-4 pb-2">
                        {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                            <div key={i} className="group w-full flex flex-col items-center gap-2">
                                <div
                                    className="w-full bg-slate-800 rounded-t-lg relative overflow-hidden group-hover:bg-slate-700 transition-colors"
                                    style={{ height: `${h}%` }}
                                >
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: "100%" }}
                                        transition={{ duration: 1, delay: 0.5 + (i * 0.1) }}
                                        className="w-full absolute bottom-0 bg-primary/20 group-hover:bg-primary/40 transition-colors"
                                    />
                                </div>
                                <span className="text-xs text-slate-500">
                                    {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'][i]}
                                </span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Right Column: Activity Feed */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-6"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-white">Atividade Recente</h3>
                        <button className="text-xs text-primary hover:text-primary-light">Ver tudo</button>
                    </div>

                    <div className="space-y-1">
                        <ActivityItem title="Maria Silva agendou Dermatologia" time="Há 5 min" type="booking" />
                        <ActivityItem title="João Souza confirmou consulta" time="Há 12 min" type="booking" />
                        <ActivityItem title="Warley respondeu dúvida sobre preço" time="Há 24 min" type="message" />
                        <ActivityItem title="Novo paciente cadastrado" time="Há 1h" type="booking" />
                        <ActivityItem title="Lembretes de amanhã enviados" time="Há 2h" type="message" />
                    </div>

                    <div className="mt-6 pt-6 border-t border-slate-800">
                        <div className="flex items-center gap-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                            <div>
                                <p className="text-sm font-medium text-emerald-400">Sistema Operante</p>
                                <p className="text-xs text-emerald-500/70">Todas as conexões ativas</p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Dashboard;
