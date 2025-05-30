{/* International Regulatory Compliance Section */}
<div className="border rounded-lg p-4 shadow-sm">
  <div className="flex items-center mb-3">
    <GlobeIcon className="h-5 w-5 text-indigo-600 mr-2" />
    <h3 className="text-base font-medium">International Regulatory Compliance</h3>
  </div>
  
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
    <div className="p-3 border rounded-md bg-sky-50">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center">
            <Badge variant="outline" className="mr-2 bg-sky-100 text-sky-700 border-sky-200">EU</Badge>
            <h4 className="text-sm font-medium">EU GMP Annex 11</h4>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Computerized Systems for EU Markets</p>
        </div>
        <Switch 
          id="enableEuGmpCompliance" 
          checked={formValues.fdaCompliance.enableEuGmpCompliance}
          onCheckedChange={() => handleToggleChange('fdaCompliance', 'enableEuGmpCompliance')}
        />
      </div>
    </div>
    
    <div className="p-3 border rounded-md bg-emerald-50">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center">
            <Badge variant="outline" className="mr-2 bg-emerald-100 text-emerald-700 border-emerald-200">Auto</Badge>
            <h4 className="text-sm font-medium">Automated Documentation</h4>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Generate documentation automatically</p>
        </div>
        <Switch 
          id="autoGenerateDocumentation" 
          checked={formValues.fdaCompliance.autoGenerateDocumentation}
          onCheckedChange={() => handleToggleChange('fdaCompliance', 'autoGenerateDocumentation')}
        />
      </div>
    </div>
  </div>

  <div className="mt-4 space-y-4">
    <h4 className="text-sm font-medium text-muted-foreground">Industry-Specific Regulations</h4>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
      <Badge variant="outline" className="justify-center py-1.5 border-indigo-100 bg-indigo-50 text-indigo-700 hover:bg-indigo-100">
        Biotech / Pharma
      </Badge>
      <Badge variant="outline" className="justify-center py-1.5 border-blue-100 bg-blue-50 text-blue-700 hover:bg-blue-100">
        Medical Device
      </Badge>
      <Badge variant="outline" className="justify-center py-1.5 border-green-100 bg-green-50 text-green-700 hover:bg-green-100">
        CRO Services
      </Badge>
    </div>
  </div>
</div>