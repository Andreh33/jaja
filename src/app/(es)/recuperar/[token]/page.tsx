import { redirect } from 'next/navigation';

// Do not render or serialize retired bearer tokens into the page, analytics
// or an outbound support link. The API rejects every legacy token as well.
export default function ResetPage() {
  redirect('/recuperar?enlace=retirado');
}
