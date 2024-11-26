import "./globals.css";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import Header from "@/components/Header";
import Provider from "./provider";
import { Toaster } from "react-hot-toast";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "URL Shortener",
  description:
    "Professional URL shortener with analytics and QR code generation"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(inter.className, "mx-auto max-w-screen-lg")}>
        <Provider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem>
            <Header />
            <main className="container mx-auto px-4 py-8">
              {children}
            </main>
          </ThemeProvider>
        </Provider>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
