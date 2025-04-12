// import ProfilePictureUploader from './components/ProfilePictureUploader';
import ModalTeacher from './components/ModalTeacher'

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from "../utils/verifyToken"; 

export default async function Dashboard() {
  const cookiesData = await cookies();
  const token = cookiesData.get('jwt')?.value;

  
      const isValidToken = await verifyToken(token || '');
      if (!isValidToken) {
        redirect('/login'); 
      }
    
    return (
      <>
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Panel de Control</h1>
        <p className="text-gray-600">
          Bienvenido al sistema de gestión escolar. Usa el menú de la izquierda para navegar.
        </p>
      </>
    );
}
