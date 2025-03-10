import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    classNameParent?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, classNameParent, leftIcon, rightIcon, ...props }, ref) => {
      const inputElement = (
          <>
              {leftIcon && (
                  <div className="absolute left-3 z-10">
                      {leftIcon}
                  </div>
              )}
              <input
                  type={type}
                  className={cn(
                      "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                      leftIcon ? "pl-10" : "",
                      rightIcon ? "pr-10" : "",
                      className
                  )}
                  ref={ref}
                  {...props}
              />
              {rightIcon && (
                  <div className="absolute right-3 z-10">
                      {rightIcon}
                  </div>
              )}
          </>
      );

      if (classNameParent) {
          return (
              <div className={cn("relative flex items-center w-full", classNameParent)}>
                  {inputElement}
              </div>
          );
      }

      return (
          <>
              {inputElement}
          </>
      );
  }
)
Input.displayName = "Input"

export {Input}
