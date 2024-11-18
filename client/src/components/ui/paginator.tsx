import React, { useEffect, useState } from 'react';
import { Button } from './button';
import { cn } from '@/lib/utils';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';

interface PaginationProps<T> extends React.HTMLAttributes<HTMLDivElement> {
  items: T[];
  itemsPerPage: number;
  renderItem: (item: T) => React.ReactNode;
  options?: {
    showAllPages?: boolean;
  };
}

function Pagination<T>({
  items,
  itemsPerPage,
  renderItem,
  options = {
    showAllPages: false,
  },
  className,
}: PaginationProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(items.length / itemsPerPage);

  // Effect to reset currentPage when items change
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1); // Reset to first page if current page exceeds total pages
    }
  }, [items, totalPages, currentPage]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = items.slice(startIndex, endIndex);

  const handlePagination = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  /**
   * Generates the pagination buttons for a paginated component.
   *
   * This function returns a set of buttons that allow users to navigate through pages.
   * It supports two modes of pagination:
   * 1. Displaying all pages.
   * 2. Displaying a sliding window of pages around the current page.
   *
   * @returns {JSX.Element[]} An array of Button components representing the pagination controls.
   *
   * The function works as follows:
   * - If `options.showAllPages` is true, it generates buttons for all pages.
   * - Otherwise, it generates a sliding window of 5 pages centered around the `currentPage`.
   * - The sliding window adjusts to ensure it stays within the bounds of the total number of pages.
   * - Each button has an `onClick` handler that triggers the `handlePagination` function with the respective page number.
   * - The button for the current page is styled differently (`variant='default'`).
   */
  const paginationPagesDisplay = (): JSX.Element[] => {
    if (options.showAllPages) {
      return Array.from({ length: totalPages }).map((_, index) => (
        <Button
          key={index}
          variant={currentPage === index + 1 ? 'default' : 'secondary'}
          onClick={() => handlePagination(index + 1)}
          size='icon'
        >
          {index + 1}
        </Button>
      ));
    }
    // return a sliding window of 5 pages
    const pages = [];
    const window = 5;
    // calculate the start and end of the window
    const halfWindow = Math.floor(window / 2);
    let start = currentPage - halfWindow;
    let end = currentPage + halfWindow;

    if (start < 1) {
      start = 1;
      end = Math.min(window, totalPages);
    }
    if (end > totalPages) {
      end = totalPages;
      start = Math.max(1, totalPages - window + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(
        <Button
          className='transition-colors duration-200 ease-in-out'
          variant={currentPage === i ? 'default' : 'secondary'}
          key={i}
          size='icon'
          onClick={() => handlePagination(i)}
        >
          {i}
        </Button>
      );
    }
    return pages;
  };

  return (
    <>
      <div
        className={cn(
          'h-[25rem] flex flex-col overflow-y-scroll my-4',
          className
        )}
      >
        {currentItems.map((item, index) => (
          <React.Fragment key={index}>{renderItem(item)}</React.Fragment>
        ))}
      </div>

      <section className='content-controls-page-info'>
        {totalPages > 1 && (
          <div className='content-controls flex justify-center gap-4'>
            <Button
              size='icon'
              variant='outline'
              onClick={() => handlePagination(currentPage - 1)}
            >
              <ChevronLeftIcon size={16} />
            </Button>
            {paginationPagesDisplay()}
            <Button
              size='icon'
              variant='outline'
              onClick={() => handlePagination(currentPage + 1)}
            >
              <ChevronRightIcon size={16} />
            </Button>
          </div>
        )}
        <div className='content-page-info text-center text-xs my-4 text-foreground/50'>
          {totalPages === 0 ? (
            <p>No items found</p>
          ) : (
            <p>
              Page {currentPage} of {totalPages}
            </p>
          )}
        </div>
      </section>
    </>
  );
}

export { Pagination };
