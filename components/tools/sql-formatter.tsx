"use client"

import * as React from "react"
import { format, type SqlLanguage } from "sql-formatter"
import { Eraser, FileInput } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CodeArea, CopyButton, DownloadButton, EDITOR_HEIGHT, Message, Panel, Segmented } from "@/components/tool-kit"

const DIALECTS: { value: SqlLanguage; label: string }[] = [
  { value: "sql", label: "Standard SQL" },
  { value: "mysql", label: "MySQL" },
  { value: "mariadb", label: "MariaDB" },
  { value: "postgresql", label: "PostgreSQL" },
  { value: "sqlite", label: "SQLite" },
  { value: "tsql", label: "SQL Server (T-SQL)" },
  { value: "plsql", label: "Oracle PL/SQL" },
  { value: "bigquery", label: "BigQuery" },
  { value: "snowflake", label: "Snowflake" },
  { value: "redshift", label: "Redshift" },
  { value: "spark", label: "Spark SQL" },
  { value: "trino", label: "Trino / Presto" },
]

const SAMPLE = `select u.id, u.name, count(o.id) as orders, sum(o.total) as revenue from users u left join orders o on o.user_id = u.id and o.status in ('paid','shipped') where u.created_at >= '2026-01-01' and u.deleted_at is null group by u.id, u.name having count(o.id) > 2 order by revenue desc limit 20;
update users set last_seen = now() where id = 42;`

export default function SqlFormatter() {
  const [input, setInput] = React.useState("")
  const [dialect, setDialect] = React.useState<SqlLanguage>("sql")
  const [keywordCase, setKeywordCase] = React.useState<"upper" | "lower" | "preserve">("upper")
  const [indent, setIndent] = React.useState<"2" | "4" | "tab">("2")

  const result = React.useMemo(() => {
    if (!input.trim()) return { output: "", error: "" }
    try {
      return {
        output: format(input, {
          language: dialect,
          keywordCase,
          tabWidth: indent === "4" ? 4 : 2,
          useTabs: indent === "tab",
          linesBetweenQueries: 1,
        }),
        error: "",
      }
    } catch (e) {
      return { output: "", error: (e as Error).message.split("\n")[0] }
    }
  }, [input, dialect, keywordCase, indent])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Select value={dialect} onValueChange={(v) => setDialect(v as SqlLanguage)}>
          <SelectTrigger className="w-48" aria-label="SQL dialect">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DIALECTS.map((d) => (
              <SelectItem key={d.value} value={d.value}>
                {d.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Segmented
          ariaLabel="Keyword case"
          size="sm"
          value={keywordCase}
          onChange={setKeywordCase}
          options={[
            { value: "upper", label: "UPPER" },
            { value: "lower", label: "lower" },
            { value: "preserve", label: "As typed" },
          ]}
        />
        {(
          <Segmented
            ariaLabel="Indentation"
            size="sm"
            value={indent}
            onChange={setIndent}
            options={[
              { value: "2", label: "2 spaces" },
              { value: "4", label: "4 spaces" },
              { value: "tab", label: "Tabs" },
            ]}
          />
        )}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel
          title="SQL"
          actions={
            <>
              <Button size="sm" variant="ghost" onClick={() => setInput(SAMPLE)}>
                <FileInput /> Sample
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setInput("")} disabled={!input}>
                <Eraser /> Clear
              </Button>
            </>
          }
        >
          <CodeArea value={input} onChange={(e) => setInput(e.target.value)} placeholder="Paste a query, e.g. select * from users where id = 1" invalid={!!result.error} className={EDITOR_HEIGHT} aria-label="SQL input" />
        </Panel>
        <Panel
          title="Formatted"
          actions={
            <>
              <CopyButton value={result.output} />
              <DownloadButton content={result.output} filename="query.sql" mime="application/sql" iconOnly />
            </>
          }
        >
          {result.error ? (
            <div className={EDITOR_HEIGHT}>
              <Message>
                <p className="font-medium">Couldn’t parse this SQL</p>
                <p className="mt-0.5 break-words">{result.error}</p>
                <p className="mt-1 text-xs">Check the dialect: some syntax only exists in one database.</p>
              </Message>
            </div>
          ) : (
            <CodeArea readOnly value={result.output} placeholder="Formatted SQL appears here" className={EDITOR_HEIGHT} aria-label="Formatted SQL" />
          )}
        </Panel>
      </div>
    </div>
  )
}
