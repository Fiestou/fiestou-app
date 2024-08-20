import { useEffect } from "react";
import { useRouter } from "next/router";

export async function getStaticProps(ctx: any) {
  const { slug } = ctx.params;

  return {
    props: {
      slug: slug,
    },
    revalidate: 60 * 60 * 60,
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
