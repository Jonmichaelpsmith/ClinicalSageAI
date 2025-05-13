import { Router } from 'express';
import { validateDeviceProfile } from '../middleware/validateDeviceProfile';
import { 
  saveDeviceProfile, 
  getDeviceProfiles, 
  getDeviceProfileById, 
  updateDeviceProfile 
} from '../services/DeviceProfileService';

const router = Router();

// Create a new device profile
router.post(
  '/device-profile',
  validateDeviceProfile,
  async (req, res) => {
    try {
      // Extract tenant information from request if available
      const orgId = req.headers['x-organization-id'] as string;
      const clientId = req.headers['x-client-workspace-id'] as string;
      
      const profile = await saveDeviceProfile(req.body, orgId, clientId);
      res.status(201).json(profile);
    } catch (error) {
      console.error('Error creating device profile:', error);
      res.status(500).json({ 
        error: 'Failed to create device profile', 
        details: error.message 
      });
    }
  }
);

// Get all device profiles (with optional tenant filtering)
router.get(
  '/device-profiles',
  async (req, res) => {
    try {
      // Extract tenant information from request if available
      const orgId = req.headers['x-organization-id'] as string;
      const clientId = req.headers['x-client-workspace-id'] as string;
      
      const profiles = await getDeviceProfiles(orgId, clientId);
      res.json(profiles);
    } catch (error) {
      console.error('Error fetching device profiles:', error);
      res.status(500).json({ 
        error: 'Failed to fetch device profiles', 
        details: error.message 
      });
    }
  }
);

// Get a device profile by ID
router.get(
  '/device-profile/:id',
  async (req, res) => {
    try {
      const { id } = req.params;
      
      // Extract tenant information for security check
      const orgId = req.headers['x-organization-id'] as string;
      
      const profile = await getDeviceProfileById(id, orgId);
      
      if (!profile) {
        return res.status(404).json({ error: 'Device profile not found' });
      }
      
      res.json(profile);
    } catch (error) {
      console.error('Error fetching device profile:', error);
      res.status(500).json({ 
        error: 'Failed to fetch device profile', 
        details: error.message 
      });
    }
  }
);

// Update a device profile
router.put(
  '/device-profile/:id',
  validateDeviceProfile,
  async (req, res) => {
    try {
      const { id } = req.params;
      
      // Extract tenant information for security check
      const orgId = req.headers['x-organization-id'] as string;
      
      const profile = await updateDeviceProfile(id, req.body, orgId);
      
      if (!profile) {
        return res.status(404).json({ error: 'Device profile not found' });
      }
      
      res.json(profile);
    } catch (error) {
      console.error('Error updating device profile:', error);
      res.status(500).json({ 
        error: 'Failed to update device profile', 
        details: error.message 
      });
    }
  }
);

export default router;