const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ArticleSchema = new Schema({
    title: { type: String, required: true, text: true },
    subtitle: { type: String },
    description: { type: String, required: true },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: String, required: true },
    createdAt: { type: Date, default: Date.now() },
    updatedAt: { type: Date, required: true }
})

ArticleSchema.path('title').validate({
    validator: (val) => {
        if (val.length < 5) {
            throw new Error("title is too short ==> at least 5 chars");
        } else if (val.length > 400) {
            throw new Error("title is too long ==> less than 400");
        }
        return true;
    },
    message: (props) => {
        return `${props.path} must have length between 5 and 400 chars, got ${props.value}`
    }
});
ArticleSchema.path('subtitle').validate({
    validator: (val) => {
        if (val.length < 5) { 
            throw new Error('subtitle is too short ==> at least 5 chars');
        }
        return true;
    },
    message: (props) => {
        return `${props.path} must have length at least 5 , got ${props.value}`;
    }
});
ArticleSchema.path('description').validate({
    validator: (val) => {
        if (val.length < 5) {
            throw new Error("description is too short ==> at least 5 chars");
        } else if (val.length > 5000) {
            throw new Error("description is too long ==> less than 5000 chars");
        }
        return true;
    },
    message: (props) => {
        return `${props.path} must have length between 5 and 5000 chars, got ${props.value}`;
    }
});
ArticleSchema.path('category').validate({
    validator: (val) => {
        if (val === 'sport' || val === 'games' || val === 'history') {
            return true;
        }
        throw new Error('FOrbidden category! Must be one of: sport, games or history');
    },
    message: (props) => {
        return `${props.path} must be one of: sport, games or history, got ${props.value}`
    }
});

module.exports = mongoose.model('Article', ArticleSchema);