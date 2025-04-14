// import ProfilePictureUploader from './components/ProfilePictureUploader';
import ModalTeacher from './components/ModalTeacher'

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from "../../utils/verifyToken"; 

export default async function Dashboard() {
  const cookiesData = await cookies();
  const token = cookiesData.get('jwt')?.value;

  
      const isValidToken = await verifyToken(token || '');
      if (!isValidToken) {
        redirect('/login'); 
      }
    
    return (
      <>
        <div className='absolute right-5 bottom-5'>
          <ModalTeacher />
        </div>
      </>
    );
}
