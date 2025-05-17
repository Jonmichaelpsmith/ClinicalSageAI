import express from 'express';
import { loadSecuritySettings, saveSecuritySettings } from '../utils/securitySettingsStore.js';

const router = express.Router();

router.get('/:workspaceId/security-settings', (req, res) => {
  const settings = loadSecuritySettings();
  const { workspaceId } = req.params;
  res.json(settings[workspaceId] || {});
});

router.patch('/:workspaceId/security-settings', (req, res) => {
  const { workspaceId } = req.params;
  const settings = loadSecuritySettings();
  settings[workspaceId] = { ...(settings[workspaceId] || {}), ...req.body };
  saveSecuritySettings(settings);
  res.json(settings[workspaceId]);
});

export default router;
