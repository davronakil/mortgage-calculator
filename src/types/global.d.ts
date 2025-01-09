// import { ReactNode } from 'react'

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: Record<string, unknown>;
    }
  }
}

declare module 'react' {
  interface ReactNode {
    children?: ReactNode;
  }
}

export {};
