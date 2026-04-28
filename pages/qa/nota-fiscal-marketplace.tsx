import Head from "next/head";

type OptionCard = {
  id: string;
  title: string;
  fit: "alto" | "medio" | "baixo";
  monthlyCost: string;
  financialModel: string;
  strengths: string[];
  cautions: string[];
  devTime: string;
  recommendation: string;
};

const options: OptionCard[] = [
  {
    id: "nuvem-fiscal",
    title: "Nuvem Fiscal",
    fit: "alto",
    monthlyCost: "R$ 300/mês no Fiscal I ou R$ 1.000/mês no Fiscal II, ambos cobrados anualmente",
    financialModel:
      "Preço público e previsível. O plano Fiscal I inclui 10.000 operações fiscais por mês e CNPJs ilimitados. O Fiscal II sobe para 100.000 operações fiscais por mês, também com CNPJs ilimitados.",
    strengths: [
      "Melhor previsibilidade de custo para marketplace.",
      "API fiscal direta, sem depender de ERP do lojista.",
      "Cobre NF-e, NFC-e e NFS-e na mesma plataforma.",
      "Escala melhor quando o número de lojistas cresce.",
    ],
    cautions: [
      "A franquia é por operações fiscais, então cancelamentos e inutilizações também entram na conta.",
      "Vai exigir camada fiscal própria na Fiestou: emitente, certificado, tributação e tratamento de falhas.",
    ],
    devTime: "4 a 6 semanas para MVP com emissão, consulta, retorno e retestes",
    recommendation: "Melhor equilíbrio entre custo previsível e arquitetura certa para a Fiestou.",
  },
  {
    id: "plugnotas",
    title: "PlugNotas",
    fit: "alto",
    monthlyCost: "Preço não público. Precisa de proposta comercial.",
    financialModel:
      "O modelo oficial pode ser por bilhetagem, em que cada nota autorizada ou cancelada consome franquia, ou ilimitado por licença ativa. O valor final depende da proposta comercial.",
    strengths: [
      "Encaixe técnico muito bom para software house e marketplace.",
      "Fluxo assíncrono com webhook, PDF e XML.",
      "API única para NF-e, NFC-e e NFS-e.",
      "Tende a dar mais suporte comercial na implantação.",
    ],
    cautions: [
      "Sem preço de prateleira, então a decisão financeira depende de proposta.",
      "O custo pode variar bastante conforme o modelo comercial fechado.",
    ],
    devTime: "5 a 7 semanas para MVP com integração, webhooks, homologação e retestes",
    recommendation: "Ótima opção técnica, mas financeiramente depende de orçamento.",
  },
  {
    id: "bling",
    title: "Bling",
    fit: "baixo",
    monthlyCost:
      "A partir de R$ 55/mês por conta no plano Cobalto, R$ 110/mês no Mercúrio e R$ 185/mês no Titânio",
    financialModel:
      "Não cobra por integração ou emissão de nota, mas o Bling é monoempresa. Para CNPJs diferentes, a regra oficial é ter um cadastro por empresa ou negociar pacote comercial.",
    strengths: [
      "Preço público simples de entender.",
      "ERP completo para quem quer operação fora da Fiestou.",
      "Tem OAuth 2.0 e webhooks oficiais.",
    ],
    cautions: [
      "Pior encaixe para marketplace multi-lojista.",
      "O custo tende a escalar por lojista/CNPJ.",
      "A experiência fica mais dependente de conta ERP do lojista do que da Fiestou.",
    ],
    devTime: "6 a 9 semanas para MVP com OAuth, sync, homologação do app e retestes",
    recommendation: "Só faz sentido se a estratégia for usar ERP por lojista, não emissão nativa na Fiestou.",
  },
];

const costScenarios = [
  {
    title: "Cenário 1 · Menor custo previsível",
    summary: "Nuvem Fiscal Fiscal I",
    value: "R$ 300/mês",
    note:
      "Bom para início com CNPJs ilimitados e até 10.000 operações fiscais mensais. É a opção com menor custo público previsível para marketplace.",
  },
  {
    title: "Cenário 2 · Crescimento com mais volume",
    summary: "Nuvem Fiscal Fiscal II",
    value: "R$ 1.000/mês",
    note:
      "Indicado quando a operação mensal já exige folga maior de emissões, cancelamentos e inutilizações, sem custo por lojista.",
  },
  {
    title: "Cenário 3 · ERP por lojista",
    summary: "Bling Cobalto como piso",
    value: "R$ 55/mês por lojista",
    note:
      "Inferência prática: com 10 lojistas ficaria a partir de R$ 550/mês; com 50, a partir de R$ 2.750/mês. Como o Bling é monoempresa, o custo tende a crescer junto com a base.",
  },
  {
    title: "Cenário 4 · Solução comercial sob proposta",
    summary: "PlugNotas",
    value: "Sob consulta",
    note:
      "Tecnicamente forte, mas sem valor público de prateleira. Antes de decidir, precisaria pedir proposta e validar o modelo: bilhetagem ou licença ilimitada.",
  },
];

