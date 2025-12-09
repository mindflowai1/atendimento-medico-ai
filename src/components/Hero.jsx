import React from 'react';
import { motion } from 'framer-motion';
import { Mic, Check, Send, X, Bot, Calendar } from 'lucide-react';

const Hero = () => {
    return (
        <section className="relative bg-slate-950 pt-32 pb-20 overflow-hidden">
            {/* Background Gradients - Dynamic */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.2, 0.4, 0.2]
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute top-0 right-0 w-3/4 h-3/4 bg-gradient-to-l from-primary-dark/20 to-transparent blur-[100px]"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.2, 0.5, 0.2]
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 1
                    }}
                    className="absolute bottom-0 left-0 w-2/3 h-2/3 bg-gradient-to-tr from-secondary-dark/20 to-transparent blur-[120px]"
                />

                {/* Shooting Stars */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="shooting-star w-[100px] top-[10%] right-[20%]" style={{ animationDelay: '0s', animationDuration: '4s' }}></div>
                    <div className="shooting-star w-[150px] top-[25%] right-[10%]" style={{ animationDelay: '2s', animationDuration: '6s' }}></div>
                    <div className="shooting-star w-[80px] top-[40%] right-[30%]" style={{ animationDelay: '4s', animationDuration: '5s' }}></div>
                    <div className="shooting-star w-[120px] top-[15%] right-[45%]" style={{ animationDelay: '6s', animationDuration: '7s' }}></div>
                    <div className="shooting-star w-[90px] top-[5%] right-[5%]" style={{ animationDelay: '1.5s', animationDuration: '5.5s' }}></div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 items-center">

                    {/* Left Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        <div className="flex items-center space-x-2 mb-6">
                            <span className="px-3 py-1 bg-slate-800/50 border border-slate-700 rounded-full text-primary-light text-xs font-semibold tracking-wider uppercase">
                                Chega no Brasil
                            </span>
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                            Sua clínica perde pacientes quando você não pode atender. <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-light to-secondary-light">O Warley não.</span>
                        </h1>
                        <p className="text-slate-400 text-lg mb-8 leading-relaxed max-w-xl">
                            Atendimento automático via WhatsApp 24h por dia. O Warley agenda consultas, tira dúvidas e <strong className="text-white">entende áudios</strong> com a mesma naturalidade da sua melhor secretária.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button className="group relative bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-xl hover:shadow-primary/25 transform hover:-translate-y-1 flex items-center justify-center overflow-hidden">
                                <span className="relative z-10">Ver o Warley trabalhando</span>
                                <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent z-0"></div>
                            </button>
                        </div>
                    </motion.div>

                    {/* Right Content - Mockup */}
                    <div className="relative perspective-[2000px]">
                        {/* Using a wrapper div to handle the 3D perspective if needed, but keeping simple for now */}

                        <motion.div
                            className="relative"
                            initial={{ opacity: 0, x: 40 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                        >

                            {/* Context Stats Floating Cards - Levitating */}
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{
                                    duration: 4,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                                className="absolute top-12 -left-10 z-20 bg-slate-800/90 backdrop-blur-md p-4 rounded-2xl border border-slate-700 shadow-2xl hidden md:block"
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-green-500/20 rounded-lg">
                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-white font-bold text-xl">+140</span>
                                        <span className="text-slate-400 text-xs">NOVOS LEADS</span>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                animate={{ y: [0, -15, 0] }}
                                transition={{
                                    duration: 5,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                    delay: 1
                                }}
                                className="absolute top-20 -right-5 z-20 bg-slate-800/90 backdrop-blur-md p-4 rounded-2xl border border-slate-700 shadow-2xl hidden md:block"
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-blue-500/20 rounded-lg">
                                        <Calendar className="w-4 h-4 text-blue-400" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-white font-bold text-xl">+35</span>
                                        <span className="text-slate-400 text-xs">AGENDAMENTOS</span>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Phone Mockup Frame */}
                            <div className="relative mx-auto border-slate-700 bg-slate-900 border-[8px] rounded-[2.5rem] h-[500px] w-[300px] shadow-2xl overflow-hidden">

                                {/* Notch */}
                                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 h-6 w-32 bg-slate-700 rounded-b-xl z-30"></div>

                                {/* Screen Content */}
                                <div className="h-full w-full bg-slate-950 flex flex-col pt-12 relative overflow-hidden">
                                    {/* Lock Screen Time */}
                                    <div className="text-center mb-8">
                                        <p className="text-slate-400 text-xs font-medium">Sexta-feira, 5 de dezembro</p>
                                        <h2 className="text-6xl text-white font-light tracking-tight">23:20</h2>
                                    </div>

                                    {/* Notifications */}
                                    <div className="px-4 space-y-3">

                                        <div className="flex items-center justify-between px-2 mb-2">
                                            <span className="text-white text-sm">Notificações</span>
                                            <X className="h-4 w-4 text-slate-500" />
                                        </div>

                                        <motion.div
                                            initial={{ x: 100, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            transition={{ delay: 1.5 }}
                                            className="bg-slate-800/60 backdrop-blur-md p-3 rounded-2xl border border-slate-700"
                                        >
                                            <div className="flex items-start space-x-3">
                                                <div className="p-1.5 bg-primary/20 rounded-lg">
                                                    <Bot className="h-5 w-5 text-primary-light" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-center">
                                                        <h4 className="text-white text-sm font-semibold">Nova consulta agendada!</h4>
                                                        <span className="text-xs text-slate-400">agora</span>
                                                    </div>
                                                    <p className="text-slate-300 text-xs mt-0.5 max-w-[180px]">Um novo paciente agendou uma consulta.</p>
                                                </div>
                                            </div>
                                        </motion.div>

                                        <motion.div
                                            initial={{ x: 100, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            transition={{ delay: 1.8 }}
                                            className="bg-slate-800/60 backdrop-blur-md p-3 rounded-2xl border border-slate-700"
                                        >
                                            <div className="flex items-start space-x-3">
                                                <div className="p-1.5 bg-green-500/20 rounded-lg">
                                                    <div className="h-5 w-5 bg-green-500 rounded-full flex items-center justify-center">
                                                        <span className="text-white text-[10px] font-bold">W</span>
                                                    </div>
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-center">
                                                        <h4 className="text-white text-sm font-semibold">Mensagem do WhatsApp</h4>
                                                        <span className="text-xs text-slate-400">agora</span>
                                                    </div>
                                                    <p className="text-slate-300 text-xs mt-0.5 max-w-[180px]">Certo, pode confirmar minha consulta</p>
                                                </div>
                                                <div className="h-5 w-5 bg-slate-700 rounded-full flex items-center justify-center">
                                                    <span className="text-white text-[10px]">22</span>
                                                </div>
                                            </div>
                                        </motion.div>

                                    </div>

                                    {/* Bottom Actions */}
                                    <div className="mt-auto mb-4 mx-auto w-10/12 flex items-center justify-between px-6 bg-slate-800/50 backdrop-blur-sm h-14 rounded-full">
                                        <div className="h-8 w-8 bg-slate-700/50 rounded-full"></div>
                                        <div className="h-8 w-8 bg-slate-700/50 rounded-full"></div>
                                    </div>

                                </div>
                            </div>

                            {/* Audio Differentiator Tooltip */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1.2 }}
                                className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 z-20 w-max max-w-[90%]"
                            >
                                <div className="bg-slate-800/90 backdrop-blur-md px-4 py-3 rounded-xl border border-primary/30 shadow-2xl flex items-center gap-3">
                                    <div className="bg-primary/20 p-2 rounded-full">
                                        <Mic className="w-5 h-5 text-primary-light" />
                                    </div>
                                    <p className="text-slate-200 text-sm font-medium">
                                        Sim, ele ouve seus pacientes.<br />
                                        <span className="text-slate-400 text-xs font-normal">Transcreve e interpreta áudios instantaneamente.</span>
                                    </p>
                                </div>
                            </motion.div>

                            {/* Decorative Elements */}
                            <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[600px] border border-slate-800 rounded-[3rem] opacity-50"></div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
