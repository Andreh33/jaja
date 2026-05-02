import { listApplicationsWithOffer } from '@/lib/admin-jobs';
import ApplicationsTable from './_components/ApplicationsTable';

export const dynamic = 'force-dynamic';

export default async function AdminCandidaturasPage() {
  const apps = await listApplicationsWithOffer();
  const serialized = apps.map((a) => ({
    id: a.id,
    fullName: a.fullName,
    email: a.email,
    phone: a.phone,
    city: a.city,
    status: a.status as 'pendiente' | 'contactado' | 'descartado' | 'contratado',
    jobOfferId: a.jobOfferId,
    offerTitle: a.offerTitle,
    createdAtMs:
      typeof a.createdAt === 'number'
        ? a.createdAt * 1000
        : (a.createdAt as Date | null)?.getTime() ?? null,
  }));
  // Build offer filter list (distinct).
  const offerOptions = Array.from(
    new Map(
      apps
        .filter((a) => a.jobOfferId && a.offerTitle)
        .map((a) => [a.jobOfferId as string, a.offerTitle as string]),
    ).entries(),
  ).map(([id, title]) => ({ id, title }));

  return (
    <div className="px-6 py-8 md:px-10 md:py-12">
      <h1 className="font-display text-3xl text-white md:text-4xl" style={{ letterSpacing: '-0.04em', fontWeight: 800 }}>
        Candidaturas
      </h1>
      <p className="mt-2 text-sm text-white/55">{apps.length} candidaturas registradas en total.</p>
      <ApplicationsTable apps={serialized} offerOptions={offerOptions} />
    </div>
  );
}
