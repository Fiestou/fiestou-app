import { useEffect } from "react";
import { useRouter } from "next/router";
import { PainelLayout } from "@/src/components/painel";

export default function LegacySaquesRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/painel/financeiro");
  }, [router]);

  return (
    <PainelLayout>
      <div className="py-20 text-center text-sm text-zinc-500">
        Redirecionando para Financeiro...
      </div>
    </PainelLayout>
  );
}

