import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ProveedorTema } from "@/components/proveedor-tema";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Plataforma escolar",
  description: "Gestión de matrículas, notas y pagos",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full">
        <ProveedorTema>{children}</ProveedorTema>
      </body>
    </html>
  );
}