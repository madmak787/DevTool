"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Copy } from "lucide-react"

// Simple MD5 implementation
function md5(string: string): string {
  function rotateLeft(value: number, shift: number): number {
    return (value << shift) | (value >>> (32 - shift))
  }

  function addUnsigned(x: number, y: number): number {
    const lsw = (x & 0xffff) + (y & 0xffff)
    const msw = (x >> 16) + (y >> 16) + (lsw >> 16)
    return (msw << 16) | (lsw & 0xffff)
  }

  function md5cmn(q: number, a: number, b: number, x: number, s: number, t: number): number {
    return addUnsigned(rotateLeft(addUnsigned(addUnsigned(a, q), addUnsigned(x, t)), s), b)
  }

  function md5ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
    return md5cmn((b & c) | (~b & d), a, b, x, s, t)
  }

  function md5gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
    return md5cmn((b & d) | (c & ~d), a, b, x, s, t)
  }

  function md5hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
    return md5cmn(b ^ c ^ d, a, b, x, s, t)
  }

  function md5ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
    return md5cmn(c ^ (b | ~d), a, b, x, s, t)
  }

  function convertToWordArray(string: string): number[] {
    const wordArray: number[] = []
    for (let i = 0; i < string.length * 8; i += 8) {
      wordArray[i >> 5] |= (string.charCodeAt(i / 8) & 0xff) << (i % 32)
    }
    return wordArray
  }

  function wordToHex(value: number): string {
    let str = ""
    for (let i = 0; i <= 3; i++) {
      str += ((value >> (i * 8 + 4)) & 0x0f).toString(16) + ((value >> (i * 8)) & 0x0f).toString(16)
    }
    return str
  }

  const x = convertToWordArray(string)
  let a = 0x67452301
  let b = 0xefcdab89
  let c = 0x98badcfe
  let d = 0x10325476

  x[(string.length * 8) >> 5] |= 0x80 << ((string.length * 8) % 32)
  x[(((string.length * 8 + 64) >>> 9) << 4) + 14] = string.length * 8

  for (let i = 0; i < x.length; i += 16) {
    const oldA = a
    const oldB = b
    const oldC = c
    const oldD = d

    a = md5ff(a, b, c, d, x[i + 0], 7, 0xd76aa478)
    d = md5ff(d, a, b, c, x[i + 1], 12, 0xe8c7b756)
    c = md5ff(c, d, a, b, x[i + 2], 17, 0x242070db)
    b = md5ff(b, c, d, a, x[i + 3], 22, 0xc1bdceee)
    a = md5ff(a, b, c, d, x[i + 4], 7, 0xf57c0faf)
    d = md5ff(d, a, b, c, x[i + 5], 12, 0x4787c62a)
    c = md5ff(c, d, a, b, x[i + 6], 17, 0xa8304613)
    b = md5ff(b, c, d, a, x[i + 7], 22, 0xfd469501)
    a = md5ff(a, b, c, d, x[i + 8], 7, 0x698098d8)
    d = md5ff(d, a, b, c, x[i + 9], 12, 0x8b44f7af)
    c = md5ff(c, d, a, b, x[i + 10], 17, 0xffff5bb1)
    b = md5ff(b, c, d, a, x[i + 11], 22, 0x895cd7be)
    a = md5ff(a, b, c, d, x[i + 12], 7, 0x6b901122)
    d = md5ff(d, a, b, c, x[i + 13], 12, 0xfd987193)
    c = md5ff(c, d, a, b, x[i + 14], 17, 0xa679438e)
    b = md5ff(b, c, d, a, x[i + 15], 22, 0x49b40821)

    a = md5gg(a, b, c, d, x[i + 1], 5, 0xf61e2562)
    d = md5gg(d, a, b, c, x[i + 6], 9, 0xc040b340)
    c = md5gg(c, d, a, b, x[i + 11], 14, 0x265e5a51)
    b = md5gg(b, c, d, a, x[i + 0], 20, 0xe9b6c7aa)
    a = md5gg(a, b, c, d, x[i + 5], 5, 0xd62f105d)
    d = md5gg(d, a, b, c, x[i + 10], 9, 0x02441453)
    c = md5gg(c, d, a, b, x[i + 15], 14, 0xd8a1e681)
    b = md5gg(b, c, d, a, x[i + 4], 20, 0xe7d3fbc8)
    a = md5gg(a, b, c, d, x[i + 9], 5, 0x21e1cde6)
    d = md5gg(d, a, b, c, x[i + 14], 9, 0xc33707d6)
    c = md5gg(c, d, a, b, x[i + 3], 14, 0xf4d50d87)
    b = md5gg(b, c, d, a, x[i + 8], 20, 0x455a14ed)
    a = md5gg(a, b, c, d, x[i + 13], 5, 0xa9e3e905)
    d = md5gg(d, a, b, c, x[i + 2], 9, 0xfcefa3f8)
    c = md5gg(c, d, a, b, x[i + 7], 14, 0x676f02d9)
    b = md5gg(b, c, d, a, x[i + 12], 20, 0x8d2a4c8a)

    a = md5hh(a, b, c, d, x[i + 5], 4, 0xfffa3942)
    d = md5hh(d, a, b, c, x[i + 8], 11, 0x8771f681)
    c = md5hh(c, d, a, b, x[i + 11], 16, 0x6d9d6122)
    b = md5hh(b, c, d, a, x[i + 14], 23, 0xfde5380c)
    a = md5hh(a, b, c, d, x[i + 1], 4, 0xa4beea44)
    d = md5hh(d, a, b, c, x[i + 4], 11, 0x4bdecfa9)
    c = md5hh(c, d, a, b, x[i + 7], 16, 0xf6bb4b60)
    b = md5hh(b, c, d, a, x[i + 10], 23, 0xbebfbc70)
    a = md5hh(a, b, c, d, x[i + 13], 4, 0x289b7ec6)
    d = md5hh(d, a, b, c, x[i + 0], 11, 0xeaa127fa)
    c = md5hh(c, d, a, b, x[i + 3], 16, 0xd4ef3085)
    b = md5hh(b, c, d, a, x[i + 6], 23, 0x04881d05)
    a = md5hh(a, b, c, d, x[i + 9], 4, 0xd9d4d039)
    d = md5hh(d, a, b, c, x[i + 12], 11, 0xe6db99e5)
    c = md5hh(c, d, a, b, x[i + 15], 16, 0x1fa27cf8)
    b = md5hh(b, c, d, a, x[i + 2], 23, 0xc4ac5665)

    a = md5ii(a, b, c, d, x[i + 0], 6, 0xf4292244)
    d = md5ii(d, a, b, c, x[i + 7], 10, 0x432aff97)
    c = md5ii(c, d, a, b, x[i + 14], 15, 0xab9423a7)
    b = md5ii(b, c, d, a, x[i + 5], 21, 0xfc93a039)
    a = md5ii(a, b, c, d, x[i + 12], 6, 0x655b59c3)
    d = md5ii(d, a, b, c, x[i + 3], 10, 0x8f0ccc92)
    c = md5ii(c, d, a, b, x[i + 10], 15, 0xffeff47d)
    b = md5ii(b, c, d, a, x[i + 1], 21, 0x85845dd1)
    a = md5ii(a, b, c, d, x[i + 8], 6, 0x6fa87e4f)
    d = md5ii(d, a, b, c, x[i + 15], 10, 0xfe2ce6e0)
    c = md5ii(c, d, a, b, x[i + 6], 15, 0xa3014314)
    b = md5ii(b, c, d, a, x[i + 13], 21, 0x4e0811a1)
    a = md5ii(a, b, c, d, x[i + 4], 6, 0xf7537e82)
    d = md5ii(d, a, b, c, x[i + 11], 10, 0xbd3af235)
    c = md5ii(c, d, a, b, x[i + 2], 15, 0x2ad7d2bb)
    b = md5ii(b, c, d, a, x[i + 9], 21, 0xeb86d391)

    a = addUnsigned(a, oldA)
    b = addUnsigned(b, oldB)
    c = addUnsigned(c, oldC)
    d = addUnsigned(d, oldD)
  }

  return (wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d)).toLowerCase()
}

export default function MD5Page() {
  const [input, setInput] = useState("")
  const [hash, setHash] = useState("")

  const handleGenerate = () => {
    const result = md5(input)
    setHash(result)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(hash)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">MD5 Hash Generator</h1>
        <p className="text-muted-foreground">Generate MD5 hash from text</p>
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Input Text</Label>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter text to hash..."
              className="min-h-[150px] font-mono"
            />
          </div>

          <Button onClick={handleGenerate} className="w-full">
            Generate MD5 Hash
          </Button>

          {hash && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>MD5 Hash</Label>
                <Button size="sm" variant="outline" onClick={handleCopy}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
              </div>
              <Input value={hash} readOnly className="font-mono" />
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
