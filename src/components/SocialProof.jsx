import React from 'react';
import { Building2, Stethoscope, Activity, HeartPulse } from 'lucide-react';

const SocialProof = () => {
    const partners = [
        { name: 'Clínica Santa Vida', icon: HeartPulse },
        { name: 'Hospital Central', icon: Building2 },
        { name: 'Dr. Consultas', icon: Stethoscope },
        { name: 'CardioCenter', icon: Activity },
        { name: 'OrtoLife', icon: Building2 },
    ];

    return (
        <section className="bg-slate-900 border-y border-slate-800 py-10 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <p className="text-slate-500 text-sm font-semibold tracking-widest uppercase mb-8">
                    Já confiado por mais de 500 clínicas em todo o Brasil
                </p>
                <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
                    {partners.map((partner, index) => (
                        <div key={index} className="flex items-center space-x-2 group">
                            <partner.icon className="h-8 w-8 text-primary group-hover:text-primary-light transition-colors" />
                            <span className="text-xl font-bold text-slate-300 group-hover:text-white transition-colors">{partner.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default SocialProof;
