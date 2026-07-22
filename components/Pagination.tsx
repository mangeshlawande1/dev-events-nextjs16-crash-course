import Link from "next/link";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

function getPageNumbers(currentPage: number, totalPages: number): (number | "ellipsis")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages = new Set<number>([
    1,
    2,
    totalPages - 1,
    totalPages,
    currentPage - 1,
    currentPage,
    currentPage + 1,
  ]);

  const sorted = [...pages]
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((a, b) => a - b);

  const result: (number | "ellipsis")[] = [];
  sorted.forEach((page, index) => {
    if (index > 0 && page - sorted[index - 1] > 1) {
      result.push("ellipsis");
    }
    result.push(page);
  });

  return result;
}

const pageHref = (page: number) => (page === 1 ? "/#events" : `/?page=${page}#events`);

const Pagination = ({ currentPage, totalPages }: PaginationProps) => {
  if (totalPages <= 1) return null;

  const pageNumbers = getPageNumbers(currentPage, totalPages);

  return (
    <nav
      aria-label="Events pagination"
      className="flex items-center justify-center gap-2 pt-4"
    >
      <Link
        href={pageHref(Math.max(1, currentPage - 1))}
        aria-disabled={currentPage === 1}
        className={`rounded-lg border border-dark-200 px-4 py-2 text-sm transition hover:border-primary ${
          currentPage === 1 ? "pointer-events-none opacity-40" : ""
        }`}
      >
        Prev
      </Link>

      {pageNumbers.map((page, index) =>
        page === "ellipsis" ? (
          <span key={`ellipsis-${index}`} className="px-2 text-gray-500">
            …
          </span>
        ) : (
          <Link
            key={page}
            href={pageHref(page)}
            aria-current={page === currentPage ? "page" : undefined}
            className={`rounded-lg border px-4 py-2 text-sm transition ${
              page === currentPage
                ? "border-primary bg-primary/80 text-black"
                : "border-dark-200 hover:border-primary"
            }`}
          >
            {page}
          </Link>
        )
      )}

      <Link
        href={pageHref(Math.min(totalPages, currentPage + 1))}
        aria-disabled={currentPage === totalPages}
        className={`rounded-lg border border-dark-200 px-4 py-2 text-sm transition hover:border-primary ${
          currentPage === totalPages ? "pointer-events-none opacity-40" : ""
        }`}
      >
        Next
      </Link>
    </nav>
  );
};

export default Pagination;
