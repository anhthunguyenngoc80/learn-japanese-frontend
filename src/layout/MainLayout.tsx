import type { JSX } from "react";
import { Header } from "./header/Header";
import { Footer } from "./Footer";

type MainLayoutProps = {
    children: JSX.Element;
};

export const MainLayout = ({ children }: MainLayoutProps) => {
    return (
        <div className="min-h-screen bg-white text-slate-900 antialiased">
            <Header />
            <main>
                {children}
            </main>
            <Footer />
        </div>
    )
}
