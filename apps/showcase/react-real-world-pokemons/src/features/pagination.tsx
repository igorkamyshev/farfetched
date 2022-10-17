import { Link } from 'react-router-dom';

export function Pagination({
  currentPage,
  totalPages,
  pathname,
}: {
  currentPage: number;
  totalPages: number;
  pathname: string;
}) {
  const pages = allInRange(1, totalPages);

  return (
    <>
      {pages.map((page) =>
        page === currentPage ? (
          <span key={page}>{page}</span>
        ) : (
          <Link to={{ pathname: `${pathname}/${page}` }} key={page}>
            {page}
          </Link>
        )
      )}
    </>
  );
}

function allInRange(from: number, to: number) {
  return Array(to - from + 1)
    .fill(0)
    .map((_, i) => i + from);
}
