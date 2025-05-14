#!/bin/bash

# CERV2Page.jsx Protection System Verification
# This script verifies that all protection measures are in place for CERV2Page.jsx

# Define color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=======================================================${NC}"
echo -e "${BLUE}CERV2Page.jsx Protection System Verification${NC}"
echo -e "${BLUE}=======================================================${NC}"

# Define paths to check
SOURCE_FILE="client/src/pages/CERV2Page.jsx"
PROTECTED_DIR="./locked_files/cerv2_protected"
BACKUP_FILE="$PROTECTED_DIR/CERV2Page.jsx"
CHECKSUM_FILE="$PROTECTED_DIR/CERV2Page.jsx.md5"
RECOVERY_INSTRUCTIONS="./locked_files/RECOVERY_INSTRUCTIONS.md"
VALIDATOR_SCRIPT="$PROTECTED_DIR/integrity_validator.sh"

# Verify source file exists
if [ -f "$SOURCE_FILE" ]; then
    echo -e "${GREEN}✓ Source file exists:${NC} $SOURCE_FILE"
else
    echo -e "${RED}✗ ERROR: Source file missing:${NC} $SOURCE_FILE"
fi

# Verify protection directory exists
if [ -d "$PROTECTED_DIR" ]; then
    echo -e "${GREEN}✓ Protection directory exists:${NC} $PROTECTED_DIR"
else
    echo -e "${RED}✗ ERROR: Protection directory missing:${NC} $PROTECTED_DIR"
fi

# Verify backup file exists
if [ -f "$BACKUP_FILE" ]; then
    echo -e "${GREEN}✓ Backup file exists:${NC} $BACKUP_FILE"
else
    echo -e "${RED}✗ ERROR: Backup file missing:${NC} $BACKUP_FILE"
fi

# Verify checksum file exists
if [ -f "$CHECKSUM_FILE" ]; then
    echo -e "${GREEN}✓ Checksum file exists:${NC} $CHECKSUM_FILE"
else
    echo -e "${RED}✗ ERROR: Checksum file missing:${NC} $CHECKSUM_FILE"
fi

# Verify recovery instructions exist
if [ -f "$RECOVERY_INSTRUCTIONS" ]; then
    echo -e "${GREEN}✓ Recovery instructions exist:${NC} $RECOVERY_INSTRUCTIONS"
else
    echo -e "${RED}✗ ERROR: Recovery instructions missing:${NC} $RECOVERY_INSTRUCTIONS"
fi

# Verify validator script exists
if [ -f "$VALIDATOR_SCRIPT" ]; then
    echo -e "${GREEN}✓ Integrity validator script exists:${NC} $VALIDATOR_SCRIPT"
else
    echo -e "${RED}✗ ERROR: Integrity validator script missing:${NC} $VALIDATOR_SCRIPT"
fi

# Check for timestamped backups
TIMESTAMP_COUNT=$(ls $PROTECTED_DIR/CERV2Page_*.jsx 2>/dev/null | wc -l)
if [ "$TIMESTAMP_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✓ Timestamped backups exist:${NC} $TIMESTAMP_COUNT found"
else
    echo -e "${YELLOW}⚠ Warning: No timestamped backups found${NC}"
fi

# Check for full system archives
ARCHIVE_COUNT=$(ls ./locked_files/CERV2_PROTECTED_FULL_*.tar.gz 2>/dev/null | wc -l)
if [ "$ARCHIVE_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✓ Full system archives exist:${NC} $ARCHIVE_COUNT found"
else
    echo -e "${YELLOW}⚠ Warning: No full system archives found${NC}"
fi

# Verify file integrity
if [ -f "$SOURCE_FILE" ] && [ -f "$CHECKSUM_FILE" ]; then
    CURRENT_MD5=$(md5sum "$SOURCE_FILE" | awk '{ print $1 }')
    STORED_MD5=$(cat "$CHECKSUM_FILE" | awk '{ print $1 }')
    
    if [ "$CURRENT_MD5" = "$STORED_MD5" ]; then
        echo -e "${GREEN}✓ Integrity check passed:${NC} File matches protected checksum"
    else
        echo -e "${RED}✗ Integrity check failed:${NC} File has been modified since protection"
        echo -e "${YELLOW}  Current MD5:${NC} $CURRENT_MD5"
        echo -e "${YELLOW}  Stored MD5:${NC} $STORED_MD5"
    fi
else
    echo -e "${YELLOW}⚠ Warning: Cannot perform integrity check${NC}"
fi

echo -e "${BLUE}=======================================================${NC}"
echo -e "${BLUE}Protection System Status Summary${NC}"
echo -e "${BLUE}=======================================================${NC}"

# Count successes and failures
SUCCESS_COUNT=0
WARNING_COUNT=0
ERROR_COUNT=0

# Fix counter logic to accurately count checks
if [ -f "$SOURCE_FILE" ]; then ((SUCCESS_COUNT++)); else ((ERROR_COUNT++)); fi
if [ -d "$PROTECTED_DIR" ]; then ((SUCCESS_COUNT++)); else ((ERROR_COUNT++)); fi
if [ -f "$BACKUP_FILE" ]; then ((SUCCESS_COUNT++)); else ((ERROR_COUNT++)); fi
if [ -f "$CHECKSUM_FILE" ]; then ((SUCCESS_COUNT++)); else ((ERROR_COUNT++)); fi
if [ -f "$RECOVERY_INSTRUCTIONS" ]; then ((SUCCESS_COUNT++)); else ((ERROR_COUNT++)); fi
if [ -f "$VALIDATOR_SCRIPT" ]; then ((SUCCESS_COUNT++)); else ((ERROR_COUNT++)); fi
if [ "$TIMESTAMP_COUNT" -gt 0 ]; then ((SUCCESS_COUNT++)); else ((WARNING_COUNT++)); fi
if [ "$ARCHIVE_COUNT" -gt 0 ]; then ((SUCCESS_COUNT++)); else ((WARNING_COUNT++)); fi

echo -e "${GREEN}Successful checks:${NC} $SUCCESS_COUNT"
echo -e "${YELLOW}Warnings:${NC} $WARNING_COUNT"
echo -e "${RED}Errors:${NC} $ERROR_COUNT"

if [ "$ERROR_COUNT" -eq 0 ] && [ "$WARNING_COUNT" -eq 0 ]; then
    echo -e "${GREEN}✓ All protection measures are in place and functioning correctly!${NC}"
elif [ "$ERROR_COUNT" -eq 0 ]; then
    echo -e "${YELLOW}⚠ Protection system is functional but has minor issues.${NC}"
else
    echo -e "${RED}✗ Protection system has critical errors that need to be addressed.${NC}"
fi

echo -e "${BLUE}=======================================================${NC}"