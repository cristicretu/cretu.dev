export function cn(...args: (string | undefined | null | false)[]) {
  return args.filter(Boolean).join(' ');
}
