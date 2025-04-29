export async function fetchCTDSections() {
  const res = await fetch('/api/coauthor/sections');
  return res.json();
}

export async function fetchRiskConnections() {
  // Since our API already returns connections within each section,
  // we'll convert them to the expected format
  const sections = await fetchCTDSections();
  
  const connections = [];
  sections.forEach(section => {
    if (section.connections && section.connections.length > 0) {
      section.connections.forEach(toId => {
        connections.push({
          from: section.id,
          to: toId,
          critical: section.status === 'critical'
        });
      });
    }
  });
  
  return connections;
}

export async function getSectionGuidance(id) {
  // We'll use our existing API endpoint for advice
  const res = await fetch('/api/coauthor/advice', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sectionId: id })
  });
  const data = await res.json();
  return { text: data.advice };
}

export async function getRiskAnalysis(id) {
  // Simulate risk analysis based on section status
  const sections = await fetchCTDSections();
  const section = sections.find(s => s.id === id);
  
  if (!section) return { level: 'Unknown', delay: 0 };
  
  return {
    level: section.status === 'critical' ? 'High' : 
           section.status === 'pending' ? 'Medium' : 'Low',
    delay: section.status === 'critical' ? 45 : 
           section.status === 'pending' ? 14 : 0
  };
}