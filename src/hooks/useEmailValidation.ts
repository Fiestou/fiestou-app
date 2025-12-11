import { useState, useEffect, useCallback } from "react";
import Api from "@/src/services/api";
import { validateEmail } from "@/src/components/utils/FormMasks";

interface UseEmailValidationOptions {
  debounceMs?: number;
  checkAvailability?: boolean;
}

export function useEmailValidation(options?: UseEmailValidationOptions) {
  const { debounceMs = 300, checkAvailability = true } = options ?? {};

  const [email, setEmail] = useState("");
  const [isValidFormat, setIsValidFormat] = useState(true);
  const [isAvailable, setIsAvailable] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounce
  const [debouncedEmail, setDebouncedEmail] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedEmail(email), debounceMs);
    return () => clearTimeout(timer);
  }, [email, debounceMs]);

  // Valida formato e disponibilidade
  useEffect(() => {
    if (!debouncedEmail) {
      setIsValidFormat(true);
      setIsAvailable(true);
      setError(null);
      return;
    }

    const valid = validateEmail(debouncedEmail);
    setIsValidFormat(valid);

    if (!valid) {
      setError("Formato de e-mail inválido");
      return;
    }

    setError(null);

    if (!checkAvailability) return;

    const checkEmailAvailability = async () => {
      setIsChecking(true);
      try {
        const api = new Api();
        const data: any = await api.bridge({
          method: "post",
          url: "auth/checkin",
          data: { ref: debouncedEmail },
        });

        if (data.response && data.user) {
          setIsAvailable(false);
          setError("O email já está vinculado a um usuário.");
        } else {
          setIsAvailable(true);
          setError(null);
        }
      } catch {
        setIsAvailable(true);
      } finally {
        setIsChecking(false);
      }
    };

    checkEmailAvailability();
  }, [debouncedEmail, checkAvailability]);

  // Limpa erro após 30s
  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => setError(null), 30000);
    return () => clearTimeout(timer);
  }, [error]);

  const isValid = isValidFormat && isAvailable && !isChecking;

  return {
    email,
    setEmail: (value: string) => setEmail(value.toLowerCase().trim()),
    isValidFormat,
    isAvailable,
    isChecking,
    isValid,
    error,
  };
}

export default useEmailValidation;
