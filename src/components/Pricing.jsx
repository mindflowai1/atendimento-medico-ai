import React from 'react';
import { Check } from 'lucide-react';

const Pricing = () => {
    const plans = [
        {
            name: 'Inicial',
            price: '297',
            period: '/mês',
            features: ['Até 500 agendamentos/mês', 'Integração Google Calendar', 'Suporte por e-mail', '1 Número de WhatsApp'],
            cta: 'Começar Agora',
            popular: false,
        },
        {
            name: 'Profissional',
            price: '497',
            period: '/mês',
            features: ['Agendamentos Ilimitados', 'Integração CRM & E-mail', 'Dashboard Avançado', 'Suporte Prioritário', 'Múltiplos calendários'],
            cta: 'Assinar Profissional',
            popular: true,
        },
        {
            name: 'Clínica',
            price: 'Sob Consulta',
            period: '',
            features: ['Múltiplos profissionais', 'API Personalizada', 'Gerente de Conta', 'Treinamento Dedicado', 'Whitelabel opcional'],
            cta: 'Falar com Consultor',
            popular: false,
        },
    ];

    return (
        <section id="precos" className="py-24 bg-slate-950">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Investimento que se paga <span className="text-primary-light">na primeira semana</span>
                    </h2>
                    <p className="text-slate-400">Sem taxa de adesão. Cancele quando quiser.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {plans.map((plan, index) => (
                        <div key={index} className={`relative rounded-3xl p-8 flex flex-col ${plan.popular ? 'bg-slate-900 border-2 border-primary shadow-2xl shadow-primary/10' : 'bg-slate-900/50 border border-slate-800'}`}>
                            {plan.popular && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                                    MAIS POPULAR
                                </div>
                            )}
                            <h3 className="text-white text-xl font-bold mb-2">{plan.name}</h3>
                            <div className="mb-6">
                                <span className="text-4xl font-bold text-white">R$ {plan.price}</span>
                                <span className="text-slate-500 font-medium">{plan.period}</span>
                            </div>
                            <ul className="space-y-4 mb-8 flex-1">
                                {plan.features.map((feat, i) => (
                                    <li key={i} className="flex items-start space-x-3 text-slate-300 text-sm">
                                        <Check className="w-5 h-5 text-primary shrink-0" />
                                        <span>{feat}</span>
                                    </li>
                                ))}
                            </ul>
                            <button className={`w-full py-4 rounded-xl font-bold transition-all ${plan.popular ? 'bg-primary hover:bg-primary-dark text-white' : 'bg-slate-800 hover:bg-slate-700 text-white'}`}>
                                {plan.cta}
                            </button>
                            {plan.name !== 'Clínica' && (
                                <p className="text-center text-slate-500 text-xs mt-4">14 dias de garantia</p>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Pricing;
