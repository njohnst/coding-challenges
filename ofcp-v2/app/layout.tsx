import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ControllerProvider from "./controller-provider";
import { useState } from "react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Pineapple OFC",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ControllerProvider>
      <html lang="en">
        <body className={inter.className}>{children}</body>
      </html>
    </ControllerProvider>
  );
}
