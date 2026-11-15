"use client"

import * as React from "react"
import { useDirection } from "@base-ui/react/direction-provider"
import { cn } from "cn"
import useEmblaCarousel, {
  type UseEmblaCarouselType,
} from "embla-carousel-react"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useMediaQuery } from "@/hooks/use-media-query"

type EmblaApi = NonNullable<UseEmblaCarouselType[1]>
type EmblaOptions = NonNullable<Parameters<typeof useEmblaCarousel>[0]>

type CarouselContextValue = {
  viewportRef: UseEmblaCarouselType[0]
  api: UseEmblaCarouselType[1]
  orientation: "horizontal" | "vertical"
  canScrollPrev: boolean
  canScrollNext: boolean
  selectedIndex: number
  snapCount: number
  scrollPrev: () => void
  scrollNext: () => void
  scrollTo: (index: number) => void
}

const CarouselContext = React.createContext<CarouselContextValue | null>(null)

function useCarousel() {
  const context = React.useContext(CarouselContext)
  if (!context) throw new Error("useCarousel must be used within <Carousel>")
  return context
}

function useEmblaValue<T extends number | boolean>(
  api: UseEmblaCarouselType[1],
  read: (api: EmblaApi) => T,
  fallback: T
): T {
  return React.useSyncExternalStore(
    (onChange) => {
      if (!api) return () => {}
      api.on("select", onChange).on("reInit", onChange)
      return () => {
        api.off("select", onChange).off("reInit", onChange)
      }
    },
    () => (api ? read(api) : fallback),
    () => fallback
  )
}

type SlideContextValue = { index: number; count: number }

const SlideContext = React.createContext<SlideContextValue>({
  index: 0,
  count: 0,
})

function SlideProvider({
  index,
  count,
  children,
}: SlideContextValue & { children: React.ReactNode }) {
  const value = React.useMemo(() => ({ index, count }), [index, count])
  return <SlideContext.Provider value={value}>{children}</SlideContext.Provider>
}

/** Give it an `aria-label`. */
function Carousel({
  orientation = "horizontal",
  opts,
  plugins,
  setApi,
  dir,
  className,
  children,
  onKeyDownCapture,
  ...props
}: React.ComponentProps<"section"> & {
  orientation?: "horizontal" | "vertical"
  opts?: EmblaOptions
  plugins?: Parameters<typeof useEmblaCarousel>[1]
  setApi?: (api: EmblaApi) => void
  dir?: "ltr" | "rtl"
}) {
  const inherited = useDirection()
  const direction = dir ?? inherited
  const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)")

  const [viewportRef, api] = useEmblaCarousel(
    {
      ...opts,
      direction: direction,
      axis: orientation === "horizontal" ? "x" : "y",
    },
    plugins
  )

  const canScrollPrev = useEmblaValue(api, (a) => a.canScrollPrev(), false)
  const canScrollNext = useEmblaValue(api, (a) => a.canScrollNext(), false)
  const selectedIndex = useEmblaValue(api, (a) => a.selectedScrollSnap(), 0)
  const snapCount = useEmblaValue(api, (a) => a.scrollSnapList().length, 0)

  // Hands embla's API to the parent when it's created. `setApi` exists for
  // exactly this (shadcn's carousel contract), so the effect is the feature,
  // not a state sync to remove.
  React.useEffect(() => {
    // react-doctor-disable-next-line react-doctor/no-pass-live-state-to-parent, react-doctor/no-pass-data-to-parent, react-doctor/no-prop-callback-in-effect
    if (api) setApi?.(api)
  }, [api, setApi])

  const scrollPrev = React.useCallback(
    () => api?.scrollPrev(reduceMotion),
    [api, reduceMotion]
  )
  const scrollNext = React.useCallback(
    () => api?.scrollNext(reduceMotion),
    [api, reduceMotion]
  )
  const scrollTo = React.useCallback(
    (index: number) => api?.scrollTo(index, reduceMotion),
    [api, reduceMotion]
  )

  const onKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    onKeyDownCapture?.(event)
    if (event.defaultPrevented) return
    // Typing in a nested field must not move the slides.
    const target = event.target as HTMLElement
    if (target.closest("input, textarea, select, [contenteditable=true]"))
      return
    const prevKey =
      orientation === "vertical"
        ? "ArrowUp"
        : direction === "rtl"
          ? "ArrowRight"
          : "ArrowLeft"
    const nextKey =
      orientation === "vertical"
        ? "ArrowDown"
        : direction === "rtl"
          ? "ArrowLeft"
          : "ArrowRight"
    if (event.key === prevKey) {
      event.preventDefault()
      scrollPrev()
    } else if (event.key === nextKey) {
      event.preventDefault()
      scrollNext()
    } else if (event.key === "Home") {
      event.preventDefault()
      scrollTo(0)
    } else if (event.key === "End") {
      event.preventDefault()
      scrollTo(Math.max(0, snapCount - 1))
    }
  }

  const context = React.useMemo<CarouselContextValue>(
    () => ({
      viewportRef,
      api,
      orientation,
      canScrollPrev,
      canScrollNext,
      selectedIndex,
      snapCount,
      scrollPrev,
      scrollNext,
      scrollTo,
    }),
    [
      viewportRef,
      api,
      orientation,
      canScrollPrev,
      canScrollNext,
      selectedIndex,
      snapCount,
      scrollPrev,
      scrollNext,
      scrollTo,
    ]
  )

  return (
    <CarouselContext.Provider value={context}>
      <section
        data-slot="carousel"
        data-orientation={orientation}
        dir={dir}
        aria-roledescription="carousel"
        onKeyDownCapture={onKeyDown}
        className={cn("relative", className)}
        {...props}
      >
        {children}
      </section>
    </CarouselContext.Provider>
  )
}

