import React from "react";

export function Steps({
  items,
}: {
  items: { title: string; description: string }[];
}) {
  return (
    <ol className="flex list-none flex-col p-0">
      {items.map((item, i) => (
        <li
          className="flex gap-[23px] border-b border-line py-[21px] last:border-0"
          key={item.title}
        >
          <span className="pt-[3px] font-mono text-[13px] text-[#7d916e]">
            0{i + 1}
          </span>
          <div>
            <h3 className="text-lg leading-[1.4]">{item.title}</h3>
            <p className="mt-[7px] text-[13px] text-muted">
              {item.description}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
