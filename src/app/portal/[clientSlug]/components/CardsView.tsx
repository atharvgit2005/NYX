'use client'

import PostCard from './PostCard'
import type { BrandConfig } from '@/lib/portal/brand-config'
import type { SerializedPost } from './types'

interface Props {
  posts: SerializedPost[]
  brand: BrandConfig
  onSelectPost: (post: SerializedPost) => void
}

export default function CardsView({ posts, brand, onSelectPost }: Props) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {posts.map((post, i) => (
        <div
          key={post.id}
          style={{
            animation: 'portalCardIn 0.4s ease both',
            animationDelay: `${i * 60}ms`,
          }}
        >
          <PostCard post={post} brand={brand} onClick={() => onSelectPost(post)} />
        </div>
      ))}

      <style>{`
        @keyframes portalCardIn {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
