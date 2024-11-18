import { Response } from 'express';

export type RestResponse<T> = {
  status: number;
  message: string;
  data?: T;
  links?: {
    self: string;

    next?: string;
    previous?: string;
  };
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
};

type RestResponseOptions<T> = {
  status: number;
  message: string;
  data?: T;
  res: Response;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
};

export function sendRestResponse<T>({
  status,
  message,
  data,
  meta,
  res,
}: RestResponseOptions<T>) {
  const { total, page, limit, totalPages } = meta || {};

  let restResponse = {} as RestResponse<T>;
  if (total && page && limit && totalPages) {
    const createLink = (targetPage: number): string => {
      const url = new URL(
        res.req.originalUrl,
        `http://${res.req.headers.host}`
      );
      url.searchParams.set('page', targetPage.toString());
      url.searchParams.set('limit', limit.toString());
      return url.toString();
    };

    const links: {
      self: string;
      next?: string;
      previous?: string;
    } = {
      self: createLink(page),
    };

    if (page < totalPages) {
      links.next = createLink(page + 1);
    }

    if (page > 1) {
      links.previous = createLink(page - 1);
    }

    restResponse = {
      status,
      message,
      data,
      links,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  } else {
    restResponse = {
      status,
      message,
      data,
      links: {
        self: res.req.originalUrl,
      },
    };
  }

  res.status(status).json(restResponse);
}
