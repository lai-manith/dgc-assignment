export type CommentType = {
  id: number;
  by: string;
  text: string;
  time: number;
  parent: number;
  kids?: number[];
  deleted?: boolean;
  dead?: boolean;
};
