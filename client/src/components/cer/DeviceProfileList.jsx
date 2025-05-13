import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, ChevronRight, PlusCircle } from 'lucide-react';
import { useTenant } from '@/contexts/TenantContext';
import { formatDistanceToNow } from 'date-fns';
import DeviceProfileDialog from './DeviceProfileDialog';
import { getDeviceProfiles, deleteDeviceProfile } from '@/api/cer';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const DeviceProfileList = ({ onSelectProfile }) => {
  const { currentOrganization } = useTenant();
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [profileToDelete, setProfileToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  
  // Fetch device profiles
  const { data: deviceProfiles, isLoading, isError, refetch } = useQuery({
    queryKey: ['/api/cer/device-profile/organization', currentOrganization?.id],
    queryFn: () => getDeviceProfiles(currentOrganization?.id),
    enabled: !!currentOrganization?.id,
    staleTime: 60000, // 1 minute
  });
  
  const handleEditSuccess = (updatedProfile) => {
    refetch();
  };
  
  const handleSelectProfile = (profile) => {
    setSelectedProfile(profile);
    if (onSelectProfile) {
      onSelectProfile(profile);
    }
  };
  
  const handleDeleteClick = (profile) => {
    setProfileToDelete(profile);
    setDeleteDialogOpen(true);
  };
  
  const handleDeleteConfirm = async () => {
    if (!profileToDelete) return;
    
    setIsDeleting(true);
    try {
      await deleteDeviceProfile(profileToDelete.id);
      toast({
        title: 'Device profile deleted',
        description: `${profileToDelete.deviceName} has been successfully deleted.`,
      });
      
      // If we deleted the currently selected profile, deselect it
      if (selectedProfile?.id === profileToDelete.id) {
        setSelectedProfile(null);
        if (onSelectProfile) {
          onSelectProfile(null);
        }
      }
      
      refetch();
    } catch (error) {
      toast({
        title: 'Error deleting profile',
        description: error.message || 'An error occurred while deleting the device profile.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setProfileToDelete(null);
    }
  };
  
  const getDeviceClassBadge = (deviceClass) => {
    const variants = {
      'I': 'outline',
      'II': 'secondary',
      'III': 'destructive'
    };
    
    return (
      <Badge variant={variants[deviceClass] || 'outline'}>
        Class {deviceClass}
      </Badge>
    );
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Device Profiles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Device Profiles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-4 text-red-500">
            Error loading device profiles. Please try again later.
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Device Profiles</CardTitle>
          <CardDescription>
            Manage your medical device profiles for 510(k) submissions
          </CardDescription>
        </div>
        <DeviceProfileDialog 
          buttonIcon={<PlusCircle className="h-4 w-4" />}
          onSuccessfulSubmit={refetch}
        />
      </CardHeader>
      <CardContent>
        {(!deviceProfiles || deviceProfiles.length === 0) ? (
          <div className="text-center p-8 text-gray-500">
            <p className="mb-4">No device profiles found.</p>
            <p>Create a new device profile to begin the 510(k) submission process.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Device Name</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Manufacturer</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deviceProfiles.map((profile) => (
                <TableRow 
                  key={profile.id} 
                  className={selectedProfile?.id === profile.id ? "bg-muted/50" : ""}
                >
                  <TableCell className="font-medium">{profile.deviceName}</TableCell>
                  <TableCell>{getDeviceClassBadge(profile.deviceClass)}</TableCell>
                  <TableCell>{profile.manufacturer || 'N/A'}</TableCell>
                  <TableCell>
                    {profile.updatedAt 
                      ? formatDistanceToNow(new Date(profile.updatedAt), { addSuffix: true })
                      : 'N/A'
                    }
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => handleSelectProfile(profile)}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      <DeviceProfileDialog
                        buttonVariant="outline"
                        buttonIcon={<Pencil className="h-4 w-4" />}
                        buttonText=""
                        existingData={profile}
                        dialogTitle="Edit Device Profile"
                        dialogDescription="Update the details for your medical device."
                        onSuccessfulSubmit={handleEditSuccess}
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDeleteClick(profile)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
      {deviceProfiles && deviceProfiles.length > 0 && (
        <CardFooter className="border-t px-6 py-4">
          <p className="text-sm text-muted-foreground">
            Showing {deviceProfiles.length} device {deviceProfiles.length === 1 ? 'profile' : 'profiles'}
          </p>
        </CardFooter>
      )}
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the device profile
              {profileToDelete && <strong> "{profileToDelete.deviceName}"</strong>} and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              disabled={isDeleting} 
              onClick={(e) => {
                e.preventDefault();
                handleDeleteConfirm();
              }}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isDeleting ? (
                <>
                  <span className="animate-spin mr-2">⟳</span>
                  Deleting...
                </>
              ) : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default DeviceProfileList;