import { Router } from "express";
import docushareRoutes from "./docushare.js";
import signatureRoutes from "./signature.js";
import indRoutes from "./ind.js";
import chatRoutes from "./chat.js";
import documentRoutes from "./document.js";

const api = Router();

// Mount the various API routes
api.use(docushareRoutes);
api.use(signatureRoutes);
api.use(indRoutes);
api.use(chatRoutes); // Add the new chat routes
api.use(documentRoutes); // Add the new document AI routes

export default api;