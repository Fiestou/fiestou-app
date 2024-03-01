import HandleCategories from "./HandleCategories";

export default function HandleCategory({ item }: { item: any }) {
  return (
    <>
      <div className="group px-3 py-2 flex items-center gap-2 relative">
        {item.title}
      </div>
      <div className={`px-2 pb-2`}>
        {!!item?.childs && <HandleCategories list={item?.childs} />}
      </div>
    </>
  );
}
