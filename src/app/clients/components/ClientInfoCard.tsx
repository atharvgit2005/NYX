'use client'

import { ClientConfig } from '../types'

interface Props {
  config: ClientConfig
}

export default function ClientInfoCard({ config }: Props) {
  const { client, brand } = config

  const rows = [
    { label: 'Brand', value: client.name },
    { label: 'Tagline', value: client.tagline },
    { label: 'Contact', value: client.contact },
    { label: 'Email', value: client.email, isLink: `mailto:${client.email}` },
    { label: 'Phone', value: client.phone, isLink: `tel:${client.phone.replace(/\s/g, '')}` },
    { label: 'Operations', value: client.operations },
  ]

  return (
    <section className="max-w-5xl mx-auto px-6 py-12">
      <div
        className="rounded-2xl overflow-hidden"
        style={{ border: '1px solid #E8E4DC', background: '#FFFFFF' }}
      >
        {/* Card header */}
        <div
          className="px-6 py-5 flex items-center gap-3"
          style={{ borderBottom: '1px solid #E8E4DC', background: '#FAF7F2' }}
        >
          <div
            className="w-2 h-2 rounded-full"
            style={{ background: brand.primary }}
          />
          <h2
            className="text-base font-semibold tracking-wide"
            style={{ fontFamily: 'var(--font-inter)', color: '#1A2A5E', letterSpacing: '0.04em' }}
          >
            CLIENT BRIEF
          </h2>
        </div>

        <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x" style={{ borderColor: '#E8E4DC' }}>
          {/* Info table */}
          <div className="divide-y" style={{ borderColor: '#E8E4DC' }}>
            {rows.map((row) => (
              <div key={row.label} className="flex px-6 py-4 gap-4">
                <span
                  className="text-xs tracking-widest uppercase w-20 shrink-0 pt-0.5"
                  style={{ fontFamily: 'var(--font-inter)', color: '#6B6B6B' }}
                >
                  {row.label}
                </span>
                {row.isLink ? (
                  <a
                    href={row.isLink}
                    className="text-sm font-medium underline underline-offset-2"
                    style={{ fontFamily: 'var(--font-inter)', color: brand.primary }}
                  >
                    {row.value}
                  </a>
                ) : (
                  <span
                    className="text-sm font-medium"
                    style={{ fontFamily: 'var(--font-inter)', color: '#1A2A5E' }}
                  >
                    {row.value}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Products */}
          <div className="px-6 py-6">
            <p
              className="text-xs tracking-widest uppercase mb-4"
              style={{ fontFamily: 'var(--font-inter)', color: '#6B6B6B' }}
            >
              Products
            </p>
            <div className="flex flex-wrap gap-2">
              {client.products.map((product) => (
                <span
                  key={product}
                  className="px-3 py-1.5 rounded-full text-xs font-medium"
                  style={{
                    background: '#FAF7F2',
                    border: '1px solid #E8E4DC',
                    fontFamily: 'var(--font-inter)',
                    color: '#1A2A5E',
                  }}
                >
                  {product}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
