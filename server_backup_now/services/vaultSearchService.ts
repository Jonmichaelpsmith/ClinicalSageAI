import { Client } from '@elastic/elasticsearch';
const es = new Client({ 
  node: process.env.ELASTIC_URL, 
  auth: { apiKey: process.env.ELASTIC_API_KEY }
});

export async function indexSection(docId: string, section: any) {
  await es.index({
    index: 'vault-sections',
    id: `${docId}-${section.id}`,
    body: { docId, ...section }
  });
}

export async function searchSections(query: string) {
  const { body } = await es.search({
    index: 'vault-sections',
    body: {
      query: {
        multi_match: {
          query,
          fields: ['content'],
          fuzziness: 'AUTO'
        }
      }
    }
  });
  return body.hits.hits.map((h:any) => h._source);
}