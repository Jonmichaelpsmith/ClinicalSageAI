/**
 * Git Conflict Resolution Wizard
 * 
 * This script helps resolve Git conflicts and repository issues
 * with a step-by-step interactive wizard approach.
 */

const { exec } = require('child_process');
const fs = require('fs');
const readline = require('readline');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bold: '\x1b[1m'
};

// Repository information
let repoInfo = {
  status: '',
  branch: '',
  isRebasing: false,
  isClean: false,
  hasConflicts: false,
  unpushedCommits: 0,
  unpulledCommits: 0,
  unstagedChanges: [],
  stagedChanges: [],
  conflicts: []
};

/**
 * Execute a shell command
 * @param {string} command - Command to execute
 * @returns {Promise<string>} - Command output
 */
function executeCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error && error.code !== 1) { // Git sometimes returns code 1 for valid informational messages
        reject(new Error(`${error.message}\n${stderr}`));
        return;
      }
      resolve(stdout.trim());
    });
  });
}

/**
 * Clear the console screen
 */
function clearScreen() {
  process.stdout.write('\x1Bc');
}

/**
 * Render a fancy header
 * @param {string} title - Header text
 */
function renderHeader(title) {
  const width = process.stdout.columns || 80;
  const padding = '='.repeat(Math.floor((width - title.length - 2) / 2));
  
  console.log(`${colors.green}${padding} ${title} ${padding}${colors.reset}`);
  console.log('');
}

/**
 * Render a section title
 * @param {string} title - Section title
 */
function renderSection(title) {
  console.log(`${colors.cyan}${colors.bold}${title}${colors.reset}`);
  console.log(`${colors.cyan}${'-'.repeat(title.length)}${colors.reset}`);
}

/**
 * Ask user a question and get response
 * @param {string} question - Question to ask
 * @returns {Promise<string>} - User response
 */
function askQuestion(question) {
  return new Promise(resolve => {
    rl.question(`${colors.green}${question}${colors.reset} `, resolve);
  });
}

/**
 * Get current Git repository status
 */
async function getRepositoryStatus() {
  try {
    // Get branch info
    const branchOutput = await executeCommand('git branch --show-current');
    repoInfo.branch = branchOutput;
    
    // Get full status
    const statusOutput = await executeCommand('git status');
    repoInfo.status = statusOutput;
    
    // Check if repository is clean
    repoInfo.isClean = !statusOutput.includes('Changes not staged for commit') && 
                       !statusOutput.includes('Changes to be committed') && 
                       !statusOutput.includes('Untracked files') &&
                       !statusOutput.includes('conflict');
    
    // Check for rebase in progress
    repoInfo.isRebasing = statusOutput.includes('rebase in progress') || 
                          fs.existsSync(path.join('.git', 'rebase-merge')) || 
                          fs.existsSync(path.join('.git', 'rebase-apply'));
    
    // Check for conflicts
    repoInfo.hasConflicts = statusOutput.includes('Unmerged paths') || 
                            statusOutput.includes('fix conflicts');
    
    // Get ahead/behind count
    try {
      const aheadBehindOutput = await executeCommand('git rev-list --left-right --count origin/main...HEAD');
      const [behind, ahead] = aheadBehindOutput.split('\t').map(Number);
      repoInfo.unpulledCommits = behind;
      repoInfo.unpushedCommits = ahead;
    } catch (err) {
      console.log(`${colors.yellow}Could not determine ahead/behind commit counts.${colors.reset}`);
      repoInfo.unpulledCommits = 0;
      repoInfo.unpushedCommits = 0;
    }
    
    // Get unstaged changes
    try {
      const unstagedOutput = await executeCommand('git diff --name-status');
      repoInfo.unstagedChanges = unstagedOutput
        .split('\n')
        .filter(line => line.trim() !== '')
        .map(line => {
          const [status, file] = line.split('\t');
          return { status, file };
        });
    } catch (err) {
      repoInfo.unstagedChanges = [];
    }
    
    // Get staged changes
    try {
      const stagedOutput = await executeCommand('git diff --name-status --staged');
      repoInfo.stagedChanges = stagedOutput
        .split('\n')
        .filter(line => line.trim() !== '')
        .map(line => {
          const [status, file] = line.split('\t');
          return { status, file };
        });
    } catch (err) {
      repoInfo.stagedChanges = [];
    }
    
    // Get conflicts
    if (repoInfo.hasConflicts) {
      try {
        const conflictOutput = await executeCommand('git diff --name-only --diff-filter=U');
        repoInfo.conflicts = conflictOutput
          .split('\n')
          .filter(line => line.trim() !== '');
      } catch (err) {
        repoInfo.conflicts = [];
      }
    }
  } catch (error) {
    console.error(`${colors.red}Error getting repository status: ${error.message}${colors.reset}`);
  }
}

