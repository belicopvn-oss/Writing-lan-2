export interface Question {
  id: string;
  part: string;
  original: string;
  keyword: string;
  sentenceStart: string;
  sentenceEnd: string;
  answer: string;
  explanation?: string;
}

export type QuizMode = 'practice' | 'test';
