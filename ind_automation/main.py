# main.py
import io
import os
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from docxtpl import DocxTemplate
from ingestion.benchling_connector import fetch_benchling_cmc
import logging

# Set up logging
logging.basicConfig(level=logging.INFO, 
                   format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = FastAPI(title="IND Automation API")

# Add CORS middleware to allow requests from the main Node.js app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, limit this to your specific domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class INDProject(BaseModel):
    project_id: str

@app.get("/")
async def root():
    return {"message": "IND Automation API is running"}

@app.get("/api/ind/{project_id}/module3")
async def generate_module3(project_id: str):
    """
    Generate Module 3 (CMC) document for an IND submission
    """
    logger.info(f"Generating Module 3 for project: {project_id}")
    
    try:
        # 1) Fetch data from Benchling (or stub)
        data = fetch_benchling_cmc(project_id)
        if not data:
            raise HTTPException(status_code=404, detail="Project not found or no CMC data available")
        
        # 2) Render template
        template_path = os.path.join(os.path.dirname(__file__), "templates", "module3_cmc.docx.j2")
        
        if not os.path.exists(template_path):
            logger.error(f"Template not found at {template_path}")
            raise HTTPException(status_code=500, 
                              detail="Module 3 template not found. Please run create_template.py first.")
        
        tpl = DocxTemplate(template_path)
        tpl.render(data)
        
        # 3) Stream back as bytes
        buf = io.BytesIO()
        tpl.save(buf)
        buf.seek(0)
        
        filename = f"Module3_CMC_{project_id}.docx"
        
        logger.info(f"Successfully generated Module 3 document: {filename}")
        
        return StreamingResponse(
            buf, 
            media_type='application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            headers={'Content-Disposition': f'attachment; filename={filename}'}
        )
        
    except Exception as e:
        logger.error(f"Error generating Module 3: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating Module 3: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    # Run the FastAPI app with uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)