export type NewsType = {
  id: number;
  by?: string;
  descendants?: number;
  kids?: number[];
  score?: number;
  time?: number;
  title?: string;
  type?: string;
  url?: string;
  text?: string;
  parent?: number;
  dead?: boolean;
  deleted?: boolean;
};