/**
 * Display repository status
 */
function displayRepositoryStatus() {
  clearScreen();
  renderHeader('GIT CONFLICT RESOLUTION WIZARD');
  
  renderSection('Repository Status');
  console.log(`${colors.white}Current branch: ${colors.yellow}${repoInfo.branch}${colors.reset}`);
  console.log(`${colors.white}Repository state: ${repoInfo.isClean ? colors.green + 'Clean' : colors.red + 'Dirty'}${colors.reset}`);
  
  if (repoInfo.isRebasing) {
    console.log(`${colors.red}${colors.bold}⚠️  REBASE IN PROGRESS ⚠️${colors.reset}`);
  }
  
  if (repoInfo.hasConflicts) {
    console.log(`${colors.red}${colors.bold}⚠️  UNRESOLVED CONFLICTS DETECTED ⚠️${colors.reset}`);
  }
  
  console.log(`${colors.white}Commits ahead of remote: ${repoInfo.unpushedCommits > 0 ? colors.yellow : colors.green}${repoInfo.unpushedCommits}${colors.reset}`);
  console.log(`${colors.white}Commits behind remote: ${repoInfo.unpulledCommits > 0 ? colors.yellow : colors.green}${repoInfo.unpulledCommits}${colors.reset}`);
  console.log('');
  
  if (repoInfo.stagedChanges.length > 0) {
    renderSection('Staged Changes');
    repoInfo.stagedChanges.forEach(change => {
      const statusSymbol = change.status === 'M' ? '📝' : change.status === 'A' ? '➕' : change.status === 'D' ? '❌' : '❓';
      console.log(`${statusSymbol} ${change.file}`);
    });
    console.log('');
  }
  
  if (repoInfo.unstagedChanges.length > 0) {
    renderSection('Unstaged Changes');
    repoInfo.unstagedChanges.forEach(change => {
      const statusSymbol = change.status === 'M' ? '📝' : change.status === 'A' ? '➕' : change.status === 'D' ? '❌' : '❓';
      console.log(`${statusSymbol} ${change.file}`);
    });
    console.log('');
  }
  
  if (repoInfo.conflicts.length > 0) {
    renderSection('Files with Conflicts');
    repoInfo.conflicts.forEach(file => {
      console.log(`${colors.red}⚠️  ${file}${colors.reset}`);
    });
    console.log('');
  }
}

/**
 * Show main menu and get user selection
 */
