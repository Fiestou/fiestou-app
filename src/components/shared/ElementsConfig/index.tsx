import React from 'react';
import { formatCpfCnpj, formatName, formatPhone } from '../../utils/FormMasks';

interface Props {
    title: string;
    value: string | undefined;
    editmode?: boolean;
    type: 'phone' | 'document' | 'number' | 'string';
    handleValueEdit: (value: any) => void;
}

const formatValue = (type: Props['type'], value: string | undefined): string => {
    if (value === undefined || value === null) return "";

    const strValue = String(value); // <-- força string aqui

    switch (type) {
        case 'phone':
            return formatPhone(strValue);
        case 'document':
            return formatCpfCnpj(strValue);
        case 'number':
            return strValue; // ou formatação de moeda, se quiser
        case 'string':
            return formatName(strValue);
        default:
            return strValue;
    }
};

const ElementsConfig: React.FC<Props> = (props) => {
    const hasValue =
        props.value !== undefined &&
        props.value !== null &&
        props.value.toString().trim() !== "";

    return (
        <div className="grid gap-4 ">
            <div className="flex items-center">
                <div className="w-full">
                    <h4 className="text-lg leading-tight text-zinc-800">
                        {props.title}
                    </h4>
                </div>
            </div>
            <div className="w-full text-sm md:text-base">
                {props.editmode ? (
                    <input
                        className="border border-black/15 p-3 w-7/12"
                        name={props.type}
                        type="text"
                        value={props.value ?? ""}
                        onChange={(e) => props.handleValueEdit(e.target.value)}
                    />
                ) : hasValue ? (
                    <span className="">{formatValue(props.type, props.value ?? "")}</span>
                ) : (
                    <span className="text-red-500">Não Preenchido</span>
                )}
            </div>
        </div>
    );
};

export default ElementsConfig;
