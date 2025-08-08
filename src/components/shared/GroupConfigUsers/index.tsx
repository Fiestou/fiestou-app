import React, { useEffect, useState } from 'react';
import ElementsConfig from '../ElementsConfig';
import { Button } from '../../ui/form';
import ArrowUp from '@/src/icons/arrowUp';
import ArrowDown from '@/src/icons/arrowDown';
import { UserType } from '@/src/models/user';
import { RecipientType } from '@/src/models/Recipient';
import Api from '@/src/services/api';
import { toast } from 'react-toastify';

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
            const address = contentForm?.addresses?.[0] ?? {};
            const phone = contentForm?.phones?.[0] ?? {};

            if (!contentForm.id) {
                console.error("ID do recebedor está undefined!");
                alert("Erro interno: ID do recebedor não encontrado.");
                return;
            }

            const payload = {
                name: contentForm.name,
                birth_date: contentForm.birth_date,
                monthly_income: contentForm.monthly_income,
                professional_occupation: contentForm.professional_occupation,
                address: {
                    id: address.id,
                    street: address.street,
                    street_number: address.street_number,
                    neighborhood: address.neighborhood,
                    complementary: address.complementary,
                    state: address.state,
                    city: address.city,
                    zip_code: address.zip_code,
                    reference_point: address.reference_point
                }
            };

            const response = await api.bridge<any>({
                method: "put",
                url: `info/recipient/${contentForm.id}/update`,
                data: payload,
            });

            if (response?.success) {
                toast.success("Dados atualizados com sucesso!");
                setEditMode(false);
            } else {
                toast.error("Erro ao atualizar os dados.");
            }
        } catch (error) {
            console.error("Erro ao salvar:", error);
            alert("Erro inesperado.");
        }
    };

    return (
        <div className="border-b pb-8 mb-0">
            <div className="flex justify-between items-center">
                <h2 className='text-2xl font-semibold cursor-pointer w-full' onClick={() => setOpen(!open)}>
                    {title}
                </h2>
                <div className="flex justify-center items-center gap-5 relative">
                    <div className="absolute right-[199%] z-20">
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
                                style="btn-primary"
                            >
                                Salvar
                            </Button>
                        )}
                    </div>
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
                            type="string"
                            handleValueEdit={value => setContentForm({ ...contentForm, birth_date: value })}
                        />

                        <ElementsConfig
                            title="Renda mensal"
                            value={"R$ " + (contentForm?.monthly_income ?? "")}
                            editmode={editMode}
                            type="number"
                            handleValueEdit={value => setContentForm({ ...contentForm, monthly_income: value })}
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