async function showMainMenu() {
  renderSection('Available Actions');
  
  const options = [];
  
  if (repoInfo.isRebasing) {
    options.push({ id: 'abort-rebase', label: 'Abort rebase (restore to state before rebase)' });
    options.push({ id: 'continue-rebase', label: 'Continue rebase (after resolving conflicts)' });
    options.push({ id: 'skip-rebase', label: 'Skip current rebase commit' });
  } else if (repoInfo.hasConflicts) {
    options.push({ id: 'resolve-conflicts', label: 'Resolve conflicts (interactive)' });
    options.push({ id: 'use-ours', label: 'Use our version for all conflicts' });
    options.push({ id: 'use-theirs', label: 'Use their version for all conflicts' });
  } else if (!repoInfo.isClean) {
    options.push({ id: 'stash-changes', label: 'Stash changes (save for later)' });
    options.push({ id: 'commit-changes', label: 'Commit all changes' });
    options.push({ id: 'discard-changes', label: 'Discard all changes (WARNING: Cannot be undone)' });
  }
  
  if (repoInfo.unpulledCommits > 0) {
    options.push({ id: 'pull-changes', label: 'Pull changes from remote' });
  }
  
  if (repoInfo.unpushedCommits > 0) {
    options.push({ id: 'push-changes', label: 'Push local commits to remote' });
  }
  
  // Always available options
  options.push({ id: 'refresh', label: 'Refresh status' });
  options.push({ id: 'reset-hard', label: 'Hard reset to remote (WARNING: Will lose local changes)' });
  options.push({ id: 'exit', label: 'Exit wizard' });
  
  // Display menu
  options.forEach((option, index) => {
    console.log(`${colors.green}${index + 1}.${colors.reset} ${option.label}`);
  });
  console.log('');
  
  // Get user choice
  const choice = await askQuestion(`Enter your choice (1-${options.length}):`);
  const index = parseInt(choice, 10) - 1;
  
  if (index >= 0 && index < options.length) {
    return options[index].id;
  } else {
    console.log(`${colors.red}Invalid choice. Please try again.${colors.reset}`);
    return 'invalid';
  }
}

/**
 * Handle abort rebase action
 */
async function abortRebase() {
  try {
    console.log(`${colors.blue}Aborting rebase...${colors.reset}`);
    await executeCommand('git rebase --abort');
    console.log(`${colors.green}Rebase aborted successfully.${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}Error aborting rebase: ${error.message}${colors.reset}`);
  }
  
  await askQuestion('Press Enter to continue...');
}

/**
 * Handle continue rebase action
 */
async function continueRebase() {
  try {
    console.log(`${colors.blue}Continuing rebase...${colors.reset}`);
    await executeCommand('git rebase --continue');
    console.log(`${colors.green}Rebase continued successfully.${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}Error continuing rebase: ${error.message}${colors.reset}`);
    console.log(`${colors.yellow}You might need to resolve all conflicts first or use 'git add' for resolved files.${colors.reset}`);
  }
  
  await askQuestion('Press Enter to continue...');
}

/**
 * Handle skip rebase action
 */
async function skipRebase() {
  try {
    console.log(`${colors.blue}Skipping current rebase commit...${colors.reset}`);
    await executeCommand('git rebase --skip');
    console.log(`${colors.green}Current commit skipped and rebase continued.${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}Error skipping current commit: ${error.message}${colors.reset}`);
  }
  
  await askQuestion('Press Enter to continue...');
}

/**
 * Handle resolving conflicts interactively
 */
async function resolveConflictsInteractive() {
  if (repoInfo.conflicts.length === 0) {
    console.log(`${colors.yellow}No conflicts detected.${colors.reset}`);
    await askQuestion('Press Enter to continue...');
    return;
  }
  
  for (const file of repoInfo.conflicts) {
    console.log(`${colors.blue}Resolving conflicts in: ${colors.white}${file}${colors.reset}`);
    console.log('');
    console.log(`${colors.cyan}Options for ${file}:${colors.reset}`);
    console.log(`${colors.green}1.${colors.reset} Use our version`);
    console.log(`${colors.green}2.${colors.reset} Use their version`);
    console.log(`${colors.green}3.${colors.reset} Skip this file (remain conflicted)`);
    console.log('');
    
    const choice = await askQuestion(`How do you want to resolve ${file}? (1-3):`);
    
    try {
      if (choice === '1') {
        await executeCommand(`git checkout --ours "${file}"`);
        await executeCommand(`git add "${file}"`);
        console.log(`${colors.green}Used our version and marked as resolved.${colors.reset}`);
      } else if (choice === '2') {
        await executeCommand(`git checkout --theirs "${file}"`);
        await executeCommand(`git add "${file}"`);
        console.log(`${colors.green}Used their version and marked as resolved.${colors.reset}`);
      } else {
        console.log(`${colors.yellow}Skipped ${file}.${colors.reset}`);
      }
    } catch (error) {
      console.error(`${colors.red}Error resolving ${file}: ${error.message}${colors.reset}`);
    }
    
    console.log('');
  }
  
  console.log(`${colors.blue}Conflict resolution complete.${colors.reset}`);
  console.log(`${colors.yellow}If you were in the middle of a rebase, you should select 'Continue rebase' next.${colors.reset}`);
  
  await askQuestion('Press Enter to continue...');
}

