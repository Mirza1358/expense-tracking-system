import type { Metadata } from "next";
import localFont from "next/font/local";
import { Toaster } from "sonner";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Expense Tracker",
  description: "Cloud-based expense tracking with real-time sync",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-canvas font-sans antialiased`}
      >
        <ThemeProvider>
          <AuthProvider>
            {children}
            <Toaster
              position="bottom-right"
              expand
              richColors
              closeButton
              duration={4000}
              toastOptions={{
                classNames: {
                  toast:
                    "group toast !rounded-xl !border !border-[var(--border)] !bg-[var(--surface)] !text-[var(--text-primary)] !shadow-xl",
                  title: "!text-sm !font-medium",
                  description: "!text-xs !text-[var(--text-secondary)]",
                  actionButton: "!bg-[var(--accent)] !text-[#09090b]",
                  cancelButton: "!bg-[var(--surface-raised)] !text-[var(--text-primary)]",
                  success: "!border-emerald-500/30",
                  error: "!border-rose-500/30",
                  loading: "!border-[var(--border)]",
                },
              }}
            />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
