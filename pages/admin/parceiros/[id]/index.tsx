import Api from "@/src/services/api";
import { UserType } from "@/src/models/user";
import UserEdit from "@/src/components/shared/UserEdit";
import { useRouter } from "next/router";
import HelpCard from "@/src/components/common/HelpCard";
import Template from "@/src/template";
import Icon from "@/src/icons/fontAwesome/FIcon";
import Link from "next/link";
import { Button } from "@/src/components/ui/form";
import { print_r } from "@/src/helper";

export async function getServerSideProps(ctx: any) {
  const api = new Api();
  const { id } = ctx.query;
  const request: any = await api.bridge(
    {
      url: "users/list",
      data: {
        filter: [
          {
            key: "id",
            value: id,
            compare: "=",
          },
        ],
      },
    },
    ctx
  );

  if (!request?.data) {
    return {
      redirect: {
        permanent: false,
        destination: "/admin/usuarios",
      },
    };
  }

  let user = request?.data ?? [];
  user = request?.data[0] ?? {};

  return {
    props: {
      user: user,
    },
  };
}

export default function MeusDados({ user }: { user: UserType }) {
  const router = useRouter();

  const submitUser = (e: any) => {
    e.preventDefault();

    // console.log(user);
  };

  return (
    !router.isFallback && (
      <Template
        header={{
          template: "admin",
          position: "solid",
        }}
      >
        <section className="">
          <div className="container-medium pt-12 pb-8 md:py-12">
            <div className="flex">
              <div className="w-full">Produtos {">"} Title</div>
              <div className="flex items-center gap-2 whitespace-nowrap">
                <div className="underline">Precisa de ajuda?</div>{" "}
                <Icon icon="fa-question-circle" />
              </div>
            </div>
            <div className="flex items-center mt-10">
              <Link passHref href="/dashboard">
                <Icon
                  icon="fa-long-arrow-left"
                  className="mr-6 text-2xl text-zinc-900"
                />
              </Link>
              <div className="font-title font-bold text-3xl md:text-4xl flex gap-4 items-center text-zinc-900 w-full">
                Dados de usuário
              </div>
            </div>
          </div>
        </section>
        <section className="">
          <div className="container-medium pb-12">
            <div className="grid md:flex gap-10 md:gap-24">
              <div className="w-full">
                {Object.entries(user).map((item: any, key: any) => (
                  <div key={key} className="flex gap-2 border-b py-2">
                    <div className="font-semibold">{item[0]}:</div>{" "}
                    <pre className="whitespace-pre-wrap">
                      {print_r(item[1])}
                    </pre>
                  </div>
                ))}
              </div>
              <div className="w-full max-w-[24rem]">
                <form className="grid" onSubmit={(e: any) => submitUser(e)}>
                  <Button>Salvar</Button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </Template>
    )
  );
}
