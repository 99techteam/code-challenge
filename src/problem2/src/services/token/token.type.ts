import type { z } from "zod"
import type { tokenSchema } from "@/services/token/token.schema"

export type TToken = z.infer<typeof tokenSchema> & {
  balance?: string | null
}
