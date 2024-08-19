import { Button } from "../ui/form";
import Icon from "@/src/icons/fontAwesome/FIcon";

export default function Paginate({
  paginate,
  current,
  route,
}: {
  paginate: Array<any>;
  current: number;
  route: string;
}) {
  let middle: number = Math.round(current / 2);
  let handle: any = {
    prev: 0,
    next: 0,
    pagesPrev: 0,
    pagesNext: 0,
  };

  if (paginate?.length > 10) {
    handle = {
      prev: current - 3,
      next: current + 3,
      pagesPrev: current - 2,
      pagesNext: current + 2,
    };
  } else {
    handle["pagesNext"] = 10;
  }

  return (
    <div className="flex gap-1 justify-center">
      {handle.prev > 0 && (
        <>
          <Button
            style="btn-white"
            href={`/${route}/pagina/${handle.prev}`}
            className="p-4 text-sm rounded-full"
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <Icon icon="fa-chevron-left" type="far" />
            </div>
          </Button>
          <div className="pt-1">...</div>
        </>
      )}

      {paginate
        .filter((item: any, key: any) => !!key)
        .map(
          (item: any, key: any) =>
            key + 1 >= handle.pagesPrev &&
            key + 1 <= handle.pagesNext && (
              <Button
                style="btn-white"
                key={key}
                href={`/${route}/${key ? "pagina/" + (key + 1) : ""}`}
                className={`${
                  current == key + 1 && "bg-yellow-400"
                } p-4 text-sm rounded-full`}
              >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  {key + 1}
                </div>
              </Button>
            )
        )}

      {!!handle.next && handle.next <= paginate?.length - 1 && (
        <>
          <div className="pt-1">...</div>
          <Button
            style="btn-white"
            href={`/${route}/pagina/${handle.next}`}
            className="p-4 text-sm rounded-full"
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <Icon icon="fa-chevron-right" type="far" />
            </div>
          </Button>
        </>
      )}
    </div>
  );
}
