import Api from "@/src/services/api";
import { UserType } from "@/src/models/user";
import UserEdit from "@/src/components/shared/UserEdit";
import Template from "@/src/template";
import Icon from "@/src/icons/fontAwesome/FIcon";
import HelpCard from "@/src/components/common/HelpCard";
import Link from "next/link";
import Breadcrumbs from "@/src/components/common/Breadcrumb";
import { useEffect, useState } from "react";
import RecipientModal from "@/src/components/pages/painel/meus-dados/RecipientModal";
import { RecipientEntity, RecipientStatusResponse } from "@/src/models/recipient";
import { getRecipientStatus } from "@/src/services/recipients";
import HelpCardConfig from "@/src/components/common/HelpCardConfig";
import InterrogacaoIcon from "@/src/icons/InterrogacaoIcon";
import SettingsIcon from "@/src/icons/SettingsIcon";

export async function getServerSideProps(ctx: any) {
  const api = new Api();

  const request: any = await api.call(
    {
      method: 'post',
      url: "request/graph",
      data: [
        {
          model: "page",
          filter: [
            {
              key: "slug",
              value: "account",
              compare: "=",
            },
          ],
        },
      ],
    },
    ctx
  );

  let page: any = request?.data?.query?.page[0] ?? {};

  return {
    props: {
      page: page,
    },
  };
}

export default function MeusDados({ page }: { page: any }) {
  const api = new Api();

  const [user, setUser] = useState({} as UserType);
  const [recipientStatus, setRecipientStatus] = useState<RecipientStatusResponse | null>(null);
  const [recipientModalOpen, setRecipientModalOpen] = useState(false);

  const getUserData = async () => {
    const request: any = await api.bridge({
      method: "get",
      url: "users/get",
    });


    if (request.response) {
      setUser(request.data);
    }
  };

  const fetchRecipientStatus = async () => {
    // TODO: trocar getRecipientStatus por chamada real ao backend (Aguardando Backend)
    const status = await getRecipientStatus();
    setRecipientStatus(status);
  };

  const handleRecipientCompleted = (data: RecipientEntity) => {
    setRecipientStatus({
      completed: true,
      recipient: data,
    });
  };

  useEffect(() => {
    getUserData();
    fetchRecipientStatus();
  }, []);

  const shouldShowRecipientBanner =
    !!user?.id &&
    user?.person === "partner" &&
    recipientStatus &&
    !recipientStatus.completed;

  return (
    <Template
      header={{
        template: "painel",
        position: "solid",
      }}
      footer={{
        template: "clean",
      }}
    >
      <section className="">
        <div className="container-medium pt-12">
          <div className="pb-4">
            <Breadcrumbs
              links={[
                { url: "/painel", name: "Painel" },
                { url: "/painel/Dados_do_recebedor", name: "Dados_do_recebedor" },
              ]}
            />
          </div>
          <div className="grid md:flex gap-4 items-center w-full border-b pb-8 mb-0">
            <div className="w-full flex items-center">
              <Link passHref href="/painel">
                <Icon
                  icon="fa-long-arrow-left"
                  className="mr-6 text-2xl text-zinc-900"
                />
              </Link>
              <div className="text-3xl lg:text-4xl flex gap-4 items-center text-zinc-900 w-full">
                <span className="font-title font-bold">Dados do recebedor</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      {!!user?.id && (
        <section className="pt-6">
          <div className="container-medium pb-12">
            {shouldShowRecipientBanner && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-5 mb-8">
                <p className="text-lg font-semibold">
                  Seu cadastro na Pagar.me ainda não foi finalizado
                </p>
                <p className="text-sm mt-2 text-red-600/90">
                  Conclua o passo a passo para receber pagamentos, antecipar valores e liberar o painel completo.
                </p>
                <button
                  type="button"
                  className="mt-4 text-red-600 font-bold underline"
                  onClick={() => setRecipientModalOpen(true)}
                >
                  Concluir cadastro agora
                </button>
              </div>
            )}
            <div className="grid lg:flex gap-10 lg:gap-20">
              <div className="w-full grid gap-8">
                <UserEdit user={user} />
              </div>
              <div className="w-full md:max-w-[18rem] lg:max-w-[24rem] flex flex-col gap-6">
                <HelpCardConfig help_text="Realizamos o pagamento aos fornecedores automaticamente por meio de split de pagamento, com o valor sendo creditado diretamente em sua conta. 

                " help_title="Por que isso é importante?" help_icon={<SettingsIcon />} help_complete="Saiba mais:" />
                <HelpCardConfig help_text="A seção de configurações é apenas para visualização, pois seus parâmetros são definidos pelo Fiestou, conforme descrito nos termos de aceite.

                " help_title="Configurações" help_icon={<InterrogacaoIcon />} help_complete={"Confira:"} />
              </div>
            </div>
          </div>
        </section>
      )}
      <RecipientModal
        open={recipientModalOpen}
        onClose={() => setRecipientModalOpen(false)}
        status={recipientStatus}
        onCompleted={handleRecipientCompleted}
      />
    </Template>
  );
}
