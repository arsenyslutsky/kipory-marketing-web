import Image, { type ImageProps } from 'next/image';

type BrandMarkProps = Omit<ImageProps, 'src' | 'alt' | 'width' | 'height' | 'unoptimized'>;

export function BrandMark(props: BrandMarkProps) {
  return (
    <Image
      {...props}
      src="/brand/kipory-logo.svg"
      alt=""
      width={80}
      height={80}
      unoptimized
    />
  );
}
