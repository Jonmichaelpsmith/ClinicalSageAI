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
import DeviceProfileForm from './DeviceProfileForm';
import { postDeviceProfile, updateDeviceProfile } from '@/api/cer';

const DeviceProfileDialog = ({ 
  buttonText = 'Create Device Profile', 
  buttonVariant = 'default',
  buttonIcon = null,
  existingData = null,
  onSuccessfulSubmit = () => {},
  dialogTitle = 'Device Profile',
  dialogDescription = 'Enter the details for your medical device to begin the 510(k) submission process.'
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
        description: 'Failed to save device profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={buttonVariant} disabled={loading}>
          {buttonIcon && <span className="mr-2">{buttonIcon}</span>}
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>
            {dialogDescription}
          </DialogDescription>
        </DialogHeader>
        <DeviceProfileForm 
          initialData={existingData} 
          onSubmit={handleSubmit} 
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

export default DeviceProfileDialog;