import Template from "@/src/template";
import { Button } from "@/src/components/ui/form";
import Link from "next/link";

export default function StepError({ message }: { message: string }) {
  return (
    <Template header={{ template: "clean", position: "solid" }}>
      <div className="container-medium py-20 text-center text-red-600">
        <p>{message}</p>
        <Link href="/parceiros/seja-parceiro">
          <Button className="mt-4">Voltar para página de parceria</Button>
        </Link>
      </div>
    </Template>
  );
}
