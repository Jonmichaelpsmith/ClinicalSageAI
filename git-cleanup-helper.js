/**
 * Git Commit Cleanup and Sync Helper
 * 
 * This script helps clean up and recover from Git repository issues,
 * particularly when dealing with rebasing conflicts, uncommitted changes,
 * and sync problems between local and remote repositories.
 */

const { exec } = require('child_process');
const fs = require('fs');
const readline = require('readline');

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
  cyan: '\x1b[36m'
};

/**
 * Execute a git command and return the output
 * @param {string} command - The command to execute
 * @returns {Promise<string>} - The command output
 */
function executeGitCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(`Error: ${error.message}\n${stderr}`);
        return;
      }
      if (stderr) {
        console.log(`${colors.yellow}Warning: ${stderr}${colors.reset}`);
      }
      resolve(stdout.trim());
    });
  });
}

/**
 * Check the current git status
 * @returns {Promise<Object>} - Status information
 */
async function checkGitStatus() {
  try {
    const statusOutput = await executeGitCommand('git status');
    
    const isClean = !statusOutput.includes('Changes not staged for commit') && 
                    !statusOutput.includes('Changes to be committed') &&
                    !statusOutput.includes('Untracked files');
    
    const branchInfo = await executeGitCommand('git branch -v');
    const currentBranch = branchInfo.split('\n').find(line => line.startsWith('*'));
    
    const isRebasing = statusOutput.includes('rebase in progress') || 
                       fs.existsSync('.git/rebase-merge') || 
                       fs.existsSync('.git/rebase-apply');
    
    const isMerging = statusOutput.includes('You have unmerged paths') || 
                      fs.existsSync('.git/MERGE_HEAD');
    
    // Get ahead/behind counts
    let aheadBehind = { ahead: 0, behind: 0 };
    try {
      const branchStatus = await executeGitCommand('git rev-list --left-right --count origin/main...HEAD');
      const [behind, ahead] = branchStatus.split('\t').map(Number);
      aheadBehind = { ahead, behind };
    } catch (error) {
      console.log(`${colors.yellow}Could not determine ahead/behind counts${colors.reset}`);
    }
    
    return {
      isClean,
      currentBranch: currentBranch ? currentBranch.substring(2) : 'unknown',
      isRebasing,
      isMerging,
      aheadBehind,
      statusOutput
    };
  } catch (error) {
    console.error(`${colors.red}Error checking Git status: ${error}${colors.reset}`);
    return {
      isClean: false,
      currentBranch: 'unknown',
      isRebasing: false,
      isMerging: false,
      aheadBehind: { ahead: 0, behind: 0 },
      statusOutput: error
    };
  }
}

/**
 * Handle a repository that is in the middle of a rebase
 */
async function handleRebasingState() {
  console.log(`${colors.cyan}===== REPOSITORY IS IN REBASING STATE =====${colors.reset}`);
  console.log(`${colors.cyan}Options:${colors.reset}`);
  console.log(`${colors.cyan}1. Abort rebase (restore to state before rebase started)${colors.reset}`);
  console.log(`${colors.cyan}2. Skip current commit and continue${colors.reset}`);
  console.log(`${colors.cyan}3. Force continue (mark conflicts as resolved)${colors.reset}`);
  
  const answer = await new Promise(resolve => {
    rl.question(`${colors.green}Enter your choice (1-3): ${colors.reset}`, resolve);
  });
  
  try {
    switch (answer) {
      case '1':
        console.log(`${colors.blue}Aborting rebase...${colors.reset}`);
        await executeGitCommand('git rebase --abort');
        console.log(`${colors.green}Rebase aborted successfully.${colors.reset}`);
        break;
      case '2':
        console.log(`${colors.blue}Skipping current commit...${colors.reset}`);
        await executeGitCommand('git rebase --skip');
        console.log(`${colors.green}Commit skipped and rebase continued.${colors.reset}`);
        break;
      case '3':
        console.log(`${colors.blue}Forcing continue...${colors.reset}`);
        await executeGitCommand('git add .');
        await executeGitCommand('git rebase --continue');
        console.log(`${colors.green}Rebase continued with conflicts marked as resolved.${colors.reset}`);
        break;
      default:
        console.log(`${colors.red}Invalid choice. Please run the script again.${colors.reset}`);
    }
  } catch (error) {
    console.error(`${colors.red}Error handling rebase: ${error}${colors.reset}`);
  }
}

