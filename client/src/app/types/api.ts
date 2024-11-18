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
