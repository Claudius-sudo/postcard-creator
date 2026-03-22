import type { Postcard } from '../App'

interface PostcardListProps {
  postcards: Postcard[]
  onDelete: (id: number) => void
  apiUrl: string
}

function PostcardList({ postcards, onDelete, apiUrl }: PostcardListProps) {
  if (postcards.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <p className="text-gray-500 text-lg">No postcards yet.</p>
        <p className="text-gray-400 mt-2">Create your first postcard above!</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {postcards.map((postcard) => (
        <div 
          key={postcard.id} 
          className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
        >
          {postcard.image_path ? (
            <img
              src={`${apiUrl}${postcard.image_path}`}
              alt={postcard.title}
              className="w-full h-48 object-cover"
            />
          ) : (
            <div className="w-full h-48 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
              <span className="text-4xl">✉️</span>
            </div>
          )}
          
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {postcard.title}
            </h3>
            
            {postcard.message && (
              <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                {postcard.message}
              </p>
            )}
            
            {postcard.recipient_email && (
              <p className="text-gray-500 text-xs mb-3">
                To: {postcard.recipient_email}
              </p>
            )}
            
            <div className="flex justify-between items-center pt-3 border-t border-gray-100">
              <span className="text-gray-400 text-xs">
                {new Date(postcard.created_at).toLocaleDateString()}
              </span>
              <button
                onClick={() => onDelete(postcard.id)}
                className="text-red-500 hover:text-red-700 text-sm font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default PostcardList
