import type { Metadata } from 'next'
import PortalSignupClient from './PortalSignupClient'

export const metadata: Metadata = {
  title: 'Request portal access',
  description: 'Submit a request to access your NYX brand-partner portal.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function PortalSignupPage() {
  return <PortalSignupClient />
}
