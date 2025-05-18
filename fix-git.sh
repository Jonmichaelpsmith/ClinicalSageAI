#!/bin/bash

# Fix Git Repository State Script
# This script helps recover from common Git issues including rebasing and conflicts

echo "==== Git Repository Repair Tool ===="
echo ""

# Function to check for locks and remove them if needed
check_for_locks() {
  if [ -f .git/index.lock ]; then
    echo "❌ Found .git/index.lock file"
    echo "Removing lock file..."
    rm .git/index.lock
    echo "✅ Lock file removed"
  fi
  
  if [ -f .git/HEAD.lock ]; then
    echo "❌ Found .git/HEAD.lock file"
    echo "Removing lock file..."
    rm .git/HEAD.lock
    echo "✅ Lock file removed"
  fi
}

# Function to check if we're in a rebase
check_rebase_state() {
  if [ -d .git/rebase-merge ] || [ -d .git/rebase-apply ]; then
    echo "⚠️ Repository is in the middle of a rebase"
    return 0
  else
    return 1
  fi
}

# Function to abort rebase
abort_rebase() {
  echo "Aborting rebase..."
  git rebase --abort
  if [ $? -eq 0 ]; then
    echo "✅ Rebase aborted successfully"
  else
    echo "❌ Failed to abort rebase"
  fi
}

# Function to get a clean slate from remote
reset_to_remote() {
  echo "⚠️ WARNING: This will discard all local changes and commits that haven't been pushed"
  echo "Are you sure you want to reset to the remote version? (y/n)"
  read confirm
  
  if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
    echo "Fetching latest from remote..."
    git fetch origin
    
    echo "Resetting to origin/main..."
    git reset --hard origin/main
    
    echo "Cleaning untracked files..."
    git clean -fd
    
    echo "✅ Repository reset to remote state"
  else
    echo "Reset operation cancelled"
  fi
}

# Function to backup changes first
backup_changes() {
  local branch_name="backup-$(date +%Y%m%d%H%M%S)"
  
  echo "Creating backup branch '$branch_name'..."
  git branch "$branch_name"
  
  if [ $? -eq 0 ]; then
    echo "✅ Backup branch created successfully"
    echo "You can find your changes in the branch: $branch_name"
  else
    echo "❌ Failed to create backup branch"
  fi
}

# Main script execution
echo "Checking repository state..."

# Check for lock files
check_for_locks

# Check if we're in a rebase
if check_rebase_state; then
  echo ""
  echo "1. Abort rebase and return to previous state"
  echo "2. Create backup branch first, then abort rebase"
  echo "3. Reset to remote (discard all local changes)"
  echo ""
  echo "Enter your choice (1-3):"
  read choice
  
  case $choice in
    1)
      abort_rebase
      ;;
    2)
      backup_changes
      abort_rebase
      ;;
    3)
      reset_to_remote
      ;;
    *)
      echo "Invalid choice"
      ;;
  esac
else
  echo "Repository is not in a rebase state."
  echo ""
  echo "1. Create backup branch"
  echo "2. Reset to remote (discard all local changes)"
  echo "3. Exit without changes"
  echo ""
  echo "Enter your choice (1-3):"
  read choice
  
  case $choice in
    1)
      backup_changes
      ;;
    2)
      reset_to_remote
      ;;
    3)
      echo "Exiting without changes"
      ;;
    *)
      echo "Invalid choice"
      ;;
  esac
fi

echo ""
echo "Current Git status:"
git status

echo ""
echo "Script completed"