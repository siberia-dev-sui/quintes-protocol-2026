import Image from "next/image";

interface LogoProps {
  className?: string;
}

export const Logo = ({ className }: LogoProps) => {
  return (
    <Image
      src="/logo.svg"
      alt="Logo"
      width={31}
      height={31}
      className={className}
    />
  );
};
