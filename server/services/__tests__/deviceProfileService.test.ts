import * as deviceProfileService from '../deviceProfileService';
import { DeviceProfile } from '../deviceProfileService';

// Reset the store before each test
beforeEach(() => {
  // Clear all profiles by deleting any existing ones
  const profiles = deviceProfileService.listProfiles();
  profiles.forEach(profile => {
    deviceProfileService.deleteProfile(profile.id);
  });
});

describe('Device Profile Service', () => {
  describe('createProfile', () => {
    it('returns a profile with id and correct data', () => {
      // Arrange
      const profileData: Omit<DeviceProfile, 'id'> = {
        deviceName: 'Test Device',
        manufacturer: 'Test Manufacturer',
        deviceClass: 'II',
        productCode: 'ABC123',
        regulationNumber: '123.456',
        intendedUse: 'For testing purposes',
      };
      const orgId = '123';

      // Act
      const result = deviceProfileService.createProfile(profileData, orgId);

      // Assert
      expect(result).toBeTruthy();
      expect(result.id).toBeDefined();
      expect(result.deviceName).toBe(profileData.deviceName);
      expect(result.manufacturer).toBe(profileData.manufacturer);
      expect(result.deviceClass).toBe(profileData.deviceClass);
      expect(result.productCode).toBe(profileData.productCode);
      expect(result.regulationNumber).toBe(profileData.regulationNumber);
      expect(result.intendedUse).toBe(profileData.intendedUse);
      expect(result.organizationId).toBe(orgId);
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
      expect(result.created).toBeDefined(); // Alternate field
      expect(result.updated).toBeDefined(); // Alternate field
    });

    it('creates a profile with name field instead of deviceName', () => {
      // Arrange
      const profileData: Omit<DeviceProfile, 'id'> = {
        name: 'Test Device Alt',
        manufacturer: 'Test Manufacturer',
      };

      // Act
      const result = deviceProfileService.createProfile(profileData);

      // Assert
      expect(result).toBeTruthy();
      expect(result.id).toBeDefined();
      expect(result.name).toBe(profileData.name);
      expect(result.deviceName).toBeUndefined(); // Not set
    });
  });

  describe('listProfiles', () => {
    it('includes newly created profiles', () => {
      // Arrange
      const orgId = '456';
      const profile1 = deviceProfileService.createProfile({ deviceName: 'Device 1' }, orgId);
      const profile2 = deviceProfileService.createProfile({ deviceName: 'Device 2' }, orgId);
      const differentOrgProfile = deviceProfileService.createProfile(
        { deviceName: 'Different Org Device' },
        '999'
      );

      // Act
      const result = deviceProfileService.listProfiles(orgId);

      // Assert
      expect(result).toHaveLength(2);
      expect(result.some(p => p.id === profile1.id)).toBe(true);
      expect(result.some(p => p.id === profile2.id)).toBe(true);
      expect(result.some(p => p.id === differentOrgProfile.id)).toBe(false); // Different org
    });

    it('returns global profiles when no organization id is provided', () => {
      // Arrange
      const globalProfile = deviceProfileService.createProfile({ deviceName: 'Global Device' });
      const orgProfile = deviceProfileService.createProfile(
        { deviceName: 'Org Device' },
        '789'
      );

      // Act
      const result = deviceProfileService.listProfiles();

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(globalProfile.id);
    });
  });

  describe('getProfile', () => {
    it('fetches by ID', () => {
      // Arrange
      const orgId = '111';
      const createdProfile = deviceProfileService.createProfile(
        { deviceName: 'Retrievable Device' },
        orgId
      );

      // Act
      const result = deviceProfileService.getProfile(createdProfile.id, orgId);

      // Assert
      expect(result).toBeTruthy();
      expect(result?.id).toBe(createdProfile.id);
      expect(result?.deviceName).toBe(createdProfile.deviceName);
    });

    it('returns undefined for non-existent profiles', () => {
      // Act
      const result = deviceProfileService.getProfile('non-existent-id');

      // Assert
      expect(result).toBeUndefined();
    });

    it('cannot find profile from a different organization', () => {
      // Arrange
      const orgId = '222';
      const createdProfile = deviceProfileService.createProfile(
        { deviceName: 'Org Specific Device' },
        orgId
      );

      // Act - Try to get with different org id
      const result = deviceProfileService.getProfile(createdProfile.id, '333');

      // Assert
      expect(result).toBeUndefined();
    });
  });

  describe('updateProfile', () => {
    it('merges updates correctly', () => {
      // Arrange
      const orgId = '444';
      const originalProfile = deviceProfileService.createProfile(
        {
          deviceName: 'Original Name',
          manufacturer: 'Original Manufacturer',
          deviceClass: 'I',
          intendedUse: 'Original use'
        },
        orgId
      );

      // Act
      const updatedData: Partial<DeviceProfile> = {
        deviceName: 'Updated Name',
        deviceClass: 'II',
        // manufacturer should remain unchanged
      };
      const result = deviceProfileService.updateProfile(originalProfile.id, updatedData, orgId);

      // Assert
      expect(result.deviceName).toBe(updatedData.deviceName);
      expect(result.deviceClass).toBe(updatedData.deviceClass);
      expect(result.manufacturer).toBe(originalProfile.manufacturer); // Unchanged
      expect(result.intendedUse).toBe(originalProfile.intendedUse); // Unchanged
      expect(result.id).toBe(originalProfile.id); // ID must never change
      expect(result.updatedAt).not.toBe(result.createdAt); // Updated timestamp
      expect(result.updated).not.toBe(result.created); // Alternate field updated
    });

    it('throws an error if profile is missing', () => {
      // Act & Assert
      expect(() => {
        deviceProfileService.updateProfile('non-existent-id', { deviceName: 'New Name' });
      }).toThrow('Device profile not found');
    });
  });

  describe('saveProfile', () => {
    it('creates a new profile when no ID is provided', () => {
      // Arrange
      const profileData: Omit<DeviceProfile, 'id'> = {
        deviceName: 'New Profile',
        manufacturer: 'New Manufacturer',
      };

      // Act
      const result = deviceProfileService.saveProfile(profileData);

      // Assert
      expect(result.id).toBeDefined();
      expect(result.deviceName).toBe(profileData.deviceName);
    });

    it('updates an existing profile when ID is provided', () => {
      // Arrange
      const orgId = '555';
      const originalProfile = deviceProfileService.createProfile(
        { deviceName: 'Original Name' },
        orgId
      );

      // Act
      const updatedData: Partial<DeviceProfile> = {
        id: originalProfile.id,
        deviceName: 'Updated Via Save',
      };
      const result = deviceProfileService.saveProfile(updatedData, orgId);

      // Assert
      expect(result.id).toBe(originalProfile.id);
      expect(result.deviceName).toBe(updatedData.deviceName);
    });
  });

  describe('deleteProfile', () => {
    it('removes the profile', () => {
      // Arrange
      const orgId = '666';
      const profile = deviceProfileService.createProfile({ deviceName: 'To Be Deleted' }, orgId);

      // Act
      const deleteResult = deviceProfileService.deleteProfile(profile.id, orgId);
      const findResult = deviceProfileService.getProfile(profile.id, orgId);

      // Assert
      expect(deleteResult).toBe(true); // Successfully deleted
      expect(findResult).toBeUndefined(); // Cannot find it anymore
    });

    it('returns false when trying to delete non-existent profile', () => {
      // Act
      const result = deviceProfileService.deleteProfile('non-existent-id');

      // Assert
      expect(result).toBe(false);
    });

    it('only deletes profile from the correct organization', () => {
      // Arrange
      const orgId = '777';
      const profile = deviceProfileService.createProfile({ deviceName: 'Org Protected' }, orgId);

      // Act - Try to delete with wrong org id
      const deleteResult = deviceProfileService.deleteProfile(profile.id, '888');
      const findResult = deviceProfileService.getProfile(profile.id, orgId);

      // Assert
      expect(deleteResult).toBe(false); // Delete failed
      expect(findResult).toBeDefined(); // Profile still exists
    });
  });
});