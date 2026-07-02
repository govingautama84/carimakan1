const RatingStars = ({ rating, max = 5, readOnly = true, onRatingChange, size = "w-5 h-5" }) => {
  return (
    <div className="flex items-center gap-1">
      {[...Array(max)].map((_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= rating;
        
        return (
          <button
            key={index}
            type="button"
            disabled={readOnly}
            onClick={() => !readOnly && onRatingChange && onRatingChange(starValue)}
            className={`${readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110 transition-transform'} focus:outline-none`}
          >
            <svg 
              className={`${size} ${isFilled ? 'star-filled' : 'star-empty'} transition-colors`} 
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        );
      })}
    </div>
  );
};

export default RatingStars;
