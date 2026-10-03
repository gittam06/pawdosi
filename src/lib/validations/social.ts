import { z } from "zod";

export const COMMENT_LIMIT = 500;

export const commentSchema = z.object({
  postId: z.uuid(),
  body: z
    .string()
    .trim()
    .min(1, "Write something first.")
    .max(COMMENT_LIMIT, `At most ${COMMENT_LIMIT} characters.`),
});

export type CommentInput = z.infer<typeof commentSchema>;
