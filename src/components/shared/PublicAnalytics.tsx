'use client';

import { Analytics } from '@vercel/analytics/next';
import { sanitizeMeasurementUrl } from '@/lib/measurement';

export default function PublicAnalytics() {
  return <Analytics beforeSend={(event) => {
    const url = sanitizeMeasurementUrl(event.url);
    return url ? { ...event, url } : null;
  }} />;
}
