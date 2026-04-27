'use client';

import Script from 'next/script';
import { useId } from 'react';

interface SchemaOrgProps {
  schema: Record<string, unknown>;
}

export default function SchemaOrg({ schema }: SchemaOrgProps) {
  const id = useId();
  
  return (
    <Script
      id={`schema-org-${id.replace(/:/g, '')}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

