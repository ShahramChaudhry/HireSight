'use client';
export const dynamic = "force-dynamic";

import { Suspense } from 'react';
import DetailsContent from './DetailsContent';

export default function DetailsPage() {
  return (
    <Suspense fallback={<div className="text-gray-400 text-center p-8">Loading candidate details...</div>}>
      <DetailsContent />
    </Suspense>
  );
}