import axios from 'axios';

export default {
  saveDraft: ({ sectionId, content }) =>
    axios.post(`/api/coauthor/save`, { sectionId, content }),
  generateDraft: (sectionId) =>
    axios.post(`/api/coauthor/generate-draft`, { sectionId }),
  generateWithTemplate: (sectionId, fields) =>
    axios.post(`/api/coauthor/template-fill/${sectionId}`, fields).then(r=>r.data),
  fetchGuidance: (sectionId) =>
    axios.get(`/api/coauthor/guidance/${sectionId}`).then(r=>r.data),
  getSuggestion: (sectionId, content) =>
    axios.post(`/api/coauthor/suggest`, { sectionId, content }).then(r=>r.data),
};