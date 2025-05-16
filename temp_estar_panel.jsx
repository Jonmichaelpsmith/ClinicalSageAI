            {/* Enhanced eSTAR Builder Panel */}
            <ESTARBuilderPanel
              projectId={deviceProfile?.id}
              deviceProfile={deviceProfile}
              complianceScore={complianceScore || 0}
              equivalenceData={equivalenceData}
              isValidating={isValidatingEstar}
              isGenerating={isGeneratingEstar}
              validationResults={estarValidationResults}
              generatedUrl={estarGeneratedUrl}
              estarFormat={estarFormat}
              setEstarFormat={setEstarFormat}
              setIsValidating={setIsValidatingEstar}
              setIsGenerating={setIsGeneratingEstar}
              setValidationResults={setEstarValidationResults}
              setGeneratedUrl={setEstarGeneratedUrl}
              onValidationComplete={(results) => {
                setEstarValidationResults(results);
                if (results.valid) {
                  toast({
                    title: "Validation Successful",
                    description: "eSTAR package meets FDA submission requirements.",
                    variant: "default",
                  });
                }
              }}
              onGenerationComplete={(result) => {
                if (result && result.downloadUrl) {
                  setEstarGeneratedUrl(result.downloadUrl);
                  toast({
                    title: "Generation Complete",
                    description: "eSTAR package has been generated successfully.",
                    variant: "default",
                  });
                }
              }}
            />