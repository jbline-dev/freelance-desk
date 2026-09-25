"use client"

import { useState } from "react"
import { toast } from "sonner"
import { useStore } from "@/lib/store"
import type { Project, Technical } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"

export function TechnicalTab({ project }: { project: Project }) {
  const { updateProject } = useStore()
  const [tech, setTech] = useState<Technical>(project.technical)

  const set = <K extends keyof Technical>(key: K, value: Technical[K]) =>
    setTech((prev) => ({ ...prev, [key]: value }))

  const handleSave = () => {
    updateProject(project.id, { technical: tech })
    toast.success("Technical details saved")
  }

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <CardTitle className="text-base">Technical Details</CardTitle>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="domain">Domain</FieldLabel>
              <Input
                id="domain"
                value={tech.domain}
                onChange={(e) => set("domain", e.target.value)}
                placeholder="bloomcafe.ph"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="hosting">Hosting</FieldLabel>
              <Input
                id="hosting"
                value={tech.hosting}
                onChange={(e) => set("hosting", e.target.value)}
                placeholder="Vercel"
              />
            </Field>
          </div>
          <Field>
            <FieldLabel htmlFor="repository">Repository</FieldLabel>
            <Input
              id="repository"
              value={tech.repository}
              onChange={(e) => set("repository", e.target.value)}
              placeholder="github.com/you/bloom-cafe"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="techStack">Tech stack</FieldLabel>
            <Input
              id="techStack"
              value={tech.techStack}
              onChange={(e) => set("techStack", e.target.value)}
              placeholder="Next.js, Tailwind, Sanity"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="credentials">Credentials & notes</FieldLabel>
            <Textarea
              id="credentials"
              value={tech.credentials}
              onChange={(e) => set("credentials", e.target.value)}
              placeholder="Registrar logins, DNS notes, API keys location..."
              rows={4}
            />
            <FieldDescription>
              Stored locally in this demo. Avoid saving real secrets.
            </FieldDescription>
          </Field>
          <Field orientation="horizontal" className="justify-end">
            <Button onClick={handleSave}>Save Details</Button>
          </Field>
        </FieldGroup>
      </CardContent>
    </Card>
  )
}
