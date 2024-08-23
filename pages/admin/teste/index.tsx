import TestEmail from "@/src/components/pages/admin/teste/TestEmail";
import TestSms from "@/src/components/pages/admin/teste/TestSms";
import Api from "@/src/services/api";
import Template from "@/src/template";
import { useEffect, useState } from "react";

export default function Teste() {
  const api = new Api();

  const [page, setPage] = useState([] as Array<any>);

  const getPage = async () => {
    let request: any = await api.bridge({
      method: "get",
      url: "admin/content/get",
      data: {
        type: "page",
        slug: "email",
      },
    });

    if (request.response) {
      setPage(request.data);
    }
  };

  useEffect(() => {
    getPage();
  }, []);

  return (
    <Template
      header={{
        template: "admin",
        position: "solid",
      }}
    >
      <section className="">
        <div className="container-medium pt-12">
          <div className="grid grid-cols-2 gap-10">
            <TestEmail page={page} />
            <TestSms page={page} />
          </div>
        </div>
      </section>
    </Template>
  );
}
