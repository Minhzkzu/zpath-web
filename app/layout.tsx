import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Compass, LayoutDashboard } from "lucide-react";

// Sử dụng font Inter cho hiện đại
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ZPATH - Định hướng tương lai",
  description: "Hiểu mình, hiểu ngành, chọn đúng tương lai",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${inter.className} bg-gray-50 text-zpath-dark min-h-screen flex flex-col`}>
        
        {/* Thanh Điều Hướng (Navbar) */}
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="text-2xl font-black text-transparent bg-clip-text bg-zpath-gradient tracking-tighter">
              ZPATH.
            </Link>

            {/* Menu */}
            <div className="flex gap-6">
              <Link href="/discover" className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-zpath-primary transition-colors">
                <Compass size={18} />
                Khám phá bản thân
              </Link>
              <Link href="/dashboard" className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-zpath-primary transition-colors">
                <LayoutDashboard size={18} />
                Dashboard
              </Link>
            </div>
          </div>
        </nav>

        {/* Nội dung các trang sẽ hiển thị ở đây */}
        <main className="flex-1">
          {children}
        </main>

      </body>
    </html>
  );
}