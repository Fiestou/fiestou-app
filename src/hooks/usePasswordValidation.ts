import { useState, useEffect, useMemo } from "react";

export type PasswordRule = {
  code: string;
  label: string;
  validate: (password: string, repeat?: string) => boolean;
};

const DEFAULT_RULES: PasswordRule[] = [
  {
    code: "number",
    label: "É necessário que a senha possua pelo menos um número.",
    validate: (pwd) => /\d/.test(pwd),
  },
  {
    code: "min",
    label: "A senha precisa ter pelo menos 6 caracteres.",
    validate: (pwd) => pwd.length >= 6,
  },
  {
    code: "equal",
    label: "As senhas precisam ser iguais.",
    validate: (pwd, repeat) => pwd === repeat,
  },
];

interface UsePasswordValidationOptions {
  rules?: PasswordRule[];
}

export function usePasswordValidation(options?: UsePasswordValidationOptions) {
  const rules = options?.rules ?? DEFAULT_RULES;

  const [password, setPassword] = useState("");
  const [repeat, setRepeat] = useState("");

  const validation = useMemo(() => {
    if (!password) {
      return { errors: [], completed: [], isValid: false };
    }

    const errors: string[] = [];
    const completed: string[] = [];

    rules.forEach((rule) => {
      if (rule.validate(password, repeat)) {
        completed.push(rule.code);
      } else {
        errors.push(rule.code);
      }
    });

    return {
      errors,
      completed,
      isValid: errors.length === 0 && completed.length === rules.length,
    };
  }, [password, repeat, rules]);

  return {
    password,
    setPassword,
    repeat,
    setRepeat,
    rules,
    ...validation,
  };
}

export default usePasswordValidation;
