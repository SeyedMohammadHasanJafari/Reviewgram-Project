// models/friendship.model.js
import { Schema, model } from 'mongoose';
const friendshipSchema = new Schema({
    from: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    to: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

export default model('Friendship', friendshipSchema);