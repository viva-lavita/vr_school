import { Suspense } from "react";
import Footer from "./components/Footer/Footer";
import Header from "./components/Header/Header";
import { montserrat, inter, exo2 } from "@/lib/fonts";
import { UserProvider } from "@/shared/context/UserContext";
import "./globals.css";

export const metadata = {
  title: "Цифровая школа",
  description: "Знания через видео, практику и виртуальные эксперименты",
  icons: {
    icon: "/images/favicon.png",
  },
};


export default function RootLayout({ children }) {
  return (
    <html
      lang="ru"
      className={`${montserrat.variable} ${inter.variable} ${exo2.variable} scroll-smooth overflow-x-hidden`}
    >
      <body>
        <Suspense fallback={<div>Loading...</div>}>
          <UserProvider>
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="page-container flex-1">{children}</main>
              <Footer />
            </div>
          </UserProvider>
        </Suspense>
      </body>
    </html>
  );
}
