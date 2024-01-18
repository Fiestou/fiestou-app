import { Button } from "@/src/components/ui/form";
import {
  ChangeDeliveryStatusMail,
  CompleteOrderMail,
  ContentType,
  RegisterOrderMail,
  RegisterUserMail,
} from "@/src/mail";
import { useState } from "react";

const formInitial = {
  sended: false,
  loading: false,
};

export default function TestEmail({ page }: { page: any }) {
  const getContent = (type: string) => {
    return {
      subject: page[type + "_subject"],
      html: page[type + "_body"],
    } as ContentType;
  };

  const [form, setForm] = useState(formInitial);
  const setFormValue = (value: any) => {
    setForm((form) => ({ ...form, ...value }));
  };

  const [data, setData] = useState({} as any);
  const handleData = (value: any) => {
    setData({ ...data, ...value });
  };

  const submitForm = async (e: any) => {
    e.preventDefault();

    setFormValue({ loading: true });

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

    setFormValue({ loading: false });
  };

  return (
    <form onSubmit={(e) => submitForm(e)} method="POST">
      <div className="p-4 max-w-[32rem] mx-auto grid gap-4">
        <div className="border-b">
          <h3 className="font-semibold text-zinc-900 pb-2">Teste de Email</h3>
        </div>
        <div>
          <label>E-mail</label>
          <input
            required
            className="form-control"
            onChange={(e: any) => handleData({ email: e.target.value })}
          />
        </div>
        <div>
          <label>Nome</label>
          <input
            required
            className="form-control"
            onChange={(e: any) => handleData({ name: e.target.value })}
          />
        </div>
        <div>
          <label>Conteúdo</label>
          <select
            required
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
        <div className="grid">
          <Button loading={form.loading}>Enviar teste</Button>
        </div>
      </div>
    </form>
  );
}
