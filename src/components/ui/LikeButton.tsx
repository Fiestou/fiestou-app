import Icon from "@/src/icons/fontAwesome/FIcon";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { Button } from "./form";

export default function LikeButton({
  id,
  style,
  onToggle,
}: {
  id: number;
  style?: string;
  onToggle?: (liked: boolean) => void;
}) {
  const [likes, setLikes] = useState([] as Array<number>);

  const readLikesFromCookie = (): number[] => {
    const raw = Cookies.get("fiestou.likes");
    if (!raw) return [];

    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];

      return parsed
        .map((value) => Number(value))
        .filter((value) => Number.isInteger(value) && value > 0);
    } catch {
      return [];
    }
  };

  const handleLikes = (like: number) => {
    if (!Number.isInteger(like) || like <= 0) return;

    let handleLikes: Array<number> = readLikesFromCookie();

    const isLiked = !!handleLikes.includes(like);

    handleLikes = isLiked
      ? (handleLikes ?? []).filter((value) => value !== like)
      : [...handleLikes, like];

    setLikes(handleLikes);
    onToggle?.(!isLiked);

    Cookies.set("fiestou.likes", JSON.stringify(handleLikes), {
      expires: 14,
    });
  };

  useEffect(() => {
    setLikes(readLikesFromCookie());
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
