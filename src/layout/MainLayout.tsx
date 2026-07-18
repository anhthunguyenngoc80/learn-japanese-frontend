import type { JSX } from "react";
import { Header } from "./header/Header";
import { Footer } from "./Footer";

type MainLayoutProps = {
    children: JSX.Element;
};

export const MainLayout = ({ children }: MainLayoutProps) => {
    return (
        <div className="bg-white text-slate-900 antialiased">
            <Header />
            <main className="">
                {children}
            </main>
            <Footer />
        </div>
    )
}
