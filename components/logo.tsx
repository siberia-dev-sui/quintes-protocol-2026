import Image from "next/image";

interface LogoProps {
  className?: string;
}

export const Logo = ({ className }: LogoProps) => {
  return (
    <img
      src="https://pub-731cbf0e109a4a5fbffae6de248ddd3a.r2.dev/Concept%201%20Logo%20-%20Dark.svg"
      alt="Quintes Logo"
      className={className}
    />
  );
};
