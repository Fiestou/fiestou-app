import React, { use, useEffect, useState } from 'react';
import ElementsConfig from '../ElementsConfig';
import { Button } from '../../ui/form';
import ArrowUp from '@/src/icons/arrowUp';
import ArrowDown from '@/src/icons/arrowDown';
import { getStore } from '@/src/contexts/AuthContext';
import { RecipientType } from '@/src/models/Recipient';
import Api from "@/src/services/api";
import { toast } from 'react-toastify';

interface Props {
    title?: string;
    content?: RecipientType;
}

const GroupConfigBasicUser: React.FC<Props> = ({ title, content }) => {
    const [editMode, setEditMode] = useState(false);
    const [phoneInput, setPhoneInput] = useState('');
    const [contentForm, setContentForm] = useState<RecipientType>({
        recipient: null,
        id: 0,
        partner_id: null,
        code: '',
        type_enum: '',
        email: '',
        document: '',
        type: 'individual',
        company_name: null,
        trading_name: null,
        annual_revenue: null,
        name: '',
        birth_date: '',
        monthly_income: '',
        professional_occupation: null,
        store_id: 0,
        created_at: '',
        updated_at: '',
        addresses: [{
            id: 0,
            street: '',
            complementary: '',
            street_number: '',
            neighborhood: '',
            city: '',
            state: '',
            zip_code: '',
            reference_point: ''
        }],
        phones: [{
            id: 0,
            area_code: '',
            number: ''
        }],
        config: {},
        partners: []
    });
    const api = new Api();
    const handleEditClick = () => setEditMode(true);
    const handleCancelEdit = () => setEditMode(false);

    useEffect(() => {
        if (content) {
            setContentForm(prev => ({
                ...prev,
                ...content,
                phones: content.phones?.length ? content.phones : prev.phones,
                addresses: content.addresses?.length ? content.addresses : prev.addresses,
            }));

            if (content.phones?.[0]?.area_code && content.phones?.[0]?.number) {
                const formatted = `(${content.phones[0].area_code}) ${content.phones[0].number.replace(/^(\d{5})(\d{4})$/, "$1-$2")}`;
                setPhoneInput(formatted);
            }
        }
    }, [content]);

    const handleSubmit = async () => {
        try {
            if (!contentForm?.id) {
                console.warn("Recipient ainda não cadastrado no Pagar.me");
                toast.warning("Para editar esses dados, primeiro conclua o cadastro no Pagar.me clicando em 'Concluir cadastro agora'.");
                return;
            }

            const phone = contentForm?.phones?.[0] ?? { area_code: "", number: "", id: undefined };

            const payload = {
                email: contentForm.email,
                monthly_income: contentForm.monthly_income,
                phone: {
                    id: phone.id,
                    area_code: phone.area_code,
                    number: phone.number,
                }
            };

            console.log("Payload enviado:", contentForm.id);

            const response = await api.bridge({
                method: "put",
                url: `info/recipient/${contentForm.id}/update`,
                data: payload,
            });

            if (response) {
                toast("Ususario atualizado com sucesso!");
                setEditMode(false);
            } else {
                toast("Erro ao atualizar.");
            }
        } catch (error) {
            console.error("Erro ao salvar:", error);
            alert("Erro inesperado.");
        }
    };

    return (
        <div className="border-b pb-8 mb-0">
            <div className="flex justify-between items-center">
                <h2 className='text-2xl font-semibold cursor-pointer w-full'>
                    {title}
                </h2>
                <div className="flex justify-center items-center gap-5 relative mt-5">
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
                </div>
            </div>
            <div>
                <div className="mt-6 flex flex-col gap-8">
                    <ElementsConfig
                        title="Código do recebedor"
                        value={content?.code ?? undefined}
                        type="string"
                        handleValueEdit={value => setContentForm({ ...contentForm, code: value })}
                    />

                    <ElementsConfig
                        title="E-mail"
                        value={contentForm.email}
                        editmode={editMode}
                        type="string"
                        handleValueEdit={value => setContentForm({ ...contentForm, email: value })}
                    />
                    <ElementsConfig
                        title="Telefone"
                        value={phoneInput}
                        editmode={editMode}
                        type="string"
                        handleValueEdit={value => {
                            setPhoneInput(value); // deixa o input digitar livremente

                            const match = value.match(/\((\d{2})\)\s*(\d{4,5})-?(\d{4})/);
                            if (match) {
                                const area_code = match[1];
                                const number = `${match[2]}${match[3]}`;

                                const updatedPhones = [...(contentForm.phones ?? [])];
                                if (updatedPhones.length > 0) {
                                    updatedPhones[0] = {
                                        ...updatedPhones[0],
                                        area_code,
                                        number,
                                    };
                                } else {
                                    updatedPhones.push({ area_code, number });
                                }

                                setContentForm({ ...contentForm, phones: updatedPhones });
                            }
                        }}
                    />


                </div>
            </div>
        </div>
    );
};

export default GroupConfigBasicUser;
