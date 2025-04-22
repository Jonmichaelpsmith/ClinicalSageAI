import { Router } from "express";
import { assembleIND } from "../../scripts/buildIND.js";
const ind = Router();

// POST /api/ind/assemble { sequence }
ind.post("/ind/assemble", async (req, res, next) => {
  try {
    const { sequence } = req.body;
    const out = await assembleIND(sequence ?? "0000");
    res.json(out);
  } catch (e) { next(e); }
});

export default ind;