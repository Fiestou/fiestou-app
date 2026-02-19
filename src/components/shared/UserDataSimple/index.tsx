import React, { useEffect, useMemo, useState } from "react";
import { Button, Input } from "../../ui/form";
import { UserType } from "@/src/models/user";
import { toast } from "react-toastify";
import Api from "@/src/services/api";
import { formatPhone, formatCep } from "@/src/components/utils/FormMasks";
import Icon from "@/src/icons/fontAwesome/FIcon";

interface Props {
  user: UserType;
  onUpdate?: () => void;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  address: {
    zipCode: string;
    street: string;
    number: string;
    complement: string;
    neighborhood: string;
    city: string;
    state: string;
  };
}

function EmptyValue() {
  return <span className="text-zinc-400 italic">Não preenchido</span>;
}

function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid sm:grid-cols-[11rem,1fr] gap-1 sm:gap-3 py-3 border-b border-zinc-100 last:border-0">
      <span className="text-sm text-zinc-500">{label}</span>
      <span className="text-sm text-zinc-900 break-words">{value || <EmptyValue />}</span>
    </div>
  );
}

function SectionHeader({
  icon,
  title,
  subtitle,
  open,
  onToggle,
}: {
  icon: string;
  title: string;
  subtitle: string;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="w-full flex items-center justify-between gap-3 text-left"
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-zinc-100 text-zinc-700 flex items-center justify-center">
          <Icon icon={icon} className="text-sm" />
        </div>
        <div>
          <h3 className="text-base md:text-lg font-semibold text-zinc-900">{title}</h3>
          <p className="text-xs md:text-sm text-zinc-500">{subtitle}</p>
        </div>
      </div>
      <Icon icon={open ? "fa-chevron-up" : "fa-chevron-down"} className="text-sm text-zinc-400" />
    </button>
  );
}

