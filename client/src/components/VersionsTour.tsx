import React, { useState } from "react"
import Joyride, { CallBackProps, STATUS, Step } from "react-joyride"

const steps: Step[] = [
  {
    target: "div:has(h2:contains('Document Version History'))",
    content: "Welcome to your version control center. Here you'll find every saved CMC draft."
  },
  {
    target: "button:has(span:contains('View'))",
    content: "Click here to preview the full generated Module 3.2 document inline."
  },
  {
    target: "button:has(span:contains('Compare'))",
    content: "Compare this version with the one before it to see changes and improvements."
  },
  {
    target: "a:contains('TXT')",
    content: "Download the raw structured file for offline editing or review."
  },
  {
    target: "a:contains('PDF')",
    content: "Export this version as a regulatory-style PDF submission copy."
  }
]

export default function VersionsTour() {
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