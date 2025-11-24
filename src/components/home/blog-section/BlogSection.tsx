"use client";

import React from "react";
import PostItem from "@/src/components/common/PostItem";
import { Button } from "@/src/components/ui/form";
import Icon from "@/src/icons/fontAwesome/FIcon";

interface BlogPostProps {
  id: number;
  [key: string]: any;
}

interface BlogSectionProps {
  Blog?: BlogPostProps[];
  title?: string;
  buttonText?: string;
  buttonHref?: string;
}

export default function BlogSection({
  Blog = [],
  title = "Veja nossas dicas",
  buttonText = "Mais postagens",
  buttonHref = "/blog",
}: BlogSectionProps) {
  return (
    <section className="pb-14 xl:py-14">
      <div className="container-medium">
        <div className="max-w-2xl mx-auto text-center pb-6 md:pb-14">
          <h2 className="font-title text-zinc-900 font-bold text-4xl md:text-5xl mt-2">
            {title}
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-10 md:gap-6">
          {!!Blog?.length &&
            [...Blog]
              .sort((a, b) => b.id - a.id)
              .map((post, key) => (
                <div key={key}>
                  <PostItem post={post} />
                </div>
              ))}
        </div>

        <div className="text-center mt-10">
          <Button href={buttonHref}>
            <Icon icon="fa-newspaper" type="far" /> {buttonText}
          </Button>
        </div>
      </div>
    </section>
  );
}
