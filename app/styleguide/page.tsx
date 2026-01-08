"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Info, AlertCircle, Search, Sun, Moon } from "lucide-react"
import { useTheme } from "next-themes"
import * as React from "react"

export default function StyleguidePage() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const isDark = resolvedTheme === "dark"

  // Hydration mismatch'i önlemek için mounted kontrolü
  React.useEffect(() => {
    setMounted(true)
  }, [])

  const handleThemeToggle = (checked: boolean) => {
    setTheme(checked ? "dark" : "light")
  }

  const themeTokenPairs = [
    { 
      name: "primary", 
      foreground: "primary-foreground",
      description: "Birincil renk ve üzerindeki metin rengi" 
    },
    { 
      name: "secondary", 
      foreground: "secondary-foreground",
      description: "İkincil renk ve üzerindeki metin rengi" 
    },
    { 
      name: "accent", 
      foreground: "accent-foreground",
      description: "Vurgu rengi ve üzerindeki metin rengi" 
    },
    { 
      name: "card", 
      foreground: "card-foreground",
      description: "Kart arka plan ve metin rengi" 
    },
    { 
      name: "popover", 
      foreground: "popover-foreground",
      description: "Popover arka plan ve metin rengi" 
    },
    { 
      name: "muted", 
      foreground: "muted-foreground",
      description: "Sessiz/arka plan ve metin rengi" 
    },
  ]

  const standaloneTokens = [
    { name: "background", description: "Ana arka plan rengi" },
    { name: "foreground", description: "Ana metin rengi" },
    { name: "destructive", description: "Hata/tehlike rengi" },
  ]

  const borderTokens = [
    { name: "border", description: "Kenarlık rengi" },
    { name: "input", description: "Input kenarlık rengi" },
    { name: "ring", description: "Odak halkası rengi" },
  ]

  return (
    <div className="container py-12 space-y-12">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">Styleguide</h1>
          <p className="text-muted-foreground">
            Bu sayfa theme token&apos;larını ve component varyantlarını gösterir.
          </p>
        </div>
        {mounted && (
          <div className="flex items-center gap-3">
            <Sun className="h-5 w-5 text-muted-foreground" />
            <Switch
              checked={isDark}
              onCheckedChange={handleThemeToggle}
              aria-label="Tema değiştir"
            />
            <Moon className="h-5 w-5 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Bölüm A: Theme Tokens */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Theme Tokens</h2>
        
        {/* Token Pairs */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Renk Çiftleri (Surface + On Surface)</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {themeTokenPairs.map((pair) => (
              <Card key={pair.name}>
                <CardHeader>
                  <CardTitle className="text-sm font-mono">{pair.name}</CardTitle>
                  <CardDescription>{pair.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div
                    className="rounded-lg border p-4 min-h-[120px] flex flex-col justify-center"
                    style={{
                      backgroundColor: `var(--${pair.name})`,
                      color: `var(--${pair.foreground})`,
                    }}
                  >
                    <p className="text-sm font-medium mb-2">Surface</p>
                    <p className="text-base">
                      Bu zemin üzerinde <code className="text-xs bg-black/10 dark:bg-white/10 px-1 py-0.5 rounded">{pair.foreground}</code> metin rengi kullanılır.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div
                      className="h-4 w-4 rounded border"
                      style={{ backgroundColor: `var(--${pair.name})` }}
                    />
                    <code>{pair.name}</code>
                    <span className="mx-1">+</span>
                    <div
                      className="h-4 w-4 rounded border"
                      style={{ backgroundColor: `var(--${pair.foreground})` }}
                    />
                    <code>{pair.foreground}</code>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Standalone Tokens */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Tekil Token&apos;lar</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {standaloneTokens.map((token) => (
              <Card key={token.name}>
                <CardHeader>
                  <CardTitle className="text-sm font-mono">{token.name}</CardTitle>
                  <CardDescription>{token.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div
                    className="rounded-lg border p-4 min-h-[80px] flex items-center justify-center"
                    style={{
                      backgroundColor: token.name === "background" ? `var(--${token.name})` : undefined,
                      color: token.name === "foreground" ? `var(--${token.name})` : undefined,
                      borderColor: token.name === "destructive" ? `var(--${token.name})` : undefined,
                    }}
                  >
                    {token.name === "background" && (
                      <p className="text-sm text-muted-foreground">Arka plan rengi</p>
                    )}
                    {token.name === "foreground" && (
                      <p className="text-sm" style={{ color: `var(--${token.name})` }}>
                        Metin rengi örneği
                      </p>
                    )}
                    {token.name === "destructive" && (
                      <div className="text-center">
                        <div
                          className="h-12 w-12 rounded-full mx-auto mb-2"
                          style={{ backgroundColor: `var(--${token.name})` }}
                        />
                        <p className="text-xs text-muted-foreground">Destructive renk</p>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div
                      className="h-4 w-4 rounded border"
                      style={{ 
                        backgroundColor: token.name !== "foreground" ? `var(--${token.name})` : undefined,
                        color: token.name === "foreground" ? `var(--${token.name})` : undefined,
                        borderColor: token.name === "foreground" ? `var(--${token.name})` : undefined,
                      }}
                    />
                    <code>{token.name}</code>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Border/Input/Ring Tokens */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Border, Input & Ring</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            {borderTokens.map((token) => (
              <Card key={token.name}>
                <CardHeader>
                  <CardTitle className="text-sm font-mono">{token.name}</CardTitle>
                  <CardDescription>{token.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div
                    className="h-12 w-full rounded border-2"
                    style={{ borderColor: `var(--${token.name})` }}
                  />
                  {token.name === "input" && (
                    <Input
                      placeholder="Örnek input"
                      className="w-full"
                      style={{ borderColor: `var(--${token.name})` }}
                    />
                  )}
                  {token.name === "ring" && (
                    <Input
                      placeholder="Focus için tıklayın"
                      className="w-full focus-visible:ring-2"
                      style={{ "--tw-ring-color": `var(--${token.name})` } as React.CSSProperties}
                    />
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Radius Token */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Radius Token</h3>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-mono">radius</CardTitle>
              <CardDescription>Border radius değeri</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-4 items-center">
                <div 
                  className="bg-primary text-primary-foreground p-4 flex items-center justify-center min-w-[120px]"
                  style={{ borderRadius: 'var(--radius)' }}
                >
                  Örnek (radius)
                </div>
                <div className="space-y-1">
                  <code className="text-xs block">var(--radius) = 0.65rem</code>
                  <code className="text-xs block text-muted-foreground">10.4px</code>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Bölüm B: Components */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Components</h2>

        {/* Button Varyantları */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Button Varyantları</h3>
          <div className="flex flex-wrap gap-2">
            <Button variant="default">Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="link">Link</Button>
          </div>
        </div>

        {/* Button Size Varyantları */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Button Size Varyantları</h3>
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button size="icon-sm">
                <Search />
              </Button>
              <Button size="icon">
                <Search />
              </Button>
              <Button size="icon-lg">
                <Search />
              </Button>
            </div>
          </div>
        </div>

        {/* Badge Varyantları */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Badge Varyantları</h3>
          <div className="flex flex-wrap gap-2">
            <Badge variant="default">Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="destructive">Destructive</Badge>
          </div>
        </div>

        {/* Alert */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Alert</h3>
          <div className="space-y-2">
            <Alert variant="default">
              <Info />
              <AlertTitle>Bilgi</AlertTitle>
              <AlertDescription>
                Bu bir varsayılan alert örneğidir.
              </AlertDescription>
            </Alert>
            <Alert variant="destructive">
              <AlertCircle />
              <AlertTitle>Hata</AlertTitle>
              <AlertDescription>
                Bu bir hata alert örneğidir.
              </AlertDescription>
            </Alert>
          </div>
        </div>

        {/* Tabs */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Tabs</h3>
          <Tabs defaultValue="tab1" className="w-full">
            <TabsList>
              <TabsTrigger value="tab1">Tab 1</TabsTrigger>
              <TabsTrigger value="tab2">Tab 2</TabsTrigger>
              <TabsTrigger value="tab3">Tab 3</TabsTrigger>
            </TabsList>
            <TabsContent value="tab1" className="mt-4">
              <p>Tab 1 içeriği burada görüntüleniyor.</p>
            </TabsContent>
            <TabsContent value="tab2" className="mt-4">
              <p>Tab 2 içeriği burada görüntüleniyor.</p>
            </TabsContent>
            <TabsContent value="tab3" className="mt-4">
              <p>Tab 3 içeriği burada görüntüleniyor.</p>
            </TabsContent>
          </Tabs>
        </div>

        {/* Input + Label */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Input + Label</h3>
          <div className="space-y-4 max-w-md">
            <div className="space-y-2">
              <Label htmlFor="example-input">Örnek Input</Label>
              <Input id="example-input" placeholder="Bir şeyler yazın..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="disabled-input">Disabled Input</Label>
              <Input id="disabled-input" placeholder="Devre dışı input" disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="error-input" className="text-destructive">
                Hatalı Input
              </Label>
              <Input 
                id="error-input" 
                placeholder="Hata durumu" 
                aria-invalid="true"
                className="border-destructive focus-visible:ring-destructive"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Bölüm E: Typography */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Typography</h2>
        
        {/* Font Aileleri */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Font Aileleri</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-mono">Geist Sans</CardTitle>
                <CardDescription>Ana font ailesi</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="font-sans text-lg">
                  Geist Sans - Bu font ailesi varsayılan olarak kullanılır.
                </p>
                <p className="font-sans text-sm text-muted-foreground mt-2">
                  ABCDEFGHIJKLMNOPQRSTUVWXYZ<br />
                  abcdefghijklmnopqrstuvwxyz<br />
                  0123456789
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-mono">Geist Mono</CardTitle>
                <CardDescription>Monospace font ailesi</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="font-mono text-lg">
                  Geist Mono - Kod ve teknik metinler için.
                </p>
                <p className="font-mono text-sm text-muted-foreground mt-2">
                  ABCDEFGHIJKLMNOPQRSTUVWXYZ<br />
                  abcdefghijklmnopqrstuvwxyz<br />
                  0123456789
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Başlık Stilleri */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Başlık Stilleri</h3>
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div>
                <h1 className="text-4xl font-bold">H1 Başlık - 4xl Bold</h1>
                <code className="text-xs text-muted-foreground">text-4xl font-bold</code>
              </div>
              <div>
                <h2 className="text-3xl font-semibold">H2 Başlık - 3xl Semibold</h2>
                <code className="text-xs text-muted-foreground">text-3xl font-semibold</code>
              </div>
              <div>
                <h3 className="text-2xl font-semibold">H3 Başlık - 2xl Semibold</h3>
                <code className="text-xs text-muted-foreground">text-2xl font-semibold</code>
              </div>
              <div>
                <h4 className="text-xl font-semibold">H4 Başlık - xl Semibold</h4>
                <code className="text-xs text-muted-foreground">text-xl font-semibold</code>
              </div>
              <div>
                <h5 className="text-lg font-semibold">H5 Başlık - lg Semibold</h5>
                <code className="text-xs text-muted-foreground">text-lg font-semibold</code>
              </div>
              <div>
                <h6 className="text-base font-semibold">H6 Başlık - base Semibold</h6>
                <code className="text-xs text-muted-foreground">text-base font-semibold</code>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Metin Stilleri */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Metin Stilleri</h3>
          <Card>
            <CardContent className="pt-6 space-y-3">
              <div>
                <p className="text-base">Normal paragraf metni (text-base)</p>
                <p className="text-sm text-muted-foreground">Küçük metin (text-sm)</p>
                <p className="text-xs text-muted-foreground">Çok küçük metin (text-xs)</p>
              </div>
              <div className="pt-2 border-t">
                <p className="font-medium">Orta kalınlıkta metin (font-medium)</p>
                <p className="font-semibold">Yarı kalın metin (font-semibold)</p>
                <p className="font-bold">Kalın metin (font-bold)</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Bölüm C: Charts */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Charts</h2>
        <div className="grid gap-4 sm:grid-cols-5">
          {[1, 2, 3, 4, 5].map((num) => (
            <Card key={num}>
              <CardHeader>
                <CardTitle className="text-sm font-mono">chart-{num}</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="h-24 w-full rounded"
                  style={{ backgroundColor: `var(--chart-${num})` }}
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  Chart color {num}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Bölüm D: Sidebar Tokens */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Sidebar Tokens</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Sidebar Mock</CardTitle>
              <CardDescription>Sidebar token&apos;larının görselleştirilmesi</CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className="rounded-lg border p-4 space-y-2"
                style={{
                  backgroundColor: `var(--sidebar)`,
                  color: `var(--sidebar-foreground)`,
                  borderColor: `var(--sidebar-border)`,
                }}
              >
                <div
                  className="rounded p-2"
                  style={{
                    backgroundColor: `var(--sidebar-accent)`,
                    color: `var(--sidebar-accent-foreground)`,
                  }}
                >
                  Sidebar Accent Item
                </div>
                <div
                  className="rounded p-2"
                  style={{
                    backgroundColor: `var(--sidebar-primary)`,
                    color: `var(--sidebar-primary-foreground)`,
                  }}
                >
                  Sidebar Primary Item
                </div>
                <div className="text-sm">Normal sidebar text</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Sidebar Token Listesi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                "sidebar",
                "sidebar-foreground",
                "sidebar-primary",
                "sidebar-primary-foreground",
                "sidebar-accent",
                "sidebar-accent-foreground",
                "sidebar-border",
                "sidebar-ring",
              ].map((token) => (
                <div key={token} className="flex items-center gap-2">
                  <div
                    className="h-6 w-6 rounded border"
                    style={{ backgroundColor: `var(--${token})` }}
                  />
                  <code className="text-xs">{token}</code>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Bölüm F: Tüm Token Değerleri (Klonlama için) */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Tüm Token Değerleri</h2>
        <Card>
          <CardHeader>
            <CardTitle>CSS Değişken Değerleri</CardTitle>
            <CardDescription>
              Bu bölüm tüm tema token değerlerini içerir. Başka bir projede klonlamak için kopyalayabilirsiniz.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-2 text-sm">Light Mode (:root)</h4>
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs font-mono">
{`:root {
  --radius: 0.65rem;
  --background: oklch(1 0 0);
  --foreground: oklch(0.141 0.005 285.823);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.141 0.005 285.823);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.141 0.005 285.823);
  --primary: oklch(0.586 0.253 17.585);
  --primary-foreground: oklch(0.969 0.015 12.422);
  --secondary: oklch(0.967 0.001 286.375);
  --secondary-foreground: oklch(0.21 0.006 285.885);
  --muted: oklch(0.967 0.001 286.375);
  --muted-foreground: oklch(0.552 0.016 285.938);
  --accent: oklch(0.967 0.001 286.375);
  --accent-foreground: oklch(0.21 0.006 285.885);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.92 0.004 286.32);
  --input: oklch(0.92 0.004 286.32);
  --ring: oklch(0.712 0.194 13.428);
  --chart-1: oklch(0.81 0.117 11.638);
  --chart-2: oklch(0.645 0.246 16.439);
  --chart-3: oklch(0.586 0.253 17.585);
  --chart-4: oklch(0.514 0.222 16.935);
  --chart-5: oklch(0.455 0.188 13.697);
  --sidebar: oklch(0.985 0 0);
  --sidebar-foreground: oklch(0.141 0.005 285.823);
  --sidebar-primary: oklch(0.586 0.253 17.585);
  --sidebar-primary-foreground: oklch(0.969 0.015 12.422);
  --sidebar-accent: oklch(0.967 0.001 286.375);
  --sidebar-accent-foreground: oklch(0.21 0.006 285.885);
  --sidebar-border: oklch(0.92 0.004 286.32);
  --sidebar-ring: oklch(0.712 0.194 13.428);
}`}
                </pre>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-sm">Dark Mode (.dark)</h4>
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs font-mono">
{`.dark {
  --background: oklch(0.141 0.005 285.823);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.21 0.006 285.885);
  --card-foreground: oklch(0.985 0 0);
  --popover: oklch(0.21 0.006 285.885);
  --popover-foreground: oklch(0.985 0 0);
  --primary: oklch(0.645 0.246 16.439);
  --primary-foreground: oklch(0.969 0.015 12.422);
  --secondary: oklch(0.274 0.006 286.033);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.274 0.006 286.033);
  --muted-foreground: oklch(0.705 0.015 286.067);
  --accent: oklch(0.274 0.006 286.033);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.704 0.191 22.216);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.41 0.159 10.272);
  --chart-1: oklch(0.81 0.117 11.638);
  --chart-2: oklch(0.645 0.246 16.439);
  --chart-3: oklch(0.586 0.253 17.585);
  --chart-4: oklch(0.514 0.222 16.935);
  --chart-5: oklch(0.455 0.188 13.697);
  --sidebar: oklch(0.21 0.006 285.885);
  --sidebar-foreground: oklch(0.985 0 0);
  --sidebar-primary: oklch(0.645 0.246 16.439);
  --sidebar-primary-foreground: oklch(0.969 0.015 12.422);
  --sidebar-accent: oklch(0.274 0.006 286.033);
  --sidebar-accent-foreground: oklch(0.985 0 0);
  --sidebar-border: oklch(1 0 0 / 10%);
  --sidebar-ring: oklch(0.41 0.159 10.272);
}`}
                </pre>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-sm">Font Aileleri</h4>
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs font-mono">
{`Font Aileleri:
- Geist Sans (Ana font)
- Geist Mono (Monospace font)

Next.js Font Import:
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});`}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

