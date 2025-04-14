import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from "../../utils/verifyToken"; 
import axios from 'axios';
import { Exam } from '../../utils/types';

export default async function Exams() {
    const getExams = async (token: string) => {
        try {
            const res = await axios.get('http://localhost:8080/api/v1/get_student_assessments/', {
                headers: {
                    'Content-Type': 'application/json',
                    'Cookie': `jwt=${token}`
                },
                withCredentials: true
            });
            return res.data;
        } catch (error) {
            console.error("Error fetching exams:", error);
            throw error;
        }
    }

    const cookiesData = await cookies();
    const token = cookiesData.get('jwt')?.value;
    
    const isValidToken = await verifyToken(token || '');
    if (!isValidToken) {
        redirect('/login'); 
    }

    const exams = await getExams(token!);

    return (
        <div>
            {exams.map((exam: Exam) => (
                <div key={exam.id} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                    <h2 className="text-lg font-bold mb-2">{exam.task}</h2>
                    <p className="text-gray-700 text-base mb-4">Fecha: {exam.due_date}</p>
                    <p className="text-gray-700 text-base mb-4">Materia: {exam.subject_id}</p>
                    <p className="text-gray-700 text-base mb-4">Tipo: {exam.type}</p>
                </div>
            ))}
        </div>
    )
}
