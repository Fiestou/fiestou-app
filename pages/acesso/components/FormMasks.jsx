import { useState } from "react";

/* Phone Mask */
export const formatPhone = (value: string): string => {
  value = value.replace(/\D/g, "");

  if (value.length === 11) {
    return value.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3"); /* Celular com 11 dígitos */
  } else if (value.length === 10) {
    return value.replace(/^(\d{2})(\d{4})(\d{4})$/, "($1) 9$2-$3"); /* Celular com 10 dígitos (adiciona o 9) */
  } else if (value.length === 8) {
    return value.replace(/^(\d{4})(\d{4})$/, "(00) 9$1-$2"); /* Fixo com 8 dígitos (adiciona o 9) */
  }

  return value;
};

/* Máscara para CPF/CNPJ */
export const formatCpfCnpj = (value: string): string => {
  value = value.replace(/\D/g, ""); /* Remove tudo que não é dígito */

  if (value.length === 11) {
    return value.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4"); /* CPF */
  } else if (value.length === 14) {
    return value.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5"); /* CNPJ */
  }

  return value;
};

/* Validação de CPF/CNPJ */
export const validateCpfCnpj = (value: string): boolean => {
  return /^\d{11}$/.test(value) || /^\d{14}$/.test(value); /* CPF ou CNPJ válido */
};

/* Máscara para CEP */
export const formatCep = (value: string): string => {
  value = value.replace(/\D/g, ""); /* Remove tudo que não é dígito */

  if (value.length === 8) {
    return value.replace(/^(\d{5})(\d{3})$/, "$1-$2"); /* Formato do CEP */
  }

  return value;
};

/* Formatação de Nome (primeira letra maiúscula) */
export const formatName = (value: string): string => {
  return value
    .toLowerCase() /* Converte tudo para minúsculo */
    .split(" ") /* Divide em palavras */
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) /* Primeira letra maiúscula */
    .join(" "); /* Junta as palavras novamente */
};

/* Validação de Email */
export const validateEmail = (email: string): boolean => {
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(email);
};

/* Componente de Máscaras */
const MaskComponent = () => {
  const [phone, setPhone] = useState("");
  const [cpfCnpj, setCpfCnpj] = useState("");
  const [cep, setCep] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  return (
    <div>
      {/* Campo de Telefone */}
      <div>
        <label>Telefone</label>
        <input
          type="text"
          value={phone}
          onChange={(e) => setPhone(formatPhone(e.target.value))}
          placeholder="(00) 9 0000-0000"
        />
      </div>

      {/* Campo de CPF/CNPJ */}
      <div>
        <label>CPF/CNPJ</label>
        <input
          type="text"
          value={cpfCnpj}
          onChange={(e) => setCpfCnpj(formatCpfCnpj(e.target.value))}
          placeholder="000.000.000-00 ou 00.000.000/0000-00"
        />
      </div>

      {/* Campo de CEP */}
      <div>
        <label>CEP</label>
        <input
          type="text"
          value={cep}
          onChange={(e) => setCep(formatCep(e.target.value))}
          placeholder="00000-000"
        />
      </div>

      {/* Campo de Nome */}
      <div>
        <label>Nome</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(formatName(e.target.value))}
          placeholder="João Silva"
        />
      </div>

      {/* Campo de Email */}
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