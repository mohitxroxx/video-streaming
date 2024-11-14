import { Schema, model } from "mongoose";
import { hash, compare } from "bcrypt";
import jwt from "jsonwebtoken"

interface IUser {
    email: string,
    username: string,
    password: string,
    created_at: string,
    updated_at: string, 
    refreshToken: string, 
    match: (password: string) => Promise<boolean>,
    generateAccessToken(): string,
    generateRefreshToken(): string
}

const UserSchema = new Schema<IUser>({
    email: {
        type: String,
        required: true,
        trim: true 
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    refreshToken: {
        type: String
    }
}, { timestamps:true });

UserSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await hash(this.password, 10)
    }
    next();
});

UserSchema.methods.match = async function (password: string) {
    return compare(password, this.password);
}

UserSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
UserSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export default model<IUser>("User", UserSchema);
