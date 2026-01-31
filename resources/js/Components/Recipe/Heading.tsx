import { ReactNode } from "react";

export default function Heading({ children }: { children: ReactNode }) {
    return <h3 className="text-xl font-medium mt-5">{children}</h3>;
}
