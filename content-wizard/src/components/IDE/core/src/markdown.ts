import markdownit from 'markdown-it';

export const markdown = markdownit({
  breaks: true,
  linkify: true,
} as markdownit.Options);
