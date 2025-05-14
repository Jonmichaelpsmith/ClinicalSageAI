import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Clock, FileSymlink, Plus, RefreshCw } from 'lucide-react';
import DeviceProfileForm from './DeviceProfileForm';
import FDA510kService from '@/services/FDA510kService';

const DeviceProfileDialog = ({ 
  buttonText = 'Create Device Profile', 
  buttonVariant = 'default',
  buttonIcon = null,
  existingData = null,
  onSuccessfulSubmit = () => {},
  dialogTitle = 'Device Profile',
  dialogDescription = 'Enter the details for your medical device to begin the 510(k) submission process.',
  showBadge = false,
  isStartingPoint = false
}) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (data) => {
    setLoading(true);
    try {
      let result;
      
      if (existingData?.id) {
        // Update existing profile
        result = await updateDeviceProfile(existingData.id, data);
        toast({
          title: 'Device profile updated',
          description: 'Your device profile has been successfully updated.',
        });
      } else {
        // Create new profile
        result = await postDeviceProfile(data);
        toast({
          title: 'Device profile created',
          description: 'Your device profile has been successfully created.',
        });
      }
      
      setOpen(false);
      onSuccessfulSubmit(result);
    } catch (error) {
      console.error('Error saving device profile:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to save device profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Generate a dynamic button with appropriate icon based on context
  const getButtonIcon = () => {
    if (buttonIcon) return buttonIcon;
    if (existingData) return <RefreshCw className="h-4 w-4 mr-2" />;
    return <Plus className="h-4 w-4 mr-2" />;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="relative inline-block">
          <Button 
            variant={buttonVariant} 
            disabled={loading}
            className={isStartingPoint ? "relative px-6 py-6 h-auto text-md font-medium shadow-md hover:shadow-lg transition-all duration-200" : ""}
          >
            {getButtonIcon()}
            {buttonText}
            {isStartingPoint && (
              <div className="absolute -top-3 -right-3">
                <Badge className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                  START HERE
                </Badge>
              </div>
            )}
          </Button>
          {showBadge && !isStartingPoint && (
            <div className="absolute -top-2 -right-2">
              <Badge className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                Step 1
              </Badge>
            </div>
          )}
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="sticky top-0 z-10 bg-white pb-3 border-b mb-2">
          <div className="flex justify-between items-center">
            <DialogTitle>{dialogTitle}</DialogTitle>
            {existingData && (
              <Badge variant="outline" className="flex items-center gap-1 text-blue-600 border-blue-200 px-2 py-1">
                <Clock className="h-3 w-3" />
                <span className="text-xs">Last updated: {new Date(existingData.updatedAt).toLocaleDateString()}</span>
              </Badge>
            )}
          </div>
          <DialogDescription>
            {dialogDescription}
          </DialogDescription>
          {existingData && (
            <div className="flex items-center mt-2 text-xs text-gray-500">
              <FileSymlink className="h-3 w-3 mr-1" />
              <span>Profile ID: {existingData.id}</span>
            </div>
          )}
        </DialogHeader>
        <div className="overflow-y-auto flex-grow pr-1">
          <DeviceProfileForm 
            initialData={existingData} 
            onSubmit={handleSubmit} 
            onCancel={() => setOpen(false)}
          />
        </div>
        {loading && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-50">
            <div className="flex flex-col items-center">
              <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mb-2"></div>
              <p className="text-blue-800 font-medium">Saving device profile...</p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DeviceProfileDialog;