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

  // Cria dados a partir do user como fallback
  const buildFromUser = (): RecipientType => {
    const userAddr = (user as any)?.address?.[0];
    const userPhone = user?.phone?.replace(/\D/g, "") || "";
    const userBank = (user as any)?.bankAccounts?.[0];
    const doc = user?.cpf || user?.document || "";
    const isPJ = doc.replace(/\D/g, "").length === 14;

    return {
      recipient: null,
      id: undefined as any,
      store_id: undefined as any,
      partner_id: "",
      code: "",
      type_enum: isPJ ? "PJ" : "PF",
      type: isPJ ? "company" : "individual",
      name: user?.name ?? "",
      email: user?.email ?? "",
      document: doc,
      company_name: null,
      trading_name: null,
      birth_date: user?.date ?? "",
      monthly_income: "",
      professional_occupation: null,
      addresses: userAddr ? [{
        id: 0,
        street: userAddr.street ?? "",
        complementary: userAddr.complement ?? "",
        street_number: String(userAddr.number ?? ""),
        neighborhood: userAddr.neighborhood ?? "",
        city: userAddr.city ?? "",
        state: userAddr.state ?? "",
        zip_code: userAddr.zipCode ?? "",
        reference_point: "",
      }] : [],
      phones: userPhone.length >= 10 ? [{
        id: 0,
        area_code: userPhone.slice(0, 2),
        number: userPhone.slice(2),
      }] : [],
      config: {},
      partners: [],
      annual_revenue: null,
      created_at: "",
      updated_at: "",
      bank_account: userBank ? {
        bank: userBank.bank ?? "",
        branch_number: userBank.agence ?? "",
        branch_check_digit: userBank.agenceDigit ?? "",
        account_number: userBank.accountNumber ?? "",
        account_check_digit: userBank.accountDigit ?? "",
        holder_name: userBank.title ?? user?.name ?? "",
        holder_type: isPJ ? "company" : "individual",
        holder_document: doc,
        type: userBank.type === "savings" ? "savings" : "checking",
      } : undefined,
    };
  };

  const getRecipientCode = async (storeId: string) => {
    try {
      const res: any = await api.bridge({
        method: "GET",
        url: `info/recipient/${storeId}`,
      });

      if (!res?.response || !res?.data) {
        // Usa dados do usuário como fallback quando não existe recipient
        console.log("Recipient não encontrado, usando dados do usuário como fallback");
        setContent(buildFromUser());
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
            id: 0,
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
            id: 0,
            area_code: d.phone.area_code ?? "",
            number: d.phone.number ?? "",
          }]
          : [],

        config: {},
        partners: [],
        annual_revenue: null,
        created_at: "",
        updated_at: ""
      };

      setContent(mapped);
    } catch (error) {
      console.error("Erro ao carregar recipient, usando fallback:", error);
      // Usa dados do usuário como fallback em caso de erro
      setContent(buildFromUser());
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
        initialData={content?.bank_account as any}
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
