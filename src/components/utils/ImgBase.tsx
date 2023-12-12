import Image from "next/image";

interface ImageType {
  src: string;
  alt?: string;
  size?: string;
  title?: string;
  className?: string;
  id?: string;
}

export default function Img(props: ImageType) {
  const size = (size = "xl") =>
    ({
      xs: 320,
      sm: 384,
      md: 448,
      lg: 512,
      xl: 576,
      "2xl": 672,
      "3xl": 768,
      "4xl": 896,
      "5xl": 1024,
      "6xl": 1152,
      "7xl": 1280,
    }[size]);

  return (
    <Image
      src={props.src}
      {...(!!props?.id ? { id: props?.id } : {})}
      {...(!!props?.title ? { title: props?.title } : {})}
      alt={props?.alt ?? "Imagem"}
      width={size(props?.size)}
      height={size(props?.size)}
      onError={(e: any) => e.target.remove()}
      className={props?.className ?? ""}
    />
  );
}
