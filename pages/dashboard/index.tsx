import Link from "next/link";
import Icon from "@/src/icons/fontAwesome/FIcon";
import Template from "@/src/template";
import { AuthContext, getUser } from "@/src/contexts/AuthContext";
import { useContext, useEffect, useState } from "react";
import { getFirstName, replaceWord } from "@/src/helper";
import { UserType } from "@/src/models/user";
import Api from "@/src/services/api";
import Breadcrumbs from "@/src/components/common/Breadcrumb";
import { Button } from "@/src/components/ui/form";

export async function getStaticProps(ctx: any) {
  const api = new Api();

  let request: any = await api.content({method: 'get', url: `dashboard` });

  const DataSeo = request?.data?.DataSeo ?? {};
  const HeaderFooter = request?.data?.HeaderFooter ?? {};
  const Dashboard = request?.data?.Dashboard ?? {};

  return {
    props: {
      HeaderFooter: HeaderFooter,
      DataSeo: DataSeo,
      Dashboard: Dashboard,
    },
  };
}

export default function Dashboard({ HeaderFooter, Dashboard }: any) {
  const { UserLogout } = useContext(AuthContext);

  const [user, setUser] = useState({} as UserType);

  useEffect(() => {
    if (!!window) {
      setUser(getUser);
    }
  }, []);

  const getDescription = (field: string) => {
    return Dashboard[field];
  };

  return (
    <Template
      header={{
        template: "default",
        position: "solid",
        content: HeaderFooter,
      }}
    >
      <section className="">
        <div className="container-medium pb-6 pt-10 md:pb-10">
          <div className="flex items-end">
            <div className="w-full">
              <div className="pb-4">
                <Breadcrumbs
                  links={[{ url: "/dashboard", name: "Dashboard" }]}
                />
              </div>
              <div className="font-title font-bold text-4xl md:text-5xl text-zinc-900">
                {!!user?.name &&
                  replaceWord(
                    Dashboard?.board_text ?? "",
                    "{first_name}",
                    getFirstName(user.name)
                  )}
              </div>
              {!!Dashboard?.board_desc && (
                <div className="pt-4">{Dashboard?.board_desc ?? ""}</div>
              )}
            </div>
          </div>
        </div>
      </section>
      <section>
        <div className="pt-4 md:pt-6 flex justify-center">
          <Button
            onClick={() => UserLogout()}
            className="md:text-lg px-4 py-2 md:py-4 md:px-8"
          >
            Sair da conta
          </Button>
        </div>
      </section>
    </Template>
  );
}
