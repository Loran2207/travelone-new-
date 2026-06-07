// Lets TSX use the <iconify-icon> web component (from the `iconify-icon` package).
import type { DetailedHTMLProps, HTMLAttributes } from "react";

type IconifyIconProps = DetailedHTMLProps<
  HTMLAttributes<HTMLElement> & {
    icon: string;
    width?: string | number;
    height?: string | number;
    inline?: boolean;
    flip?: string;
    rotate?: string | number;
  },
  HTMLElement
>;

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "iconify-icon": IconifyIconProps;
    }
  }
}
