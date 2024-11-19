import dotenv from "dotenv";
dotenv.config();
import app from "./app";
import mongoose from "mongoose";

mongoose
	.connect(process.env.MONGO_URL as string, {})
	.then((data) => {
		console.log("MongoDB connection success");
		const PORT = process.env.PORT || 3003;
		app.listen(PORT, () => {
			console.info(`Server is running successfully on port: ${PORT}`);
			console.info(`Admin project on http://localhost:${PORT}/admin \n`);
		});
	})
	.catch((err) => console.log("ERROR on connection mongodb", err));
