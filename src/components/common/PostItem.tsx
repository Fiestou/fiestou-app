import Link from "next/link";
import Img from "../utils/ImgBase";
import { getExtenseData, getImage } from "@/src/helper";

export default function PostItem({ post }: any) {
  return (
    <>
      <Link href={`/blog/${post.slug}`}>
        <div className="aspect-[4/3] bg-zinc-100 border relative overflow-hidden rounded-lg">
          {!!getImage(post?.image) && (
            <Img
              src={getImage(post?.image)}
              className="w-full h-full object-cover"
            />
          )}
        </div>
      </Link>
      <div className="grid gap-2 pt-4">
        <div className="md:pr-4">
          <Link href={`/blog/${post.slug}`}>
            <div className="text-zinc-900 hover:text-yellow-500 ease font-bold text-xl leading-tight">
              {post.title}
            </div>
          </Link>
          <div className="text-sm text-zinc-400">
            {getExtenseData(post.created_at)}
          </div>
        </div>
      </div>
    </>
  );
}