/**
 * Handle using our version for all conflicts
 */
async function useOurVersion() {
  try {
    if (repoInfo.conflicts.length === 0) {
      console.log(`${colors.yellow}No conflicts detected.${colors.reset}`);
    } else {
      console.log(`${colors.blue}Resolving all conflicts with our version...${colors.reset}`);
      
      for (const file of repoInfo.conflicts) {
        await executeCommand(`git checkout --ours "${file}"`);
        await executeCommand(`git add "${file}"`);
        console.log(`${colors.green}Resolved ${file} with our version.${colors.reset}`);
      }
      
      console.log(`${colors.green}All conflicts resolved with our version.${colors.reset}`);
      console.log(`${colors.yellow}If you were in the middle of a rebase, you should select 'Continue rebase' next.${colors.reset}`);
    }
  } catch (error) {
    console.error(`${colors.red}Error using our version: ${error.message}${colors.reset}`);
  }
  
  await askQuestion('Press Enter to continue...');
}

/**
 * Handle using their version for all conflicts
 */
async function useTheirVersion() {
  try {
    if (repoInfo.conflicts.length === 0) {
      console.log(`${colors.yellow}No conflicts detected.${colors.reset}`);
    } else {
      console.log(`${colors.blue}Resolving all conflicts with their version...${colors.reset}`);
      
      for (const file of repoInfo.conflicts) {
        await executeCommand(`git checkout --theirs "${file}"`);
        await executeCommand(`git add "${file}"`);
        console.log(`${colors.green}Resolved ${file} with their version.${colors.reset}`);
      }
      
      console.log(`${colors.green}All conflicts resolved with their version.${colors.reset}`);
      console.log(`${colors.yellow}If you were in the middle of a rebase, you should select 'Continue rebase' next.${colors.reset}`);
    }
  } catch (error) {
    console.error(`${colors.red}Error using their version: ${error.message}${colors.reset}`);
  }
  
  await askQuestion('Press Enter to continue...');
}

/**
 * Handle stashing changes
 */
async function stashChanges() {
  try {
    const stashName = await askQuestion('Enter a name for this stash (optional):');
    const command = stashName 
      ? `git stash push -m "${stashName}"` 
      : 'git stash push';
    
    console.log(`${colors.blue}Stashing changes...${colors.reset}`);
    await executeCommand(command);
    console.log(`${colors.green}Changes stashed successfully.${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}Error stashing changes: ${error.message}${colors.reset}`);
  }
  
  await askQuestion('Press Enter to continue...');
}

/**
 * Handle committing changes
 */
async function commitChanges() {
  try {
    // Make sure all changes are staged
    console.log(`${colors.blue}Staging all changes...${colors.reset}`);
    await executeCommand('git add .');
    
    const message = await askQuestion('Enter commit message:');
    if (!message.trim()) {
      console.log(`${colors.red}Commit message cannot be empty.${colors.reset}`);
    } else {
      console.log(`${colors.blue}Committing changes...${colors.reset}`);
      await executeCommand(`git commit -m "${message}"`);
      console.log(`${colors.green}Changes committed successfully.${colors.reset}`);
    }
  } catch (error) {
    console.error(`${colors.red}Error committing changes: ${error.message}${colors.reset}`);
  }
  
  await askQuestion('Press Enter to continue...');
}

/**
 * Handle discarding changes
 */
