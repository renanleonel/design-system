"use client"

import * as React from "react"
import { cn } from "cn"

import {
  Carousel,
  CarouselContent,
  CarouselDots,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel"

const PANELS = [
  "bg-primary text-primary-foreground",
  "bg-secondary text-secondary-foreground",
  "bg-muted text-foreground",
  "bg-accent text-accent-foreground",
]

function Slide({
  index,
  title,
  caption,
  className,
}: {
  index: number
  title: string
  caption?: string
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex h-48 flex-col justify-end gap-1 rounded-lg px-12 py-5",
        PANELS[index % PANELS.length],
        className
      )}
    >
      <span className="text-xs tabular-nums opacity-70">
        {String(index + 1).padStart(2, "0")}
      </span>
      <p className="text-lg font-medium">{title}</p>
      {caption && <p className="text-sm opacity-80">{caption}</p>}
    </div>
  )
}

const TITLES = ["Plan", "Design", "Build", "Review", "Ship"]

/** Swipe, drag, use the arrows or dots; arrow keys work once focus is inside. */
export function Default() {
  return (
    <Carousel aria-label="Release steps" className="mx-auto w-full max-w-md">
      <CarouselContent>
        {TITLES.map((title, i) => (
          <CarouselItem key={title}>
            <Slide index={i} title={title} caption="Step in the release flow" />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
      <CarouselDots className="mt-3" />
    </Carousel>
  )
}

/** Controls below the slides, with the position read out through `setApi`. */
export function ControlsBelow() {
  const [api, setApi] = React.useState<CarouselApi>()
  const [current, setCurrent] = React.useState(1)
  React.useEffect(() => {
    if (!api) return
    const update = () => setCurrent(api.selectedScrollSnap() + 1)
    api.on("select", update)
    return () => {
      api.off("select", update)
    }
  }, [api])
  return (
    <Carousel
      aria-label="Release steps"
      setApi={setApi}
      className="mx-auto w-full max-w-md"
    >
      <CarouselContent>
        {TITLES.map((title, i) => (
          <CarouselItem key={title}>
            <Slide index={i} title={title} />
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className="mt-3 flex items-center justify-between">
        <CarouselPrevious className="static translate-y-0" />
        <span className="text-sm text-muted-foreground tabular-nums">
          {current} / {TITLES.length}
        </span>
        <CarouselNext className="static translate-y-0" />
      </div>
    </Carousel>
  )
}

/** Several slides per view: `basis-*` on the items, `loop` and `align` in `opts`. */
export function MultiPerView() {
  return (
    <Carousel
      aria-label="Gallery"
      opts={{ align: "start", loop: true }}
      className="mx-auto w-full max-w-lg"
    >
      <CarouselContent>
        {Array.from({ length: 8 }, (_, i) => (
          <CarouselItem key={i} className="basis-1/2 md:basis-1/3">
            <Slide index={i} title={`Item ${i + 1}`} className="h-32" />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  )
}

/** `orientation="vertical"`: give the content a height; arrows are Up and Down. */
export function Vertical() {
  return (
    <Carousel
      aria-label="Release steps"
      orientation="vertical"
      className="mx-auto w-full max-w-xs"
    >
      <CarouselContent className="h-48">
        {TITLES.map((title, i) => (
          <CarouselItem key={title}>
            <Slide index={i} title={title} className="h-full" />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  )
}

/** Mirrors itself: Left Arrow goes forward, the chevrons flip, drag reverses. */
export function Rtl() {
  return (
    <Carousel
      dir="rtl"
      aria-label="Ø®Ø·ÙˆØ§Øª Ø§Ù„Ø¥ØµØ¯Ø§Ø±"
      className="mx-auto w-full max-w-md"
    >
      <CarouselContent>
        {[
          "Ø§Ù„ØªØ®Ø·ÙŠØ·",
          "Ø§Ù„ØªØµÙ…ÙŠÙ…",
          "Ø§Ù„Ø¨Ù†Ø§Ø¡",
          "Ø§Ù„Ù…Ø±Ø§Ø¬Ø¹Ø©",
        ].map((title, i) => (
          <CarouselItem key={title}>
            <Slide
              index={i}
              title={title}
              caption="Ø®Ø·ÙˆØ© ÙÙŠ Ù…Ø³Ø§Ø± Ø§Ù„Ø¥ØµØ¯Ø§Ø±"
            />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
      <CarouselDots className="mt-3" />
    </Carousel>
  )
}

/** A single slide: the dots hide and both arrows disable. */
export function One() {
  return (
    <Carousel aria-label="Announcement" className="mx-auto w-full max-w-md">
      <CarouselContent>
        <CarouselItem>
          <Slide index={0} title="Only one" caption="Nothing to scroll to" />
        </CarouselItem>
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
      <CarouselDots className="mt-3" />
    </Carousel>
  )
}

/** No slides: say so instead of showing a blank box. */
export function Empty() {
  return (
    <div className="mx-auto flex h-32 w-full max-w-md items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
      No slides yet
    </div>
  )
}

const LONG = [
  {
    id: "long-1",
    title: "Maria Eduarda dos Santos Albuquerque Cavalcanti",
    caption:
      "Coordenadora de OperaÃ§Ãµes de Relacionamento com o Cliente e Sucesso do Produto na RegiÃ£o Centro-Oeste",
  },
  {
    id: "long-2",
    title: "JoÃ£o Pedro de Oliveira Neto Filho",
    caption:
      "Supercalifragilisticexpialidocious_unbreakable_caption_0123456789",
  },
  {
    id: "long-3",
    title: "æ±äº¬éƒ½æ¸‹è°·åŒºç¥žå®®å‰ã®æ–°ã—ã„ã‚ªãƒ•ã‚£ã‚¹ã¸ã‚ˆã†ã“ã",
    caption:
      "é•·ã„èª¬æ˜Žæ–‡ãŒã“ã“ã«å…¥ã‚Šã¾ã™ã€‚æŠ˜ã‚Šè¿”ã—ã¨ã¯ã¿å‡ºã—ã®ç¢ºèªã€‚",
  },
  {
    id: "long-4",
    title:
      "Ù…Ø±Ø­Ø¨Ø§ Ø¨ÙƒÙ… ÙÙŠ Ø§Ù„Ù…ÙƒØªØ¨ Ø§Ù„Ø¬Ø¯ÙŠØ¯ ÙÙŠ ÙˆØ³Ø· Ø§Ù„Ù…Ø¯ÙŠÙ†Ø©",
    caption:
      "ÙˆØµÙ Ø·ÙˆÙŠÙ„ Ø¬Ø¯Ø§ ÙŠØªØ­Ù‚Ù‚ Ù…Ù† Ø§Ù„Ø§Ù„ØªÙØ§Ù ÙˆØ§Ù„Ø§Ù‚ØªØ·Ø§Ø¹ ÙÙŠ Ø§Ù„Ø´Ø±Ø§Ø¦Ø­",
  },
]

/** Long captions, CJK and Arabic, and 30 slides with wrapping dots. */
export function WorstCase() {
  const slides = [
    ...LONG,
    ...Array.from({ length: 26 }, (_, i) => ({
      id: `slide-${i + 5}`,
      title: `Slide ${i + 5}`,
      caption: undefined as string | undefined,
    })),
  ]
  return (
    <Carousel aria-label="Equipe" className="mx-auto w-full max-w-md">
      <CarouselContent>
        {slides.map((slide, i) => (
          <CarouselItem key={slide.id}>
            <Slide
              index={i}
              title={slide.title}
              caption={slide.caption}
              className="h-auto min-h-48 overflow-hidden"
            />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
      <CarouselDots className="mt-3 flex-wrap" />
    </Carousel>
  )
}
