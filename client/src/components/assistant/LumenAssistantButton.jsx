import React from 'react';
import { Bot } from 'lucide-react';
import { useLumenAssistant } from './LumenAssistantProvider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

const LumenAssistantButton = ({
  variant = 'default',
  size = 'default',
  tooltip = 'Ask Lumen',
  className,
  contextData,
  ...props
}) => {
  const { toggleAssistant } = useLumenAssistant();

  // Handle button click with contextual data
  const handleClick = () => {
    // In a real implementation, you could use the contextData
    // to provide module-specific context to the assistant
    console.log('Assistant context:', contextData);
    toggleAssistant();
  };

  // Map variant styles
  const variantStyles = {
    'default': 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100',
    'primary': 'bg-indigo-600 hover:bg-indigo-700 text-white',
    'secondary': 'bg-purple-600 hover:bg-purple-700 text-white',
    'ghost': 'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-100',
  };

  // Map size styles
  const sizeStyles = {
    'sm': 'h-9 w-9',
    'default': 'h-11 w-11',
    'lg': 'h-14 w-14',
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={handleClick}
            className={cn(
              'rounded-full flex items-center justify-center shadow-md transition-colors focus-visible:outline-none focus-visible:ring focus-visible:ring-indigo-400',
              variantStyles[variant],
              sizeStyles[size],
              className
            )}
            aria-label="Ask Lumen AI Assistant"
            {...props}
          >
            <Bot 
              size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20} 
              className={variant.includes('primary') || variant.includes('secondary') ? 'text-white' : ''}
            />
          </button>
        </TooltipTrigger>
        <TooltipContent side="left">
          {tooltip}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default LumenAssistantButton;