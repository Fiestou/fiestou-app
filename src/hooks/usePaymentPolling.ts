import { useCallback, useEffect, useRef, useState } from "react";
import Api from "@/src/services/api";
import { fetchOrderById } from "@/src/services/order";
import { PixType } from "@/src/models/order";

interface UsePaymentPollingOptions {
  orderId: number;
  onPaymentConfirmed?: () => void;
  onPaymentFailed?: (message: string) => void;
}

interface PixCharge {
  code?: string;
  qrcode?: string;
  time?: string;
  expires_in?: number;
}

interface BoletoCharge {
  pdf?: string;
  due_at?: string;
  line?: string;
}

export function usePaymentPolling({
  orderId,
  onPaymentConfirmed,
  onPaymentFailed,
}: UsePaymentPollingOptions) {
  const api = useRef(new Api()).current;

  const [pix, setPix] = useState<PixType>({
    status: false,
    expires_in: 300,
  });

  const [boleto, setBoleto] = useState<any>({});
  const [expire, setExpire] = useState("start");
  const [isPolling, setIsPolling] = useState(false);

  // Verifica se o pagamento foi confirmado
  const checkPaymentStatus = useCallback(async () => {
    try {
      const order = await fetchOrderById(api, orderId);
      if (order && order.status === 1) {
        onPaymentConfirmed?.();
        return true;
      }
    } catch (err) {
      console.error("Error checking payment status:", err);
    }
    return false;
  }, [api, orderId, onPaymentConfirmed]);

  // Inicia polling para cartão de crédito
  const startCardPolling = useCallback(() => {
    setIsPolling(true);
    let attempts = 5;

    const interval = setInterval(async () => {
      if (new Date().getSeconds() % 5 === 0) {
        attempts--;
        const confirmed = await checkPaymentStatus();

        if (confirmed) {
          clearInterval(interval);
          setIsPolling(false);
          return;
        }
      }

      if (attempts === 0) {
        clearInterval(interval);
        setIsPolling(false);
        onPaymentFailed?.("Algo deu errado ao processar seu pagamento. Tente novamente.");
      }
    }, 1000);

    return () => {
      clearInterval(interval);
      setIsPolling(false);
    };
  }, [checkPaymentStatus, onPaymentFailed]);

  // Inicia polling para PIX
  const startPixPolling = useCallback((charge: PixCharge) => {
    setPix({
      status: true,
      code: charge.code,
      qrcode: charge.qrcode,
      time: charge.time,
      expires_in: charge.expires_in ?? 300,
    });
    setIsPolling(true);

    const targetTime = new Date(charge.time ?? "").getTime();

    const updateExpire = () => {
      const now = new Date().getTime();
      const distance = targetTime - now;

      if (distance <= 0) {
        setExpire("expired");
        return false;
      }

      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setExpire(
        `${minutes < 10 ? "0" : ""}${minutes}:${seconds < 10 ? "0" : ""}${seconds}`
      );
      return true;
    };

    updateExpire();

    const interval = setInterval(async () => {
      const isValid = updateExpire();

      if (!isValid) {
        clearInterval(interval);
        setIsPolling(false);
        onPaymentFailed?.("Seu código de pagamento via pix não é mais válido. Tente novamente.");
        return;
      }

      // Verifica a cada 30 segundos
      const seconds = new Date().getSeconds();
      if (seconds === 30 || seconds === 0) {
        await checkPaymentStatus();
      }
    }, 1000);

    return () => {
      clearInterval(interval);
      setIsPolling(false);
    };
  }, [checkPaymentStatus, onPaymentFailed]);

  // Configura boleto (não precisa de polling contínuo)
  const setupBoleto = useCallback((charge: BoletoCharge) => {
    setBoleto({
      status: true,
      pdf: charge.pdf,
      due_at: charge.due_at,
      line: charge.line,
    });
  }, []);

  // Reseta o estado
  const reset = useCallback(() => {
    setPix({ status: false, expires_in: 300 });
    setBoleto({});
    setExpire("start");
    setIsPolling(false);
  }, []);

  return {
    pix,
    boleto,
    expire,
    isPolling,
    startCardPolling,
    startPixPolling,
    setupBoleto,
    checkPaymentStatus,
    reset,
  };
}
