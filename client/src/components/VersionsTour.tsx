import React, { useState, useEffect } from "react"
import Joyride, { CallBackProps, STATUS, Step } from "react-joyride"

const steps: Step[] = [
  {
    target: "#version-header",
    content: "Welcome to your version control center. Here you'll find every saved CMC draft."
  },
  {
    target: "button[data-tour='view-version']",
    content: "Click here to preview the full generated Module 3.2 document inline."
  },
  {
    target: "button[data-tour='compare-version']",
    content: "Compare this version with the one before it to see changes and improvements."
  },
  {
    target: "a[data-tour='download-txt']",
    content: "Download the raw structured file for offline editing or review."
  },
  {
    target: "a[data-tour='download-pdf']",
    content: "Export this version as a regulatory-style PDF submission copy."
  }
]

export default function VersionsTour() {
  const [run, setRun] = useState(false)

  useEffect(() => {
    const shouldRun = localStorage.getItem("trialsage.seenVersionsTour") !== "true"
    if (shouldRun) {
      setRun(true)
    }
  }, [])

  const handleCallback = (data: CallBackProps) => {
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(data.status)) {
      localStorage.setItem("trialsage.seenVersionsTour", "true")
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