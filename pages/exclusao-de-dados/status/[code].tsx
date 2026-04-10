import Api from "@/src/services/api";
import Template from "@/src/template";
import Breadcrumbs from "@/src/components/common/Breadcrumb";
import Icon from "@/src/icons/fontAwesome/FIcon";
import { findFacebookDataDeletionRequest } from "@/src/server/facebook-data-deletion";

interface StatusPageProps {
  HeaderFooter: any;
  DataSeo: any;
  Scripts: any;
  requestFound: boolean;
  code: string;
  receivedAt: string | null;
}

export async function getServerSideProps(ctx: any) {
  const api = new Api();
  const request: any = await api.content({ method: "get", url: "default" });
  const code = String(ctx.params?.code ?? "").trim();
  const record = code ? findFacebookDataDeletionRequest(code) : null;

  return {
    props: {
      HeaderFooter: request?.data?.HeaderFooter ?? {},
      DataSeo: request?.data?.DataSeo ?? {},
      Scripts: request?.data?.Scripts ?? {},
      requestFound: !!record,
      code,
      receivedAt: record?.receivedAt ?? null,
    },
  };
}

export default function ExclusaoDeDadosStatus({
  HeaderFooter,
  DataSeo,
  Scripts,
  requestFound,
  code,
  receivedAt,
}: StatusPageProps) {
  return (
    <Template
      scripts={Scripts}
      metaPage={{
        title: `Status da exclusão de dados | ${DataSeo?.site_text ?? "Fiestou"}`,
        description:
          "Acompanhe o status da solicitação de exclusão de dados registrada pela Fiestou.",
        url: `exclusao-de-dados/status/${code}`,
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
                links={[
                  { url: "/exclusao-de-dados", name: "Exclusão de dados" },
                  { url: `/exclusao-de-dados/status/${code}`, name: "Status" },
                ]}
              />
            </div>
            <h1 className="font-title font-bold text-4xl md:text-5xl">
              Status da solicitação
            </h1>
            <p className="max-w-3xl text-lg md:text-2xl font-semibold">
              {requestFound
                ? "Recebemos a solicitação de exclusão de dados e ela já foi registrada."
                : "Não encontramos uma solicitação com esse código."}
            </p>
          </div>
        </div>
      </section>

      <section className="container-medium py-10 md:py-16">
        <div className="mx-auto max-w-3xl rounded-3xl border border-zinc-200 bg-white p-6 md:p-8">
          <div className="flex items-start gap-4">
            <div
              className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
                requestFound
                  ? "bg-green-100 text-green-600"
                  : "bg-yellow-100 text-yellow-500"
              }`}
            >
              <Icon icon={requestFound ? "fa-check" : "fa-search"} />
            </div>

            <div className="grid gap-4">
              <div>
                <h2 className="font-title text-2xl font-bold text-zinc-900">
                  {requestFound ? "Solicitação recebida" : "Solicitação não localizada"}
                </h2>
                <p className="pt-2 text-zinc-600">
                  Código de confirmação: <strong>{code}</strong>
                </p>
              </div>

              {requestFound ? (
                <>
                  <p className="text-zinc-700">
                    A Fiestou registrou esse pedido automaticamente e pode entrar
                    em contato caso precise confirmar a titularidade da conta.
                  </p>
                  {receivedAt && (
                    <p className="text-sm text-zinc-500">
                      Recebido em{" "}
                      {new Date(receivedAt).toLocaleString("pt-BR", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                      .
                    </p>
                  )}
                  <p className="text-sm text-zinc-500">
                    Se você precisar complementar a solicitação, envie um e-mail
                    para <strong>fiestoudev@gmail.com</strong> e informe esse
                    código no assunto ou no corpo da mensagem.
                  </p>
                </>
              ) : (
                <p className="text-zinc-700">
                  Verifique se o código foi copiado corretamente. Se precisar de
                  ajuda, envie um e-mail para <strong>fiestoudev@gmail.com</strong>.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    </Template>
  );
}
