import { ReactNode } from 'react';

export type QuestionAnswer = {
  question: ReactNode | string;
  answer: ReactNode | string;
  image?: ReactNode;
};
