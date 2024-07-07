declare module 'properties' {
  export interface PropertiesState {
    position: 'def' | 'quote' | 'comment';
    nextMultiline: boolean;
    inMultiline: boolean;
    afterSection: boolean;
  }
}

export {};