/** In a vertical carousel give it a height (`h-64`). */
function CarouselContent({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  const { viewportRef, orientation } = useCarousel()
  // toArray keys every element, so each slide keeps a stable key.
  const slides = React.Children.toArray(children).filter(React.isValidElement)
  return (
    <div
      ref={viewportRef}
      data-slot="carousel-viewport"
      // Tab stop so the arrow keys work before any button has focus.
      role="region"
      aria-label="Slides"
      tabIndex={0}
      className="overflow-hidden rounded-lg focus-ring"
    >
      <div
        data-slot="carousel-content"
        className={cn(
          "flex",
          orientation === "horizontal"
            ? "-ms-4 touch-pan-y touch-pinch-zoom"
            : "-mt-4 h-full touch-pan-x touch-pinch-zoom flex-col",
          className
        )}
        {...props}
      >
        {slides.map((child, index) => (
          <SlideProvider key={child.key} index={index} count={slides.length}>
            {child}
          </SlideProvider>
        ))}
      </div>
    </div>
  )
}

function CarouselItem({ className, ...props }: React.ComponentProps<"div">) {
  const { orientation } = useCarousel()
  const { index, count } = React.useContext(SlideContext)
  return (
    <div
      role="group"
      aria-roledescription="slide"
      aria-label={`${index + 1} of ${count}`}
      data-slot="carousel-item"
      className={cn(
        "min-w-0 shrink-0 grow-0 basis-full",
        orientation === "horizontal" ? "ps-4" : "pt-4",
        className
      )}
      {...props}
    />
  )
}

function CarouselPrevious({
  className,
  variant = "outline",
  size = "icon-sm",
  ...props
}: React.ComponentProps<typeof Button>) {
  const { orientation, scrollPrev, canScrollPrev } = useCarousel()
  return (
    <Button
      data-slot="carousel-previous"
      variant={variant}
      size={size}
      className={cn(
        "absolute z-10 rounded-full bg-background dark:bg-background dark:hover:bg-muted",
        orientation === "horizontal"
          ? "start-2 top-1/2 -translate-y-1/2"
          : "start-1/2 top-2 -translate-x-1/2 rtl:translate-x-1/2",
        className
      )}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      {...props}
    >
      <ChevronLeftIcon
        className={cn(
          orientation === "vertical" ? "rotate-90" : "rtl:rotate-180"
        )}
      />
      <span className="sr-only">Previous slide</span>
    </Button>
  )
}

function CarouselNext({
  className,
  variant = "outline",
  size = "icon-sm",
  ...props
}: React.ComponentProps<typeof Button>) {
  const { orientation, scrollNext, canScrollNext } = useCarousel()
  return (
    <Button
      data-slot="carousel-next"
      variant={variant}
      size={size}
      className={cn(
        "absolute z-10 rounded-full bg-background dark:bg-background dark:hover:bg-muted",
        orientation === "horizontal"
          ? "end-2 top-1/2 -translate-y-1/2"
          : "start-1/2 bottom-2 -translate-x-1/2 rtl:translate-x-1/2",
        className
      )}
      disabled={!canScrollNext}
      onClick={scrollNext}
      {...props}
    >
      <ChevronRightIcon
        className={cn(
          orientation === "vertical" ? "rotate-90" : "rtl:rotate-180"
        )}
      />
      <span className="sr-only">Next slide</span>
    </Button>
  )
}

function CarouselDots({ className, ...props }: React.ComponentProps<"div">) {
  const { snapCount, selectedIndex, scrollTo, orientation } = useCarousel()
  const snapList = React.useMemo(
    () => Array.from({ length: snapCount }, (_, n) => n),
    [snapCount]
  )
  if (snapCount < 2) return null
  return (
    <div
      role="group"
      aria-label="Choose slide"
      data-slot="carousel-dots"
      className={cn(
        "flex items-center justify-center",
        orientation === "vertical" && "flex-col",
        className
      )}
      {...props}
    >
      {snapList.map((snap) => (
        <button
          key={snap}
          type="button"
          aria-label={`Go to slide ${snap + 1}`}
          aria-current={snap === selectedIndex ? "true" : undefined}
          onClick={() => scrollTo(snap)}
          // 24px target around a 6px dot (WCAG 2.5.8).
          className="group/dot grid size-6 place-items-center rounded-full focus-ring outline-none"
        >
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full bg-foreground/25 transition-[background-color,scale] duration-(--ds-duration-popover) ease-out group-hover/dot:bg-foreground/50 motion-reduce:transition-none",
              "group-aria-current/dot:bg-foreground",
              "group-aria-current/dot:scale-150"
            )}
          />
        </button>
      ))}
    </div>
  )
}

export {
  Carousel,
  CarouselContent,
  CarouselDots,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  useCarousel,
  type EmblaApi as CarouselApi,
}
