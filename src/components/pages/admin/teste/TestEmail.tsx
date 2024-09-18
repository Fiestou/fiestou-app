import { Button } from "@/src/components/ui/form";
import {
  ChangeDeliveryStatusMail,
  CompleteOrderMail,
  ContentType,
  RegisterOrderMail,
  RegisterUserMail,
} from "@/src/mail";
import { OrderType } from "@/src/models/order";
import { useState } from "react";

const formInitial = {
  sended: false,
  loading: false,
};

export default function TestEmail({ page }: { page: any }) {
  const getContent = (type: string) => {
    return {
      subject: page[type + "_subject"],
      image: page[type + "_image"],
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
          deliveryStatus: "",
          deliveryTo: "reception",
          deliveryPrice: 0,
          deliverySchedule: "Manhã - 09:00",
          total: 0,
          platformCommission: "",
          listItems: [],
          deliveryAddress: {
            zipCode: "15047099",
            street: "Yole Spaolonze Ismael",
            number: "441",
            neighborhood: "JD Maria Lúcia",
            complement: "Escola",
            city: "São José do Rio Preto",
            state: "SP",
            country: "BRASIL",
          },
          status: 1,
        } as OrderType,
        getContent("delivery")
      );
    }

    if (data.content == "order") {
      await RegisterOrderMail(
        {
          user: { email: data.email, name: data.name },
          deliveryStatus: "",
          deliveryTo: "reception",
          deliveryPrice: 0,
          deliverySchedule: "Manhã - 09:00",
          total: 290,
          platformCommission: "",
          listItems: [],
          deliveryAddress: {
            zipCode: "15047099",
            street: "Yole Spaolonze Ismael",
            number: "441",
            neighborhood: "JD Maria Lúcia",
            complement: "Escola",
            city: "São José do Rio Preto",
            state: "SP",
            country: "BRASIL",
          },
          status: 1,
        } as OrderType,
        JSON.parse(
          `[{"attributes":[],"details":{"dateStart":"2024-03-17","dateEnd":"2024-03-17","days":0,"schedulingDiscount":"0"},"product":{"unavailable":["2024-03-17"],"title":"Ursinho Azul","id":136,"store":{"id":19,"slug":"circus-festas","title":"Circus Festas"},"vehicle":null,"freeTax":null,"fragility":"no","comercialType":"renting","schedulingTax":null,"schedulingPeriod":null},"quantity":1,"total":20},{"attributes":[],"details":{"dateStart":"2024-03-17","dateEnd":"2024-03-17","days":0,"schedulingDiscount":"0"},"product":{"unavailable":["2024-03-17"],"title":"Miney Kit","id":198,"store":{"id":19,"slug":"circus-festas","title":"Circus Festas"},"vehicle":"pickup","freeTax":null,"fragility":"no","comercialType":"renting","schedulingTax":null,"schedulingPeriod":null},"quantity":1,"total":290}]`
        ),
        getContent("order")
      );
    }

    if (data.content == "order_complete") {
      await CompleteOrderMail(
        {
          user: { email: data.email, name: data.name },
          deliveryStatus: "",
          deliveryTo: "reception",
          deliveryPrice: 0,
          deliverySchedule: "Manhã - 09:00",
          total: 0,
          platformCommission: "",
          listItems: [],
          deliveryAddress: {
            zipCode: "15047099",
            street: "Yole Spaolonze Ismael",
            number: "441",
            neighborhood: "JD Maria Lúcia",
            complement: "Escola",
            city: "São José do Rio Preto",
            state: "SP",
            country: "BRASIL",
          },
          status: 1,
        } as OrderType,
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
