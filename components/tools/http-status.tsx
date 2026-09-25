"use client"

import * as React from "react"
import { Search } from "lucide-react"
import { Segmented } from "@/components/tool-kit"
import { cn } from "@/lib/utils"

const CODES: [number, string, string][] = [
  [100, "Continue", "The server got the request headers; the client should send the body."],
  [101, "Switching Protocols", "The server is switching protocols as asked, for example to WebSocket."],
  [103, "Early Hints", "Preload hints sent before the final response."],
  [200, "OK", "The request succeeded. The standard response for successful GET and POST."],
  [201, "Created", "A new resource was created. Usually returned by POST, with a Location header."],
  [202, "Accepted", "The request was accepted for processing, but it hasn’t finished yet."],
  [204, "No Content", "Success with no body to return, common for DELETE and PUT."],
  [206, "Partial Content", "Only part of the resource is returned, in answer to a Range request."],
  [301, "Moved Permanently", "The resource has a new permanent URL. Search engines move ranking to it."],
  [302, "Found", "Temporary redirect. Browsers may change POST to GET when following it."],
  [303, "See Other", "Redirect to another URL with GET, typically after a form POST."],
  [304, "Not Modified", "The cached copy is still valid (answer to If-None-Match or If-Modified-Since)."],
  [307, "Temporary Redirect", "Temporary redirect that keeps the method and body."],
  [308, "Permanent Redirect", "Permanent redirect that keeps the method and body."],
  [400, "Bad Request", "The request is malformed or invalid, for example bad JSON or missing fields."],
  [401, "Unauthorized", "Authentication is missing or invalid. The client should log in or send a token."],
  [402, "Payment Required", "Reserved; sometimes used when a payment or subscription is needed."],
  [403, "Forbidden", "The client is known but isn’t allowed to access this resource."],
  [404, "Not Found", "Nothing exists at this URL, or the server won’t reveal that it does."],
  [405, "Method Not Allowed", "The URL exists but doesn’t support this HTTP method. Include an Allow header."],
  [406, "Not Acceptable", "The server can’t produce a format that matches the Accept headers."],
  [408, "Request Timeout", "The client took too long to send the request."],
  [409, "Conflict", "The request conflicts with the current state, like a duplicate or an edit conflict."],
  [410, "Gone", "The resource was deliberately removed and won’t come back."],
  [411, "Length Required", "The server needs a Content-Length header."],
  [412, "Precondition Failed", "A condition in the headers (like If-Match) wasn’t met."],
  [413, "Content Too Large", "The request body is bigger than the server allows."],
  [414, "URI Too Long", "The URL is longer than the server will handle."],
  [415, "Unsupported Media Type", "The body’s Content-Type isn’t supported."],
  [416, "Range Not Satisfiable", "The requested byte range is outside the file."],
  [418, "I’m a teapot", "An April Fools’ joke from RFC 2324, occasionally used for fun."],
  [422, "Unprocessable Content", "The syntax is fine but the data fails validation."],
  [423, "Locked", "The resource is locked (WebDAV)."],
  [425, "Too Early", "The server won’t risk processing a request that might be replayed."],
  [426, "Upgrade Required", "The client must switch to another protocol, such as TLS."],
  [428, "Precondition Required", "The server requires conditional requests to prevent lost updates."],
  [429, "Too Many Requests", "Rate limit hit. Check the Retry-After header before trying again."],
  [431, "Request Header Fields Too Large", "The headers, often cookies, are too large."],
  [451, "Unavailable For Legal Reasons", "Blocked because of a legal demand, such as censorship."],
  [500, "Internal Server Error", "Something went wrong on the server; a generic catch-all error."],
  [501, "Not Implemented", "The server doesn’t support the functionality needed."],
  [502, "Bad Gateway", "A proxy or gateway got an invalid response from the upstream server."],
  [503, "Service Unavailable", "The server is overloaded or down for maintenance. Retry later."],
  [504, "Gateway Timeout", "A proxy or gateway didn’t get a response from upstream in time."],
  [505, "HTTP Version Not Supported", "The server doesn’t support the request’s HTTP version."],
  [507, "Insufficient Storage", "The server can’t store what’s needed to complete the request."],
  [508, "Loop Detected", "The server found an infinite loop while processing."],
  [511, "Network Authentication Required", "The client must sign in to the network, as with Wi-Fi captive portals."],
]

const GROUPS = [
  { value: "all", label: "All" },
  { value: "1", label: "1xx Info" },
  { value: "2", label: "2xx Success" },
  { value: "3", label: "3xx Redirect" },
  { value: "4", label: "4xx Client" },
  { value: "5", label: "5xx Server" },
] as const

const TONE: Record<string, string> = {
  "1": "bg-sky-500/12 text-sky-700 dark:text-sky-300",
  "2": "bg-success/15 text-success",
  "3": "bg-violet-500/12 text-violet-700 dark:text-violet-300",
  "4": "bg-warning/20 text-amber-800 dark:text-warning",
  "5": "bg-destructive/12 text-destructive",
}

export default function HttpStatus() {
  const [q, setQ] = React.useState("")
  const [group, setGroup] = React.useState<(typeof GROUPS)[number]["value"]>("all")
  const query = q.trim().toLowerCase()
  const list = CODES.filter(([code, name, desc]) => {
    if (group !== "all" && String(code)[0] !== group) return false
    if (!query) return true
    return String(code).startsWith(query) || name.toLowerCase().includes(query) || desc.toLowerCase().includes(query)
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by code or meaning, e.g. 404, redirect"
            aria-label="Search status codes"
            className="h-10 w-full rounded-md border bg-card pr-3 pl-9 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/25"
          />
        </div>
        <Segmented ariaLabel="Class" size="sm" value={group} onChange={setGroup} options={GROUPS} />
      </div>
      {list.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">No status codes match.</p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {list.map(([code, name, desc]) => (
            <div key={code} className="flex gap-3 rounded-xl border bg-card p-4 shadow-xs">
              <span className={cn("h-fit rounded-md px-2 py-1 font-mono text-base font-semibold tabular-nums", TONE[String(code)[0]])}>{code}</span>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold">{name}</h3>
                <p className="mt-0.5 text-[13px] leading-snug text-muted-foreground">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
