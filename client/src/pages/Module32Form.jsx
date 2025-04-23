import React, { useState } from 'react';

const Module32Form = () => {
  const [formData, setFormData] = useState({
    drug_name: '',
    molecular_formula: '',
    synthesis_steps: '',
    formulation_details: '',
    manufacturing_controls: '',
    analytical_methods: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      // In a real implementation, this would use axios to call the backend API
      // const response = await axios.post('/api/generate/module32', formData);
      // setResult(response.data);
      
      // For demonstration, use a mock response
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock successful response with PDF export paths
      const mockResponse = {
        status: "success",
        module32_draft: `# Module 3.2 CMC Document for ${formData.drug_name}

## 3.2.S Drug Substance
### 3.2.S.1 General Information
#### 3.2.S.1.1 Nomenclature
International Non-proprietary Name (INN): ${formData.drug_name}
Chemical Name: [Chemical name based on IUPAC]
CAS Registry Number: [CAS number]
Molecular Formula: ${formData.molecular_formula}

### 3.2.S.2 Manufacture
${formData.synthesis_steps}

### 3.2.S.4 Control of Drug Substance
${formData.analytical_methods}

## 3.2.P Drug Product
### 3.2.P.1 Description and Composition
${formData.formulation_details}

### 3.2.P.3 Manufacture
${formData.manufacturing_controls}
`,
        export_paths: {
          txt: `generated_documents/module32_${formData.drug_name.replace(' ', '_')}_1234-5678-9012.txt`,
          pdf: `generated_documents/module32_${formData.drug_name.replace(' ', '_')}_1234-5678-9012.pdf`
        },
        drug: formData.drug_name,
        timestamp: new Date().toISOString()
      };
      
      setResult(mockResponse);
    } catch (err) {
      setError(err.message || "An error occurred during the API call");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="module32-form-container">
      <div className="form-header">
        <h1>Generate Module 3.2 Documentation</h1>
        <p>Enter the drug substance and product details to generate a CMC document draft.</p>
      </div>
      
      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="module32-form">
        <div className="form-group">
          <label htmlFor="drug_name">Drug Name</label>
          <input 
            type="text" 
            id="drug_name" 
            name="drug_name" 
            value={formData.drug_name}
            onChange={handleChange}
            required
            placeholder="Enter drug name"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="molecular_formula">Molecular Formula</label>
          <input 
            type="text" 
            id="molecular_formula" 
            name="molecular_formula" 
            value={formData.molecular_formula}
            onChange={handleChange}
            required
            placeholder="E.g., C21H23NO5"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="synthesis_steps">Synthesis Steps</label>
          <textarea 
            id="synthesis_steps" 
            name="synthesis_steps" 
            value={formData.synthesis_steps}
            onChange={handleChange}
            rows={4}
            required
            placeholder="Describe the synthesis pathway..."
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="formulation_details">Formulation Details</label>
          <textarea 
            id="formulation_details" 
            name="formulation_details" 
            value={formData.formulation_details}
            onChange={handleChange}
            rows={4}
            required
            placeholder="Describe the drug product formulation..."
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="manufacturing_controls">Manufacturing Controls</label>
          <textarea 
            id="manufacturing_controls" 
            name="manufacturing_controls" 
            value={formData.manufacturing_controls}
            onChange={handleChange}
            rows={4}
            required
            placeholder="Describe manufacturing process controls..."
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="analytical_methods">Analytical Methods</label>
          <textarea 
            id="analytical_methods" 
            name="analytical_methods" 
            value={formData.analytical_methods}
            onChange={handleChange}
            rows={4}
            required
            placeholder="Describe analytical methods and specifications..."
          />
        </div>
        
        <div className="form-actions">
          <button 
            type="submit" 
            className="generate-btn"
            disabled={loading}
          >
            {loading ? 'Generating...' : 'Generate Module 3.2 Document'}
          </button>
        </div>
      </form>
      
      {result && (
        <div className="result-section">
          <h2>Generated Module 3.2 Document</h2>
          
          <div className="result-meta">
            <p><strong>Drug:</strong> {result.drug}</p>
            <p><strong>Generated:</strong> {new Date(result.timestamp).toLocaleString()}</p>
            <p><strong>Export Paths:</strong></p>
            <ul>
              <li>Text: {result.export_paths?.txt || result.export_path}</li>
              <li>PDF: {result.export_paths?.pdf}</li>
            </ul>
          </div>
          
          <div className="result-content">
            <h3>Document Preview</h3>
            <pre className="whitespace-pre-wrap">{result.module32_draft}</pre>
          </div>
          
          <div className="result-actions">
            <a 
              href={'/' + (result.export_paths?.pdf || '')} 
              className="download-btn"
              download
            >
              Download as PDF
            </a>
            <a 
              href={'/' + (result.export_paths?.txt || result.export_path || '')} 
              className="download-btn"
              download
            >
              Download as Text
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default Module32Form;