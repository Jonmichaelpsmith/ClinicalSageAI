import React, { useState } from "react"
import Joyride, { CallBackProps, STATUS, Step } from "react-joyride"

const steps: Step[] = [
  {
    target: "form button[type='submit']",
    content: "Submit your molecular and manufacturing inputs here to generate a complete CMC document."
  },
  {
    target: "div:has(h2:contains('Generated Module'))",
    content: "Your AI-generated output will appear here. You can download it instantly in multiple formats."
  },
  {
    target: "a:contains('Download PDF')",
    content: "Click to export your finalized Module 3.2 as a formatted PDF."
  }
]

export default function Module32Tour() {
  const [run, setRun] = useState(true)

  const handleCallback = (data: CallBackProps) => {
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(data.status)) {
      setRun(false)
    }
  }

  return (
    <Joyride
      run={run}
      steps={steps}
      continuous
      showSkipButton
      scrollToFirstStep
      showProgress
      callback={handleCallback}
      styles={{ options: { zIndex: 9999, primaryColor: "#2563EB" } }}
    />
  )
}