/**
 * Handle merge conflicts
 */
async function handleMergeConflicts() {
  console.log(`${colors.cyan}===== MERGE CONFLICTS DETECTED =====${colors.reset}`);
  console.log(`${colors.cyan}Options:${colors.reset}`);
  console.log(`${colors.cyan}1. Abort merge${colors.reset}`);
  console.log(`${colors.cyan}2. Force-resolve all conflicts with "our" version${colors.reset}`);
  console.log(`${colors.cyan}3. Force-resolve all conflicts with "their" version${colors.reset}`);
  
  const answer = await new Promise(resolve => {
    rl.question(`${colors.green}Enter your choice (1-3): ${colors.reset}`, resolve);
  });
  
  try {
    switch (answer) {
      case '1':
        console.log(`${colors.blue}Aborting merge...${colors.reset}`);
        await executeGitCommand('git merge --abort');
        console.log(`${colors.green}Merge aborted successfully.${colors.reset}`);
        break;
      case '2':
        console.log(`${colors.blue}Resolving conflicts with our version...${colors.reset}`);
        await executeGitCommand('git checkout --ours .');
        await executeGitCommand('git add .');
        await executeGitCommand('git commit -m "Resolve conflicts with our version"');
        console.log(`${colors.green}Conflicts resolved with our version.${colors.reset}`);
        break;
      case '3':
        console.log(`${colors.blue}Resolving conflicts with their version...${colors.reset}`);
        await executeGitCommand('git checkout --theirs .');
        await executeGitCommand('git add .');
        await executeGitCommand('git commit -m "Resolve conflicts with their version"');
        console.log(`${colors.green}Conflicts resolved with their version.${colors.reset}`);
        break;
      default:
        console.log(`${colors.red}Invalid choice. Please run the script again.${colors.reset}`);
    }
  } catch (error) {
    console.error(`${colors.red}Error handling merge conflicts: ${error}${colors.reset}`);
  }
}

/**
 * Handle uncommitted changes
 */
async function handleUncommittedChanges() {
  console.log(`${colors.cyan}===== UNCOMMITTED CHANGES DETECTED =====${colors.reset}`);
  console.log(`${colors.cyan}Options:${colors.reset}`);
  console.log(`${colors.cyan}1. Stash changes (save for later)${colors.reset}`);
  console.log(`${colors.cyan}2. Commit changes${colors.reset}`);
  console.log(`${colors.cyan}3. Discard all changes (DANGER: Cannot be undone)${colors.reset}`);
  console.log(`${colors.cyan}4. Show detailed status${colors.reset}`);
  
  const answer = await new Promise(resolve => {
    rl.question(`${colors.green}Enter your choice (1-4): ${colors.reset}`, resolve);
  });
  
  try {
    switch (answer) {
      case '1':
        console.log(`${colors.blue}Stashing changes...${colors.reset}`);
        await executeGitCommand('git stash save "Automated stash from cleanup script"');
        console.log(`${colors.green}Changes stashed successfully. Use 'git stash list' to see stashes.${colors.reset}`);
        break;
      case '2':
        const commitMessage = await new Promise(resolve => {
          rl.question(`${colors.green}Enter commit message: ${colors.reset}`, resolve);
        });
        console.log(`${colors.blue}Committing changes...${colors.reset}`);
        await executeGitCommand('git add .');
        await executeGitCommand(`git commit -m "${commitMessage || 'Automatic commit from cleanup script'}"`);
        console.log(`${colors.green}Changes committed successfully.${colors.reset}`);
        break;
      case '3':
        const confirmation = await new Promise(resolve => {
          rl.question(`${colors.red}⚠️ WARNING: This will permanently discard all changes. Type 'CONFIRM' to proceed: ${colors.reset}`, resolve);
        });
        if (confirmation === 'CONFIRM') {
          console.log(`${colors.blue}Discarding all changes...${colors.reset}`);
          await executeGitCommand('git reset --hard HEAD');
          await executeGitCommand('git clean -fd');
          console.log(`${colors.green}All changes discarded.${colors.reset}`);
        } else {
          console.log(`${colors.yellow}Operation cancelled.${colors.reset}`);
        }
        break;
      case '4':
        const detailedStatus = await executeGitCommand('git status');
        console.log(`${colors.blue}Detailed status:${colors.reset}\n${detailedStatus}`);
        await handleUncommittedChanges(); // Recurse to show options again
        break;
      default:
        console.log(`${colors.red}Invalid choice. Please run the script again.${colors.reset}`);
    }
  } catch (error) {
    console.error(`${colors.red}Error handling uncommitted changes: ${error}${colors.reset}`);
  }
}

