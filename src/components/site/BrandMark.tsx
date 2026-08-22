import type { SVGProps } from 'react';

export function BrandMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" {...props}>
      <path d="M6 8.5 13.8 4 26 11 18.2 15.5 6 8.5Z" stroke="currentColor" strokeWidth="1.6" />
      <path d="m6 14.5 12.2 7L26 17" stroke="currentColor" strokeWidth="1.6" />
      <path d="m6 20.5 12.2 7L26 23" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
