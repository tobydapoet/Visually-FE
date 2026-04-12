import type { MusicStatus } from "../../constants/music.enum";

export interface MusicResponse {
  id: number;
  artist: string;
  title: string;
  img: string;
  url: string;
  duration: number;
  createdAt: Date;
  updatedAt: Date;
  status: MusicStatus;
}

export type MusicPageResponse = {
  content: MusicResponse[];

  totalPages: number;
  totalElements: number;

  size: number;
  number: number;

  first: boolean;
  last: boolean;
};
