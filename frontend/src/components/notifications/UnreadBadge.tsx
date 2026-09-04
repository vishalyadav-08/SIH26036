/** A small count pill for a header bell. Renders nothing at zero. */
export function UnreadBadge({
  count,
  className = "bg-rose-600 text-white",
}: {
  count: number;
  className?: string;
}) {
  if (count <= 0) return null;

  return (
    <span
      aria-label={`${count} unread notifications`}
      className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold leading-none ring-2 ring-white ${className}`}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}
