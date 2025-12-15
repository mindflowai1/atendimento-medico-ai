import React from 'react';
import { ArrowLeft, FileText, CheckCircle, AlertTriangle, Scale, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const TermsOfUsePage = () => {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-300 p-6 md:p-12 font-sans">
            <div className="max-w-4xl mx-auto space-y-12">

                {/* Header */}
                <div className="space-y-6">
                    <Link to="/" className="inline-flex items-center gap-2 text-primary hover:text-primary-light transition-colors font-medium">
                        <ArrowLeft className="w-5 h-5" />
                        Voltar para o Início
                    </Link>
                    <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                        Termos de Uso
                    </h1>
                    <p className="text-lg text-slate-400">
                        Última atualização: {new Date().toLocaleDateString('pt-BR')}
                    </p>
                </div>

                {/* Main Content */}
                <div className="space-y-10">

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold text-white flex items-center gap-3">
                            <CheckCircle className="w-6 h-6 text-primary" />
                            1. Aceitação dos Termos
                        </h2>
                        <p className="leading-relaxed">
                            Ao acessar e usar o <strong>Atendimento Médico AI</strong> ("Serviço"), você concorda em cumprir e ficar vinculado a estes Termos de Uso. Se você não concordar com qualquer parte destes termos, você não deve acessar o Serviço.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold text-white flex items-center gap-3">
                            <FileText className="w-6 h-6 text-primary" />
                            2. Descrição do Serviço
                        </h2>
                        <p>
                            O Atendimento Médico AI é uma plataforma de gestão para clínicas que utiliza inteligência artificial para auxiliar no agendamento, comunicação e organização. O serviço é fornecido "como está" e pode ser atualizado, modificado ou descontinuado a qualquer momento.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold text-white flex items-center gap-3">
                            <AlertTriangle className="w-6 h-6 text-primary" />
                            3. Isenção de Responsabilidade Médica (Importante)
                        </h2>
                        <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl space-y-3">
                            <p className="font-semibold text-white">
                                A Inteligência Artificial é uma ferramenta de auxílio e suporte.
                            </p>
                            <p>
                                O Atendimento Médico AI <strong>NÃO</strong> fornece diagnósticos médicos, tratamentos ou aconselhamento profissional de saúde.
                            </p>
                            <ul className="list-disc pl-6 space-y-2 marker:text-red-500">
                                <li>As sugestões geradas pela AI devem ser sempre verificadas por um profissional qualificado.</li>
                                <li>Nós não nos responsabilizamos por decisões clínicas tomadas com base nas informações do sistema.</li>
                                <li>O usuário (médico ou gestor) é inteiramente responsável pela validação das informações.</li>
                            </ul>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold text-white flex items-center gap-3">
                            <Scale className="w-6 h-6 text-primary" />
                            4. Responsabilidades do Usuário
                        </h2>
                        <p>Você concorda em:</p>
                        <ul className="list-disc pl-6 space-y-2 marker:text-primary">
                            <li>Fornecer informações verdadeiras e precisas ao criar sua conta.</li>
                            <li>Manter a segurança de suas credenciais de acesso (login e senha).</li>
                            <li>Não utilizar o serviço para atividades ilegais ou não autorizadas.</li>
                            <li>Respeitar as leis de proteção de dados (LGPD) ao inserir dados de pacientes no sistema.</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold text-white flex items-center gap-3">
                            <Scale className="w-6 h-6 text-primary" />
                            5. Propriedade Intelectual
                        </h2>
                        <p>
                            O Serviço e seu conteúdo original, recursos e funcionalidades são e permanecerão de propriedade exclusiva do Atendimento Médico AI e seus licenciadores.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold text-white flex items-center gap-3">
                            <Mail className="w-6 h-6 text-primary" />
                            6. Contato
                        </h2>
                        <p>
                            Para dúvidas sobre estes Termos, entre em contato:
                        </p>
                        <p className="text-primary font-medium">
                            suporte@atendimentomedicoai.com
                        </p>
                    </section>

                </div>

                {/* Footer */}
                <div className="pt-12 border-t border-slate-800 text-center text-slate-500 text-sm">
                    &copy; {new Date().getFullYear()} Atendimento Médico AI. Todos os direitos reservados.
                </div>
            </div>
        </div>
    );
};

export default TermsOfUsePage;
