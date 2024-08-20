import { useEffect } from "react";
import { useRouter } from "next/router";

const ProdutosIndex = () => {
  const router = useRouter();

  useEffect(() => {
    router.replace("/produtos/pagina/1");
  }, [router]);

  return null;
};

export default ProdutosIndex;
