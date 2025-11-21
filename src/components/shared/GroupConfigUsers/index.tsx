import React, { useEffect, useState } from 'react';
import ElementsConfig from '../ElementsConfig';
import { Button } from '../../ui/form';
import ArrowUp from '@/src/icons/arrowUp';
import ArrowDown from '@/src/icons/arrowDown';
import { UserType } from '@/src/models/user';

import Api from '@/src/services/api';
import { toast } from 'react-toastify';
import { RecipientType, UpdateRecipientResponse} from '@/src/models/Recipient';

interface Props {
    title: string;
    content?: RecipientType;
}

const GroupConfigUsers: React.FC<Props> = ({ title, content }) => {
    const [open, setOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [contentForm, setContentForm] = useState(content as RecipientType);
    const api = new Api();

    useEffect(() => {
        if (content) {
            setContentForm(prev => ({
                ...prev,
                ...content,
                addresses: content.addresses?.length ? content.addresses : prev.addresses,
                phones: content.phones?.length ? content.phones : prev.phones,
            }));
        }
    }, [content]);

    const handleEditClick = () => {
        setEditMode(true);
    };

    const handleCancelEdit = () => {
        setEditMode(false);
    };

    const handleSubmit = async () => {
        try {
            const address = contentForm?.addresses?.[0];

            if (!contentForm?.id) {
                console.error("ID do recebedor está undefined!");
                alert("Erro interno: ID do recebedor não encontrado.");
                return;
            }

            // normaliza birth_date → "2001-10-04"
            const birthDate =
                contentForm.birth_date && contentForm.birth_date.trim() !== ""
                    ? contentForm.birth_date.split("T")[0] // se vier "2001-10-04T00:00:00.000000Z"
                    : null;

            // trata monthly_income:
            // - "" -> null
            // - "2500" -> 2500
            // - "2.500,00" / "R$ 2.500,00" (se um dia vier assim) -> 2500.00
            let monthlyIncome: number | null = null;
            if (
                contentForm.monthly_income !== null &&
                contentForm.monthly_income !== undefined
            ) {
                const raw = String(contentForm.monthly_income).trim();
                if (raw !== "") {
                    const numeric = Number(
                        raw
                            .replace(/[^\d,,-.]/g, "") // tira R$, espaço, etc
                            .replace(/\./g, "") // tira pontos de milhar
                            .replace(",", ".") // vírgula pra decimal
                    );
                    monthlyIncome = isNaN(numeric) ? null : numeric;
                }
            }

            const payload = {
                name: contentForm.name,
                birth_date: birthDate,
                monthly_income: monthlyIncome,
                professional_occupation: contentForm.professional_occupation,
                address: address
                    ? {
                        id: address.id,
                        street: address.street,
                        street_number: address.street_number,
                        neighborhood: address.neighborhood,
                        complementary: address.complementary,
                        state: address.state,
                        city: address.city,
                        zip_code: address.zip_code,
                        reference_point: address.reference_point,
                    }
                    : null,
            };

            const response = await api.bridge<UpdateRecipientResponse>({
                method: "put",
                url: `info/recipients/${contentForm.id}`,
                data: payload,
            });

            if (response?.response) {
                toast.success("Dados atualizados com sucesso!");
                setEditMode(false);

                // se quiser atualizar o form com o que voltou do backend:
                // if (response.data) {
                //   setContentForm(response.data);
                // }
            } else {
                toast.error(response.response ?? "Erro ao atualizar os dados.");
            }
        } catch (error) {
            console.error("Erro ao salvar:", error);
            alert("Erro inesperado ao salvar os dados do recebedor.");
        }
    };

    return (
        <div className="border-b pb-8 mb-0">
            <div className="flex items-center">
                <h2
                    className="text-2xl font-semibold cursor-pointer"
                    onClick={() => setOpen(!open)}
                >
                    {title}
                </h2>

                {/* empurra tudo isso pra direita */}
                <div className="flex items-center gap-3 ml-auto">
                    {!editMode ? (
                        <Button
                            onClick={handleEditClick}
                            type="button"
                            style="btn-link"
                        >
                            Editar
                        </Button>
                    ) : (
                        <Button
                            onClick={handleCancelEdit}
                            type="button"
                            style="btn-link"
                        >
                            Cancelar
                        </Button>
                    )}

                    {editMode && (
                        <Button
                            onClick={handleSubmit}
                            type="button"
                            style="btn-yellow"
                        >
                            Salvar
                        </Button>
                    )}

                    <span
                        className="text-sm font-medium cursor-pointer"
                        onClick={() => setOpen(!open)}
                    >
                        {open ? <ArrowUp /> : <ArrowDown />}
                    </span>
                </div>
            </div>
            {open && (
                <div>
                    <div className="mt-6 flex flex-col gap-8">
                        <h3 className="font-bold mb-2 text-lg">Dados</h3>

                        <ElementsConfig
                            title="Nome do Recebedor"
                            value={contentForm?.name}
                            editmode={editMode}
                            type="string"
                            handleValueEdit={value => setContentForm({ ...contentForm, name: value })}
                        />

                        <ElementsConfig
                            title="Data de nascimento"
                            value={contentForm?.birth_date}
                            editmode={editMode}
                            type="date"
                            handleValueEdit={value =>
                                setContentForm({ ...contentForm, birth_date: value })
                            }
                        />

                        <ElementsConfig
                            title="Renda mensal"
                            value={contentForm?.monthly_income ?? ""} // sem "R$ "
                            editmode={editMode}
                            type="number"
                            handleValueEdit={value =>
                                setContentForm({ ...contentForm, monthly_income: value })
                            }
                        />

                        <ElementsConfig
                            title="Ocupação profissional"
                            value={contentForm?.professional_occupation ?? ""}
                            editmode={editMode}
                            type="string"
                            handleValueEdit={value => setContentForm({ ...contentForm, professional_occupation: value })}
                        />
                    </div>
                    <hr className="my-4 w-32" />
                    <div className="mt-6 flex flex-col gap-8">
                        <h3 className="font-bold mb-2">Endereço</h3>
                        <ElementsConfig
                            title="Rua"
                            value={contentForm?.addresses?.[0]?.street ?? ""}
                            editmode={editMode}
                            type="string"
                            handleValueEdit={value =>
                                setContentForm({
                                    ...contentForm,
                                    addresses: [
                                        {
                                            ...contentForm.addresses?.[0],
                                            street: value
                                        }
                                    ]
                                })
                            }
                        />

                        <ElementsConfig
                            title="Número"
                            value={contentForm?.addresses?.[0]?.street_number ?? ""}
                            editmode={editMode}
                            type="string"
                            handleValueEdit={value =>
                                setContentForm({
                                    ...contentForm,
                                    addresses: [
                                        {
                                            ...contentForm.addresses?.[0],
                                            street_number: value
                                        }
                                    ]
                                })
                            }
                        />

                        <ElementsConfig
                            title="Bairro"
                            value={contentForm?.addresses?.[0]?.neighborhood ?? ""}
                            editmode={editMode}
                            type="string"
                            handleValueEdit={value =>
                                setContentForm({
                                    ...contentForm,
                                    addresses: [
                                        {
                                            ...contentForm.addresses?.[0],
                                            neighborhood: value
                                        }
                                    ]
                                })
                            }
                        />

                        <ElementsConfig
                            title="Complemento"
                            value={contentForm?.addresses?.[0]?.complementary ?? ""}
                            editmode={editMode}
                            type="string"
                            handleValueEdit={value =>
                                setContentForm({
                                    ...contentForm,
                                    addresses: [
                                        {
                                            ...contentForm.addresses?.[0],
                                            complementary: value
                                        }
                                    ]
                                })
                            }
                        />

                        <ElementsConfig
                            title="Estado"
                            value={contentForm?.addresses?.[0]?.state ?? ""}
                            editmode={editMode}
                            type="string"
                            handleValueEdit={value =>
                                setContentForm({
                                    ...contentForm,
                                    addresses: [
                                        {
                                            ...contentForm.addresses?.[0],
                                            state: value
                                        }
                                    ]
                                })
                            }
                        />

                        <ElementsConfig
                            title="Cidade"
                            value={contentForm?.addresses?.[0]?.city ?? ""}
                            editmode={editMode}
                            type="string"
                            handleValueEdit={value =>
                                setContentForm({
                                    ...contentForm,
                                    addresses: [
                                        {
                                            ...contentForm.addresses?.[0],
                                            city: value
                                        }
                                    ]
                                })
                            }
                        />

                        <ElementsConfig
                            title="CEP"
                            value={contentForm?.addresses?.[0]?.zip_code ?? ""}
                            editmode={editMode}
                            type="string"
                            handleValueEdit={value =>
                                setContentForm({
                                    ...contentForm,
                                    addresses: [
                                        {
                                            ...contentForm.addresses?.[0],
                                            zip_code: value
                                        }
                                    ]
                                })
                            }
                        />

                        <ElementsConfig
                            title="Ponto de referência"
                            value={contentForm?.addresses?.[0]?.reference_point ?? ""}
                            editmode={editMode}
                            type="string"
                            handleValueEdit={value =>
                                setContentForm({
                                    ...contentForm,
                                    addresses: [
                                        {
                                            ...contentForm.addresses?.[0],
                                            reference_point: value
                                        }
                                    ]
                                })
                            }
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default GroupConfigUsers;
