import Api from "@/src/services/api";
import { UserType } from "@/src/models/user";
import { useRouter } from "next/router";
import Template from "@/src/template";
import Link from "next/link";
import { useEffect, useState } from "react";
import UserEditAdmin from "@/src/components/shared/UserEditAdmin";
import Breadcrumbs from "@/src/components/common/Breadcrumb";

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
      <section>
        <div className="container-medium pt-8">
          <Breadcrumbs
            links={[
              { url: "/admin", name: "Admin" },
              { url: "/admin/usuarios", name: "Usuários" },
              { url: `/admin/usuarios/${query.id}`, name: user?.name || "Editar" },
            ]}
          />
        </div>
      </section>

      <section>
        <div className="container-medium py-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="font-title font-bold text-3xl text-zinc-900">
              {user?.name || "Dados de usuário"}
            </h1>
          </div>
          <UserEditAdmin user={user} />
        </div>
      </section>
    </Template>
  );
}
