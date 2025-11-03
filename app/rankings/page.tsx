'use client';
export const dynamic = "force-dynamic";

import { Suspense } from 'react';
import RankingsContent from './RankingsContent';

export default function RankingsPage() {
  return (
    <Suspense fallback={<div className="text-gray-400 text-center p-8">Loading rankings...</div>}>
      <RankingsContent />
    </Suspense>
  );
}