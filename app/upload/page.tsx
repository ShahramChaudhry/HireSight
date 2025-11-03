'use client';
export const dynamic = "force-dynamic";

import { Suspense } from 'react';
import UploadContent from './UploadContent';

export default function UploadPage() {
  return (
    <Suspense fallback={<div className="text-center p-12 text-gray-400">Loading upload page...</div>}>
      <UploadContent />
    </Suspense>
  );
}
