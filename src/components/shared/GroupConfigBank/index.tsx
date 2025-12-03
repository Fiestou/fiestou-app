import React, { use, useEffect, useState } from 'react';
import ElementsConfig from '../ElementsConfig';
import { Button } from '../../ui/form';
import ArrowUp from '@/src/icons/arrowUp';
import ArrowDown from '@/src/icons/arrowDown';
import { toast } from 'react-toastify';
import Api from '@/src/services/api';
import { BankAccountTypeRecipient, RecipientType, } from '@/src/models/Recipient';
import { getStore } from '@/src/contexts/AuthContext';

interface Props {
    title: string;
    recipientId?: number;
}

const GroupConfigBank: React.FC<Props> = ({ title, recipientId }) => {
    const [open, setOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [contentForm, setContentForm] = useState<BankAccountTypeRecipient>({} as BankAccountTypeRecipient);
    const api = new Api();

    const handleEditClick = () => setEditMode(true);
    const handleCancelEdit = () => setEditMode(false);

    const handleSubmit = async () => {
        try {
            console.log("Submitting form with contentForm:", recipientId);
            if (!recipientId) {
                toast.error("ID do recebedor não encontrado.");
                return;
            }

            const payloadBank: BankAccountTypeRecipient = {
                title: contentForm.title,
                bank: contentForm.bank,
                branch_number: contentForm.branch_number,
                branch_check_digit: contentForm.branch_check_digit,
                account_number: contentForm.account_number,
                account_check_digit: contentForm.account_check_digit,
            };

            // Atualiza dados bancários do recebedor
            const responseBank = await api.bridge<any>({
                method: "put",
                url: `info/recipient/${recipientId}/bank`,
                data: payloadBank
            });

            if (!responseBank?.success) {
                toast.error("Erro ao atualizar dados bancários.");
                return;
            }

            // resolve store id from context (getStore()) or fallback to recipientId
            const storeId = getStore() || recipientId;

            // Try the new endpoint POST /withdraw/{storeId} first
            const checkWithdraw = await api.bridge<any>({
                method: "post",
                url: `/withdraw/${storeId}`,
            });

            // normalize withdraw data from multiple possible response shapes
            const withdrawData =
                checkWithdraw?.data ?? checkWithdraw?.data?.data ?? checkWithdraw?.data?.[0] ?? null;

            const payloadWithdraw = {
                store: storeId,
                split_payment: 1,
                bankAccount: payloadBank,
                is_split: 1,
            };

            if (withdrawData && withdrawData.code) {
                const updateWithdraw = await api.bridge<any>({
                    method: "put",
                    url: `/withdraw/update`,
                    data: {
                        code: withdrawData.code,
                        status: 1,
                        bankAccount: payloadBank,
                    },
                });

                if (updateWithdraw?.response) {
                    toast.success("Saque atualizado com sucesso!");
                } else {
                    toast.error("Erro ao atualizar saque.");
                }
            } else {
                const createWithdraw = await api.bridge<any>({
                    method: "post",
                    url: "/withdraw/register",
                    data: payloadWithdraw,
                });

                if (createWithdraw?.success || createWithdraw?.response) {
                    toast.success("Saque criado com sucesso!");
                } else {
                    toast.error("Erro ao criar saque.");
                }
            }

            setEditMode(false);
        } catch (error) {
            console.error("Erro ao salvar:", error);
            toast.error("Erro inesperado ao salvar dados.");
        }
    };

    useEffect(() => {
        const fetchWithdrawData = async () => {
            try {
                const storeId = getStore();

                const checkWithdraw = await api.bridge<any>({
                    method: "get",
                    url: `/withdraw/${storeId}`,
                });
                console.log("checkWithdraw:", checkWithdraw);

                const withdrawData = checkWithdraw[0]?.data ?? checkWithdraw?.data?.data ?? checkWithdraw?.data?.[0] ?? null;

                console.log("withdrawData:", withdrawData?.account_number);

                const bankAccountRaw = withdrawData?.account_number || withdrawData?.account_number || null;

                console.log("bankAccountRaw:", bankAccountRaw);

                if (bankAccountRaw) {
                    const bankAccount = typeof bankAccountRaw === "string" ? JSON.parse(bankAccountRaw) : bankAccountRaw;

                    console.log("bankAccount parsed:", bankAccount);

                    setContentForm({
                        title: bankAccount.title ?? "",
                        bank: bankAccount.bank ?? "",
                        branch_number: bankAccount.branch_number ?? bankAccount.branch_number ?? "",
                        branch_check_digit: bankAccount.branch_check_digit ?? "",
                        account_number: bankAccount.account_number ?? "",
                        account_check_digit: bankAccount.account_check_digit ?? "",
                    });
                }
            } catch (err) {
                console.error("Erro ao buscar saque:", err);
            }
        };

        fetchWithdrawData();
    }, []);

    useEffect(() => {
        console.log("contentForm updated:", contentForm);
    }, [contentForm]);

    return (
        <div className="border-b pb-8 mb-0">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold cursor-pointer w-full" onClick={() => setOpen(!open)}>
                    {title}
                </h2>
                <div className="flex justify-center items-center gap-5 relative">
                    <div className="absolute right-[199%] z-20">
                        {!editMode ? (
                            <Button onClick={handleEditClick} type="button" style="btn-link">
                                Editar
                            </Button>
                        ) : (
                            <>
                                <Button onClick={handleCancelEdit} type="button" style="btn-link">
                                    Cancelar
                                </Button>
                                <Button onClick={handleSubmit} type="button" style="btn-primary">
                                    Salvar
                                </Button>
                            </>
                        )}
                    </div>
                    <span className="text-sm font-medium cursor-pointer" onClick={() => setOpen(!open)}>
                        {open ? <ArrowUp /> : <ArrowDown />}
                    </span>
                </div>
            </div>

            {open && (
                <div className="mt-6 flex flex-col gap-8">
                    <ElementsConfig
                        title="Nome do titular da conta"
                        value={contentForm?.title}
                        editmode={editMode}
                        type="string"
                        handleValueEdit={value => setContentForm({ ...contentForm, title: value })}
                    />

                    <ElementsConfig
                        title="Código do banco"
                        value={contentForm?.bank}
                        editmode={editMode}
                        type="string"
                        handleValueEdit={value => setContentForm({ ...contentForm, bank: value })}
                    />

                    <ElementsConfig
                        title="Número da agência"
                        value={contentForm?.branch_number}
                        editmode={editMode}
                        type="string"
                        handleValueEdit={value => setContentForm({ ...contentForm, branch_number: value })}
                    />

                    <ElementsConfig
                        title="Dígito da agência"
                        value={contentForm?.branch_check_digit}
                        editmode={editMode}
                        type="string"
                        handleValueEdit={value => setContentForm({ ...contentForm, branch_check_digit: value })}
                    />

                    <ElementsConfig
                        title="Número da conta"
                        value={contentForm?.account_number}
                        editmode={editMode}
                        type="string"
                        handleValueEdit={value => setContentForm({ ...contentForm, account_number: value })}
                    />

                    <ElementsConfig
                        title="Dígito verificador da conta"
                        value={contentForm?.account_check_digit}
                        editmode={editMode}
                        type="string"
                        handleValueEdit={value => setContentForm({ ...contentForm, account_check_digit: value })}
                    />
                </div>
            )}
        </div>
    );
};

export default GroupConfigBank;
