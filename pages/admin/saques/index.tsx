import { useEffect } from "react";
import { useRouter } from "next/router";
import Template from "@/src/template";

export default function LegacyAdminSaquesRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/antecipacoes");
  }, [router]);

  return (
    <Template
      header={{ template: "admin", position: "solid" }}
      footer={{ template: "clean" }}
    >
      <section>
        <div className="container-medium py-20 text-center text-sm text-zinc-500">
          Redirecionando para Antecipações de Lojistas...
        </div>
      </section>
    </Template>
  );
}

