"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const FAQ = [
  {
    q: "Can I change plans later?",
    a: "Yes. Upgrades apply now and are prorated; downgrades apply at the next renewal.",
  },
  {
    q: "Do you offer refunds?",
    a: "Within 14 days of a charge, no questions asked.",
  },
  {
    q: "Where is my data stored?",
    a: "In the region you pick when you create the workspace.",
  },
]

export function Default() {
  return (
    <Accordion className="w-full max-w-md">
      {FAQ.map((item) => (
        <AccordionItem key={item.q} value={item.q}>
          <AccordionTrigger>{item.q}</AccordionTrigger>
          <AccordionContent>{item.a}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}

export function Multiple() {
  return (
    <Accordion multiple defaultValue={[FAQ[0].q]} className="w-full max-w-md">
      {FAQ.map((item) => (
        <AccordionItem key={item.q} value={item.q}>
          <AccordionTrigger>{item.q}</AccordionTrigger>
          <AccordionContent>{item.a}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
