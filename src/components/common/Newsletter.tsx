import { Button, Input, Label } from "@/src/components/ui/form";
import Img from "@/src/components/utils/ImgBase";

export default function Newsletter() {
  return (
    <section className="xl:py-14">
      <div className="container-medium">
        <div className="bg-zinc-100 p-6 lg:p-20 relative overflow-hidden rounded-xl md:rounded-3xl">
          <div className="absolute left-0 top-0 grid w-1/4 h-full">
            <div className="p-10 hidden lg:flex items-end around">
              <Img src="/images/star.png" className="w-auto ml-8" />
            </div>
            <div className="p-8 md:p-10 flex items-start justify-center">
              <Img src="/images/star.png" className="md:w-[2rem] rotate-45" />
            </div>
          </div>
          <div className="relative z-[1]">
            <div className="max-w-2xl mx-auto text-center pb-10 md:pb-8">
              <h2 className="font-title text-zinc-900 font-bold text-3xl md:text-5xl mt-2">
                Receba novidades e promoções
              </h2>
            </div>
            <div className="max-w-[40rem] mx-auto grid gap-2 md:gap-4">
              <div className="">
                <Label>Email</Label>
                <Input placeholder="Insira seu melhor e-mail" />
              </div>
              <Button>Cadastrar agora</Button>
            </div>
          </div>
          <div className="absolute right-0 top-0 grid w-1/4 h-full">
            <div className="p-10"></div>
            <div className="flex items-end">
              <Img src="/images/loop-line.png" className="w-auto" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
