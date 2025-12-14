// models/movie.model.js
import { Schema, model } from 'mongoose';
const movieSchema = new Schema({
    name: {
        type: String,
        required: true,
        min: 3,
        max: 255
    },
    description: {
        type: String,
        max: 2048
    },
    image: {
        type: Buffer
    },
    genre: {
        type: String,
        enum: ['Action/Adventure', 'Animals', 'Animation', 'Biography', 'Comedy', 'Cooking', 'Dance', 'Documentary', 'Drama', 'Education', 'Entertainment', 'Family', 'Fantasy', 'History', 'Horror', 'Independent', 'International', 'Kids', 'Kids & Family', 'Medical', 'Military/War', 'Music', 'Musical', 'Mystery/Crime', 'Nature', 'Paranormal', 'Politics', 'Racing', 'Romance', 'Sci-Fi/Horror', 'Science', 'Science Fiction', 'Science/Nature', 'Spanish', 'Travel', 'Western'],
    },
    release_year: {
        type: Number,
        required: true
    },
    users_rating: {
        type: Number,
        default: 1
    },
    number_of_users_rating: {
        type: Number,
        default: 0
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

export default model('Movie', movieSchema);