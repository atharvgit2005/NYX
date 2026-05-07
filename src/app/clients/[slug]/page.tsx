import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { ClientConfig } from '../types'
import ClientPortal from '../components/ClientPortal'

async function loadConfig(slug: string): Promise<ClientConfig | null> {
  try {
    const mod = await import(`../data/${slug}.config.json`)
    return mod.default as ClientConfig
  } catch {
    return null
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const config = await loadConfig(slug)
  if (!config) return {}
  return {
    title: `${config.client.name} × NYX Studio — Content Calendar`,
    description: `${config.campaign.title} · ${config.campaign.period}`,
    robots: { index: false, follow: false },
    openGraph: {
      title: `${config.client.name} × NYX Studio — Content Calendar`,
      description: `${config.campaign.title} · ${config.campaign.period}`,
      siteName: 'NYX Studio Client Portal',
    },
  }
}

export default async function ClientPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const config = await loadConfig(slug)
  if (!config) notFound()
  return <ClientPortal config={config} slug={slug} />
}
