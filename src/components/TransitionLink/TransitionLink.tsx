"use client";
import Link, { LinkProps } from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { usePageTransitionState } from "@/atoms/pageTransitionAtoms";
import { useEffect, useState } from "react";

interface TransitionLinkProps extends LinkProps {
    children: React.ReactNode;
    href: string;
    className?: string;
}

export default function TransitionLink({
    children,
    href,
    ...props
}: TransitionLinkProps) {
    const pathname = usePathname();
    const [active, setActive] = useState(pathname === href);
    const router = useRouter();
    const pageTransitionState = usePageTransitionState();
    const onClick = props.onClick;
    delete props.onClick;

    useEffect(() => {
        setActive(pathname === href);
    }, [pathname, href])

    function handleClick(event: React.MouseEvent<HTMLAnchorElement>) {
        event.preventDefault();
        if (href !== pathname) {
            pageTransitionState.onExitComplete(() => router.push(href));
            pageTransitionState.setToExit();
        }
        if (onClick) onClick(event);

        // Perform any custom logic here, such as animations or transitions
    }

    props.className = `${props.className} ${active ? "active" : ""}`;
    return <Link href={href} {...props} onClick={handleClick}>{children}</Link>
}