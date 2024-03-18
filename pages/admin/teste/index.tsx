import TestEmail from "@/src/components/pages/admin/teste/TestEmail";
import TestSms from "@/src/components/pages/admin/teste/TestSms";
import {
  ChangeDeliveryStatusMail,
  CompleteOrderMail,
  ContentType,
  RegisterOrderMail,
  RegisterUserMail,
} from "@/src/mail";
import Api from "@/src/services/api";
import Template from "@/src/template";
import { useState } from "react";

export async function getServerSideProps(ctx: any) {
  const api = new Api();

  let request: any = await api.call({
    url: "request/graph",
    data: [
      {
        model: "page",
        filter: [
          {
            key: "slug",
            value: "email",
            compare: "=",
          },
        ],
      },
    ],
  });

  // // console.log(request, "<<");

  return {
    props: {
      page: request?.data?.query?.page[0] ?? {},
    },
  };
}

export default function Teste({ page }: { page: any }) {
  // console.log(page);

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
