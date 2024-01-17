import Api from "@/src/services/api";
import {
  ChangeDeliveryStatusSMS,
  CompleteOrderSMS,
  MessageType,
  RegisterOrderSMS,
  RegisterUserSMS,
} from "@/src/sms";
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

  return {
    props: {
      page: request?.data?.query?.page[0] ?? {},
    },
  };
}

export default function Sms({ page }: { page: any }) {
  const getContent = (type: string) => {
    return {
      subject: page[type + "_subject"],
      message: page[type + "_body"],
    } as MessageType;
  };

  const [data, setData] = useState({} as any);
  const handleData = (value: any) => {
    setData({ ...data, ...value });
  };

  const submitForm = async (e: any) => {
    e.preventDefault();

    if (data.content == "register") {
      await RegisterUserSMS(
        { email: data.email, name: data.name, phone: data.phone },
        getContent("register")
      );
    }

    if (data.content == "delivery") {
      await ChangeDeliveryStatusSMS(
        {
          user: { email: data.email, name: data.name, phone: data.phone },
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
      await RegisterOrderSMS(
        {
          user: { email: data.email, name: data.name, phone: data.phone },
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
      await CompleteOrderSMS(
        {
          user: { email: data.email, name: data.name, phone: data.phone },
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
          <label>Celular</label>
          <input
            className="form-control"
            onChange={(e: any) => handleData({ phone: e.target.value })}
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
  );
}
