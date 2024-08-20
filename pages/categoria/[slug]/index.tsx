import { useEffect } from "react";
import { useRouter } from "next/router";

export async function getServerSideProps(ctx: any) {
  const { slug } = ctx.query;

  return {
    props: {
      slug: slug,
    },
  };
}

const CategoriaIndex = ({ slug }: any) => {
  const router = useRouter();

  useEffect(() => {
    router.replace(`/categoria/${slug}/pagina/1`);
  }, [router]);

  return null;
};

export default CategoriaIndex;
