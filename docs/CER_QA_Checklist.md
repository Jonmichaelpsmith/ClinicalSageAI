# TrialSage CER Generator - Quality Assurance Checklist

## Overview
This document provides a comprehensive QA checklist for the TrialSage CER Generator module before stakeholder review.

## ✅ CERv2 QA CHECKLIST – FINAL REVIEW

### 1. 🚀 **Navigation & Entry**

* [ ] Sidebar shows **"CER Generator"** in blue highlight
* [ ] Clicking it routes to `/cer`
* [ ] Page loads without console errors

---

### 2. 🧠 **Instructional Flow**

* [ ] Instruction card shows all 3 steps:

  * Select section
  * Generate content
  * Preview/export

---

### 3. ✍️ **Section Builder Panel**

* [ ] Section type dropdown works (4 types)
* [ ] Textarea accepts input
* [ ] "Generate Section" calls `/api/cer/generate-section`
* [ ] Generated content is displayed clearly
* [ ] New section is added to live draft

---

### 4. 📄 **Live Preview**

* [ ] CER title renders at top
* [ ] Drafted sections display correctly with formatting
* [ ] FAERS table displays adverse events (if present)
* [ ] Comparator list shows risk scores

---

### 5. 📤 **Export Buttons**

* [ ] "Export as PDF" downloads a file with FAERS + sections
* [ ] "Export as Word" downloads same in `.docx` format
* [ ] Files are readable and professionally formatted

---

### 6. ⚙️ **Backend API Test**

* [ ] `/api/cer/fetch-faers` works with valid product name
* [ ] `/api/cer/export-docx` and `/api/cer/export-pdf` respond with correct files
* [ ] `/api/cer/generate-section` generates expected content using GPT-4o

---

### 7. 💾 **State Sync (Advanced)**

* [ ] Generated sections are stored in local state
* [ ] Preview reflects all added sections without page reload
* [ ] Export pulls the correct title, FAERS, and comparators at time of click

---

## Test Results

| Date | Tester | Status | Notes |
|------|--------|--------|-------|
| 2025-05-05 | [Name] | [Pass/Fail] | [Key observations] |

## Additional Notes

* The CER Generator is a critical component for regulatory compliance workflows
* All exports should maintain consistent formatting across PDF and DOCX formats
* FAERS data integration should be thoroughly verified with multiple test products
