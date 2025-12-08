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
import { useEffect, useState } from "react";
import UserEditAdmin from "@/src/components/shared/UserEditAdmin";

export async function getServerSideProps(ctx: any) {
  const api = new Api();
  const { id } = ctx.query;

  return {
    props: {
      id: id,
    },
  };
}

export default function AdminPartner({ id }: any) {
  const router = useRouter();

  const api = new Api();

  const [partner, setPartner] = useState({} as UserType);

  const submitUser = (e: any) => {
    e.preventDefault();
  };

  const getPartner = async () => {
    const request: any = await api.bridge({
      method: "get",
      url: "users/get",
      data: {
        ref: id,
        person: "partner",
      },
    });

    if (request.response) {
      setPartner(request.data);
    }
  };

  useEffect(() => {
    getPartner();
  }, []);

  if (router.isFallback) {
    return null;
  }

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
            <Link passHref href="/admin/parceiros/">
              <Icon
                icon="fa-long-arrow-left"
                className="mr-6 text-2xl text-zinc-900"
              />
            </Link>
            <div className="font-title font-bold text-3xl md:text-4xl flex gap-4 items-center text-zinc-900 w-full">
              Parceiro
            </div>
          </div>
        </div>
      </section>
      {!!partner && (
        <UserEditAdmin user={partner} redirect="/admin/parceiros" />
      )}
    </Template>
  );
}
