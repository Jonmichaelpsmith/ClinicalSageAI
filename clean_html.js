import fs from 'fs';

// Read the HTML file
const filePath = 'clean_landing_page.html';
let htmlContent = fs.readFileSync(filePath, 'utf8');

// Step 1: Remove the "Why Leading Companies Choose TrialSage™" section
// This has already been done manually, but we'll double-check
let updatedHtml = htmlContent;

// Step 2: Remove the redundant Vault content organization section
const vaultContentSectionStart = '<!-- Vault content organization -->';
const vaultContentSectionEnd = '</section>';

const vaultContentStartIndex = updatedHtml.indexOf(vaultContentSectionStart);
if (vaultContentStartIndex !== -1) {
  // Find the end of the section (the first </section> after the start marker)
  const sectionEndSearchFrom = vaultContentStartIndex + vaultContentSectionStart.length;
  const vaultContentEndIndex = updatedHtml.indexOf(vaultContentSectionEnd, sectionEndSearchFrom) + vaultContentSectionEnd.length;
  
  if (vaultContentEndIndex > vaultContentStartIndex) {
    // Remove the section
    updatedHtml = 
      updatedHtml.substring(0, vaultContentStartIndex) + 
      '<!-- Removed redundant Vault content organization section -->\n    ' +
      updatedHtml.substring(vaultContentEndIndex);
    
    console.log('Successfully removed Vault content organization section');
  } else {
    console.error('Could not find the end of the Vault content organization section');
  }
} else {
  console.log('Vault content organization section not found (may have been already removed)');
}

// Write the updated HTML back to the file
fs.writeFileSync(filePath, updatedHtml, 'utf8');
console.log('HTML file has been updated successfully');