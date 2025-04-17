import styles from "./Page.module.css";

export default function Page({
    children,
    className,
}: Readonly<{
    children: React.ReactNode;
    className?: string;
}>) {
    return (
        <div className={`${className} ${styles.page}`}>
            {children}
        </div>
    )
}