const UserDataSimple: React.FC<Props> = ({ user, onUpdate }) => {
  const api = new Api();
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [openPersonal, setOpenPersonal] = useState(true);
  const [openAddress, setOpenAddress] = useState(true);

  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    address: {
      zipCode: "",
      street: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: "",
    },
  });

  useEffect(() => {
    if (user) {
      const userAddr = (user as any)?.address?.[0];
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: {
          zipCode: userAddr?.zipCode || "",
          street: userAddr?.street || "",
          number: String(userAddr?.number || ""),
          complement: userAddr?.complement || "",
          neighborhood: userAddr?.neighborhood || "",
          city: userAddr?.city || "",
          state: userAddr?.state || "",
        },
      });
    }
  }, [user]);

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddressChange = (field: keyof FormData["address"], value: string) => {
    setFormData((prev) => ({
      ...prev,
      address: { ...prev.address, [field]: value },
    }));
  };

  const fetchCep = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, "");
    if (cleanCep.length !== 8) return;

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await response.json();
      if (!data.erro) {
        setFormData((prev) => ({
          ...prev,
          address: {
            ...prev.address,
            street: data.logradouro || prev.address.street,
            neighborhood: data.bairro || prev.address.neighborhood,
            city: data.localidade || prev.address.city,
            state: data.uf || prev.address.state,
          },
        }));
      }
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
    }
  };

  const handleCepChange = (value: string) => {
    const masked = formatCep(value);
    handleAddressChange("zipCode", masked);
    if (value.replace(/\D/g, "").length === 8) {
      fetchCep(value);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await api.bridge({
        method: "post",
        url: "users/update",
        data: {
          name: formData.name,
          phone: formData.phone.replace(/\D/g, ""),
          address: [
            {
              zipCode: formData.address.zipCode.replace(/\D/g, ""),
              street: formData.address.street,
              number: formData.address.number,
              complement: formData.address.complement,
              neighborhood: formData.address.neighborhood,
              city: formData.address.city,
              state: formData.address.state,
            },
          ],
        },
      });

      if (response) {
        toast.success("Dados atualizados com sucesso!");
        setEditMode(false);
        onUpdate?.();
      }
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast.error("Erro ao atualizar dados.");
    } finally {
      setLoading(false);
    }
  };

  const filledFields = useMemo(() => {
    const values = [
      formData.name,
      formData.email,
      formData.phone,
      formData.address.zipCode,
      formData.address.street,
      formData.address.number,
      formData.address.neighborhood,
      formData.address.city,
      formData.address.state,
    ];
    return values.filter((item) => String(item || "").trim().length > 0).length;
  }, [formData]);

  const totalFields = 9;
  const completion = Math.round((filledFields / totalFields) * 100);

  return (
    <div className="space-y-5 md:space-y-6">
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 md:p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center">
              <Icon icon="fa-user" className="text-lg" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-semibold text-zinc-900">Dados da conta</h2>
              <p className="text-sm text-zinc-600 mt-1">
                Mantenha seu cadastro atualizado para facilitar acompanhamento de pedidos e entrega.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {!editMode ? (
              <Button type="button" style="btn-outline-light" className="px-4 py-2" onClick={() => setEditMode(true)}>
                Editar dados
              </Button>
            ) : (
              <>
                <Button type="button" style="btn-light" className="px-4 py-2" onClick={() => setEditMode(false)}>
                  Cancelar
                </Button>
                <Button
                  type="button"
                  style="btn-yellow"
                  className="px-4 py-2"
                  onClick={handleSubmit}
                  loading={loading}
                  disable={loading}
                >
                  Salvar alterações
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="mt-4 grid sm:grid-cols-3 gap-3">
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5">
            <p className="text-xs uppercase tracking-wide text-zinc-500">Perfil</p>
            <p className="text-sm font-semibold text-zinc-900 mt-1">{formData.name || "Conta cliente"}</p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5">
            <p className="text-xs uppercase tracking-wide text-zinc-500">Contato</p>
            <p className="text-sm font-semibold text-zinc-900 mt-1">{formData.email || "Sem e-mail"}</p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5">
            <p className="text-xs uppercase tracking-wide text-zinc-500">Cadastro completo</p>
            <p className="text-sm font-semibold text-zinc-900 mt-1">{completion}%</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-5 md:p-6 shadow-sm">
        <SectionHeader
          icon="fa-id-card"
          title="Dados pessoais"
          subtitle="Informações básicas da conta"
          open={openPersonal}
          onToggle={() => setOpenPersonal((prev) => !prev)}
        />

        {openPersonal && (
          <div className="mt-5">
            {editMode ? (
              <div className="grid gap-4">
                <Input
                  name="name"
                  placeholder="Nome completo"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                />
                <Input
                  name="email"
                  placeholder="E-mail"
                  value={formData.email}
                  disabled
                  className="bg-zinc-100"
                />
                <Input
                  name="phone"
                  placeholder="Telefone"
                  value={formatPhone(formData.phone)}
                  onChange={(e) => handleChange("phone", e.target.value)}
                />
              </div>
            ) : (
              <div>
                <DataRow label="Nome" value={formData.name} />
                <DataRow label="E-mail" value={formData.email} />
                <DataRow label="Telefone" value={formatPhone(formData.phone)} />
              </div>
            )}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-5 md:p-6 shadow-sm">
        <SectionHeader
          icon="fa-map-marker-alt"
          title="Endereço principal"
          subtitle="Usado para facilitar cálculo de entrega"
          open={openAddress}
          onToggle={() => setOpenAddress((prev) => !prev)}
        />

        {openAddress && (
          <div className="mt-5">
            {editMode ? (
              <div className="grid gap-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <Input
                    name="zipCode"
                    placeholder="CEP"
                    value={formData.address.zipCode}
                    onChange={(e) => handleCepChange(e.target.value)}
                    maxLength={9}
                  />
                  <Input
                    name="state"
                    placeholder="UF"
                    value={formData.address.state}
                    onChange={(e) => handleAddressChange("state", e.target.value.toUpperCase())}
                    maxLength={2}
                  />
                </div>
                <Input
                  name="street"
                  placeholder="Rua"
                  value={formData.address.street}
                  onChange={(e) => handleAddressChange("street", e.target.value)}
                />
                <div className="grid md:grid-cols-2 gap-4">
                  <Input
                    name="number"
                    placeholder="Número"
                    value={formData.address.number}
                    onChange={(e) => handleAddressChange("number", e.target.value)}
                  />
                  <Input
                    name="complement"
                    placeholder="Complemento"
                    value={formData.address.complement}
                    onChange={(e) => handleAddressChange("complement", e.target.value)}
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <Input
                    name="neighborhood"
                    placeholder="Bairro"
                    value={formData.address.neighborhood}
                    onChange={(e) => handleAddressChange("neighborhood", e.target.value)}
                  />
                  <Input
                    name="city"
                    placeholder="Cidade"
                    value={formData.address.city}
                    onChange={(e) => handleAddressChange("city", e.target.value)}
                  />
                </div>
              </div>
            ) : (
              <div>
                <DataRow label="CEP" value={formData.address.zipCode} />
                <DataRow label="Rua" value={formData.address.street} />
                <DataRow label="Número" value={formData.address.number} />
                <DataRow label="Complemento" value={formData.address.complement} />
                <DataRow label="Bairro" value={formData.address.neighborhood} />
                <DataRow label="Cidade" value={formData.address.city} />
                <DataRow label="UF" value={formData.address.state} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDataSimple;
