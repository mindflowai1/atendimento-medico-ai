import React from 'react';
import { Brain, User, Coffee } from 'lucide-react';

const Comparison = () => {
    return (
        <section id="vantagens" className="py-24 bg-slate-950">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Impact Phrase */}
                <div className="mb-20 text-center">
                    <div className="inline-block p-4 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl transform hover:scale-105 transition-transform duration-300">
                        <div className="flex items-center space-x-3 text-lg md:text-xl font-medium text-slate-300">
                            <Coffee className="w-6 h-6 text-amber-500" />
                            <span>
                                "Mais barato que um café por dia, <span className="text-white font-bold">mais eficiente que uma equipe inteira.</span>"
                            </span>
                        </div>
                    </div>
                </div>

                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Comparativo de Eficiência
                    </h2>
                    <p className="text-slate-400">Veja a diferença na prática.</p>
                </div>

                <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden">
                    <div className="grid grid-cols-3 p-6 border-b border-slate-800 bg-slate-800/50">
                        <div className="col-span-1 text-slate-400 font-semibold">Critério</div>
                        <div className="col-span-1 flex items-center justify-center space-x-2 text-white font-bold">
                            <User className="w-5 h-5 text-slate-500" />
                            <span className="hidden md:inline">Secretária Comum</span>
                            <span className="md:hidden">Comum</span>
                        </div>
                        <div className="col-span-1 flex items-center justify-center space-x-2 text-primary-light font-bold">
                            <Brain className="w-5 h-5" />
                            <span className="hidden md:inline">Warley AI</span>
                            <span className="md:hidden">Warley</span>
                        </div>
                    </div>

                    {[
                        { label: 'Carga Horária', human: '40h / semana', ai: '168h / semana', highlight: true },
                        { label: 'Tempo de Resposta', human: 'Variável (até horas)', ai: 'Imediato (3 seg)', highlight: true },
                        { label: 'Multitarefa', human: '1 paciente por vez', ai: 'Infinitos simultâneos', highlight: true },
                        { label: 'Humor', human: 'Oscila com o dia', ai: 'Sempre cordial', highlight: false },
                        { label: 'Custo', human: 'Salário + Encargos', ai: 'Assinatura Fixa', highlight: false },
                    ].map((row, index) => (
                        <div key={index} className={`grid grid-cols-3 p-6 border-b border-slate-800 last:border-0 hover:bg-slate-800/30 transition-colors ${row.highlight ? 'bg-slate-800/10' : ''}`}>
                            <div className="col-span-1 text-slate-300 font-medium flex items-center text-sm md:text-base">{row.label}</div>
                            <div className="col-span-1 text-center text-slate-400 flex items-center justify-center text-sm md:text-base">
                                {row.human}
                            </div>
                            <div className="col-span-1 text-center text-primary-light font-bold flex items-center justify-center text-sm md:text-base">
                                {row.ai}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Comparison;
