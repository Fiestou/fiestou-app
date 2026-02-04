import { useRouter } from "next/router";
import { useEffect } from "react";

export default function GmailCallback() {
  const router = useRouter();

  useEffect(() => {
    const { code, error } = router.query;
    if (code || error) {
      const params = new URLSearchParams();
      if (code) params.set("code", code as string);
      if (error) params.set("error", error as string);
      router.replace(`/admin/configuracoes?${params.toString()}`);
    }
  }, [router.query]);

  return null;
}
