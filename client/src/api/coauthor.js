/** Fetch the list of CTD sections (with positions + status) */
export async function fetchCTDSections() {
  const res = await fetch('/api/coauthor/sections');
  return res.json();
}

/** Fetch the list of connections (edges) */
export async function fetchRiskConnections() {
  const res = await fetch('/api/coauthor/connections');
  return res.json();
}

/** Fetch guidance for a specific section */
export async function fetchSectionGuidance(sectionId) {
  const res = await fetch(`/api/coauthor/guidance/${sectionId}`);
  return res.json();
}

/** Fetch risk assessment for a specific section */
export async function fetchSectionRisk(sectionId) {
  const res = await fetch(`/api/coauthor/risk/${sectionId}`);
  return res.json();
}

/** Update the position of a section */
export async function updateSectionPosition(sectionId, x, y) {
  const res = await fetch(`/api/coauthor/layout/${sectionId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ x, y })
  });
  return res.json();
}