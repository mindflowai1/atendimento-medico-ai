import React from 'react';
import { Bot, Instagram, Linkedin, Facebook } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-slate-950 border-t border-slate-900 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid md:grid-cols-4 gap-8 mb-8">
                    <div className="col-span-1 md:col-span-1">
                        <div className="flex items-center space-x-2 mb-4">
                            <Bot className="h-6 w-6 text-primary" />
                            <span className="text-xl font-bold text-white">Warley AI</span>
                        </div>
                        <p className="text-slate-500 text-sm">
                            A Secretária Inteligente para Clínicas Modernas.
                        </p>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-4">Produto</h4>
                        <ul className="space-y-2 text-sm text-slate-400">
                            <li><a href="#funcionalidades" className="hover:text-primary transition-colors">Funcionalidades</a></li>
                            <li><a href="#precos" className="hover:text-primary transition-colors">Planos</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Suporte</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-4">Legal</h4>
                        <ul className="space-y-2 text-sm text-slate-400">
                            <li><Link to="/privacidade" className="hover:text-primary transition-colors">Termos de Privacidade (LGPD)</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-4">Contato</h4>
                        <ul className="space-y-2 text-sm text-slate-400">
                            <li><a href="#" className="hover:text-primary transition-colors">Falar com Vendas</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">suporte@warley.ai</a></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-slate-900 pt-8 flex flex-col md:flex-row justify-between items-center">
                    <p className="text-slate-600 text-sm mb-4 md:mb-0">
                        © 2025 Warley AI Tecnologia Ltda. Todos os direitos reservados.
                    </p>
                    <div className="flex space-x-6">
                        <a href="#" className="text-slate-500 hover:text-white transition-colors"><Instagram className="w-5 h-5" /></a>
                        <a href="#" className="text-slate-500 hover:text-white transition-colors"><Linkedin className="w-5 h-5" /></a>
                        <a href="#" className="text-slate-500 hover:text-white transition-colors"><Facebook className="w-5 h-5" /></a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
