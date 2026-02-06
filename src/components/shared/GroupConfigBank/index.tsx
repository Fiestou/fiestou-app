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
    initialData?: BankAccountTypeRecipient;
}

const GroupConfigBank: React.FC<Props> = ({ title, recipientId, initialData }) => {
    const [open, setOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [contentForm, setContentForm] = useState<BankAccountTypeRecipient>({} as BankAccountTypeRecipient);
    const api = new Api();

    const handleEditClick = () => setEditMode(true);
    const handleCancelEdit = () => setEditMode(false);

    const handleSubmit = async () => {
        try {
            if (!recipientId) {
                toast.warning("Para editar esses dados, primeiro conclua o cadastro no Pagar.me clicando em 'Concluir cadastro agora'.");
                return;
            }

            const storeId = getStore();
            if (!storeId) {
                toast.error("Loja não encontrada.");
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

            const checkWithdraw = await api.bridge<any>({
                method: "get",
                url: `/withdraw/${storeId}`,
            });

            const withdrawData = checkWithdraw?.[0] ?? checkWithdraw?.data?.[0] ?? null;

            if (withdrawData && withdrawData.id) {
                const updateWithdraw = await api.bridge<any>({
                    method: "post",
                    url: "/withdraw/update",
                    data: {
                        id: withdrawData.id,
                        store: storeId,
                        ...payloadBank,
                        holder_name: payloadBank.title,
                    },
                });

                if (updateWithdraw?.response) {
                    toast.success("Dados bancários atualizados!");
                } else {
                    toast.error("Erro ao atualizar dados bancários.");
                }
            } else {
                const createWithdraw = await api.bridge<any>({
                    method: "post",
                    url: "/withdraw/register",
                    data: {
                        store: storeId,
                        recipient_id: recipientId,
                        ...payloadBank,
                        holder_name: payloadBank.title,
                        split_payment: 1,
                        is_split: 1,
                    },
                });

                if (createWithdraw?.response) {
                    toast.success("Dados bancários salvos!");
                } else {
                    toast.error("Erro ao salvar dados bancários.");
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

                const withdrawData = checkWithdraw?.[0] ?? checkWithdraw?.data?.[0] ?? checkWithdraw?.data ?? null;

                if (withdrawData?.bank || withdrawData?.holder_name) {
                    setContentForm({
                        title: withdrawData.holder_name ?? "",
                        bank: withdrawData.bank ?? "",
                        branch_number: withdrawData.branch_number ?? "",
                        branch_check_digit: withdrawData.branch_check_digit ?? "",
                        account_number: withdrawData.account_number ?? "",
                        account_check_digit: withdrawData.account_check_digit ?? "",
                    });
                } else if (withdrawData?.bankAccount) {
                    const bankAccount = typeof withdrawData.bankAccount === "string"
                        ? JSON.parse(withdrawData.bankAccount)
                        : withdrawData.bankAccount;

                    setContentForm({
                        title: bankAccount.title ?? bankAccount.holder_name ?? "",
                        bank: bankAccount.bank ?? "",
                        branch_number: bankAccount.branch_number ?? bankAccount.agence ?? "",
                        branch_check_digit: bankAccount.branch_check_digit ?? bankAccount.agenceDigit ?? "",
                        account_number: bankAccount.account_number ?? bankAccount.accountNumber ?? "",
                        account_check_digit: bankAccount.account_check_digit ?? bankAccount.accountDigit ?? "",
                    });
                } else if (initialData) {
                    // Usa dados iniciais como fallback
                    setContentForm({
                        title: initialData.title ?? initialData.holder_name ?? "",
                        bank: initialData.bank ?? "",
                        branch_number: initialData.branch_number ?? "",
                        branch_check_digit: initialData.branch_check_digit ?? "",
                        account_number: initialData.account_number ?? "",
                        account_check_digit: initialData.account_check_digit ?? "",
                    });
                }
            } catch (err) {
                console.error("Erro ao buscar saque:", err);
                // Em caso de erro, usa dados iniciais como fallback
                if (initialData) {
                    setContentForm({
                        title: initialData.title ?? initialData.holder_name ?? "",
                        bank: initialData.bank ?? "",
                        branch_number: initialData.branch_number ?? "",
                        branch_check_digit: initialData.branch_check_digit ?? "",
                        account_number: initialData.account_number ?? "",
                        account_check_digit: initialData.account_check_digit ?? "",
                    });
                }
            }
        };

        fetchWithdrawData();
    }, [initialData]);

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
