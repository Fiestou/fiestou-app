interface ImageType {
  src?: string | null;
  alt?: string;
  size?: string;
  title?: string;
  className?: string;
  id?: string;
  style?: React.CSSProperties;
  loading?: "lazy" | "eager";
  decoding?: "sync" | "async" | "auto";
  fetchPriority?: "high" | "low" | "auto";
}

const SIZE_MAP: Record<string, number> = {
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
};

const TRANSPARENT_PIXEL =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";

export default function Img(props: ImageType) {
  const resolvedSize = SIZE_MAP[props?.size ?? "xl"] ?? SIZE_MAP.xl;
  const src = typeof props?.src === "string" && props.src.trim() ? props.src : TRANSPARENT_PIXEL;

  const handleError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    if (event.currentTarget.src !== TRANSPARENT_PIXEL) {
      event.currentTarget.src = TRANSPARENT_PIXEL;
    }
  };

  return (
    <img
      src={src}
      {...(!!props?.id ? { id: props?.id } : {})}
      {...(!!props?.title ? { title: props?.title } : {})}
      alt={props?.alt ?? "Imagem"}
      width={resolvedSize}
      height={resolvedSize}
      loading={props?.loading ?? "lazy"}
      decoding={props?.decoding ?? "async"}
      {...(props?.fetchPriority
        ? ({ fetchpriority: props.fetchPriority } as any)
        : {})}
      onError={handleError}
      style={props?.style}
      className={props?.className ?? ""}
    />
  );
}
