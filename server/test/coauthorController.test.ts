import { generateDraft } from '../controllers/coauthorController.js';

describe('coauthorController.generateDraft', () => {
  it('returns generated draft text', () => {
    const req: any = { validatedBody: { moduleId: 'M1', sectionId: '1.1', prompt: 'test' } };
    const res: any = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    generateDraft(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, draft: expect.any(String) })
    );
  });
});