const devStages = [
  {
    title: "Modelagem fiscal",
    detail:
      "Cadastro do emitente por lojista, certificado, série, ambiente, regime tributário e vínculo pedido -> nota.",
  },
  {
    title: "Integração principal",
    detail:
      "Envio da nota, consulta de status, download de XML/PDF, armazenamento e tratamento de rejeições.",
  },
  {
    title: "Webhooks e retentativas",
    detail:
      "Receber retorno assíncrono, evitar duplicidade, reprocessar falhas e manter trilha de auditoria.",
  },
  {
    title: "Painel e operação",
    detail:
      "Tela para o lojista acompanhar emissão, erro, XML, PDF e reenvio. Admin precisa enxergar falhas e travas.",
  },
  {
    title: "Homologação e testes",
    detail:
      "Homologar com 1 ou 2 lojas reais, validar produto e serviço, rejeições mais comuns e rotinas de suporte antes de abrir para todos.",
  },
];

const sources = [
  {
    label: "Nuvem Fiscal · Planos",
    url: "https://www.nuvemfiscal.com.br/planos/",
  },
  {
    label: "Nuvem Fiscal · Documentação",
    url: "https://dev.nuvemfiscal.com.br/docs/",
  },
  {
    label: "PlugNotas · Página principal",
    url: "https://plugnotas.com.br/",
  },
  {
    label: "PlugNotas · Fluxo de emissão",
    url: "https://atendimento.tecnospeed.com.br/hc/pt-br/articles/1500005772522-Entendo-o-Fluxo-de-emiss%C3%A3o-do-PlugNotas",
  },
  {
    label: "PlugNotas · NFe/NFCe e modelo de faturamento",
    url: "https://atendimento.tecnospeed.com.br/hc/pt-br/articles/38024197110295-Fa%C3%A7o-a-emiss%C3%A3o-de-NFSe-no-PlugNotas-como-come%C3%A7o-a-emiss%C3%A3o-de-NFe-NFCe",
  },
  {
    label: "Bling · Planos e preços",
    url: "https://www.bling.com.br/planos-e-precos/JACKIESANTOS",
  },
  {
    label: "Bling · OAuth 2.0 para aplicativos",
    url: "https://developer.bling.com.br/aplicativos",
  },
  {
    label: "Bling · Webhooks",
    url: "https://developer.bling.com.br/webhooks",
  },
];

function fitClasses(fit: OptionCard["fit"]) {
  if (fit === "alto") {
    return "border-emerald-200 bg-emerald-50 text-emerald-800";
  }

  if (fit === "medio") {
    return "border-amber-200 bg-amber-50 text-amber-800";
  }

  return "border-rose-200 bg-rose-50 text-rose-800";
}

