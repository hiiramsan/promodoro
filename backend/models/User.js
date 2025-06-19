import mongoose from "mongoose"
import bcrypt from "bcrypt"

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    username: {
        type: String,
        required: true,
        unique: false,
    },
    password: {
        type: String,
        required: true,
        minglength: 6
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    tasksStats: {
        total: { type: Number, default: 0 },
        completed: { type: Number, default: 0 }
    }
}, { timestamps: true })

// hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
})

// password comparison
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
}

export default mongoose.model('User', userSchema);