"use client"

import * as React from "react"

import {
  getPageRange,
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

/** `getPageRange` keeps the same number of slots on every page. */
export function Default() {
  const [page, setPage] = React.useState(6)
  const pageCount = 20
  const go = (next: number) => (event: React.MouseEvent) => {
    event.preventDefault()
    setPage(Math.min(pageCount, Math.max(1, next)))
  }
  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href={`#page-${page - 1}`}
            onClick={go(page - 1)}
            aria-disabled={page === 1}
          />
        </PaginationItem>
        {getPageRange(page, pageCount).map((item, i) => (
          <PaginationItem key={item === "ellipsis" ? `gap-${i}` : item}>
            {item === "ellipsis" ? (
              <PaginationEllipsis />
            ) : (
              <PaginationLink
                href={`#page-${item}`}
                isActive={item === page}
                onClick={go(item)}
              >
                {item}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext
            href={`#page-${page + 1}`}
            onClick={go(page + 1)}
            aria-disabled={page === pageCount}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}
