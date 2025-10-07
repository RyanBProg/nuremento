import type { ReactNode } from "react";

type MemoryCardProps = {
  title: string;
  subtitle?: string | null;
  description?: string | null;
  thumbnailUrl?: string | null;
  actions?: ReactNode;
  className?: string;
};

export function MemoryCard({
  title,
  subtitle,
  description,
  thumbnailUrl,
  actions,
  className,
}: MemoryCardProps) {
  return (
    <article
      className={`flex w-full min-w-[250px] max-w-[400px] flex-col space-y-4 rounded-xl border bg-background p-6 shadow-[5px_5px_0_rgba(0,0,0,1)] ${
        className ? ` ${className}` : ""
      }`}>
      {thumbnailUrl ? (
        <div className="relative overflow-hidden rounded-lg border aspect-square">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={thumbnailUrl}
            alt={`Thumbnail for ${title}`}
            className="h-full w-full object-cover"
          />
        </div>
      ) : null}

      <div className="space-y-2">
        {subtitle ? (
          <p className="text-xs uppercase tracking-[0.2em] text-neutral-600">
            {subtitle}
          </p>
        ) : null}
        <h3 className="text-xl font-semibold">{title}</h3>
        {description ? (
          <p className="text-sm leading-relaxed text-neutral-600 text-ellipsis">
            {description}
          </p>
        ) : null}
      </div>

      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </article>
  );
}
