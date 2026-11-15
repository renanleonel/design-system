import { addDays, startOfDay } from "date-fns"

import type { ScheduleEvent } from "./schedule-utils"

export function createSampleEvents(now: Date): ScheduleEvent[] {
  const day = (offset: number, h = 0, m = 0) => {
    const d = addDays(startOfDay(now), offset)
    d.setHours(h, m)
    return d
  }
  const timed = (
    id: string,
    title: string,
    offset: number,
    from: [number, number],
    to: [number, number],
    extra: Partial<ScheduleEvent> = {}
  ): ScheduleEvent => ({
    id,
    title,
    start: day(offset, ...from),
    end: day(offset, ...to),
    tone: "blue",
    ...extra,
  })
  return [
    timed("s1", "Daily with the platform team", 0, [9, 30], [9, 45], {
      tone: "green",
      location: "Meet",
    }),
    timed("s2", "Design review: calendar block", 0, [10, 0], [11, 0], {
      tone: "purple",
      location: "Room Ibirapuera",
      description:
        "Walk through week, day and month; decide what ships in the first cut.",
    }),
    timed("s3", "1:1 with Ana Souza", 0, [10, 30], [11, 30], { tone: "amber" }),
    timed("s4", "Lunch with João Silva", 0, [12, 30], [14, 0], {
      tone: "orange",
      location: "Mercado Pinheiros",
    }),
    timed("s5", "Release train", 0, [16, 0], [17, 30], { tone: "red" }),
    timed("s6", "Planning", 1, [9, 0], [10, 30], { tone: "blue" }),
    timed("s7", "Pairing: registry build", 1, [14, 0], [15, 0], {
      tone: "green",
    }),
    timed("s8", "Yoga", -1, [7, 0], [8, 0], { tone: "gray" }),
    timed("s9", "Customer call: Pedro Santos", -1, [15, 0], [16, 0], {
      tone: "blue",
    }),
    timed("s10", "Retro", -2, [11, 0], [12, 0], { tone: "purple" }),
    timed("s11", "Dentist", 3, [8, 30], [9, 15], { tone: "amber" }),
    timed("s12", "Demo day", 4, [15, 0], [16, 30], {
      tone: "red",
      location: "Auditorium",
    }),
    timed("s13", "Maria Oliveira's birthday dinner", 5, [19, 30], [22, 0], {
      tone: "orange",
    }),
    timed("s14", "Rehearsal", 8, [18, 0], [19, 0], { tone: "gray" }),
    timed("s15", "Quarterly review", 9, [13, 0], [15, 0], { tone: "blue" }),
    {
      id: "a1",
      title: "Sprint 42",
      start: day(-2),
      end: day(2),
      allDay: true,
      tone: "green",
    },
    {
      id: "a2",
      title: "Lucas Costa on vacation",
      start: day(3),
      end: day(5),
      allDay: true,
      tone: "amber",
    },
    {
      id: "a3",
      title: "Public holiday",
      start: day(1),
      end: day(1),
      allDay: true,
      tone: "red",
    },
    {
      id: "m1",
      title: "Offsite in Campinas",
      start: day(6, 9, 0),
      end: day(7, 18, 0),
      tone: "purple",
      location: "Campinas, SP",
    },
  ]
}
