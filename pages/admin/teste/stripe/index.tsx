// pages/admin/teste/stripe/index.tsx
import React, { useCallback, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";

// Melhor prática: carregar fora do componente para memoizar a Promise.
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ""
);

type CreateSessionPayload = {
  // ajuste para o formato esperado pelo seu backend/serviço Payment
  deliveryStatus: string;
  deliverySchedule: string;
  total: number;
  status: number;
  platformCommission: number;
  listItems: Array<{
    product: { store: number | string };
    attributes: any[];
    quantity: number;
    total: number;
  }>;
  deliveryTo: string;
  deliveryPrice: number;
};

export default function StripeTestPage() {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const submitOrder = useCallback(async () => {
    setMsg(null);

    // valida chave pública
    if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
      setMsg(
        "Erro: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY não definida (.env.local)."
      );
      return;
    }

    setLoading(true);
    try {
      // 1) Monte o payload (exemplo mínimo)
      const payload: CreateSessionPayload = {
        deliveryStatus: "",
        deliverySchedule: "",
        total: 0,
        status: -1,
        platformCommission: 0,
        listItems: [
          {
            product: { store: 1 },
            attributes: [],
            quantity: 1,
            total: 1,
          },
        ],
        deliveryTo: "",
        deliveryPrice: 0,
      };

      // 2) Chame seu backend para CRIAR a sessão do Stripe
      //    Ajuste a URL abaixo para o seu endpoint real
      //    Ex.: /api/payments/stripe/create-session  ou  `${process.env.NEXT_PUBLIC_API}/payments/stripe/create-session`
      const res = await fetch("/api/payments/stripe/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Falha ao criar sessão: ${text || res.status}`);
      }

      const json: any = await res.json();

      // Convenção comum: backend retorna { sessionId } OU { session: { id } }
      const sessionId: string | undefined =
        json?.sessionId ?? json?.session?.id ?? json?.id;

      if (!sessionId) {
        throw new Error("Resposta sem sessionId.");
      }

      // 3) Redirecionar para o Stripe
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error("Stripe não inicializado (chave pública inválida?).");
      }

      const { error } = await stripe.redirectToCheckout({ sessionId });
      if (error) {
        throw error;
      }
    } catch (err: any) {
      console.error(err);
      setMsg(err?.message || "Erro inesperado ao iniciar o checkout.");
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="min-h-[50vh] flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-xl border border-gray-200 p-6 bg-white">
        <h1 className="text-xl font-bold text-zinc-900 mb-3">
          Teste de Checkout - Stripe
        </h1>

        {!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY && (
          <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded">
            Defina <code className="font-mono">NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code> no
            seu <code className="font-mono">.env.local</code>.
          </div>
        )}

        {msg && (
          <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded">
            {msg}
          </div>
        )}

        <button
          onClick={submitOrder}
          disabled={loading}
          className={`w-full py-3 rounded-lg font-semibold text-zinc-900 ${
            loading ? "bg-yellow-300/70 cursor-not-allowed" : "bg-yellow-300"
          }`}
        >
          {loading ? "Carregando..." : "Carregar Stripe"}
        </button>

        <p className="text-xs text-gray-500 mt-4 leading-relaxed">
          Ajuste a URL do <code className="font-mono">fetch</code> para o seu endpoint
          que cria a sessão do Stripe. Se você já usa uma classe{" "}
          <code className="font-mono">Payment</code>, pode trocar o fetch por ela
          (ex.: <code className="font-mono">new Payment().createSession(payload)</code>) desde que
          retorne um <code className="font-mono">sessionId</code>.
        </p>
      </div>
    </div>
  );
}
