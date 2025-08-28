import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import { AuthProvider } from "@/lib/contexts/AuthContext";

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Refugio de Montaña - Sistema de Reservas',
  description: 'Sistema de reservas para refugio de montaña con múltiples tipos de alojamiento',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}