async function discardChanges() {
  const confirmation = await askQuestion(`${colors.red}WARNING: This will permanently discard all changes. Type 'CONFIRM' to proceed:${colors.reset}`);
  
  if (confirmation === 'CONFIRM') {
    try {
      console.log(`${colors.blue}Discarding all changes...${colors.reset}`);
      await executeCommand('git reset --hard HEAD');
      await executeCommand('git clean -fd');
      console.log(`${colors.green}All changes discarded.${colors.reset}`);
    } catch (error) {
      console.error(`${colors.red}Error discarding changes: ${error.message}${colors.reset}`);
    }
  } else {
    console.log(`${colors.yellow}Operation cancelled.${colors.reset}`);
  }
  
  await askQuestion('Press Enter to continue...');
}

/**
 * Handle pulling changes
 */
async function pullChanges() {
  try {
    console.log(`${colors.blue}Pulling changes from remote...${colors.reset}`);
    const output = await executeCommand('git pull');
    console.log(`${colors.green}Pull completed:${colors.reset}`);
    console.log(output);
  } catch (error) {
    console.error(`${colors.red}Error pulling changes: ${error.message}${colors.reset}`);
    console.log(`${colors.yellow}You might have conflicts or uncommitted changes.${colors.reset}`);
  }
  
  await askQuestion('Press Enter to continue...');
}

/**
 * Handle pushing changes
 */
async function pushChanges() {
  try {
    console.log(`${colors.blue}Pushing changes to remote...${colors.reset}`);
    const output = await executeCommand('git push');
    console.log(`${colors.green}Push completed:${colors.reset}`);
    console.log(output);
  } catch (error) {
    console.error(`${colors.red}Error pushing changes: ${error.message}${colors.reset}`);
    console.log(`${colors.yellow}Remote might have new changes. Try pulling first.${colors.reset}`);
  }
  
  await askQuestion('Press Enter to continue...');
}

/**
 * Handle hard reset to remote
 */
async function hardReset() {
  const confirmation = await askQuestion(`${colors.red}WARNING: This will reset to remote and discard all local changes and commits. Type 'CONFIRM' to proceed:${colors.reset}`);
  
  if (confirmation === 'CONFIRM') {
    try {
      console.log(`${colors.blue}Fetching latest from remote...${colors.reset}`);
      await executeCommand('git fetch origin');
      
      console.log(`${colors.blue}Hard resetting to origin/main...${colors.reset}`);
      await executeCommand('git reset --hard origin/main');
      
      console.log(`${colors.blue}Cleaning untracked files...${colors.reset}`);
      await executeCommand('git clean -fd');
      
      console.log(`${colors.green}Reset to remote state completed.${colors.reset}`);
    } catch (error) {
      console.error(`${colors.red}Error resetting to remote: ${error.message}${colors.reset}`);
    }
  } else {
    console.log(`${colors.yellow}Operation cancelled.${colors.reset}`);
  }
  
  await askQuestion('Press Enter to continue...');
}

/**
 * Main function
 */
async function main() {
  let exit = false;
  
  while (!exit) {
    await getRepositoryStatus();
    displayRepositoryStatus();
    
    const action = await showMainMenu();
    
    switch (action) {
      case 'abort-rebase':
        await abortRebase();
        break;
      case 'continue-rebase':
        await continueRebase();
        break;
      case 'skip-rebase':
        await skipRebase();
        break;
      case 'resolve-conflicts':
        await resolveConflictsInteractive();
        break;
      case 'use-ours':
        await useOurVersion();
        break;
      case 'use-theirs':
        await useTheirVersion();
        break;
      case 'stash-changes':
        await stashChanges();
        break;
      case 'commit-changes':
        await commitChanges();
        break;
      case 'discard-changes':
        await discardChanges();
        break;
      case 'pull-changes':
        await pullChanges();
        break;
      case 'push-changes':
        await pushChanges();
        break;
      case 'reset-hard':
        await hardReset();
        break;
      case 'refresh':
        // Just refresh status
        break;
      case 'exit':
        console.log(`${colors.green}Exiting wizard. Goodbye!${colors.reset}`);
        exit = true;
        break;
      default:
        // Invalid choice or unimplemented action
        break;
    }
  }
  
  rl.close();
}

// Run the wizard
main().catch(error => {
  console.error(`${colors.red}Unhandled error: ${error.message}${colors.reset}`);
  rl.close();
});