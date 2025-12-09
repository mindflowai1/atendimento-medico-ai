import React from 'react';
import { QrCode, Sliders, CalendarCheck } from 'lucide-react';

const HowItWorks = () => {
    const steps = [
        {
            icon: QrCode,
            title: 'Conecte seu WhatsApp',
            desc: 'Escaneie o QR Code para conectar a nossa tecnologia ao número da sua clínica.',
        },
        {
            icon: Sliders,
            title: 'Ajuste os horários',
            desc: 'Defina sua disponibilidade e serviços. É rápido e intuitivo.',
        },
        {
            icon: CalendarCheck,
            title: 'Pronto!',
            desc: 'O Warley assume o atendimento e sua agenda começa a encher automaticamente.',
        },
    ];

    return (
        <section id="como-funciona" className="py-24 bg-slate-900 border-t border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Simples como deve ser.
                    </h2>
                    <p className="text-slate-400">Implementação em 3 passos.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 relative">
                    {/* Connection Line */}
                    <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-slate-700 to-transparent z-0"></div>

                    {steps.map((step, index) => (
                        <div key={index} className="relative z-10 flex flex-col items-center text-center">
                            <div className="w-24 h-24 bg-slate-800 rounded-2xl border border-slate-700 flex items-center justify-center mb-6 shadow-xl relative group hover:-translate-y-2 transition-transform duration-300">
                                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <step.icon className="w-10 h-10 text-primary-light relative z-10" />
                                <div className="absolute -top-3 -right-3 w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center border border-slate-600 font-bold text-white">
                                    {index + 1}
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                            <p className="text-slate-400 max-w-xs">{step.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;
