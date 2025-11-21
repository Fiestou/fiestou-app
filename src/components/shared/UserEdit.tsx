import Image from "next/image";
import Link from "next/link";
import Icon from "@/src/icons/fontAwesome/FIcon";
import Template from "@/src/template";
import { useEffect, useState } from "react";
import { Button, Input, Select, TextArea } from "@/src/components/ui/form";
import Api from "@/src/services/api";
import { UserType } from "@/src/models/user";
import { formatName, formatPhone } from "src/components/utils/FormMasks";
import GroupConfigUsers from "./GroupConfigUsers";
import GroupConfigBank from "./GroupConfigBank";
import GroupConfigBasicUser from "./GroupConfigBasicUser";
import GroupConfig from "./GroupConfig";
import { getStore } from "@/src/contexts/AuthContext";
import { RecipientType } from "@/src/models/Recipient";
import { toast } from "react-toastify";

const formInitial = {
  edit: "",
  loading: false,
};

export default function UserEdit({ user }: { user: UserType }) {
  const api = new Api();

  const [form, setForm] = useState(formInitial);
  const handleForm = (value: Object) => {
    setForm({ ...form, ...value });
  };

  const [content, setContent] = useState<RecipientType>();
  const [storeId, setStoreId] = useState<any>();

  const getRecipientCode = async (storeId: string) => {
    try {
      const res: any = await api.bridge({
        method: "GET",
        url: `info/recipient/${storeId}`,
        // se essa rota estiver fora de /api/app, passe noAppPrefix: true
      });

      if (!res?.response || !res?.data) {
        toast.error("Não foi possível carregar o recebedor.");
        return;
      }

      const d = res.data;

      // mapeia address/phone (objetos) -> arrays esperados pelos componentes
      const mapped: RecipientType = {
        recipient: null,
        id: d.id,
        store_id: d.store_id,
        partner_id: d.partner_id,
        code: d.code ?? "",
        type_enum: d.type_enum ?? "",
        type: d.type ?? "individual",
        name: d.name ?? "",
        email: d.email ?? "",
        document: d.document ?? "",
        company_name: d.company_name ?? null,
        trading_name: d.trading_name ?? null,
        birth_date: d.birth_date ?? "",
        monthly_income: d.monthly_income ?? "",
        professional_occupation: d.professional_occupation ?? null,

        // converte address {..} para addresses [{..}]
        addresses: d.address
          ? [{
            id: 0, // se vier no payload, use d.address.id
            street: d.address.street ?? "",
            complementary: d.address.complementary ?? "",
            street_number: d.address.street_number ?? "",
            neighborhood: d.address.neighborhood ?? "",
            city: d.address.city ?? "",
            state: d.address.state ?? "",
            zip_code: d.address.zip_code ?? "",
            reference_point: d.address.reference_point ?? "",
          }]
          : [],

        // converte phone {..} para phones [{..}]
        phones: d.phone
          ? [{
            id: 0, // se vier no payload, use d.phone.id
            area_code: d.phone.area_code ?? "",
            number: d.phone.number ?? "",
          }]
          : [],

        // se quiser expor o bloco bancário direto no content
        config: {},
        partners: [],
        annual_revenue: null,
        created_at: "",
        updated_at: ""
      };

      setContent(mapped);
    } catch (error) {
      console.error("Complete o cadastro:", error);
      toast.error("Erro ao carregar recebedor.");
    }
  };

  useEffect(() => {
    if (!!window) {
      setStoreId(getStore());
    }
  }, []);

  useEffect(() => {
    console.log("storeId changed:", storeId);
    if (storeId) {
      getRecipientCode(storeId);
    }
  }, [storeId]);

  const [handleProfile, setHandleProfile] = useState({
    remove: 0,
    preview: user?.profile?.preview ?? "",
  });


  return (
    <>
      <GroupConfigBasicUser content={content} />

      <GroupConfigUsers title="Pessoa Física" content={content} />

      <GroupConfigBank
        title="Contas bancárias"
        recipientId={content?.id}
      />

      <GroupConfig
        title="Configurações"
        content={{
          autoTransfer: "Sim",
          transferFrequency: "Mensal",
          transferDay: "Dia 15",
          autoAdvance: "Sim",
          advanceType: "Full",
          advanceVolume: "50",
          advanceDays: "Dia X",
        }}
      />

    </>
  );
}
