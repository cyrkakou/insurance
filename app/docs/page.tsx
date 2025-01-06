'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import 'swagger-ui-react/swagger-ui.css';

// Import dynamique de SwaggerUI pour éviter les problèmes de SSR
const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });

export default function ApiDocs() {
  return (
    <div className="swagger-container">
      <Suspense fallback={<div>Chargement de la documentation...</div>}>
        <SwaggerUI url="/api/docs" />
      </Suspense>
      <style jsx global>{`
        .swagger-container {
          margin: 0;
          padding: 20px;
        }
        .swagger-ui .topbar {
          background-color: #1a365d;
        }
        .swagger-ui .info {
          margin: 20px 0;
        }
      `}</style>
    </div>
  );
}
