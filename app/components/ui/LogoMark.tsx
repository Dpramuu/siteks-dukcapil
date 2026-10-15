/** Logo satu warna dipakai sebagai mask, jadi warnanya diatur lewat className
 *  (mis. `bg-accent` atau `bg-hero-ink`) dan ikut berganti saat dark mode. */
export default function LogoMark({ className = '' }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`block ${className}`}
      style={{
        WebkitMaskImage: 'url(/logo_simanten.png)',
        maskImage: 'url(/logo_simanten.png)',
        WebkitMaskSize: 'contain',
        maskSize: 'contain',
        WebkitMaskRepeat: 'no-repeat',
        maskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
        maskPosition: 'center',
      }}
    />
  );
}