import type { Metadata } from "next";
import "./globals.css";

import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Shallion Connections",
  description:
    "Accessible friendship and relationship platform for people living with chronic illness, functional conditions, neurodiversity and autism.",
 
};





export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
          <Nav />

        <main id="main">
          {children}
        </main>

        <Footer />
      </body>
    </html>
  );
}