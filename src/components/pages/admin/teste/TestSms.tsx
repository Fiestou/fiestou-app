import { Button } from "@/src/components/ui/form";
import {
  ChangeDeliveryStatusSMS,
  CompleteOrderSMS,
  MessageType,
  RegisterOrderSMS,
  RegisterUserSMS,
} from "@/src/sms";
import { useState } from "react";

const formInitial = {
  sended: false,
  loading: false,
};

export default function Sms({ page }: { page: any }) {
  const getContent = (type: string) => {
    return {
      subject: page[type + "_subject"],
      message: page[type + "_body"],
    } as MessageType;
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
      await RegisterUserSMS(
        { id: 0, email: data.email, name: data.name, phone: data.phone },
        getContent("register")
      );
    }

    if (data.content == "delivery") {
      await ChangeDeliveryStatusSMS(
        {
          id: 0,
          groupHash: "",
          mainOrderId: 0,
          orderIds: [],
          metadata: {},
          delivery_status: "sent",
          delivery_schedule: "",
          delivery_address: {},
          subtotal: 0,
          delivery_price: 0,
          createdAt: new Date().toISOString(),
          user: { id: 0, email: data.email, name: data.name, phone: data.phone },
          deliveryStatus: "sent",
          deliverySchedule: "",
          deliveryPrice: 0,
          total: 0,
          platformCommission: "",
          listItems: [],
          status: 1,
          deliveryTo: "",
          freights: {
            zipcode: "",
            productsIds: []
          }
        } as any,
        getContent("delivery")
      );
    }

    if (data.content == "order") {
      await RegisterOrderSMS(
        {
          id: 0,
          groupHash: "",
          mainOrderId: 0,
          orderIds: [],
          metadata: {},
          delivery_status: "",
          delivery_schedule: "",
          delivery_address: {},
          subtotal: 0,
          delivery_price: 0,
          createdAt: new Date().toISOString(),
          user: { id: 0, email: data.email, name: data.name, phone: data.phone },
          deliveryStatus: "",
          deliverySchedule: "",
          deliveryPrice: 0,
          total: 0,
          platformCommission: "",
          listItems: [],
          status: 1,
          deliveryTo: "",
          freights: {
            zipcode: "",
            productsIds: []
          }
        } as any,
        [],
        getContent("order")
      );
    }

    if (data.content == "order_complete") {
      await CompleteOrderSMS(
        {
          id: 0,
          groupHash: "",
          mainOrderId: 0,
          orderIds: [],
          metadata: {},
          delivery_status: "",
          delivery_schedule: "",
          delivery_address: {},
          subtotal: 0,
          delivery_price: 0,
          createdAt: new Date().toISOString(),
          user: { id: 0, email: data.email, name: data.name, phone: data.phone },
          deliveryStatus: "",
          deliverySchedule: "",
          deliveryPrice: 0,
          total: 0,
          platformCommission: "",
          listItems: [],
          status: 1,
          deliveryTo: "",
          freights: {
            zipcode: "",
            productsIds: []
          }
        } as any,
        getContent("order_complete")
      );
    }

    setFormValue({ loading: false });
  };

  return (
    <form onSubmit={(e) => submitForm(e)} method="POST">
      <div className="p-4 max-w-[32rem] mx-auto grid gap-4">
        <div className="border-b">
          <h3 className="font-semibold text-zinc-900 pb-2">Teste de SMS</h3>
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
          <label>Celular</label>
          <input
            required
            className="form-control"
            onChange={(e: any) => handleData({ phone: e.target.value })}
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
