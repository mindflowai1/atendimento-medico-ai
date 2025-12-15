import { motion, useMotionValue, useTransform, animate, useInView } from 'framer-motion';
import { Clock, MessageSquare, Calendar, BarChart3, Shield, Zap } from 'lucide-react';
import React, { useEffect, useRef } from 'react';

const Counter = ({ from, to }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });

    const count = useMotionValue(from);
    const rounded = useTransform(count, (latest) => Math.round(latest));

    useEffect(() => {
        if (isInView) {
            const controls = animate(count, to, { duration: 1.5, ease: "easeOut" });
            return controls.stop;
        }
    }, [count, to, isInView]);

    return (
        <span ref={ref} className="text-green-400 text-sm font-bold flex">
            <motion.span>{rounded}</motion.span>%
        </span>
    );
};

const Features = () => {
    return (
        <section id="funcionalidades" className="py-24 bg-slate-950 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        A Secretária Inteligente para <span className="text-primary-light">Clínicas Modernas.</span>
                    </h2>
                    <p className="text-slate-400 text-lg">
                        Ela é prestativa, incansável, educada e extremamente eficiente.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Card 1 - Agenda (Large) */}
                    <div className="md:col-span-2 row-span-2 bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 border border-slate-700/50 hover:border-primary/50 transition-all group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                        <div className="relative z-10">
                            <div className="bg-primary/20 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 text-primary-light">
                                <Calendar className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-4">Agenda Sempre Cheia</h3>
                            <p className="text-slate-400 text-lg mb-6">
                                Focada em eliminar horários vagos. O Warley preenche a agenda ativamente e realiza confirmações automáticas, garantindo ocupação máxima e <strong className="text-white">reduzindo as faltas a quase zero</strong>.
                            </p>

                            <div className="space-y-4">
                                {/* Métrica 1 */}
                                <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-slate-400 text-sm">Ocupação da Agenda</span>
                                        <Counter from={0} to={98} className="text-green-400" />
                                    </div>
                                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            whileInView={{ width: "98%" }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                                            className="bg-green-500 w-[98%] h-full rounded-full relative"
                                        >
                                            <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/50 animate-pulse shadow-[0_0_10px_rgba(74,222,128,0.8)]"></div>
                                        </motion.div>
                                    </div>
                                </div>

                                {/* Métrica 2 */}
                                <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-slate-400 text-sm">Taxa de Comparecimento</span>
                                        <Counter from={0} to={96} className="text-blue-400" />
                                    </div>
                                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            whileInView={{ width: "96%" }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 1.5, ease: "easeOut", delay: 0.4 }}
                                            className="bg-blue-500 w-[96%] h-full rounded-full relative"
                                        >
                                            <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/50 animate-pulse shadow-[0_0_10px_rgba(96,165,250,0.8)]"></div>
                                        </motion.div>
                                    </div>
                                </div>

                                {/* Métrica 3 - Retenção */}
                                <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-slate-400 text-sm">Taxa de Retenção</span>
                                        <Counter from={0} to={92} className="text-purple-400" />
                                    </div>
                                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            whileInView={{ width: "92%" }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 1.5, ease: "easeOut", delay: 0.6 }}
                                            className="bg-purple-500 w-[92%] h-full rounded-full relative"
                                        >
                                            <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/50 animate-pulse shadow-[0_0_10px_rgba(168,85,247,0.8)]"></div>
                                        </motion.div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card 2 - No-Show */}
                    <div className="bg-slate-900 rounded-3xl p-8 border border-slate-700/50 hover:border-primary/50 transition-all group">
                        <div className="bg-purple-500/20 w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-purple-400">
                            <Shield className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Fim do No-Show</h3>
                        <p className="text-slate-400">
                            Confirmação automática e inteligente para o paciente não faltar. Se ele não puder, ela reagenda na hora.
                        </p>
                    </div>

                    {/* Card 3 - Humanizado */}
                    <div className="bg-slate-900 rounded-3xl p-8 border border-slate-700/50 hover:border-primary/50 transition-all group">
                        <div className="bg-blue-500/20 w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-blue-400">
                            <MessageSquare className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Atendimento Humanizado</h3>
                        <p className="text-slate-400">
                            Nada de parecer um robô chato. O Warley conversa com empatia, entende o contexto e acolhe o paciente.
                        </p>
                    </div>

                    {/* Card 4 - Integração (Wide) */}
                    <div className="md:col-span-3 bg-slate-900 rounded-3xl p-8 border border-slate-700/50 hover:border-primary/50 transition-all group flex flex-col md:flex-row items-center gap-8">
                        <div className="flex-1">
                            <div className="bg-orange-500/20 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 text-orange-400">
                                <Zap className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-4">Integração Simples</h3>
                            <p className="text-slate-400 text-lg">
                                Funciona com o número de WhatsApp atual da sua clínica. Não precisa trocar de chip, nem instalar programas complexos.
                            </p>
                        </div>
                        <div className="flex-1 flex justify-center opacity-80 mix-blend-lighten">
                            {/* Abstract visualization of integration */}
                            <div className="relative flex items-center gap-4">
                                <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-6 z-10">
                                    <MessageSquare className="text-white w-8 h-8" />
                                </div>
                                <div className="h-1 w-16 bg-slate-700 rounded-full"></div>
                                <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center shadow-xl z-20 border-4 border-slate-900">
                                    <span className="text-white font-bold text-lg">Warley</span>
                                </div>
                                <div className="h-1 w-16 bg-slate-700 rounded-full"></div>
                                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg transform rotate-6 z-10">
                                    <Calendar className="text-white w-8 h-8" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Features;
