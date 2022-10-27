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

  const hasNext = currentPage < totalPages;
  const hasPrev = currentPage > 1;

  return (
    <>
      {hasPrev && <Link to={`${pathname}/${currentPage - 1}`}>prev</Link>}
      {pages.map((page) =>
        page === currentPage ? (
          <span key={page}>{page}</span>
        ) : (
          <Link to={`${pathname}/${page}`} key={page}>
            {page}
          </Link>
        )
      )}
      {hasNext && <Link to={`${pathname}/${currentPage + 1}`}>next</Link>}
    </>
  );
}

function allInRange(from: number, to: number) {
  return Array(to - from + 1)
    .fill(0)
    .map((_, i) => i + from);
}
