import '../styles/globals.css';
import { AuthProvider } from './context/AuthContext';

export const metadata = {
  title: 'ComerciosConecta',
  description: 'Aplicación de gestión de comercios',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
