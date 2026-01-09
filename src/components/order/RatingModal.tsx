import Modal from "@/src/components/utils/Modal";
import Img from "@/src/components/utils/ImgBase";
import { Button, Label, TextArea } from "@/src/components/ui/form";
import Icon from "@/src/icons/fontAwesome/FIcon";
import { getImage } from "@/src/helper";

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  product?: {
    title?: string;
    sku?: string;
    gallery?: any[];
  };
  rate: number;
  comment?: string;
  onRateChange: (rate: number) => void;
  onCommentChange: (comment: string) => void;
  loading?: boolean;
  orderStatus?: number;
  paymentUrl?: string;
}

export default function RatingModal({
  isOpen,
  onClose,
  onSubmit,
  product,
  rate,
  comment,
  onRateChange,
  onCommentChange,
  loading,
  orderStatus,
  paymentUrl,
}: RatingModalProps) {
  return (
    <Modal title="Avaliação de produto" status={isOpen} close={onClose}>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        {orderStatus ? (
          <>
            <div className="">
              <div className="flex items-center gap-6">
                <div className="w-fit">
                  <div className="aspect-square bg-zinc-200 w-[4rem] rounded-full relative overflow-hidden">
                    {!!getImage(product?.gallery) && (
                      <Img
                        src={getImage(product?.gallery, "thumb")}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                </div>
                <div className="grid w-full">
                  <div className="font-title font-semibold text-zinc-900">
                    {product?.title}
                  </div>
                  <div className="text-sm">sku #{product?.sku}</div>
                </div>
              </div>
            </div>
            <div className="md:flex items-center gap-4">
              <div className="relative">
                <Label className="pt-1">O que você achou do produto?</Label>
                <div className="opacity-0 h-0 absolute mt-3 left-1/2 top-0 -translate-x-1/2">
                  {!rate && (
                    <input type="checkbox" required className="inline-block" />
                  )}
                </div>
              </div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((value: number) => (
                  <label
                    key={value}
                    className="cursor-pointer"
                    onClick={() => onRateChange(value)}
                  >
                    <Icon
                      icon="fa-star"
                      type={rate >= value ? "fa" : "fal"}
                      className={`${
                        rate >= value ? "text-yellow-400" : "text-gray-400"
                      } ease text-lg hover:text-yellow-600`}
                    />
                  </label>
                ))}
              </div>
            </div>
            <div className="">
              <Label>Deixe seu comentário</Label>
              <TextArea
                rows="5"
                value={comment}
                onChange={(e: any) => onCommentChange(e.target.value)}
              />
            </div>
            <div className="grid">
              <Button loading={!!loading}>Enviar</Button>
            </div>
          </>
        ) : (
          <div className="text-center py-7">
            <div className="mx-auto max-w-[24rem] mb-6">
              É necessário que efetue o pagamento do seu pedido para fazer sua
              avaliação ao produto.
            </div>
            <div>
              <Button href={paymentUrl}>Efetuar pagamento</Button>
            </div>
          </div>
        )}
      </form>
    </Modal>
  );
}
