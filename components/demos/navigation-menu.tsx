"use client"

import * as React from "react"

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerClassName,
} from "@/components/ui/navigation-menu"

const products = [
  { title: "Analytics", description: "Track usage across every project." },
  { title: "Automations", description: "Run workflows when something changes." },
  { title: "Integrations", description: "Connect the tools your team uses." },
  { title: "Security", description: "Single sign-on, audit logs and roles." },
]

export function Default() {
  return (
    <NavigationMenu aria-label="Main">
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Product</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-0.5 sm:w-96 sm:grid-cols-2">
              {products.map((item) => (
                <li key={item.title}>
                  <NavigationMenuLink href="#product">
                    <span className="font-medium">{item.title}</span>
                    <span className="text-muted-foreground">
                      {item.description}
                    </span>
                  </NavigationMenuLink>
                </li>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Resources</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-0.5 sm:w-64">
              <li>
                <NavigationMenuLink href="#docs">
                  <span className="font-medium">Documentation</span>
                  <span className="text-muted-foreground">
                    Guides and API reference.
                  </span>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink href="#changelog">
                  <span className="font-medium">Changelog</span>
                  <span className="text-muted-foreground">
                    What shipped this week.
                  </span>
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink
            href="#pricing"
            active
            className={navigationMenuTriggerClassName}
          >
            Pricing
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}

/** Long labels, compound names, CJK and Arabic text, and an unbroken 50-character word. */
export function WorstCase() {
  return (
    <NavigationMenu aria-label="Worst case" className="max-w-full">
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>
            Equipe de Maria Eduarda dos Santos Albuquerque Cavalcanti
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-0.5 sm:w-96">
              <li>
                <NavigationMenuLink href="#a">
                  <span className="font-medium">
                    João Pedro de Oliveira Neto
                  </span>
                  <span className="text-muted-foreground">
                    joao.pedro.oliveira.neto@departamento-de-engenharia.empresa.com.br
                  </span>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink href="#b">
                  <span className="font-medium">
                    Aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
                  </span>
                  <span className="text-muted-foreground">
                    山田太郎さんは東京の開発チームでデザインシステムを担当しています。
                  </span>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink href="#c">
                  <span className="font-medium">مهندسة برمجيات</span>
                  <span className="text-muted-foreground">
                    تعمل على نظام التصميم في فريق المنتج.
                  </span>
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink
            href="#jp"
            className={navigationMenuTriggerClassName}
          >
            料金プラン
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}

export function One() {
  return (
    <NavigationMenu aria-label="Single item">
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuLink
            href="#home"
            className={navigationMenuTriggerClassName}
          >
            Home
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}

export function Empty() {
  return (
    <NavigationMenu aria-label="Empty section">
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Recent</NavigationMenuTrigger>
          <NavigationMenuContent>
            <p className="p-2 text-sm text-muted-foreground sm:w-56">
              Nothing here yet.
            </p>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}
