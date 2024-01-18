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

  // console.log(request, "<<");

  return {
    props: {
      page: request?.data?.query?.page[0] ?? {},
    },
  };
}

export default function Mail({ page }: { page: any }) {
  console.log(page);

  const getContent = (type: string) => {
    return {
      subject: page[type + "_subject"],
      html: page[type + "_body"],
    } as ContentType;
  };

  const [data, setData] = useState({} as any);
  const handleData = (value: any) => {
    setData({ ...data, ...value });
  };

  const submitForm = async (e: any) => {
    e.preventDefault();

    if (data.content == "register") {
      await RegisterUserMail(
        { email: data.email, name: data.name },
        getContent("register")
      );
    }

    if (data.content == "delivery") {
      await ChangeDeliveryStatusMail(
        {
          user: { email: data.email, name: data.name },
          deliveryStatus: "sent",
          deliverySchedule: "",
          total: 0,
          platformCommission: "",
          listItems: [],
          status: 1,
        },
        getContent("delivery")
      );
    }

    if (data.content == "order") {
      await RegisterOrderMail(
        {
          user: { email: data.email, name: data.name },
          deliveryStatus: "",
          deliverySchedule: "",
          total: 0,
          platformCommission: "",
          listItems: [],
          status: 1,
        },
        [],
        getContent("order")
      );
    }

    if (data.content == "order_complete") {
      await CompleteOrderMail(
        {
          user: { email: data.email, name: data.name },
          deliveryStatus: "",
          deliverySchedule: "",
          total: 0,
          platformCommission: "",
          listItems: [],
          status: 1,
        },
        getContent("order_complete")
      );
    }
  };

  return (
    <Template
      header={{
        template: "admin",
        position: "solid",
      }}
    >
      <form onSubmit={(e) => submitForm(e)} method="POST">
        <div className="p-4 max-w-[32rem] mx-auto grid gap-4">
          <div>
            <label>E-mail</label>
            <input
              className="form-control"
              onChange={(e: any) => handleData({ email: e.target.value })}
            />
          </div>
          <div>
            <label>Nome</label>
            <input
              className="form-control"
              onChange={(e: any) => handleData({ name: e.target.value })}
            />
          </div>
          <div>
            <label>Conteúdo</label>
            <select
              className="form-control"
              onChange={(e: any) => handleData({ content: e.target.value })}
            >
              <option value="">Selecione...</option>
              <option value="register">Confirmação de cadastro</option>
              <option value="order">Pedido efetuado</option>
              <option value="order_complete">Pagamento efetuado</option>
              <option value="delivery">Status de entrega</option>
            </select>
          </div>
          <div>
            <button className="p-4 rounded font-semibold text-zinc-900 bg-yellow-300 w-full">
              Enviar
            </button>
          </div>
        </div>
      </form>
    </Template>
  );
}
