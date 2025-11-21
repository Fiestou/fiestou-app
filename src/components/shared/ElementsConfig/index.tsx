import React from 'react';
import { formatCpfCnpj, formatName, formatPhone } from '../../utils/FormMasks';
import { formatDate } from '@/src/helper';

interface Props {
    title: string;
    value: string | number | null | undefined; // aceita null também
    editmode?: boolean;
    type: 'phone' | 'document' | 'number' | 'string' | 'date';
    handleValueEdit: (value: any) => void;
}

const formatValue = (
  type: Props['type'],
  value: string | number | null | undefined
): string => {
  if (value === undefined || value === null) return "";

  const strValue = String(value); // força string aqui

  switch (type) {
    case 'phone':
      return formatPhone(strValue);
    case 'document':
      return formatCpfCnpj(strValue);
    case 'number':
      return strValue;
    case 'string':
      return formatName(strValue);
    case 'date':
      return formatDate(strValue);
    default:
      return strValue;
  }
};

const ElementsConfig: React.FC<Props> = (props) => {
    const hasValue =
        props.value !== undefined &&
        props.value !== null &&
        props.value.toString().trim() !== "";

    // valor que vai para o input
    const inputValue =
        props.type === 'date'
            ? (props.value ? String(props.value).split('T')[0] : '')
            : (props.value ?? "");

    const inputType =
        props.type === 'date'
            ? 'date'
            : 'text';

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
                    <span className="">
                        {props.title === "Renda mensal"
                            ? `R$ ${props.value}`                        // aqui entra o R$
                            : formatValue(props.type, props.value ?? "")}
                    </span>
                ) : (
                    <span className="text-red-500">Não Preenchido</span>
                )}
            </div>
        </div>
    );
};

export default ElementsConfig;
