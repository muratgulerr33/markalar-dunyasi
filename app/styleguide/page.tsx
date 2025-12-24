import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Info, AlertCircle } from "lucide-react"

export default function StyleguidePage() {
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
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">Styleguide</h1>
        <p className="text-muted-foreground">
          Bu sayfa theme token'larını ve component varyantlarını gösterir.
        </p>
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
          <h3 className="text-xl font-semibold">Tekil Token'lar</h3>
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
          <div className="space-y-2 max-w-md">
            <Label htmlFor="example-input">Örnek Input</Label>
            <Input id="example-input" placeholder="Bir şeyler yazın..." />
          </div>
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
              <CardDescription>Sidebar token'larının görselleştirilmesi</CardDescription>
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
    </div>
  )
}

