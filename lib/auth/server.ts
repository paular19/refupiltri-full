import { cookies } from 'next/headers';
import { auth } from '@/lib/firebase/config';

const ADMIN_EMAILS = ['ramospaula1996@gmail.com'];

export async function checkAdminAuth(): Promise<boolean> {
  try {
    // 1. Leer la cookie de sesión
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value;

    if (!sessionCookie) {
      console.log('No hay cookie de sesión');
      return false;
    }

    // 2. Verificar que la cookie es válida
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
    
    // 3. Verificar que es admin
    const userEmail = decodedClaims.email;
    const isAdmin = userEmail ? ADMIN_EMAILS.includes(userEmail) : false;
    
    console.log('Usuario verificado:', userEmail, 'Es admin:', isAdmin);
    return isAdmin;
    
  } catch (error) {
    console.error('Error verificando autenticación:', error);
    return false;
  }
}