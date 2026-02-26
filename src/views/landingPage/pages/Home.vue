<template>
    <!-- Hero Section -->
    <header class="relative bg-gradient-to-br from-primary to-primaryDark text-white overflow-hidden">
        <div class="absolute inset-0 opacity-10 pointer-events-none">
            <div
                class="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.2)_0%,transparent_50%)]">
            </div>
        </div>

        <nav class="container mx-auto px-4 sm:px-6 py-5 flex items-center justify-between relative z-10">
            <div class="text-2xl sm:text-3xl font-bold tracking-tight">
                <img src="../../../assets/logo.png" alt="Alinifacture Logo" class="w-[100px]">
            </div>

            <div class="hidden md:flex items-center space-x-8">
                <a href="#funcionalidades" class="hover:text-accent transition duration-300">Funcionalidades</a>
                <a href="#precos" class="hover:text-accent transition duration-300">Preços</a>
                <a href="#contactos" class="hover:text-accent transition duration-300">Contactos</a>
            </div>

            <div class="flex items-center space-x-3 sm:space-x-4">
                <button
                    class="px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg border border-white/30 hover:bg-white/10 transition duration-300 text-sm sm:text-base">
                    Entrar
                </button>
                <button
                    class="px-5 hidden lg:block py-2.5 sm:px-6 sm:py-3 bg-white text-primary font-semibold rounded-lg shadow-lg hover:bg-gray-100 transition duration-300 transform hover:-translate-y-1 hover:scale-105">
                    Teste Grátis 14 dias
                </button>
            </div>
        </nav>

        <div class="container mx-auto px-4 sm:px-6 py-20 sm:py-28 md:py-32 lg:py-40 text-center relative z-10">
            <h1 class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 animate-slide-up">
                Facturação Simples,<br class="hidden sm:block" />
                Rápida e Profissional em Angola
            </h1>
            <p
                class="text-lg sm:text-xl md:text-2xl text-white/90 max-w-3xl mx-auto mb-8 sm:mb-10 animate-fade [animation-delay:200ms]">
                Emita facturas certificadas pela AGT, gere relatórios em tempo real, controle stock e receba pagamentos
                online — tudo num só lugar.
            </p>
            <div class="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6">
                <button
                    class="px-6 py-3 sm:px-8 sm:py-4 bg-accent text-white font-bold text-base sm:text-lg rounded-xl shadow-xl hover:bg-emerald-600 transition duration-300 transform hover:scale-105 animate-scale-in [animation-delay:400ms]">
                    Começar Gratuitamente
                </button>
                <button
                    class="px-6 py-3 sm:px-8 sm:py-4 bg-white/10 backdrop-blur-md text-white font-semibold text-base sm:text-lg rounded-xl border border-white/30 hover:bg-white/20 transition duration-300 animate-scale-in [animation-delay:500ms]">
                    Ver Demonstração
                </button>
            </div>
            <p class="mt-6 sm:mt-8 text-white/70 text-sm sm:text-base animate-fade [animation-delay:600ms]">
                Sem cartão de crédito • +2.300 empresas já confiam na Alinifacture
            </p>
        </div>

        <!-- Mockup responsivo (esconde em mobile pequeno, aparece em md+) -->
        <div
            class="hidden lg:block absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/4 w-full max-w-5xl px-6">
            <img src="https://images.unsplash.com/photo-1556155099-490a1ba16284?w=1200&auto=format&fit=crop&q=80"
                alt="Dashboard Alinifacture"
                class="rounded-2xl shadow-2xl ring-1 ring-white/20 animate-scale-in [animation-delay:800ms]" />
        </div>
    </header>

    <!-- Trust / Stats – animação ao scroll (delay por item) -->
    <section class="py-16 sm:py-20 bg-neutral-50">
        <div class="container mx-auto px-4 sm:px-6 text-center">
            <p class="text-xs sm:text-sm uppercase tracking-wider text-gray-500 mb-8 animate-fade">Utilizado por
                empresas em todo Angola</p>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-10 max-w-5xl mx-auto">
                <div class="animate-slide-up [animation-delay:100ms]">
                    <div class="text-3xl sm:text-4xl font-bold text-primary">2.3k+</div>
                    <p class="text-gray-600 mt-2 text-sm sm:text-base">Empresas Ativas</p>
                </div>
                <div class="animate-slide-up [animation-delay:200ms]">
                    <div class="text-3xl sm:text-4xl font-bold text-primary">150k+</div>
                    <p class="text-gray-600 mt-2 text-sm sm:text-base">Facturas Emitidas</p>
                </div>
                <div class="animate-slide-up [animation-delay:300ms]">
                    <div class="text-3xl sm:text-4xl font-bold text-primary">99.9%</div>
                    <p class="text-gray-600 mt-2 text-sm sm:text-base">Uptime Garantido</p>
                </div>
                <div class="animate-slide-up [animation-delay:400ms]">
                    <div class="text-3xl sm:text-4xl font-bold text-primary">24/7</div>
                    <p class="text-gray-600 mt-2 text-sm sm:text-base">Suporte Local</p>
                </div>
            </div>
        </div>
    </section>

    <!-- Funcionalidades – cards com hover scale + fade-in -->
    <section id="funcionalidades" class="py-20 sm:py-24 bg-white">
        <div class="container mx-auto px-4 sm:px-6">
            <div class="text-center mb-12 sm:mb-16">
                <h2 class="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 animate-slide-up">Tudo o que precisas para
                    facturar melhor</h2>
                <p class="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto animate-fade [animation-delay:200ms]">
                    Desenhado para PMEs angolanas — certificado AGT, simples e poderoso.
                </p>
            </div>

            <div class="grid md:grid-cols-3 gap-6 sm:gap-10">
                <div
                    class="p-6 sm:p-8 bg-neutral-50 rounded-2xl border border-gray-100 hover:shadow-xl transition duration-300 transform hover:scale-105 animate-slide-up [animation-delay:100ms]">
                    <div
                        class="w-12 h-12 sm:w-14 sm:h-14 bg-accent/10 rounded-xl flex items-center justify-center mb-6">
                        <svg class="w-7 h-7 sm:w-8 sm:h-8 text-accent" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <h3 class="text-xl sm:text-2xl font-bold mb-3">Facturação Certificada AGT</h3>
                    <p class="text-gray-600 text-sm sm:text-base">Gere facturas, recibos, notas de débito/crédito 100%
                        conformes.</p>
                </div>

                <!-- Repete o padrão para os outros 2 cards, com delays 200ms e 300ms -->
                <div
                    class="p-6 sm:p-8 bg-neutral-50 rounded-2xl border border-gray-100 hover:shadow-xl transition duration-300 transform hover:scale-105 animate-slide-up [animation-delay:200ms]">
                    <div
                        class="w-12 h-12 sm:w-14 sm:h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                        <svg class="w-7 h-7 sm:w-8 sm:h-8 text-primary" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 class="text-xl sm:text-2xl font-bold mb-3">Gestão de Pagamentos</h3>
                    <p class="text-gray-600 text-sm sm:text-base">Multicaixa, Transferências, Referências, lembretes
                        automáticos.</p>
                </div>

                <div
                    class="p-6 sm:p-8 bg-neutral-50 rounded-2xl border border-gray-100 hover:shadow-xl transition duration-300 transform hover:scale-105 animate-slide-up [animation-delay:300ms]">
                    <div
                        class="w-12 h-12 sm:w-14 sm:h-14 bg-indigo-100 rounded-xl flex items-center justify-center mb-6">
                        <svg class="w-7 h-7 sm:w-8 sm:h-8 text-indigo-600" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    </div>
                    <h3 class="text-xl sm:text-2xl font-bold mb-3">Relatórios & Analytics</h3>
                    <p class="text-gray-600 text-sm sm:text-base">Lucro, impostos, clientes mais valiosos — tudo em
                        tempo real.</p>
                </div>
            </div>
        </div>
    </section>

    <!-- CTA Final -->
    <section class="py-20 sm:py-24 bg-gradient-to-r from-primary to-primaryDark text-white text-center">
        <div class="container mx-auto px-4 sm:px-6">
            <h2 class="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 animate-slide-up">Pronto para simplificar a tua
                facturação?</h2>
            <p
                class="text-lg sm:text-xl md:text-2xl text-white/90 mb-8 sm:mb-10 max-w-3xl mx-auto animate-fade [animation-delay:200ms]">
                Experimenta o Alinifacture sem compromisso por 14 dias. Sem cartão, sem complicações.
            </p>
            <button
                class="px-8 py-4 sm:px-10 sm:py-5 bg-white text-primary font-bold text-lg sm:text-xl rounded-xl shadow-2xl hover:bg-gray-100 transition duration-300 transform hover:scale-105 animate-scale-in [animation-delay:400ms]">
                Criar Conta Grátis Agora
            </button>
        </div>
    </section>

    <!-- Seção de Preços -->
    <section id="precos" class="py-20 sm:py-24 bg-neutral-50">
        <div class="container mx-auto px-4 sm:px-6">
            <div class="text-center mb-12 sm:mb-16">
                <h2 class="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 animate-slide-up">Escolhe o plano perfeito
                    para o teu negócio</h2>
                <p class="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto animate-fade [animation-delay:200ms]">
                    Planos mensais flexíveis — sem compromisso de longo prazo. IVA incluído.
                </p>
            </div>

            <div class="grid md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
                <!-- Plano Pequeno -->
                <div
                    class="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sm:p-8 flex flex-col animate-slide-up [animation-delay:100ms] hover:shadow-xl transition duration-300 transform hover:scale-[1.02]">
                    <h3 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Pequeno</h3>

                    <div class="mb-6">
                        <span class="text-4xl sm:text-5xl font-extrabold text-primary">5.700</span>
                        <span class="text-xl sm:text-2xl font-medium text-gray-600"> Kz</span>
                        <span class="block text-gray-500 mt-1">por mês (IVA incluído)</span>
                    </div>

                    <ul class="space-y-4 mb-8 flex-grow">
                        <li class="flex items-center text-gray-700">
                            <svg class="w-5 h-5 text-accent mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M5 13l4 4L19 7" />
                            </svg>
                            Actualizações
                        </li>
                        <li class="flex items-center text-gray-700">
                            <svg class="w-5 h-5 text-accent mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M5 13l4 4L19 7" />
                            </svg>
                            Suporte Técnico
                        </li>
                        <li class="flex items-center text-gray-700">
                            <svg class="w-5 h-5 text-accent mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M5 13l4 4L19 7" />
                            </svg>
                            2 Utilizadores
                        </li>
                        <li class="flex items-center text-gray-700">
                            <svg class="w-5 h-5 text-accent mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M5 13l4 4L19 7" />
                            </svg>
                            5 Facturas/mês
                        </li>
                    </ul>

                    <button
                        class="mt-auto px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primaryDark transition duration-300 transform hover:scale-105">
                        Escolher Plano Pequeno
                    </button>
                </div>

                <!-- Plano Médio (Popular) -->
                <div
                    class="relative bg-gradient-to-b from-primary/5 to-white rounded-2xl shadow-2xl border-2 border-primary p-6 sm:p-8 flex flex-col animate-slide-up [animation-delay:200ms] hover:shadow-2xl transition duration-300 transform hover:scale-[1.03]">
                    <!-- Badge Popular -->
                    <div
                        class="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-accent text-white text-sm font-bold px-5 py-1.5 rounded-full shadow-md">
                        Popular
                    </div>

                    <h3 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 mt-6">Médio</h3>

                    <div class="mb-6">
                        <span class="text-4xl sm:text-5xl font-extrabold text-primary">11.400</span>
                        <span class="text-xl sm:text-2xl font-medium text-gray-600"> Kz</span>
                        <span class="block text-gray-500 mt-1">por mês (IVA incluído)</span>
                    </div>

                    <ul class="space-y-4 mb-8 flex-grow">
                        <li class="flex items-center text-gray-700">
                            <svg class="w-5 h-5 text-accent mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M5 13l4 4L19 7" />
                            </svg>
                            Actualizações
                        </li>
                        <li class="flex items-center text-gray-700">
                            <svg class="w-5 h-5 text-accent mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M5 13l4 4L19 7" />
                            </svg>
                            Suporte Técnico
                        </li>
                        <li class="flex items-center text-gray-700">
                            <svg class="w-5 h-5 text-accent mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M5 13l4 4L19 7" />
                            </svg>
                            Relatórios
                        </li>
                        <li class="flex items-center text-gray-700">
                            <svg class="w-5 h-5 text-accent mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M5 13l4 4L19 7" />
                            </svg>
                            3 Utilizadores
                        </li>
                        <li class="flex items-center text-gray-700">
                            <svg class="w-5 h-5 text-accent mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M5 13l4 4L19 7" />
                            </svg>
                            50 Facturas/mês
                        </li>
                    </ul>

                    <button
                        class="mt-auto px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primaryDark transition duration-300 transform hover:scale-105">
                        Escolher Plano Médio
                    </button>
                </div>

                <!-- Plano Grande -->
                <div
                    class="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sm:p-8 flex flex-col animate-slide-up [animation-delay:300ms] hover:shadow-xl transition duration-300 transform hover:scale-[1.02]">
                    <h3 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Grande</h3>

                    <div class="mb-6">
                        <span class="text-4xl sm:text-5xl font-extrabold text-primary">17.100</span>
                        <span class="text-xl sm:text-2xl font-medium text-gray-600"> Kz</span>
                        <span class="block text-gray-500 mt-1">por mês (IVA incluído)</span>
                    </div>

                    <ul class="space-y-4 mb-8 flex-grow">
                        <li class="flex items-center text-gray-700">
                            <svg class="w-5 h-5 text-accent mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M5 13l4 4L19 7" />
                            </svg>
                            Actualizações
                        </li>
                        <li class="flex items-center text-gray-700">
                            <svg class="w-5 h-5 text-accent mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M5 13l4 4L19 7" />
                            </svg>
                            Suporte Técnico
                        </li>
                        <li class="flex items-center text-gray-700">
                            <svg class="w-5 h-5 text-accent mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M5 13l4 4L19 7" />
                            </svg>
                            Relatórios
                        </li>
                        <li class="flex items-center text-gray-700">
                            <svg class="w-5 h-5 text-accent mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M5 13l4 4L19 7" />
                            </svg>
                            Alertas (Email/SMS)
                        </li>
                        <li class="flex items-center text-gray-700">
                            <svg class="w-5 h-5 text-accent mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M5 13l4 4L19 7" />
                            </svg>
                            Séries de documento
                        </li>
                        <li class="flex items-center text-gray-700">
                            <svg class="w-5 h-5 text-accent mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M5 13l4 4L19 7" />
                            </svg>
                            10 Utilizadores
                        </li>
                        <li class="flex items-center text-gray-700">
                            <svg class="w-5 h-5 text-accent mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M5 13l4 4L19 7" />
                            </svg>
                            500 Facturas/mês
                        </li>
                    </ul>

                    <button
                        class="mt-auto px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primaryDark transition duration-300 transform hover:scale-105">
                        Escolher Plano Grande
                    </button>
                </div>
            </div>

            <div class="text-center mt-12 sm:mt-16 animate-fade [animation-delay:400ms]">
                <p class="text-gray-600 text-lg">
                    Todos os planos incluem certificado AGT e suporte prioritário. <br class="hidden sm:block" />
                    Precisas de mais? <a href="#contactos" class="text-primary font-medium hover:underline">Contacta-nos
                        para plano personalizado</a>.
                </p>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="bg-neutral-900 text-gray-400 py-10 sm:py-12">
        <div class="container mx-auto px-4 sm:px-6 text-center">
            <div class="text-2xl flex justify-center font-bold text-white mb-4 animate-fade">
                <img src="../../../assets/logo.png" alt="Alinifacture Logo" class="w-[100px] mz-auto">
            </div>
            <p class="mb-6 text-sm sm:text-base animate-fade [animation-delay:200ms]">&copy; 2026 Alinifacture.
                Facturação certificada em Angola.</p>
            <div class="flex justify-center space-x-6 text-sm sm:text-base">
                <a href="#" class="hover:text-white transition duration-300">Termos</a>
                <a href="#" class="hover:text-white transition duration-300">Privacidade</a>
                <a href="#" class="hover:text-white transition duration-300">Contacto</a>
            </div>
        </div>
    </footer>
</template>

<script setup>
// Aqui podes adicionar lógica futura (ex: scroll observer real para animações mais complexas)
</script>