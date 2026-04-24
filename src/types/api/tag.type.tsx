export type TagReponse = {
  id: number;
  name: string;
};

export type TagPageResponse = {
  content: TagReponse[];
  total: number;
  page: number;
  size: number;
};
