import mongoose from "mongoose";
import { ViewGroup } from "../enums/view.enum";

export interface View {
	_id: mongoose.ObjectId;
	viewGroup: ViewGroup;
	memberId: mongoose.ObjectId;
	viewRefId: mongoose.ObjectId;
	createdAt: Date;
	updatedAt: Date;
}

export interface ViewInput {
	viewGroup: ViewGroup;
	memberId: mongoose.ObjectId;
	viewRefId: mongoose.ObjectId;
}
