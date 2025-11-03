'use client';
export const dynamic = "force-dynamic";

import { Suspense } from 'react';
import CriteriaContent from './CriteriaContent';

export default function CriteriaPage() {
  return (
    <Suspense fallback={<div className="text-gray-400 text-center p-8">Loading job criteria...</div>}>
      <CriteriaContent />
    </Suspense>
  );
}