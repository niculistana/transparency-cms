export type InsertCommentDao = {
  author: string;
  text: string;
  likes: number;
  image: string;
  date: string;
};

export type InsertDocumentDao = {
  external_link: string;
  date: string;
};
