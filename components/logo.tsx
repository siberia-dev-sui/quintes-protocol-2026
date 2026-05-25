import React from "react";

interface LogoProps {
  className?: string;
  style?: React.CSSProperties;
}

export const Logo = ({ className, style }: LogoProps) => {
  return (
    <img
      src="https://pub-731cbf0e109a4a5fbffae6de248ddd3a.r2.dev/Concept%201%20Logo%20-%20Dark.svg"
      alt="Quintes Logo"
      className={`${className} hover:opacity-80 transition-opacity`}
      style={style}
    />
  );
};
