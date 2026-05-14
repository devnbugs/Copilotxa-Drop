import { SVGProps } from "react";

export function PremiumLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect x="20" y="20" width="60" height="60" rx="12" fill="currentColor" />
      <path
        d="M35 50 L45 60 L65 40"
        stroke="#000000"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
