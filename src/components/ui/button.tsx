import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

// shadcn base-nova Button, restyled for the site:
// - palette tints only (no color-mix, no oklch);
// - the site focus ring (2px white, offset 3px) instead of shadcn's soft ring;
// - every size is at least 44px tall, the site's minimum tap target;
// - UI label type: weight 600, 15px, width 102%.
const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-[0.9375rem] font-semibold [font-stretch:102%] whitespace-nowrap transition-colors select-none focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-rc-ink active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-rc-accent-deep",
        outline:
          "border-border bg-transparent text-rc-ink hover:border-rc-muted hover:bg-muted aria-expanded:bg-muted",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-rc-muted/20 aria-expanded:bg-rc-muted/20",
        ghost:
          "text-rc-muted hover:bg-muted hover:text-rc-ink aria-expanded:bg-muted aria-expanded:text-rc-ink",
        destructive:
          "border-rc-line bg-transparent text-destructive hover:border-rc-muted hover:bg-muted",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default:
          "min-h-11 gap-2 px-4 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        xs: "min-h-11 gap-1 px-2.5 text-xs [&_svg:not([class*='size-'])]:size-3",
        sm: "min-h-11 gap-1.5 px-3 text-sm [&_svg:not([class*='size-'])]:size-3.5",
        lg: "min-h-12 gap-2 px-6 has-data-[icon=inline-end]:pr-5 has-data-[icon=inline-start]:pl-5",
        icon: "size-11",
        "icon-xs": "size-11 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-11 [&_svg:not([class*='size-'])]:size-3.5",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
