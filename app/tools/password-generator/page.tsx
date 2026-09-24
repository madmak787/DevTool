"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Copy, RefreshCw } from "lucide-react"

export default function PasswordGeneratorPage() {
  const [password, setPassword] = useState("")
  const [length, setLength] = useState(16)
  const [options, setOptions] = useState({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
  })

  const generatePassword = () => {
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    const lowercase = "abcdefghijklmnopqrstuvwxyz"
    const numbers = "0123456789"
    const symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?"

    let chars = ""
    if (options.uppercase) chars += uppercase
    if (options.lowercase) chars += lowercase
    if (options.numbers) chars += numbers
    if (options.symbols) chars += symbols

    if (chars === "") {
      setPassword("Please select at least one option")
      return
    }

    let result = ""
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setPassword(result)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(password)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Password Generator</h1>
        <p className="text-muted-foreground">Generate secure random passwords</p>
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          {password && (
            <div className="space-y-2">
              <Label>Generated Password</Label>
              <div className="flex gap-2">
                <Input value={password} readOnly className="font-mono text-lg" />
                <Button size="icon" variant="outline" onClick={handleCopy}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Password Length: {length}</Label>
              </div>
              <Slider value={[length]} onValueChange={(v) => setLength(v[0])} min={4} max={64} step={1} />
            </div>

            <div className="space-y-3">
              <Label>Character Types</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="uppercase"
                    checked={options.uppercase}
                    onCheckedChange={(checked) => setOptions({ ...options, uppercase: checked as boolean })}
                  />
                  <label htmlFor="uppercase" className="text-sm cursor-pointer">
                    Uppercase Letters (A-Z)
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="lowercase"
                    checked={options.lowercase}
                    onCheckedChange={(checked) => setOptions({ ...options, lowercase: checked as boolean })}
                  />
                  <label htmlFor="lowercase" className="text-sm cursor-pointer">
                    Lowercase Letters (a-z)
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="numbers"
                    checked={options.numbers}
                    onCheckedChange={(checked) => setOptions({ ...options, numbers: checked as boolean })}
                  />
                  <label htmlFor="numbers" className="text-sm cursor-pointer">
                    Numbers (0-9)
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="symbols"
                    checked={options.symbols}
                    onCheckedChange={(checked) => setOptions({ ...options, symbols: checked as boolean })}
                  />
                  <label htmlFor="symbols" className="text-sm cursor-pointer">
                    Symbols (!@#$%^&*)
                  </label>
                </div>
              </div>
            </div>
          </div>

          <Button onClick={generatePassword} className="w-full">
            <RefreshCw className="h-4 w-4 mr-2" />
            Generate Password
          </Button>
        </div>
      </Card>
    </div>
  )
}
