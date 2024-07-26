declare module 'properties' {
  export type PropertiesState = {
    position: 'def' | 'quote' | 'comment';
    nextMultiline: boolean;
    inMultiline: boolean;
    afterSection: boolean;
  };
}

export {};
