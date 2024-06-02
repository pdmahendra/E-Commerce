import mongoose, { Schema } from "mongoose";
import validator from 'validator'

interface IUser extends Document {
    _id: string;
    name: string;
    email: string;
    photo: string;
    role: "admin" | "user";
    gender: "male" | "female";
    dob: Date;
    createdAt: Date;
    updatedAt: Date;
    age: number;  //virtual attribute
}

const userSchema = new Schema({
    _id: {
        type: String,
        required: [true, "Please enter ID"]
    },
    name: {
        type: String,
        required: [true, "Please enter Name"]
    },
    email: {
        type: String,
        required: [true, "Please enter email"],
        unique: [true, "Email already Exist"],
        validate: [validator.isEmail, 'Invalid email']
    },
    photo: {
        type: String,
        required: [true, "Please add photo"]
    },
    role: {
        type: String,
        enum: ["admin", "user"],
        default: "user"
    },
    gender: {
        type: String,
        enum: ["male", "female"],
        required: [true, "Please enter gender"]
    },
    dob: {
        type: Date,
        required: [true, "Please enter Date of Birth"]
    },

}, {
    timestamps: true
});

userSchema.virtual("age").get(function (this: IUser) {
    const today = new Date();
    const dob = this.dob;
    let age = today.getFullYear() - dob.getFullYear();

    if (today.getMonth() < dob.getMonth() || today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate()) {
        age--;
    }
    return age;
})

const User = mongoose.model<IUser>('User', userSchema)

export default User;
