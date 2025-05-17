import { z } from 'zod';

const generateDraftSchema = z.object({
  moduleId: z.string().min(1),
  sectionId: z.string().min(1),
  prompt: z.string().min(1)
});

export const validateGenerateDraft = (req, res, next) => {
  try {
    req.validatedBody = generateDraftSchema.parse(req.body);
    next();
  } catch (err) {
    const errors = err.errors || err.message;
    res.status(400).json({ success: false, message: 'Invalid request', errors });
  }
};
