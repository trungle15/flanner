import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { MealPlanProvider } from "@/contexts/MealPlanContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import dynamic from "next/dynamic";

// Use dynamic import to prevent SSR issues with localStorage
import NavigationBar from "@/components/NavigationBar";

const geist = Geist({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Flanner - Meal Planning Assistant",
  description: "Plan your meals and discover dining options",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geist.className} antialiased`}>
        <AuthProvider>
          <MealPlanProvider>
            <ThemeProvider>
              <div className="min-h-screen flex flex-col">
                <NavigationBar />
                <main className="flex-grow">{children}</main>
              </div>
            </ThemeProvider>
          </MealPlanProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
