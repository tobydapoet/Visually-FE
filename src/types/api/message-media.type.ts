export type MessageMedia = {
  id: number;
  url: string;
};

export type MessagePageResponse = {
  data: MessageMedia[];
  page: number;
  size: number;
  total: number;
  totalPages: number;
};
