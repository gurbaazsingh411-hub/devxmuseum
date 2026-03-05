import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DinoQuest Museum | 2D Educational Exploration",
  description: "Explore the virtual dinosaur museum, complete puzzles, and unlock custom dinosaurs!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