/**
 * Handle sync issues with remote
 */
async function handleSyncIssues(aheadBehind) {
  console.log(`${colors.cyan}===== SYNC ISSUES WITH REMOTE =====${colors.reset}`);
  console.log(`${colors.cyan}Your branch is ${aheadBehind.ahead} commits ahead and ${aheadBehind.behind} commits behind the remote.${colors.reset}`);
  console.log(`${colors.cyan}Options:${colors.reset}`);
  console.log(`${colors.cyan}1. Pull from remote${colors.reset}`);
  console.log(`${colors.cyan}2. Push to remote${colors.reset}`);
  console.log(`${colors.cyan}3. Fetch only${colors.reset}`);
  console.log(`${colors.cyan}4. Reset to remote state (DANGER: Will discard local commits)${colors.reset}`);
  
  const answer = await new Promise(resolve => {
    rl.question(`${colors.green}Enter your choice (1-4): ${colors.reset}`, resolve);
  });
  
  try {
    switch (answer) {
      case '1':
        console.log(`${colors.blue}Pulling from remote...${colors.reset}`);
        await executeGitCommand('git pull');
        console.log(`${colors.green}Pull completed.${colors.reset}`);
        break;
      case '2':
        console.log(`${colors.blue}Pushing to remote...${colors.reset}`);
        await executeGitCommand('git push');
        console.log(`${colors.green}Push completed.${colors.reset}`);
        break;
      case '3':
        console.log(`${colors.blue}Fetching from remote...${colors.reset}`);
        await executeGitCommand('git fetch');
        console.log(`${colors.green}Fetch completed.${colors.reset}`);
        break;
      case '4':
        const confirmation = await new Promise(resolve => {
          rl.question(`${colors.red}⚠️ WARNING: This will discard all local commits. Type 'CONFIRM' to proceed: ${colors.reset}`, resolve);
        });
        if (confirmation === 'CONFIRM') {
          console.log(`${colors.blue}Resetting to remote state...${colors.reset}`);
          await executeGitCommand('git fetch');
          await executeGitCommand('git reset --hard origin/main');
          console.log(`${colors.green}Reset to remote state completed.${colors.reset}`);
        } else {
          console.log(`${colors.yellow}Operation cancelled.${colors.reset}`);
        }
        break;
      default:
        console.log(`${colors.red}Invalid choice. Please run the script again.${colors.reset}`);
    }
  } catch (error) {
    console.error(`${colors.red}Error handling sync issues: ${error}${colors.reset}`);
  }
}

/**
 * Main function
 */
async function main() {
  console.log(`${colors.green}===== GIT CLEANUP AND SYNC HELPER =====${colors.reset}`);
  console.log(`${colors.green}Checking repository status...${colors.reset}`);
  
  const status = await checkGitStatus();
  
  console.log(`${colors.blue}Current branch: ${status.currentBranch}${colors.reset}`);
  console.log(`${colors.blue}Ahead by ${status.aheadBehind.ahead} commits, behind by ${status.aheadBehind.behind} commits${colors.reset}`);
  
  if (status.isRebasing) {
    await handleRebasingState();
  } else if (status.isMerging) {
    await handleMergeConflicts();
  } else if (!status.isClean) {
    await handleUncommittedChanges();
  } else if (status.aheadBehind.ahead > 0 || status.aheadBehind.behind > 0) {
    await handleSyncIssues(status.aheadBehind);
  } else {
    console.log(`${colors.green}Repository is in a clean state with no sync issues.${colors.reset}`);
  }
  
  // Final status check
  const finalStatus = await checkGitStatus();
  console.log(`${colors.cyan}===== CURRENT REPOSITORY STATUS =====${colors.reset}`);
  console.log(finalStatus.statusOutput);
  
  rl.close();
}

// Run the main function
main().catch(error => {
  console.error(`${colors.red}Unhandled error: ${error}${colors.reset}`);
  rl.close();
});