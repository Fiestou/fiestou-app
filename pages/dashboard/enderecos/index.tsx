import Link from "next/link";
import React, { useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import Icon from "@/src/icons/fontAwesome/FIcon";
import Template from "@/src/template";
import { Button } from "@/src/components/ui/form";
import Api from "@/src/services/api";
import { UserType } from "@/src/models/user";
import { getZipCode } from "@/src/helper";
import { AddressType } from "@/src/models/address";
import HelpCard from "@/src/components/common/HelpCard";
import Breadcrumbs from "@/src/components/common/Breadcrumb";
import { formatCep } from "@/src/components/utils/FormMasks";
import { toast } from "react-toastify";

const INPUT_BASE_CLASS =
  "w-full rounded-md border border-zinc-300 px-4 py-3 font-sans text-base leading-relaxed text-zinc-900 placeholder:font-sans placeholder:text-base placeholder:leading-relaxed placeholder:text-zinc-400 focus:border-zinc-800 hover:border-zinc-400";

interface AddressInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

const AddressInput = React.forwardRef<HTMLInputElement, AddressInputProps>(
  ({ className = "", ...props }, ref) => {
    return <input ref={ref} {...props} className={`${INPUT_BASE_CLASS} ${className}`} />;
  }
);

AddressInput.displayName = "AddressInput";

export async function getServerSideProps(ctx: any) {
  const api = new Api();

  let cookieUser: any = {};
  try {
    cookieUser = JSON.parse(ctx?.req?.cookies?.["fiestou.user"] ?? "{}");
  } catch {
    cookieUser = {};
  }

  let userRequest: any = {};
  if (cookieUser?.email) {
    userRequest = await api.bridge(
      {
        method: "get",
        url: "users/get",
        data: {
          ref: cookieUser.email,
          person: "client",
        },
      },
      ctx
    );
  }

  const user = userRequest?.data ?? cookieUser ?? {};

  const contentRequest = await api.content({
    method: "get",
    url: "account/address",
  });

  const Address: any = contentRequest?.data?.Address ?? {};
  const HeaderFooter = contentRequest?.data?.HeaderFooter ?? {};
  const DataSeo = contentRequest?.data?.DataSeo ?? {};
  const Scripts = contentRequest?.data?.Scripts ?? {};

  return {
    props: {
      user,
      page: Address,
      HeaderFooter,
      DataSeo,
      Scripts,
    },
  };
}

function emptyAddress(): AddressType {
  return {
    zipCode: "",
    street: "",
    number: "",
    neighborhood: "",
    complement: "",
    city: "",
    state: "",
    country: "Brasil",
    main: false,
  };
}

function normalizeAddress(address: AddressType): AddressType {
  return {
    zipCode: formatCep(String(address?.zipCode ?? "")).trim(),
    street: String(address?.street ?? "").trim(),
    number: String(address?.number ?? "").trim(),
    neighborhood: String(address?.neighborhood ?? "").trim(),
    complement: String(address?.complement ?? "").trim(),
    city: String(address?.city ?? "").trim(),
    state: String(address?.state ?? "").trim().toUpperCase(),
    country: String(address?.country ?? "Brasil").trim() || "Brasil",
    main: !!address?.main,
  };
}

function hasAnyAddressData(address: AddressType): boolean {
  return [
    address?.zipCode,
    address?.street,
    address?.number,
    address?.neighborhood,
    address?.city,
    address?.state,
    address?.complement,
  ].some((value) => String(value ?? "").trim().length > 0);
}

function ensureMainAddress(addresses: AddressType[]): AddressType[] {
  if (!addresses.length) return [];

  const normalized = addresses.map((address) => normalizeAddress(address));
  const firstMain = normalized.findIndex((address) => address.main);

  if (firstMain === -1) {
    normalized[0].main = true;
    return normalized;
  }

  return normalized.map((address, index) => ({
    ...address,
    main: index === firstMain,
  }));
}

function validateAddress(address: AddressType): string | null {
  const zipDigits = String(address.zipCode ?? "").replace(/\D/g, "");
  if (zipDigits.length !== 8) return "Informe um CEP válido com 8 números.";

  if (!address.street) return "Informe a rua.";
  if (!address.number) return "Informe o número.";
  if (!address.neighborhood) return "Informe o bairro.";
  if (!address.city) return "Informe a cidade.";

  const uf = String(address.state ?? "").toUpperCase();
  if (!/^[A-Z]{2}$/.test(uf)) {
    return "Informe a UF com 2 letras.";
  }

  return null;
}

function addressSummary(address: AddressType): string[] {
  return [
    `${address.street || "Rua não informada"}${address.number ? `, ${address.number}` : ""}`,
    address.neighborhood || "Bairro não informado",
    `CEP: ${address.zipCode || "Não informado"}`,
    `${address.city || "Cidade não informada"} | ${address.state || "UF"} - ${address.country || "Brasil"}`,
    address.complement ? `Complemento: ${address.complement}` : "",
  ].filter(Boolean);
}

type EditorMode =
  | { type: "none"; index: null }
  | { type: "create"; index: null }
  | { type: "edit"; index: number };

type LookupMessage = {
  type: "info" | "success" | "error";
  text: string;
};

export default function Enderecos({
  user,
  page,
  HeaderFooter,
}: {
  user: UserType;
  page: any;
  HeaderFooter: any;
}) {
  const api = useMemo(() => new Api(), []);
  const router = useRouter();

  const initialAddresses = (Array.isArray(user?.address) ? user.address : [])
    .map((address) => normalizeAddress(address as AddressType))
    .filter((address) => hasAnyAddressData(address));

  const [addresses, setAddresses] = useState<AddressType[]>(
    ensureMainAddress(initialAddresses)
  );
  const [editor, setEditor] = useState<EditorMode>({ type: "none", index: null });
  const [draft, setDraft] = useState<AddressType>(emptyAddress());
  const [saving, setSaving] = useState(false);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupMessage, setLookupMessage] = useState<LookupMessage>({
    type: "info",
    text: "Digite o CEP para tentar preencher rua, bairro, cidade e UF automaticamente.",
  });

  const lastLookupCepRef = useRef<string>("");
  const numberFieldRef = useRef<HTMLInputElement>(null);

  const completion = addresses.length
    ? Math.round(
        (addresses.filter((address) => !validateAddress(normalizeAddress(address))).length /
          addresses.length) *
          100
      )
    : 0;

  const mainAddress = addresses.find((address) => address.main) ?? addresses[0] ?? null;

  const resetLookupFeedback = () => {
    setLookupMessage({
      type: "info",
      text: "Digite o CEP para tentar preencher rua, bairro, cidade e UF automaticamente.",
    });
  };

  const openCreate = () => {
    setEditor({ type: "create", index: null });
    setDraft(emptyAddress());
    lastLookupCepRef.current = "";
    resetLookupFeedback();
  };

  const openEdit = (index: number) => {
    const current = addresses[index] ?? emptyAddress();
    setEditor({ type: "edit", index });
    setDraft(normalizeAddress(current));
    lastLookupCepRef.current = String(current?.zipCode ?? "").replace(/\D/g, "");
    resetLookupFeedback();
  };

  const copyMainAddress = () => {
    if (!mainAddress) return;

    setDraft({
      ...normalizeAddress(mainAddress),
      main: false,
    });

    const mainZipDigits = String(mainAddress?.zipCode ?? "").replace(/\D/g, "");
    lastLookupCepRef.current = mainZipDigits;

    toast.info("Endereço principal copiado para edição.");
  };

  const duplicateAddress = (address: AddressType) => {
    setEditor({ type: "create", index: null });
    setDraft({
      ...normalizeAddress(address),
      main: false,
    });
    lastLookupCepRef.current = String(address?.zipCode ?? "").replace(/\D/g, "");
    resetLookupFeedback();
  };

  const closeEditor = () => {
    setEditor({ type: "none", index: null });
    setDraft(emptyAddress());
    lastLookupCepRef.current = "";
    resetLookupFeedback();
  };

  const setDraftField = (patch: Partial<AddressType>) => {
    setDraft((previousDraft) => normalizeAddress({ ...previousDraft, ...patch } as AddressType));
  };

  const lookupZipCode = async (zipDigitsInput?: string, fromUserAction = false) => {
    const zipDigits = (
      zipDigitsInput ?? String(draft.zipCode ?? "").replace(/\D/g, "")
    )
      .replace(/\D/g, "")
      .slice(0, 8);

    if (zipDigits.length !== 8) {
      if (fromUserAction) {
        toast.warning("Informe um CEP válido com 8 números para buscar.");
      }
      return;
    }

    setLookupLoading(true);

    try {
      const location: any = await getZipCode(zipDigits);

      if (location?.erro) {
        setLookupMessage({
          type: "error",
          text: "Não encontramos esse CEP. Você pode preencher manualmente.",
        });
        toast.warning("CEP não encontrado.");
        return;
      }

      setDraft((previousDraft) =>
        normalizeAddress({
          ...previousDraft,
          zipCode: formatCep(zipDigits),
          street: previousDraft.street || location?.logradouro || "",
          neighborhood: previousDraft.neighborhood || location?.bairro || "",
          city: previousDraft.city || location?.localidade || "",
          state: (previousDraft.state || location?.uf || "").toUpperCase(),
          country: previousDraft.country || "Brasil",
        } as AddressType)
      );

      setLookupMessage({
        type: "success",
        text: "CEP localizado. Confira o número e finalize o cadastro.",
      });

      window.setTimeout(() => {
        numberFieldRef.current?.focus();
      }, 20);
    } catch {
      setLookupMessage({
        type: "error",
        text: "Não foi possível consultar o CEP agora. Continue com o preenchimento manual.",
      });
      toast.error("Não foi possível consultar o CEP agora.");
    } finally {
      setLookupLoading(false);
    }
  };

  const onZipChange = (value: string) => {
    const zipDigits = value.replace(/\D/g, "").slice(0, 8);
    setDraftField({ zipCode: formatCep(zipDigits) });

    if (zipDigits.length < 8) {
      lastLookupCepRef.current = "";
      if (lookupMessage.type !== "info") {
        resetLookupFeedback();
      }
      return;
    }

    if (zipDigits !== lastLookupCepRef.current) {
      lastLookupCepRef.current = zipDigits;
      lookupZipCode(zipDigits);
    }
  };

  const persistAddresses = async (nextAddresses: AddressType[]) => {
    const normalizedNextAddresses = ensureMainAddress(
      nextAddresses.map((address) => normalizeAddress(address)).filter((address) => hasAnyAddressData(address))
    );

    setSaving(true);

    try {
      const payload: UserType = {
        ...(user ?? {}),
        id: user?.id,
        address: normalizedNextAddresses,
      } as UserType;

      const request: any = await api.bridge({
        method: "post",
        url: "users/update",
        data: payload,
      });

      if (request?.response || request?.data) {
        setAddresses(normalizedNextAddresses);
        toast.success("Endereços atualizados com sucesso.");
        closeEditor();
      } else {
        toast.error("Não foi possível salvar os endereços.");
      }
    } catch {
      toast.error("Falha ao salvar endereços. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  const saveDraft = async () => {
    const normalizedDraft = normalizeAddress(draft);
    const validationError = validateAddress(normalizedDraft);

    if (validationError) {
      toast.warning(validationError);
      return;
    }

    let nextAddresses = [...addresses];
    let targetIndex = nextAddresses.length;

    if (editor.type === "edit" && editor.index !== null) {
      targetIndex = editor.index;
      nextAddresses[targetIndex] = normalizedDraft;
    } else {
      nextAddresses.push(normalizedDraft);
    }

    const shouldSetAsMain = normalizedDraft.main || nextAddresses.length === 1;

    if (shouldSetAsMain) {
      nextAddresses = nextAddresses.map((address, index) => ({
        ...address,
        main: index === targetIndex,
      }));
    }

    nextAddresses = ensureMainAddress(nextAddresses);
    await persistAddresses(nextAddresses);
  };

  const removeAddress = async (index: number) => {
    const target = addresses[index];
    if (!target) return;

    const shouldRemove = window.confirm("Deseja remover este endereço?");
    if (!shouldRemove) return;

    let nextAddresses = addresses.filter((_, currentIndex) => currentIndex !== index);
    nextAddresses = ensureMainAddress(nextAddresses);
    await persistAddresses(nextAddresses);
  };

  const markAsMain = async (index: number) => {
    if (!addresses[index]) return;

    let nextAddresses = addresses.map((address, currentIndex) => ({
      ...address,
      main: currentIndex === index,
    }));

    nextAddresses = ensureMainAddress(nextAddresses);
    await persistAddresses(nextAddresses);
  };

  return (
    !router.isFallback && (
      <Template
        header={{
          template: "default",
          position: "solid",
          content: HeaderFooter,
        }}
      >
        <section>
          <div className="container-medium pt-10 pb-8 md:py-12">
            <div className="pb-4">
              <Breadcrumbs
                links={[
                  { url: "/dashboard", name: "Dashboard" },
                  { url: "/dashboard/enderecos", name: "Endereços" },
                ]}
              />
            </div>

            <div className="flex items-start gap-4">
              <Link passHref href="/dashboard" className="pt-1">
                <Icon icon="fa-long-arrow-left" className="text-2xl text-zinc-900" />
              </Link>
              <div className="w-full">
                <h1 className="font-title font-bold text-3xl md:text-4xl text-zinc-900">Meus endereços</h1>
                <p className="text-sm md:text-base text-zinc-600 mt-2 max-w-2xl leading-relaxed">
                  Salve seus endereços para finalizar pedidos mais rápido. Ao informar o CEP, a plataforma tenta
                  preencher os campos automaticamente.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="container-medium pb-14">
            <div className="grid xl:grid-cols-[minmax(0,1fr),22rem] gap-8 xl:gap-10 items-start">
              <div className="w-full grid gap-5 md:gap-6">
                <div className="rounded-2xl border border-zinc-200 bg-white p-5 md:p-6 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-semibold text-zinc-900">Resumo de endereços</h2>
                      <p className="text-sm text-zinc-600 mt-1">
                        Defina um endereço principal para facilitar o checkout e a entrega.
                      </p>
                    </div>
                    <Button type="button" onClick={openCreate} disable={saving || editor.type !== "none"}>
                      Adicionar endereço
                    </Button>
                  </div>

                  <div className="mt-4 grid sm:grid-cols-3 gap-3">
                    <div className="rounded-xl bg-zinc-50 border border-zinc-200 px-3 py-2.5">
                      <p className="text-xs uppercase tracking-wide text-zinc-500">Total cadastrado</p>
                      <p className="text-lg font-bold text-zinc-900 mt-1">{addresses.length}</p>
                    </div>
                    <div className="rounded-xl bg-zinc-50 border border-zinc-200 px-3 py-2.5">
                      <p className="text-xs uppercase tracking-wide text-zinc-500">Endereço principal</p>
                      <p className="text-sm font-semibold text-zinc-900 mt-1">
                        {mainAddress?.street || "Não definido"}
                      </p>
                    </div>
                    <div className="rounded-xl bg-zinc-50 border border-zinc-200 px-3 py-2.5">
                      <p className="text-xs uppercase tracking-wide text-zinc-500">Cadastro completo</p>
                      <p className="text-lg font-bold text-zinc-900 mt-1">{completion}%</p>
                    </div>
                  </div>
                </div>

                {editor.type !== "none" && (
                  <div className="rounded-2xl border border-zinc-200 bg-white p-5 md:p-6 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-zinc-900">
                          {editor.type === "create" ? "Novo endereço" : `Editar endereço ${editor.index + 1}`}
                        </h3>
                        <p className="text-sm text-zinc-600 mt-1">
                          Comece pelo CEP e depois confirme os demais campos.
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {editor.type === "create" && !!mainAddress && (
                          <Button
                            type="button"
                            style="btn-outline-light"
                            className="px-3 py-2 text-sm"
                            onClick={copyMainAddress}
                            disable={saving}
                          >
                            Copiar endereço principal
                          </Button>
                        )}
                        <Button type="button" style="btn-link" onClick={closeEditor} disable={saving}>
                          Fechar
                        </Button>
                      </div>
                    </div>

                    <div
                      className={`rounded-lg border px-3 py-2.5 text-sm mb-4 ${
                        lookupMessage.type === "success"
                          ? "bg-green-50 border-green-200 text-green-700"
                          : lookupMessage.type === "error"
                            ? "bg-red-50 border-red-200 text-red-700"
                            : "bg-zinc-50 border-zinc-200 text-zinc-600"
                      }`}
                    >
                      {lookupMessage.text}
                    </div>

                    <div className="grid gap-4">
                      <div className="grid md:grid-cols-[1fr,auto] gap-3 items-start">
                        <AddressInput
                          name="zipCode"
                          placeholder="CEP"
                          value={draft.zipCode ?? ""}
                          onChange={(event) => onZipChange(event.target.value)}
                          onBlur={() => lookupZipCode()}
                          maxLength={9}
                          autoComplete="postal-code"
                          inputMode="numeric"
                        />
                        <Button
                          type="button"
                          style="btn-outline-light"
                          className="px-4 py-2.5"
                          onClick={() => lookupZipCode(undefined, true)}
                          disable={lookupLoading}
                        >
                          {lookupLoading ? "Buscando CEP..." : "Buscar CEP"}
                        </Button>
                      </div>

                      <div className="grid md:grid-cols-[1fr,11rem] gap-3">
                        <AddressInput
                          name="street"
                          placeholder="Rua"
                          value={draft.street ?? ""}
                          onChange={(event) => setDraftField({ street: event.target.value })}
                          autoComplete="address-line1"
                        />
                        <AddressInput
                          ref={numberFieldRef}
                          name="number"
                          placeholder="Número"
                          value={String(draft.number ?? "")}
                          onChange={(event) => setDraftField({ number: event.target.value })}
                          autoComplete="address-line2"
                          inputMode="numeric"
                        />
                      </div>

                      <div className="grid md:grid-cols-[1fr,1fr,6rem] gap-3">
                        <AddressInput
                          name="neighborhood"
                          placeholder="Bairro"
                          value={draft.neighborhood ?? ""}
                          onChange={(event) => setDraftField({ neighborhood: event.target.value })}
                          autoComplete="address-level3"
                        />
                        <AddressInput
                          name="city"
                          placeholder="Cidade"
                          value={draft.city ?? ""}
                          onChange={(event) => setDraftField({ city: event.target.value })}
                          autoComplete="address-level2"
                        />
                        <AddressInput
                          name="state"
                          placeholder="UF"
                          value={draft.state ?? ""}
                          maxLength={2}
                          onChange={(event) => setDraftField({ state: event.target.value.toUpperCase() })}
                          autoComplete="address-level1"
                        />
                      </div>

                      <AddressInput
                        name="complement"
                        placeholder="Complemento (opcional)"
                        value={draft.complement ?? ""}
                        onChange={(event) => setDraftField({ complement: event.target.value })}
                        autoComplete="off"
                      />

                      <label className="inline-flex items-center gap-2 text-sm text-zinc-700 select-none">
                        <input
                          type="checkbox"
                          checked={!!draft.main}
                          onChange={(event) => setDraftField({ main: event.target.checked })}
                        />
                        Definir como endereço principal
                      </label>

                      <div className="flex flex-wrap gap-2 pt-1">
                        <Button type="button" style="btn-light" onClick={closeEditor} disable={saving}>
                          Cancelar
                        </Button>
                        <Button type="button" onClick={saveDraft} loading={saving} disable={saving}>
                          Salvar endereço
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {addresses.length > 0 ? (
                  <div className="grid gap-4">
                    {addresses.map((address, index) => {
                      const summary = addressSummary(address);

                      return (
                        <article
                          key={`address-${index}`}
                          className="rounded-2xl border border-zinc-200 bg-white p-5 md:p-6 shadow-sm"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <h4 className="text-lg font-semibold text-zinc-900">Endereço {index + 1}</h4>
                                {address.main && (
                                  <span className="inline-flex items-center rounded-full bg-cyan-100 text-cyan-700 px-2.5 py-1 text-xs font-semibold">
                                    Principal
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-zinc-500 mt-1">Utilizado no checkout para entrega.</p>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              {!address.main && (
                                <Button
                                  type="button"
                                  style="btn-outline-light"
                                  className="px-3 py-2 text-sm"
                                  onClick={() => markAsMain(index)}
                                  disable={saving}
                                >
                                  Tornar principal
                                </Button>
                              )}

                              <Button
                                type="button"
                                style="btn-outline-light"
                                className="px-3 py-2 text-sm"
                                onClick={() => duplicateAddress(address)}
                                disable={saving || editor.type !== "none"}
                              >
                                Reutilizar
                              </Button>

                              <Button
                                type="button"
                                style="btn-light"
                                className="px-3 py-2 text-sm"
                                onClick={() => openEdit(index)}
                                disable={saving || editor.type !== "none"}
                              >
                                Editar
                              </Button>

                              <Button
                                type="button"
                                style="btn-link"
                                className="text-red-600"
                                onClick={() => removeAddress(index)}
                                disable={saving}
                              >
                                Remover
                              </Button>
                            </div>
                          </div>

                          <div className="mt-4 grid gap-1.5 text-sm text-zinc-700">
                            {summary.map((line, lineIndex) => (
                              <p key={`address-${index}-line-${lineIndex}`}>{line}</p>
                            ))}
                          </div>
                        </article>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6 text-center">
                    <p className="text-zinc-700">Você ainda não possui endereços cadastrados.</p>
                    <p className="text-sm text-zinc-500 mt-1">
                      Clique em <strong>Adicionar endereço</strong> para agilizar seus próximos pedidos.
                    </p>
                    <div className="mt-4">
                      <Button type="button" onClick={openCreate}>
                        Adicionar primeiro endereço
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <div className="w-full xl:max-w-[22rem] xl:sticky xl:top-24 grid gap-4">
                <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
                  <h3 className="text-sm font-semibold text-zinc-900">Dicas para preencher rápido</h3>
                  <ul className="mt-2 text-sm text-zinc-600 grid gap-1.5">
                    <li>Digite o CEP completo para preencher automaticamente.</li>
                    <li>Use um endereço principal para reduzir passos no checkout.</li>
                    <li>Quando necessário, use o botão Reutilizar e ajuste só o número.</li>
                  </ul>
                </div>

                <HelpCard list={page?.help_list ?? []} />
              </div>
            </div>
          </div>
        </section>
      </Template>
    )
  );
}
