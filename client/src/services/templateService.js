class TemplateService {
  constructor() {
    this.apiBase = '/api/templates';
  }

  async getTemplates() {
    const res = await fetch(this.apiBase);
    if (!res.ok) throw new Error('Failed to fetch templates');
    return res.json();
  }

  async getTemplate(id) {
    const res = await fetch(`${this.apiBase}/${id}`);
    if (!res.ok) throw new Error('Failed to fetch template');
    return res.json();
  }

  async createTemplate(data) {
    const res = await fetch(this.apiBase, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create template');
    return res.json();
  }

  async updateTemplate(id, data) {
    const res = await fetch(`${this.apiBase}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update template');
    return res.json();
  }
}

export default new TemplateService();
