import Image, { type ImageProps } from 'next/image';

type BrandMarkProps = Omit<ImageProps, 'src' | 'alt' | 'width' | 'height' | 'unoptimized'>;

export function BrandMark(props: BrandMarkProps) {
  return (
    <Image
      {...props}
      src="/brand/kipory-symbol-vector.svg"
      alt=""
      width={34}
      height={32}
      unoptimized
    />
  );
}