export default function QaNotaFiscalMarketplacePage() {
  return (
    <>
      <Head>
        <title>QA | Comparativo de Nota Fiscal</title>
      </Head>

      <main className="min-h-screen bg-zinc-100 text-zinc-900">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-zinc-200 bg-white px-6 py-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-yellow-700">
              QA · Documento de decisão
            </p>
            <h1 className="mt-2 text-3xl font-bold">
              Nota fiscal para a Fiestou
            </h1>
            <p className="mt-3 max-w-4xl text-sm leading-relaxed text-zinc-600">
              Pauta para conversa com o Pedro sobre opções de emissão fiscal,
              com foco em <strong>valor financeiro</strong>, aderência para
              marketplace e tempo real de desenvolvimento. Valores públicos
              consultados em <strong>28/03/2026</strong>.
            </p>
          </div>

          <section className="mt-6 grid gap-4 lg:grid-cols-[1.25fr,0.75fr]">
            <div className="rounded-3xl border border-zinc-200 bg-white px-6 py-5 shadow-sm">
              <h2 className="text-xl font-bold text-zinc-900">
                Resumo executivo
              </h2>
              <div className="mt-4 grid gap-3">
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4">
                  <p className="text-sm font-semibold text-emerald-800">
                    Melhor decisão financeira previsível
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-emerald-900">
                    <strong>Nuvem Fiscal</strong>. Tem preço público, CNPJs
                    ilimitados e custo que não cresce por lojista logo de cara.
                  </p>
                </div>

                <div className="rounded-2xl border border-yellow-200 bg-yellow-50 px-4 py-4">
                  <p className="text-sm font-semibold text-yellow-800">
                    Melhor encaixe técnico com suporte comercial
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-yellow-900">
                    <strong>PlugNotas</strong>. Encaixa muito bem para software
                    house, mas depende de proposta comercial para fechar conta.
                  </p>
                </div>

                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4">
                  <p className="text-sm font-semibold text-rose-800">
                    Opção menos indicada para a Fiestou
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-rose-900">
                    <strong>Bling</strong>. Funciona, mas empurra a operação
                    para ERP por lojista e tende a escalar custo por CNPJ.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-zinc-200 bg-white px-6 py-5 shadow-sm">
              <h2 className="text-xl font-bold text-zinc-900">
                Faixa de esforço
              </h2>
              <div className="mt-4 grid gap-3">
                <div className="rounded-2xl bg-zinc-50 px-4 py-4">
                  <p className="text-sm font-semibold text-zinc-900">
                    MVP mínimo em produção
                  </p>
                  <p className="mt-1 text-2xl font-bold text-zinc-900">
                    4 a 7 semanas
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                    Considerando 1 dev focado, apoio de QA e homologação com
                    lojas reais.
                  </p>
                </div>
                <div className="rounded-2xl bg-zinc-50 px-4 py-4">
                  <p className="text-sm font-semibold text-zinc-900">
                    Principal motivo do prazo
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                    Não é só integrar a API. Precisa modelar emitente, tratar
                    rejeições, armazenar XML/PDF, garantir idempotência e
                    validar tudo com testes de homologação.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-6 rounded-3xl border border-zinc-200 bg-white px-6 py-6 shadow-sm">
            <h2 className="text-2xl font-bold text-zinc-900">
              Comparativo das opções
            </h2>
            <div className="mt-5 grid gap-5 xl:grid-cols-3">
              {options.map((option) => (
                <article
                  key={option.id}
                  className="rounded-3xl border border-zinc-200 bg-zinc-50 px-5 py-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-xl font-bold text-zinc-900">
                      {option.title}
                    </h3>
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${fitClasses(
                        option.fit
                      )}`}
                    >
                      Fit {option.fit}
                    </span>
                  </div>

                  <div className="mt-4 rounded-2xl border border-zinc-200 bg-white px-4 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                      Valor financeiro
                    </p>
                    <p className="mt-2 text-lg font-bold text-zinc-900">
                      {option.monthlyCost}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                      {option.financialModel}
                    </p>
                  </div>

                  <div className="mt-4 grid gap-4">
                    <div>
                      <p className="text-sm font-semibold text-zinc-900">
                        Pontos fortes
                      </p>
                      <ul className="mt-2 grid gap-2 text-sm leading-relaxed text-zinc-600">
                        {option.strengths.map((item) => (
                          <li key={item}>• {item}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-zinc-900">
                        Alertas
                      </p>
                      <ul className="mt-2 grid gap-2 text-sm leading-relaxed text-zinc-600">
                        {option.cautions.map((item) => (
                          <li key={item}>• {item}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="rounded-2xl border border-yellow-200 bg-yellow-50 px-4 py-4">
                      <p className="text-sm font-semibold text-yellow-800">
                        Tempo estimado de desenvolvimento
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-yellow-900">
                        {option.devTime}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-4">
                      <p className="text-sm font-semibold text-zinc-900">
                        Leitura rápida
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-zinc-600">
                        {option.recommendation}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="mt-6 rounded-3xl border border-zinc-200 bg-white px-6 py-6 shadow-sm">
            <h2 className="text-2xl font-bold text-zinc-900">
              Cenários financeiros para explicar ao Pedro
            </h2>
            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              {costScenarios.map((scenario) => (
                <article
                  key={scenario.title}
                  className="rounded-3xl border border-zinc-200 bg-zinc-50 px-5 py-5"
                >
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-zinc-500">
                    {scenario.title}
                  </p>
                  <h3 className="mt-2 text-xl font-bold text-zinc-900">
                    {scenario.summary}
                  </h3>
                  <p className="mt-2 text-2xl font-bold text-yellow-700">
                    {scenario.value}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-zinc-600">
                    {scenario.note}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section className="mt-6 rounded-3xl border border-zinc-200 bg-white px-6 py-6 shadow-sm">
            <h2 className="text-2xl font-bold text-zinc-900">
              O que realmente consome tempo de desenvolvimento
            </h2>
            <p className="mt-3 max-w-4xl text-sm leading-relaxed text-zinc-600">
              As estimativas abaixo são <strong>internas da Fiestou</strong> e
              consideram implementação, testes, homologação e retestes antes de
              abrir para todos os lojistas.
            </p>
            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              {devStages.map((stage) => (
                <article
                  key={stage.title}
                  className="rounded-3xl border border-zinc-200 bg-zinc-50 px-5 py-5"
                >
                  <h3 className="text-lg font-bold text-zinc-900">
                    {stage.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                    {stage.detail}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section className="mt-6 rounded-3xl border border-zinc-200 bg-white px-6 py-6 shadow-sm">
            <h2 className="text-2xl font-bold text-zinc-900">
              Roteiro rapido para apresentar ao Pedro
            </h2>
            <div className="mt-5 grid gap-4 lg:grid-cols-3">
              <article className="rounded-3xl border border-zinc-200 bg-zinc-50 px-5 py-5">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-zinc-500">
                  1. O que importa primeiro
                </p>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                  O ponto principal é o <strong>custo financeiro</strong> e
                  como ele cresce quando a base de lojistas aumentar.
                </p>
              </article>

              <article className="rounded-3xl border border-zinc-200 bg-zinc-50 px-5 py-5">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-zinc-500">
                  2. O que explicar sobre prazo
                </p>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                  Não é só plugar API. Precisa montar emitente por lojista,
                  XML/PDF, rejeições, webhooks, auditoria e testes reais.
                </p>
              </article>

              <article className="rounded-3xl border border-zinc-200 bg-zinc-50 px-5 py-5">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-zinc-500">
                  3. Decisão sugerida
                </p>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                  Se for para decidir rápido com valor público, a prioridade
                  hoje é <strong>Nuvem Fiscal</strong>. Se entrar proposta boa,
                  <strong> PlugNotas</strong> vira o plano B mais forte.
                </p>
              </article>
            </div>
          </section>

          <section className="mt-6 rounded-3xl border border-zinc-200 bg-white px-6 py-6 shadow-sm">
            <h2 className="text-2xl font-bold text-zinc-900">
              Recomendação final
            </h2>
            <div className="mt-5 grid gap-4 lg:grid-cols-3">
              <article className="rounded-3xl border border-emerald-200 bg-emerald-50 px-5 py-5">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-800">
                  Melhor caminho agora
                </p>
                <p className="mt-2 text-lg font-bold text-emerald-900">
                  Nuvem Fiscal
                </p>
                <p className="mt-2 text-sm leading-relaxed text-emerald-900">
                  Melhor para decidir rápido com preço público, custo previsível
                  e arquitetura compatível com marketplace.
                </p>
              </article>

              <article className="rounded-3xl border border-yellow-200 bg-yellow-50 px-5 py-5">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-yellow-800">
                  Melhor plano B
                </p>
                <p className="mt-2 text-lg font-bold text-yellow-900">
                  PlugNotas
                </p>
                <p className="mt-2 text-sm leading-relaxed text-yellow-900">
                  Se a proposta comercial vier boa, pode virar a opção mais forte
                  tecnicamente.
                </p>
              </article>

              <article className="rounded-3xl border border-rose-200 bg-rose-50 px-5 py-5">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-rose-800">
                  Menos indicado
                </p>
                <p className="mt-2 text-lg font-bold text-rose-900">
                  Bling
                </p>
                <p className="mt-2 text-sm leading-relaxed text-rose-900">
                  Só vale se a decisão for operar com ERP por lojista, e não com
                  emissão nativa dentro da Fiestou.
                </p>
              </article>
            </div>
          </section>

          <section className="mt-6 rounded-3xl border border-zinc-200 bg-white px-6 py-6 shadow-sm">
            <h2 className="text-2xl font-bold text-zinc-900">
              Fontes oficiais
            </h2>
            <ul className="mt-4 grid gap-3 text-sm leading-relaxed text-zinc-600">
              {sources.map((source) => (
                <li key={source.url}>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-yellow-700 underline underline-offset-2"
                  >
                    {source.label}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>
    </>
  );
}
