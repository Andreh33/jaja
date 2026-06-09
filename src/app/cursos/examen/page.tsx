import { redirect } from 'next/navigation';
import { getCommercialId } from '@/lib/curso-auth';
import { getCourseState } from '@/lib/curso';
import { buildExam, PASS_MARK } from '@/lib/curso-exam';
import Exam from './Exam';

export const dynamic = 'force-dynamic';

export default async function ExamenPage() {
  const commercialId = await getCommercialId();
  if (!commercialId) redirect('/cursos');

  const state = await getCourseState(commercialId);
  if (!state.examUnlocked) redirect('/cursos');

  const questions = await buildExam();
  return <Exam questions={questions} passMark={PASS_MARK} />;
}
