import type { ReferenceImage, ReferenceImageType } from '../types'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

export interface UploadReferenceResponse {
  id: string
  url: string
  name: string
  type: ReferenceImageType
}

/**
 * Upload a reference image to the server
 */
export async function uploadReferenceImage(
  file: File,
  type: ReferenceImageType,
  postcardId?: number
): Promise<UploadReferenceResponse> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('type', type)
  if (postcardId) {
    formData.append('postcard_id', postcardId.toString())
  }

  const response = await fetch(`${API_BASE_URL}/references/upload`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Upload failed' }))
    throw new Error(error.message || 'Failed to upload reference image')
  }

  return response.json()
}

/**
 * Fetch reference images for a postcard
 */
export async function fetchReferenceImages(postcardId: number): Promise<ReferenceImage[]> {
  const response = await fetch(`${API_BASE_URL}/references?postcard_id=${postcardId}`)

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Fetch failed' }))
    throw new Error(error.message || 'Failed to fetch reference images')
  }

  return response.json()
}

/**
 * Delete a reference image
 */
export async function deleteReferenceImage(referenceId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/references/${referenceId}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Delete failed' }))
    throw new Error(error.message || 'Failed to delete reference image')
  }
}

/**
 * Update reference image type
 */
export async function updateReferenceImageType(
  referenceId: string,
  type: ReferenceImageType
): Promise<ReferenceImage> {
  const response = await fetch(`${API_BASE_URL}/references/${referenceId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ type }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Update failed' }))
    throw new Error(error.message || 'Failed to update reference image')
  }

  return response.json()
}

/**
 * Upload multiple reference images in batch
 */
export async function uploadReferenceImagesBatch(
  references: { file: File; type: ReferenceImageType }[],
  postcardId?: number
): Promise<UploadReferenceResponse[]> {
  const uploadPromises = references.map(({ file, type }) =>
    uploadReferenceImage(file, type, postcardId)
  )

  return Promise.all(uploadPromises)
}

/**
 * Save all reference images for a postcard
 * This uploads new references and returns the complete list
 */
export async function saveReferenceImages(
  references: ReferenceImage[],
  postcardId: number
): Promise<ReferenceImage[]> {
  // Filter out references that have a file (new uploads)
  const newReferences = references.filter(ref => ref.file !== null)
  
  if (newReferences.length === 0) {
    // No new uploads, just return existing
    return references
  }

  // Upload new references
  const uploadPromises = newReferences.map(ref =>
    uploadReferenceImage(ref.file!, ref.type, postcardId)
  )

  const uploaded = await Promise.all(uploadPromises)

  // Merge uploaded references with existing ones (that don't have files)
  const existingReferences = references.filter(ref => ref.file === null)
  
  return [
    ...existingReferences,
    ...uploaded.map(u => ({
      id: u.id,
      url: u.url,
      file: null,
      type: u.type,
      name: u.name,
      createdAt: new Date().toISOString(),
    })),
  ]
}
