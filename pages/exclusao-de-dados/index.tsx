import Api from "@/src/services/api";
import Template from "@/src/template";
import Breadcrumbs from "@/src/components/common/Breadcrumb";
import Icon from "@/src/icons/fontAwesome/FIcon";

interface DataDeletionPageProps {
  HeaderFooter: any;
  DataSeo: any;
  Scripts: any;
}

const REQUEST_EMAIL = "fiestoudev@gmail.com";
const REQUEST_SUBJECT = "Exclusão de dados - Fiestou";

export async function getStaticProps() {
  const api = new Api();
  const request: any = await api.content({ method: "get", url: "default" });

  return {
    props: {
      HeaderFooter: request?.data?.HeaderFooter ?? {},
      DataSeo: request?.data?.DataSeo ?? {},
      Scripts: request?.data?.Scripts ?? {},
    },
    revalidate: 60 * 60 * 24,
  };
}

export default function ExclusaoDeDados({
  HeaderFooter,
  DataSeo,
  Scripts,
}: DataDeletionPageProps) {
  const requestUrl = `mailto:${REQUEST_EMAIL}?subject=${encodeURIComponent(
    REQUEST_SUBJECT,
  )}`;

  return (
    <Template
      scripts={Scripts}
      metaPage={{
        title: `Exclusão de dados | ${DataSeo?.site_text ?? "Fiestou"}`,
        description:
          "Saiba como solicitar a exclusão da sua conta e dos seus dados pessoais na Fiestou.",
        url: "exclusao-de-dados",
      }}
      header={{
        template: "default",
        position: "fixed",
        content: HeaderFooter,
      }}
      footer={{
        template: "default",
        content: HeaderFooter,
      }}
    >
      <section className="bg-cyan-500 pt-24 md:pt-32 relative">
        <div className="container-medium relative pb-6 md:pb-10 text-white">
          <div className="grid gap-4">
            <div className="pb-2">
              <Breadcrumbs
                links={[{ url: "/exclusao-de-dados", name: "Exclusão de dados" }]}
              />
            </div>
            <h1 className="font-title font-bold text-4xl md:text-5xl">
              Exclusão de dados do usuário
            </h1>
            <p className="max-w-3xl text-lg md:text-2xl font-semibold">
              Esta página explica como solicitar a exclusão da sua conta e dos
              seus dados pessoais na Fiestou.
            </p>
          </div>
        </div>
      </section>

      <section className="container-medium py-10 md:py-16">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem]">
          <div className="grid gap-6">
            <div className="rounded-3xl border border-zinc-200 bg-white p-6 md:p-8">
              <div className="flex items-center gap-3 pb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-100 text-yellow-500">
                  <Icon icon="fa-trash-alt" />
                </div>
                <div>
                  <h2 className="font-title text-2xl font-bold text-zinc-900">
                    Como solicitar
                  </h2>
                  <p className="text-sm text-zinc-500">
                    O pedido é feito por e-mail, para manter o registro e validar a titularidade.
                  </p>
                </div>
              </div>

              <ol className="grid gap-4 text-zinc-700 md:text-lg">
                <li>
                  1. Envie um e-mail para{" "}
                  <a
                    href={`mailto:${REQUEST_EMAIL}`}
                    className="font-semibold text-cyan-600 underline"
                  >
                    {REQUEST_EMAIL}
                  </a>{" "}
                  com o assunto{" "}
                  <strong>{REQUEST_SUBJECT}</strong>.
                </li>
                <li>
                  2. Use, de preferência, o mesmo e-mail cadastrado na Fiestou.
                </li>
                <li>
                  3. No corpo da mensagem, informe seu nome completo e o e-mail
                  usado na conta. Se quiser, inclua também o telefone cadastrado.
                </li>
                <li>
                  4. Se o acesso foi feito com Facebook ou Google, informe isso
                  na solicitação para facilitar a localização do cadastro.
                </li>
              </ol>
            </div>

            <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-6 md:p-8">
              <div className="flex items-center gap-3 pb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100 text-green-600">
                  <Icon icon="fa-shield-check" />
                </div>
                <div>
                  <h2 className="font-title text-2xl font-bold text-zinc-900">
                    O que acontece depois
                  </h2>
                  <p className="text-sm text-zinc-500">
                    A Fiestou analisa o pedido antes de concluir a exclusão.
                  </p>
                </div>
              </div>

              <ul className="grid gap-4 text-zinc-700 md:text-lg">
                <li>
                  Após receber a solicitação, a Fiestou pode pedir uma
                  confirmação adicional para garantir que o pedido foi feito pelo
                  titular da conta.
                </li>
                <li>
                  Depois da validação, a conta e os dados associados são
                  excluídos ou anonimizados sempre que isso for possível.
                </li>
                <li>
                  Alguns registros podem precisar ser mantidos por obrigação
                  legal, regulatória, fiscal, financeira ou de prevenção a
                  fraude.
                </li>
              </ul>
            </div>
          </div>

          <aside className="grid gap-6">
            <div className="rounded-3xl border border-zinc-200 bg-white p-6 md:p-8">
              <h3 className="font-title text-2xl font-bold text-zinc-900">
                Enviar solicitação
              </h3>
              <p className="pt-3 text-zinc-600">
                Se preferir, toque no botão abaixo para abrir o seu aplicativo de
                e-mail com o assunto já preenchido.
              </p>

              <a
                href={requestUrl}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-yellow-400 px-5 py-4 font-semibold text-zinc-900 transition hover:bg-yellow-300"
              >
                <Icon icon="fa-envelope" />
                Enviar e-mail de solicitação
              </a>
            </div>

            <div className="rounded-3xl border border-zinc-200 bg-white p-6 md:p-8">
              <h3 className="font-title text-2xl font-bold text-zinc-900">
                Dados úteis no pedido
              </h3>
              <ul className="pt-4 grid gap-3 text-zinc-600">
                <li>Nome completo</li>
                <li>E-mail da conta</li>
                <li>Telefone cadastrado, se houver</li>
                <li>Informação se o login foi feito com Facebook ou Google</li>
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </Template>
  );
}
