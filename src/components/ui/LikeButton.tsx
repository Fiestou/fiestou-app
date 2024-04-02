import Icon from "@/src/icons/fontAwesome/FIcon";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { Button } from "./form";

export default function LikeButton({
  id,
  style,
}: {
  id: number;
  style?: string;
}) {
  const [likes, setLikes] = useState([] as Array<number>);

  const handleLikes = (like: number) => {
    let handleLikes: Array<number> = !!Cookies.get("fiestou.likes")
      ? Object.values(JSON.parse(Cookies.get("fiestou.likes") ?? "[]"))
      : [];

    handleLikes = !!handleLikes.includes(like)
      ? (handleLikes ?? []).filter((value) => value !== like)
      : [...handleLikes, like];

    setLikes(handleLikes);

    Cookies.set("fiestou.likes", JSON.stringify(handleLikes), {
      expires: 14,
    });
  };

  useEffect(() => {
    if (!!window && !!Cookies.get("fiestou.likes")) {
      let cookieLikes = Cookies.get("fiestou.likes") ?? JSON.stringify([]);
      setLikes(Object.values(JSON.parse(cookieLikes)));
    }
  }, []);

  return (
    <Button
      type="button"
      onClick={() => handleLikes(id)}
      className={`${!!likes.includes(id) ? "liked" : ""} ${
        !!style ? "" : "rounded-full"
      } group/item relative p-6`}
      style={style ?? "btn-light"}
    >
      <Icon
        type="fa"
        icon="fa-heart"
        className="text-zinc-300 group-hover/item:text-red-600 ease group-[.liked]/item:text-red-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      />
    </Button>
  );
}
