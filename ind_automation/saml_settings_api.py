from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from ind_automation import saml_creds, rbac

router = APIRouter()

class SAMLSettings(BaseModel):
    idp_entity_id: str
    idp_sso_url: str
    idp_x509_cert: str
    sp_entity_id: str
    sp_acs_url: str
    tenant_id: Optional[str] = None
    
@router.get("/api/ind-automation/saml/settings/{tenant_id}")
async def get_saml_settings(tenant_id: str, _=Depends(rbac.requires("saml.read"))):
    """Get SAML settings for a tenant"""
    settings = saml_creds.load(tenant_id)
    if not settings:
        raise HTTPException(404, "SAML settings not found for this tenant")
    return settings

@router.post("/api/ind-automation/saml/settings/{tenant_id}")
async def save_saml_settings(tenant_id: str, settings: SAMLSettings, _=Depends(rbac.requires("saml.write"))):
    """Save SAML settings for a tenant"""
    saml_creds.save(tenant_id, settings.dict())
    return {"status": "success", "message": "SAML settings saved"}

@router.delete("/api/ind-automation/saml/settings/{tenant_id}")
async def delete_saml_settings(tenant_id: str, _=Depends(rbac.requires("saml.delete"))):
    """Delete SAML settings for a tenant"""
    saml_creds.delete(tenant_id)
    return {"status": "success", "message": "SAML settings deleted"}