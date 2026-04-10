import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/router";
import Template from "@/src/template";
import Api from "@/src/services/api";
import { useSegmentGroups } from "@/src/hooks/useSegmentGroups";
import { preRegisterPartner, completePartnerRegister, PartnerStoreData } from "@/src/services/partner";
import { PreUser } from "@/src/types/user";
import Step1UserData from "@/src/components/parceiros/cadastro/Step1UserData";
import Step2PersonType from "@/src/components/parceiros/cadastro/Step2PersonType";
import StepFinalReview from "@/src/components/parceiros/cadastro/StepFinalReview";

function splitFullName(fullName: string) {
  const normalized = String(fullName ?? "").trim().replace(/\s+/g, " ");
  if (!normalized) return { firstName: "", lastName: "" };
  const parts = normalized.split(" ");
  return { firstName: parts[0] ?? "", lastName: parts.slice(1).join(" ") };
}

type StepId = 1 | 2 | 3;

export type StoreType = {
  email?: string;
  name?: string | null;

  // PF
  cpf?: string;

  // PJ
  cnpj?: string;
  razaoSocial?: string;

  // Comum
  document?: string;
  personType?: "pf" | "pj";
  title?: string;
  companyName?: string;
  segment?: string;
  segmentId?: string | number;
};

export default function PartnerSignupWizard() {
  const [step, setStep] = useState<StepId>(1);
  const [form, setForm] = useState({ loading: false });
  const [store, setStore] = useState<StoreType>({});
  const [preUser, setPreUser] = useState<PreUser | null>(null);
  const { segments: elements, loading: segLoading, error: segError } = useSegmentGroups();
  const api = new Api();
  const router = useRouter();

  const digits = (s?: string) => (s || "").replace(/\D/g, "");

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("preCadastro");
      if (!raw) { setPreUser(null); return; }
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object" && typeof parsed.email === "string") {
        setPreUser({
          name: typeof parsed.name === "string" ? parsed.name : "",
          email: parsed.email,
          phone: typeof parsed.phone === "string" ? parsed.phone : "",
          password: typeof parsed.password === "string" ? parsed.password : "",
        });
      } else {
        setPreUser(null);
      }
    } catch {
      setPreUser(null);
    }
  }, []);

  const preUserForStep = useMemo(
    () =>
      preUser
        ? {
            name: preUser.name ?? "",
            email: preUser.email ?? "",
            phone: preUser.phone ?? "",
            password: preUser.password ?? "",
          }
        : null,
    [preUser]
  );

  const submitStore = async (e: React.FormEvent) => {
    e.preventDefault();
    setForm((f) => ({ ...f, loading: true }));

    try {
      if (!preUser) {
        alert("Dados de pré-cadastro não encontrados.");
        return;
      }

      const doc = store.personType === "pj"
        ? digits(store.cnpj || store.document)
        : digits(store.cpf || store.document);

      if (!(doc.length === 11 || doc.length === 14)) {
        alert("Documento inválido. Informe um CPF (11) ou CNPJ (14) válido.");
        return;
      }

      const nameForUser = (store.name ?? preUser.name ?? "").trim();
      const emailForUser = (preUser.email ?? "").trim().toLowerCase();
      const phoneDigits = digits(preUser.phone);
      const passwordForUser = preUser.password ?? "";
      const parsedName = splitFullName(nameForUser);

      if (!parsedName.firstName || !parsedName.lastName) {
        alert("Informe seu nome e sobrenome.");
        return;
      }
      if (!emailForUser) { alert("Informe seu e-mail."); return; }
      if (phoneDigits.length < 10) { alert("Informe um telefone válido (DDD + número)."); return; }
      if (passwordForUser.length < 8) { alert("Defina uma senha com pelo menos 8 caracteres."); return; }

      // 1) Pré-registro
      const preResp = await preRegisterPartner(api, {
        name: nameForUser,
        email: emailForUser,
        phone: phoneDigits,
        password: passwordForUser,
      });

      if (!preResp?.response && (preResp as any)?.code !== "email_already_registered") {
        alert(preResp?.message || preResp?.error || "Não foi possível pré-registrar o usuário.");
        return;
      }

      // 2) Complete Register
      const storeData: PartnerStoreData = {
        name: nameForUser,
        email: emailForUser,
        phone: phoneDigits,
        password: passwordForUser,
        personType: store.personType || "pf",
        document: doc,
        companyName: store.companyName || store.title || store.name || "",
        hasDelivery: false,
        segment: store.segment,
        segmentId: store.segmentId,
        razaoSocial: store.razaoSocial,
        // Endereço preenchido depois no painel
        street: "",
        number: "",
        neighborhood: "",
        complement: "",
        state: "",
        city: "",
        zipcode: "",
      };

      const result = await completePartnerRegister(api, storeData);

      if (result.response) {
        try { sessionStorage.removeItem("preCadastro"); } catch {}
        router.push("/acesso");
      } else {
        alert(result.error || "Erro ao completar o cadastro da loja.");
      }
    } catch {
      alert("Erro ao finalizar cadastro.");
    } finally {
      setForm((f) => ({ ...f, loading: false }));
    }
  };

  return (
    <Template header={{ template: "clean", position: "solid" }}>
      <div className="max-w-md mx-auto py-10">
        {step === 1 && (
          <Step1UserData
            preUser={preUserForStep}
            store={store}
            setStore={(v) => setStore((p) => ({ ...p, ...v }))}
            nextStep={() => setStep(2)}
          />
        )}

        {step === 2 && (
          <Step2PersonType
            store={store}
            setStore={(v) => setStore((p) => ({ ...p, ...v }))}
            backStep={() => setStep(1)}
            nextStep={() => setStep(3)}
          />
        )}

        {step === 3 && (
          <StepFinalReview
            store={store}
            setStore={(v) => setStore((p) => ({ ...p, ...v }))}
            elements={elements}
            submitStore={submitStore}
            backStep={() => setStep(2)}
          />
        )}

        {segLoading && <div className="text-center text-sm mt-6">Carregando segmentos…</div>}
        {segError && <div className="text-center text-sm mt-2 text-red-600">{segError}</div>}
      </div>
    </Template>
  );
}
