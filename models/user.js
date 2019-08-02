const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
    // _id: Schema.Types.ObjectId,
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    role: { type: String, required: true },
    cratedAt: { type: Schema.Types.Date, default: Date.now() },
    numberOfArticles: { type: Number, default: 0 },
    nickname: String
});

ProductSchema.path('firstName').validate({
    validator: (val) => {
        if (val.length < 4) {
            throw new Error("first name is too short");
        } else if (val.length > 50) {
            throw new Error("first name is too long");
        }
        return true
    },
    message: (props) => {
        return `${props.path} must have length between 4 and 50 chars, got ${props.value}`;
    }
});
ProductSchema.path('lastName').validate({
    validator: (val) => {
        if (val.length < 3) {
            throw new Error("last name is too short");
        } else if (val.length > 60) {
            throw new Error("last name is too long");
        }
        return true
    },
    message: (props) => {
        return `${props.path} must have length between 3 and 60 chars, got ${props.value}`;
    }
});
ProductSchema.path('role').validate({
    validator: (val) => {
        if (val === "admin" || val === "writer" || val === "guest") {
            return true
        }
        throw new Error("Forbidden role! Must be one of: admin, writer or guest");
    },
    message: (props) => {
        return `${props.path} must be one of: admin, writer or guest, got ${props.value}`;
    } 
})

module.exports = mongoose.model('User', ProductSchema);