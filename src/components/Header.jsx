import React, { useState } from 'react';
import { Menu, X, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';

import logo from '../assets/logo.png';

const Header = ({ onLoginClick }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="fixed w-full z-50 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800 transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-28">
                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center cursor-pointer transition-transform duration-300 hover:scale-105" onClick={() => window.location.href = '/'}>
                        <img
                            src={logo}
                            alt="Warley AI Logo"
                            className="h-24 w-auto object-contain drop-shadow-md"
                        />
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-8">
                            <a href="#funcionalidades" className="text-slate-300 hover:text-primary-light transition-colors px-3 py-2 rounded-md text-sm font-medium hover:bg-white/5">Funcionalidades</a>
                            <a href="#como-funciona" className="text-slate-300 hover:text-primary-light transition-colors px-3 py-2 rounded-md text-sm font-medium hover:bg-white/5">Como funciona</a>
                            <a href="#vantagens" className="text-slate-300 hover:text-primary-light transition-colors px-3 py-2 rounded-md text-sm font-medium hover:bg-white/5">Vantagens</a>
                            <a href="#precos" className="text-slate-300 hover:text-primary-light transition-colors px-3 py-2 rounded-md text-sm font-medium hover:bg-white/5">Planos</a>
                        </div>
                    </div>

                    {/* Desktop CTA */}
                    <div className="hidden md:flex items-center gap-4">
                        <button
                            onClick={onLoginClick}
                            className="group flex items-center gap-2 px-5 py-2 rounded-full border border-slate-700/50 bg-slate-800/20 text-slate-300 hover:text-white hover:border-primary/50 hover:bg-slate-800/80 transition-all duration-300"
                        >
                            <LogIn className="w-4 h-4 opacity-70 group-hover:opacity-100 group-hover:-translate-x-0.5 transition-all" />
                            <span className="font-medium">Entrar</span>
                        </button>
                        <button className="bg-gradient-to-r from-primary to-primary-dark hover:from-primary-light hover:to-primary text-white px-6 py-2.5 rounded-full font-semibold transition-all shadow-lg hover:shadow-primary/25 transform hover:-translate-y-0.5 active:scale-95">
                            Contratar o Warley
                        </button>
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
                        >
                            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-slate-900 border-b border-slate-800 animate-in slide-in-from-top-5 duration-200">
                    <div className="px-4 pt-2 pb-6 space-y-2 sm:px-3">
                        <a href="#funcionalidades" className="text-slate-300 hover:text-white block px-3 py-3 rounded-xl hover:bg-slate-800/50 text-base font-medium transition-colors">Funcionalidades</a>
                        <a href="#como-funciona" className="text-slate-300 hover:text-white block px-3 py-3 rounded-xl hover:bg-slate-800/50 text-base font-medium transition-colors">Como funciona</a>
                        <a href="#vantagens" className="text-slate-300 hover:text-white block px-3 py-3 rounded-xl hover:bg-slate-800/50 text-base font-medium transition-colors">Vantagens</a>
                        <a href="#precos" className="text-slate-300 hover:text-white block px-3 py-3 rounded-xl hover:bg-slate-800/50 text-base font-medium transition-colors">Planos</a>

                        <div className="pt-4 mt-4 border-t border-slate-800/50 flex flex-col gap-3">
                            <button
                                className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
                                onClick={() => {
                                    setIsOpen(false);
                                    onLoginClick();
                                }}
                            >
                                <LogIn className="w-5 h-5" />
                                <span className="font-medium">Acessar Conta</span>
                            </button>
                            <button className="w-full bg-primary text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-primary/20">
                                Contratar o Warley
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Header;
