import React from 'react';
import { Search, MessageCircle } from 'lucide-react';

const CommentCard = ({ comment, author, publishDate, imageUrl }) => (
  <div className="bg-gray-700 p-4 rounded-lg mb-2 hover:bg-gray-600 transition-colors">
    <div className="flex items-center mb-3">
      <img 
        src={imageUrl} 
        alt={author} 
        className="w-10 h-10 rounded-full mr-3 object-cover"
        onError={(e) => {
          e.target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(author);
        }}
      />
      <div>
        <div className="font-semibold text-white">{author}</div>
        <div className="text-xs text-gray-400">{publishDate}</div>
      </div>
    </div>
    <p className="text-gray-300">{comment}</p>
  </div>
);

export const CommentsSection = ({ commentsData }) => {
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredComments = commentsData.filter(
    comment => 
      comment.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comment.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section id="comments" className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white flex items-center">
          <MessageCircle className="mr-2 h-6 w-6" />
          Community Comments
        </h2>
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search comments"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-gray-700 text-white px-3 py-2 rounded-lg pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        </div>
      </div>
      <div className="bg-gray-800 p-4 rounded-lg max-h-[400px] overflow-y-auto">
        {filteredComments.length > 0 ? (
          filteredComments.map(comment => (
            <CommentCard 
              key={comment.id}
              comment={comment.comment}
              author={comment.author}
              publishDate={comment.publishDate}
              imageUrl={comment.image_url || comment.imageUrl}
            />
          ))
        ) : (
          <div className="text-center text-gray-400 py-4">
            No comments found
          </div>
        )}
      </div>
    </section>
  );
};