import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Card, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import type { Postcard } from '../types'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

interface GalleryPageProps {
  onEdit?: (postcard: Postcard) => void
}

export function GalleryPage({ onEdit }: GalleryPageProps) {
  const [postcards, setPostcards] = useState<Postcard[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPostcards = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_URL}/postcards`)
      setPostcards(response.data)
      setError(null)
    } catch (err) {
      setError('Failed to load postcards')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPostcards()
  }, [])

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this postcard?')) return

    try {
      await axios.delete(`${API_URL}/postcards/${id}`)
      fetchPostcards()
    } catch (err) {
      console.error('Failed to delete postcard:', err)
      alert('Failed to delete postcard')
    }
  }

  if (loading) {
    return (
      <div className="py-16 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-terracotta-100 mb-4">
          <svg className="animate-spin h-8 w-8 text-terracotta-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
        <p className="text-cream-600">Loading your postcards...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-16 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-100 mb-4">
          <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={fetchPostcards}>Try Again</Button>
      </div>
    )
  }

  if (postcards.length === 0) {
    return (
      <div className="py-16 text-center animate-fade-in">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-cream-100 mb-6">
          <span className="text-4xl">📭</span>
        </div>
        <h2 className="font-display text-2xl font-semibold text-cream-900 mb-2">
          No postcards yet
        </h2>
        <p className="text-cream-600 mb-6 max-w-md mx-auto">
          Start creating beautiful postcards to share with your loved ones.
        </p>
        <Button onClick={() => window.location.href = '#/create'}>
          Create Your First Postcard
        </Button>
      </div>
    )
  }

  return (
    <div className="animate-fade-in py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-cream-900">
              My Postcards
            </h1>
            <p className="text-cream-600 mt-1">
              {postcards.length} {postcards.length === 1 ? 'postcard' : 'postcards'} created
            </p>
          </div>
          
          <Button onClick={() => window.location.href = '#/create'}>
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create New
          </Button>
        </div>

        {/* Postcards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {postcards.map((postcard) => (
            <Card key={postcard.id} className="group">
              {/* Image */}
              <div className="aspect-[4/3] bg-cream-100 overflow-hidden">
                {postcard.image_path ? (
                  <img
                    src={`${API_URL}${postcard.image_path}`}
                    alt={postcard.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-cream-100 to-cream-200">
                    <span className="text-6xl">✉️</span>
                  </div>
                )}
              </div>

              <CardContent className="p-5">
                <h3 className="font-display text-lg font-semibold text-cream-900 mb-2 line-clamp-1">
                  {postcard.title}
                </h3>
                
                {postcard.message && (
                  <p className="text-cream-600 text-sm mb-3 line-clamp-2">
                    {postcard.message}
                  </p>
                )}

                {postcard.recipient_email && (
                  <p className="text-xs text-cream-500 mb-3">
                    To: {postcard.recipient_email}
                  </p>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-cream-100">
                  <span className="text-xs text-cream-400">
                    {new Date(postcard.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEdit?.(postcard)}
                      className="p-2 text-cream-500 hover:text-terracotta-600 hover:bg-terracotta-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(postcard.id)}
                      className="p-2 text-cream-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
