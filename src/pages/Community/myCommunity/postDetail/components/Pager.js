const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

const Pager = ({
  page,
  totalPages,
  onPageChange,
  className = "",
  maxButtons = 7,
}) => {
  if (!totalPages || totalPages <= 1) return null;

  const safePage = clamp(page, 1, totalPages);

  const half = Math.floor(maxButtons / 2);
  let start = Math.max(1, safePage - half);
  let end = Math.min(totalPages, start + maxButtons - 1);

  start = Math.max(1, end - maxButtons + 1);

  const go = (p) => onPageChange(clamp(p, 1, totalPages));

  const pages = [];
  for (let p = start; p <= end; p++) pages.push(p);

  const showLeftEllipsis = start > 1;
  const showRightEllipsis = end < totalPages;

  return (
    <div className={`PostDetailPager ${className}`}>
      <button
        type="button"
        className="ReplyActionBtn"
        onClick={() => go(safePage - 1)}
        disabled={safePage <= 1}
      >
        Prev
      </button>

      <div className="PostDetailPagerNumbers">
        {start > 1 && (
          <>
            <button
              type="button"
              className={`ReplyActionBtn ${
                safePage === 1 ? "ReplyActionBtn--active" : ""
              }`}
              onClick={() => go(1)}
            >
              1
            </button>
            {showLeftEllipsis && <span className="PostDetailPagerEllipsis">…</span>}
          </>
        )}

        {pages.map((p) => (
          <button
            key={p}
            type="button"
            className={`ReplyActionBtn ${
              safePage === p ? "ReplyActionBtn--active" : ""
            }`}
            onClick={() => go(p)}
            aria-current={safePage === p ? "page" : undefined}
          >
            {p}
          </button>
        ))}

        {end < totalPages && (
          <>
            {showRightEllipsis && <span className="PostDetailPagerEllipsis">…</span>}
            <button
              type="button"
              className={`ReplyActionBtn ${
                safePage === totalPages ? "ReplyActionBtn--active" : ""
              }`}
              onClick={() => go(totalPages)}
            >
              {totalPages}
            </button>
          </>
        )}
      </div>

      <button
        type="button"
        className="ReplyActionBtn"
        onClick={() => go(safePage + 1)}
        disabled={safePage >= totalPages}
      >
        Next
      </button>
    </div>
  );
};

export default Pager;
