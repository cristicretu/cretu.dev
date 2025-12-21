interface Props {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
}

export default function MDXImage({ src, alt, width, height, className }: Props) {
  return (
    <img 
      src={src} 
      alt={alt} 
      width={width}
      height={height}
      className={`rounded-lg ${className || ''}`}
      loading="lazy"
    />
  );
}
