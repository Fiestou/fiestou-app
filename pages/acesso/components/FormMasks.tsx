import { useState } from "react";

/* Phone Mask */ 
export const formatPhone = (value: string): string => {
  value = value.replace(/\D/g, "");

  if (value.length === 11) {
    return value.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3"); /* Cell phone with 11 digits */
  } else if (value.length === 10) {
    return value.replace(/^(\d{2})(\d{4})(\d{4})$/, "($1) 9$2-$3"); /* Cell phone with 10 digits (add 9) */
  } else if (value.length === 8) {
    return value.replace(/^(\d{4})(\d{4})$/, "(00) 9$1-$2"); /* Fixed with 8 digits (add 9) */
  }

  return value;
};

/* CPF/CNPJ Mask */
export const formatCpfCnpj = (value: string): string => {
  value = value.replace(/\D/g, "");

  if (value.length === 11) {
    return value.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4"); /* CPF */
  } else if (value.length === 14) {
    return value.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5"); /* CNPJ */
  }

  return value;
};

/* CPF/CNPJ Validation */
export const validateCpfCnpj = (value: string): boolean => {
  return /^\d{11}$/.test(value) || /^\d{14}$/.test(value); /* Invalid CPF/CNPJ */
};

/* CEP (ZipCode) Mask */
export const formatCep = (value: string): string => {
  value = value.replace(/\D/g, "");

  if (value.length === 8) {
    return value.replace(/^(\d{5})(\d{3})$/, "$1-$2");
  }

  return value;
};

export const formatName = (value: string): string => {
  return value
    .toLowerCase() 
    .split(" ") 
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) 
    .join(" "); 
};

/* Email Validation */
export const validateEmail = (email: string): boolean => {
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(email);
};

/* Masks Components */
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
          placeholder="(00) 9 0000-0000"
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

      {/* CEP (brazilian zipcode) Field */}
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