import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FAQ = () => {
    const [openIndex, setOpenIndex] = useState(null);

    const faqs = [
        {
            q: 'Funciona com meu CRM atual?',
            a: 'Sim! Temos integração nativa com os principais CRMs médicos do mercado e Google Calendar. Se você usa um sistema próprio, nossa API permite integração personalizada.',
        },
        {
            q: 'A IA pode errar um agendamento?',
            a: 'Nossa IA foi treinada especificamente para agendamento médico e possui travas de segurança. Ela sempre confirma os dados antes de finalizar. A taxa de precisão é superior a 99,9%.',
        },
        {
            q: 'Como funciona com áudios?',
            a: 'Usamos tecnologia de ponta (Whisper AI) para transcrever e entender áudios, sotaques e gírias com perfeição, respondendo instantaneamente em texto.',
        },
        {
            q: 'Posso testar antes de pagar?',
            a: 'Sim, oferecemos 7 dias de garantia incondicional. Você pode implementar, usar e se não gostar, devolvemos seu dinheiro.',
        },
    ];

    return (
        <section className="py-24 bg-slate-900 border-t border-slate-800">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl font-bold text-white text-center mb-12">Perguntas Frequentes</h2>
                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div key={index} className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
                            <button
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                className="w-full px-6 py-4 text-left flex items-center justify-between focus:outline-none"
                            >
                                <span className="font-semibold text-white">{faq.q}</span>
                                {openIndex === index ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
                            </button>
                            {openIndex === index && (
                                <div className="px-6 pb-4 pt-0 text-slate-400 border-t border-slate-800/50 mt-2">
                                    <p className="mt-2">{faq.a}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FAQ;
