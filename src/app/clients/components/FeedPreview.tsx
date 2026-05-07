'use client'

import { useState } from 'react'
import { ClientConfig, Post, TYPE_GRADIENTS } from '../types'
import PostModal from './PostModal'

interface Props {
  config: ClientConfig
}

const TYPE_ICONS: Record<string, string> = {
  Reel: '▶',
  Carousel: '⧉',
  Photo: '◻',
  'Reel + Story': '▶',
  Story: '○',
}

export default function FeedPreview({ config }: Props) {
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)

  // Fill 9 cells: 8 posts + 1 placeholder
  const cells: (Post | null)[] = [...config.posts.slice(0, 8), null]

  return (
    <section
      className="py-12"
      style={{ background: '#FAF7F2', borderTop: '1px solid #E8E4DC', borderBottom: '1px solid #E8E4DC' }}
    >
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2
              className="text-3xl font-bold"
              style={{ fontFamily: 'var(--font-playfair)', color: '#1A2A5E' }}
            >
              Feed Preview
            </h2>
            <p
              className="text-sm mt-1"
              style={{ fontFamily: 'var(--font-inter)', color: '#6B6B6B' }}
            >
              How the content looks on Instagram · click any post to view details
            </p>
          </div>

          {/* Fake Instagram profile header */}
          <div
            className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full"
            style={{ background: '#FFFFFF', border: '1px solid #E8E4DC' }}
          >
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
              style={{ background: `linear-gradient(135deg, ${config.brand.primary}, ${config.brand.secondary})` }}
            >
              D
            </div>
            <span
              className="text-xs font-medium"
              style={{ fontFamily: 'var(--font-inter)', color: '#1A2A5E' }}
            >
              @dessertino.pune
            </span>
          </div>
        </div>

        {/* Instagram 3-col grid mockup */}
        <div
          className="max-w-sm md:max-w-md mx-auto rounded-2xl overflow-hidden"
          style={{ border: '1px solid #E8E4DC', boxShadow: '0 8px 32px rgba(26,42,94,0.08)' }}
        >
          {/* Fake profile bar */}
          <div
            className="flex items-center gap-3 px-4 py-3"
            style={{ background: '#FFFFFF', borderBottom: '1px solid #F0EDE6' }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
              style={{ background: `linear-gradient(135deg, ${config.brand.primary}, ${config.brand.secondary})` }}
            >
              D
            </div>
            <div>
              <p className="text-xs font-semibold" style={{ fontFamily: 'var(--font-inter)', color: '#1A2A5E' }}>
                dessertino.pune
              </p>
              <p className="text-xs" style={{ fontFamily: 'var(--font-inter)', color: '#6B6B6B' }}>
                Shakes and More · Pune
              </p>
            </div>
          </div>

          {/* 3-col grid */}
          <div className="grid grid-cols-3 gap-0.5" style={{ background: '#F0EDE6' }}>
            {cells.map((post, i) => {
              if (!post) {
                return (
                  <div
                    key={i}
                    className="aspect-square flex items-center justify-center"
                    style={{ background: '#FFFFFF' }}
                  >
                    <div className="text-center">
                      <p className="text-xs mb-0.5" style={{ color: '#C0BAB0' }}>···</p>
                      <p className="text-xs" style={{ fontFamily: 'var(--font-inter)', color: '#C0BAB0', fontSize: '9px' }}>
                        coming soon
                      </p>
                    </div>
                  </div>
                )
              }

              const gradient = TYPE_GRADIENTS[post.type] ?? TYPE_GRADIENTS['Reel']
              const icon = TYPE_ICONS[post.type] ?? '◻'

              return (
                <button
                  key={post.id}
                  onClick={() => setSelectedPost(post)}
                  className="aspect-square relative group overflow-hidden"
                  style={{ background: gradient }}
                >
                  {/* Overlay on hover */}
                  <div
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: 'rgba(0,0,0,0.35)' }}
                  >
                    <p className="text-white text-xs font-medium px-1 text-center leading-tight" style={{ fontFamily: 'var(--font-inter)', fontSize: '10px' }}>
                      {post.title.split('—')[0].trim()}
                    </p>
                  </div>

                  {/* Post number */}
                  <div className="absolute top-1.5 left-1.5">
                    <span
                      className="text-white font-bold"
                      style={{ fontSize: '10px', fontFamily: 'var(--font-inter)', textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}
                    >
                      #{post.id}
                    </span>
                  </div>

                  {/* Type icon */}
                  <div className="absolute top-1.5 right-1.5">
                    <span className="text-white" style={{ fontSize: '9px', textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}>
                      {icon}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-4 mt-6">
          {Object.entries(TYPE_GRADIENTS).map(([type, gradient]) => (
            <div key={type} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-sm"
                style={{ background: gradient }}
              />
              <span
                className="text-xs"
                style={{ fontFamily: 'var(--font-inter)', color: '#6B6B6B' }}
              >
                {type}
              </span>
            </div>
          ))}
        </div>
      </div>

      {selectedPost && (
        <PostModal
          post={selectedPost}
          config={config}
          onClose={() => setSelectedPost(null)}
        />
      )}
    </section>
  )
}
