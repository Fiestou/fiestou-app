import Api from "@/src/services/api";
import { UserType } from "@/src/models/user";
import UserEdit from "@/src/components/shared/UserEdit";
import { useRouter } from "next/router";
import HelpCard from "@/src/components/common/HelpCard";
import Template from "@/src/template";
import Icon from "@/src/icons/fontAwesome/FIcon";
import Link from "next/link";
import { Button, Select } from "@/src/components/ui/form";
import { print_r } from "@/src/helper";
import { useEffect, useState } from "react";
import UserEditAdmin from "@/src/components/shared/UserEditAdmin";

export default function Usuario() {
  const router = useRouter();
  const query: any = router.query;

  const [user, setUser] = useState({} as UserType);

  const getUser = async () => {
    const api = new Api();
    const request: any = await api.bridge({
      method: "get",
      url: "users/get",
      data: {
        ref: query.id,
        person: "client",
      },
    });

    if (request.response) {
      setUser(request.data);
    }
  };

  useEffect(() => {
    if (!!query?.id) {
      getUser();
    }
  }, [query]);

  return (
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
      <UserEditAdmin user={user} />
    </Template>
  );
}
