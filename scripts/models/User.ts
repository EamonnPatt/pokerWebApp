import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'user' },
    alias: { type: String, default: '' },
    description: { type: String, default: '' }
});

export const User = mongoose.model('User', userSchema); 

