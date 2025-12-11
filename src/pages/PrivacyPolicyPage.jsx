import React from 'react';
import { ArrowLeft, Shield, Lock, Eye, Server, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const PrivacyPolicyPage = () => {
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
                        Política de Privacidade
                    </h1>
                    <p className="text-lg text-slate-400">
                        Última atualização: {new Date().toLocaleDateString('pt-BR')}
                    </p>
                </div>

                {/* Main Content */}
                <div className="space-y-10">

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold text-white flex items-center gap-3">
                            <Shield className="w-6 h-6 text-primary" />
                            1. Introdução
                        </h2>
                        <p className="leading-relaxed">
                            A sua privacidade é nossa prioridade. Esta Política de Privacidade descreve como o <strong>Atendimento Médico AI</strong> ("nós", "nosso") coleta, usa, armazena e protege as informações dos usuários ("você"), especialmente em relação à integração com os serviços do Google.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold text-white flex items-center gap-3">
                            <Eye className="w-6 h-6 text-primary" />
                            2. Coleta de Dados
                        </h2>
                        <p>Coletamos as seguintes informações para fornecer nossos serviços:</p>
                        <ul className="list-disc pl-6 space-y-2 marker:text-primary">
                            <li><strong>Informações de Conta:</strong> Nome, endereço de e-mail e foto do perfil, obtidos através do Login com Google.</li>
                            <li><strong>Dados da Agenda (Google Calendar):</strong> Acessamos seus eventos, horários e detalhes de calendário <strong>apenas com sua permissão explícita</strong>.</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold text-white flex items-center gap-3">
                            <Server className="w-6 h-6 text-primary" />
                            3. Uso das Informações (Google User Data)
                        </h2>
                        <p>O uso das informações recebidas das APIs do Google respeita a <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Política de Dados do Usuário dos Serviços de API do Google</a>, incluindo os requisitos de "Uso Limitado".</p>

                        <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 space-y-4 mt-4">
                            <h3 className="text-lg font-medium text-white">Como usamos seus dados do Google Calendar:</h3>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0"></div>
                                    <span><strong>Visualização:</strong> Para exibir seus agendamentos médicos diretamente no painel do sistema.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0"></div>
                                    <span><strong>Gerenciamento:</strong> Para permitir que você crie, edite ou exclua consultas médicas através da nossa interface.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0"></div>
                                    <span><strong>Não utilizamos</strong> seus dados do Google Calendar para publicidade ou qualquer outro fim não relacionado à gestão da sua clínica.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0"></div>
                                    <span><strong>Não transferimos</strong> seus dados para terceiros, exceto conforme necessário para fornecer o serviço (ex: infraestrutura de banco de dados).</span>
                                </li>
                            </ul>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold text-white flex items-center gap-3">
                            <Lock className="w-6 h-6 text-primary" />
                            4. Armazenamento e Segurança
                        </h2>
                        <p>
                            Utilizamos medidas de segurança padrão da indústria para proteger seus dados. As credenciais de acesso (Tokens) são armazenadas de forma criptografada e segura, sendo utilizadas exclusivamente para manter a conexão com sua agenda ativa enquanto você utiliza a plataforma.
                        </p>
                        <p>
                            Nossos parceiros de infraestrutura incluem:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 marker:text-primary">
                            <li><strong>Supabase:</strong> Para autenticação e banco de dados seguro.</li>
                            <li><strong>Google Cloud Platform:</strong> Para hospedagem da aplicação.</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold text-white flex items-center gap-3">
                            <Mail className="w-6 h-6 text-primary" />
                            5. Contato
                        </h2>
                        <p>
                            Se você tiver dúvidas sobre esta Política de Privacidade ou sobre como tratamos seus dados, entre em contato conosco:
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

export default PrivacyPolicyPage;
