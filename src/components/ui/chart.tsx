import * as React from "react"
import * as RechartsPrimitive from "recharts"

import { cn } from "@/lib/utils"

// Simplified chart components to fix TypeScript errors
const Chart = RechartsPrimitive

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    config: Record<string, any>
  }
>(({ config, children, className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("h-full w-full", className)}
      {...props}
    >
      {children}
    </div>
  )
})
ChartContainer.displayName = "ChartContainer"

const ChartTooltip = RechartsPrimitive.Tooltip

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    active?: boolean
    payload?: any[]
    label?: any
    hideLabel?: boolean
    hideIndicator?: boolean
    indicator?: "line" | "dot" | "dashed"
    nameKey?: string
    labelKey?: string
  }
>(({ className, active, payload, label, hideLabel, hideIndicator, indicator = "dot" }, ref) => {
  if (!active || !payload?.length) {
    return null
  }

  return (
    <div
      ref={ref}
      className={cn(
        "rounded-lg border bg-background p-2 shadow-md",
        className
      )}
    >
      {!hideLabel && label && (
        <div className="mb-2 font-medium">{label}</div>
      )}
      <div className="space-y-1">
        {payload.map((item, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            {!hideIndicator && (
              <div
                className={cn(
                  "h-2 w-2 rounded-full",
                  indicator === "dot" && "bg-current"
                )}
                style={{ color: item.color }}
              />
            )}
            <span className="text-muted-foreground">{item.name}:</span>
            <span className="font-medium">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
})
ChartTooltipContent.displayName = "ChartTooltipContent"

const ChartLegend = RechartsPrimitive.Legend

const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    payload?: any[]
    hideIcon?: boolean
    nameKey?: string
  }
>(({ className, payload, hideIcon }, ref) => {
  if (!payload?.length) {
    return null
  }

  return (
    <div
      ref={ref}
      className={cn("flex items-center justify-center gap-4 pt-3", className)}
    >
      {payload.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          {!hideIcon && (
            <div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: item.color }}
            />
          )}
          <span className="text-sm text-muted-foreground">{item.value}</span>
        </div>
      ))}
    </div>
  )
})
ChartLegendContent.displayName = "ChartLegendContent"

export {
  Chart,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
}