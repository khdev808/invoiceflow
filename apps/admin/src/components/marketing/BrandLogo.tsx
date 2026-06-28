import Image from 'next/image';
import Link from 'next/link';

const sizeMap = {
  sm: { width: 120, height: 24, className: 'h-6 w-auto' },
  md: { width: 160, height: 32, className: 'h-8 w-auto' },
  lg: { width: 200, height: 40, className: 'h-10 w-auto' },
} as const;

type BrandLogoSize = keyof typeof sizeMap;

type BrandLogoProps = {
  size?: BrandLogoSize;
  href?: string;
  priority?: boolean;
};

export function BrandLogo({ size = 'md', href = '/', priority = false }: BrandLogoProps) {
  const { width, height, className } = sizeMap[size];

  const logo = (
    <Image
      src="/brand/logo-full.svg"
      alt="InvoiceFlow"
      width={width}
      height={height}
      className={className}
      priority={priority}
    />
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex shrink-0 items-center">
        {logo}
      </Link>
    );
  }

  return logo;
}
