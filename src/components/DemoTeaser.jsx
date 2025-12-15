import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';

const DemoTeaser = () => {
    return (
        <section className="py-20 relative overflow-hidden">
            <div className="absolute inset-0 bg-primary-dark/20"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-transparent to-slate-950"></div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        Teste a inteligência agora mesmo
                    </h2>
                    <p className="text-slate-300 text-xl mb-10">
                        Não acredite apenas na nossa palavra. Mande uma mensagem no WhatsApp da nossa demo e tente confundur a IA.
                    </p>
                    <a href="#" className="inline-flex items-center space-x-3 bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-full font-bold text-lg transition-all transform hover:scale-105 shadow-2xl hover:shadow-green-500/30">
                        <MessageCircle className="w-6 h-6" />
                        <span>Testar Demo no WhatsApp</span>
                    </a>
                    <p className="mt-4 text-sm text-slate-500">Sem cadastro necessário para testar.</p>
                </motion.div>
            </div>
        </section>
    );
};

export default DemoTeaser;
