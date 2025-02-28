import { useState } from "react";

/* Phone Mask */
export const formatPhone = (value: string): string => {
  value = value.replace(/\D/g, ""); // Remove tudo que não é dígito

  // Limita o número de dígitos a 11 (formato de celular no Brasil)
  if (value.length > 11) {
    value = value.slice(0, 11);
  }

  if (value.length > 0) {
    // Formatar progressivamente conforme o usuário digita
    if (value.length <= 2) {
      // Início do DDD
      return value;
    } else if (value.length <= 7) {
      // DDD + início do número
      return `(${value.slice(0, 2)}) ${value.slice(2)}`;
    } else if (value.length <= 11) {
      // Formato padrão celular
      const areaCode = value.slice(0, 2); // DDD
      const firstPart = value.slice(2, 7); // Primeira parte do número
      const secondPart = value.slice(7); // Segunda parte do número

      // Formato final: (XX) XXXXX-XXXX
      return `(${areaCode}) ${firstPart}${secondPart ? `-${secondPart}` : ''}`;
    }
  }

  return value;
};

/* Mask for CPF/CNPJ */
export const formatCpfCnpj = (value: string): string => {
  value = value.replace(/\D/g, ""); /* Removes all non-digit characters */

  if (value.length === 11) {
    return value.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4"); /* CPF */
  } else if (value.length === 14) {
    return value.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5"); /* CNPJ */
  }

  return value;
};

/* CPF/CNPJ Validation */
export const validateCpfCnpj = (value: string): boolean => {
  return /^\d{11}$/.test(value) || /^\d{14}$/.test(value); /* Valid CPF or CNPJ */
};

/* Mask for CEP */
export const formatCep = (value: string): string => {
  value = value.replace(/\D/g, ""); /* Removes all non-digit characters */

  if (value.length === 8) {
    return value.replace(/^(\d{5})(\d{3})$/, "$1-$2"); /* CEP format */
  }

  return value;
};

/* Name Formatting (first letter uppercase) */
export const formatName = (value: string): string => {
  return value
    .toLowerCase() /* Converts everything to lowercase */
    .split(" ") /* Splits into words */
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) /* First letter uppercase */
    .join(" "); /* Joins the words again */
};

/* Email Validation */
export const validateEmail = (email: string): boolean => {
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(email);
};

/* Mask Component */
const MaskComponent = () => {
  const [phone, setPhone] = useState("");
  const [cpfCnpj, setCpfCnpj] = useState("");
  const [cep, setCep] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  return (
    <div>
      {/* Phone Field */}
      <div>
        <label>Telefone</label>
        <input
          type="text"
          value={phone}
          onChange={(e) => setPhone(formatPhone(e.target.value))}
          placeholder="(00) 00000-0000"
        />
      </div>

      {/* CPF/CNPJ Field */}
      <div>
        <label>CPF/CNPJ</label>
        <input
          type="text"
          value={cpfCnpj}
          onChange={(e) => setCpfCnpj(formatCpfCnpj(e.target.value))}
          placeholder="000.000.000-00 ou 00.000.000/0000-00"
        />
      </div>

      {/* CEP Field */}
      <div>
        <label>CEP</label>
        <input
          type="text"
          value={cep}
          onChange={(e) => setCep(formatCep(e.target.value))}
          placeholder="00000-000"
        />
      </div>

      {/* Name Field */}
      <div>
        <label>Nome</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(formatName(e.target.value))}
          placeholder="João Silva"
        />
      </div>

      {/* Email Field */}
      <div>
        <label>Email</label>
        <input
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="exemplo@email.com"
        />
      </div>
    </div>
  );
};

export default MaskComponent;