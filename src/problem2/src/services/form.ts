import * as z from "zod";

export const formSchema = z
  .object({
    target: z.coerce
      .number()
      .positive()
      .min(0, "Target amount must be at least 0"),
    targetBalance: z.number().min(0, "Target balance must be at least 0"),
    converted: z.coerce.number().optional(),
    convertedBalance: z.number(),
    fee: z.number(),
    currency: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.target > data.targetBalance) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Target cannot higher than current balance",
        path: ["target"],
      });
    }
  });

export type FormSchema = z.infer<typeof formSchema>;
