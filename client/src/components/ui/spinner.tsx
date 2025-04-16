import * as React from "react"
import { cn } from "@/lib/utils"

const Spinner = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    className={cn("animate-spin h-5 w-5 border-2 border-current border-t-transparent rounded-full", className)}
    ref={ref}
    {...props}
  />
))
Spinner.displayName = "Spinner"

export { Spinner }