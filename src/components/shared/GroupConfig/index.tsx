import React, { useState } from 'react';
import ElementsConfig from '../ElementsConfig';
import { Button } from '../../ui/form';
import ArrowUp from '@/src/icons/arrowUp';
import ArrowDown from '@/src/icons/arrowDown';

interface Props {
    title: string;
    content?: {
        autoTransfer?: string;
        transferFrequency?: string;
        transferDay?: string;
        autoAdvance?: string;
        advanceType?: string;
        advanceVolume?: string;
        advanceDays?: string;
    };
}

const GroupConfig: React.FC<Props> = ({ title, content }) => {
    const [open, setOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [contentForm, setContentForm] = useState(content ?? {});

    const handleEditClick = () => setEditMode(true);
    const handleCancelEdit = () => setEditMode(false);

    return (
        <div className="border-b pb-8 mb-0">
            <div className="flex justify-between items-center">
                <h2
                    className="text-2xl font-semibold cursor-pointer w-full"
                    onClick={() => setOpen(!open)}
                >
                    {title}
                </h2>
                <div className="flex justify-center items-center gap-5 relative">
                   
                    <span
                        className="text-sm font-medium cursor-pointer"
                        onClick={() => setOpen(!open)}
                    >
                        {open ? <ArrowUp /> : <ArrowDown />}
                    </span>
                </div>
            </div>

            {open && (
                <div className="mt-6 flex flex-col gap-10">
                    <div className="flex flex-col gap-4">
                        <h3 className="text-lg font-semibold">Transferência</h3>

                        <ElementsConfig
                            title="O recebedor receberá seus pagamentos automaticamente"
                            value={contentForm.autoTransfer}
                            editmode={editMode}
                            type="string"
                            handleValueEdit={(value) => setContentForm({ ...contentForm, autoTransfer: value })}
                        />
                        <ElementsConfig
                            title="Frequência das transferências automáticas para o recebedor"
                            value={contentForm.transferFrequency}
                            editmode={editMode}
                            type="string"
                            handleValueEdit={(value) => setContentForm({ ...contentForm, transferFrequency: value })}
                        />
                        <ElementsConfig
                            title="Dia em que ocorrerá as transferências automáticas"
                            value={contentForm.transferDay}
                            editmode={editMode}
                            type="string"
                            handleValueEdit={(value) => setContentForm({ ...contentForm, transferDay: value })}
                        />
                    </div>

                    <hr className="w-32" />

                    <div className="flex flex-col gap-4">
                        <h3 className="text-lg font-semibold">Antecipação</h3>

                        <ElementsConfig
                            title="O recebedor receberá antecipações automaticamente"
                            value={contentForm.autoAdvance}
                            editmode={editMode}
                            type="string"
                            handleValueEdit={(value) => setContentForm({ ...contentForm, autoAdvance: value })}
                        />
                        <ElementsConfig
                            title="Antecipação automática"
                            value={contentForm.advanceType}
                            editmode={editMode}
                            type="string"
                            handleValueEdit={(value) => setContentForm({ ...contentForm, advanceType: value })}
                        />
                        <ElementsConfig
                            title="Volume passível de ser antecipado para o recebedor"
                            value={contentForm.advanceVolume}
                            editmode={editMode}
                            type="string"
                            handleValueEdit={(value) => setContentForm({ ...contentForm, advanceVolume: value })}
                        />
                        <ElementsConfig
                            title="Dias em que ocorrerá as antecipações automáticas"
                            value={contentForm.advanceDays}
                            editmode={editMode}
                            type="string"
                            handleValueEdit={(value) => setContentForm({ ...contentForm, advanceDays: value })}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default GroupConfig;
