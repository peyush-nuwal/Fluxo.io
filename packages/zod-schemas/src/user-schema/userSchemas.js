import { z } from "zod";

export const getUsersByEmailsSchema = z.object({
  emails: z.array(z.string().email()).min(1).max(200),
});

export const updateUserProfileSchema = z
  .object({
    name: z
      .string({
        required_error: "name is required",
        invalid_type_error: "name must be a string",
      })
      .min(1, "name cannot be empty")
      .optional(),

    user_name: z
      .string({
        required_error: "username is required",
        invalid_type_error: "username must be a string",
      })
      .min(3, "username must be at least 3 characters")
      .optional(),

    avatar_url: z
      .string({
        invalid_type_error: "avatar_url must be a string",
      })
      .url("avatar_url must be a valid URL")
      .optional(),

    bio: z
      .string({
        invalid_type_error: "bio must be a string",
      })
      .max(300, "bio must be under 300 characters")
      .optional(),

    location: z
      .string({
        invalid_type_error: "location must be a string",
      })
      .max(100, "location too long")
      .optional(),

    website: z
      .string({
        invalid_type_error: "website must be a string",
      })
      .trim()
      .refine((value) => value.length === 0 || /^https?:\/\/.+/.test(value), {
        message: "website must be a valid URL",
      })
      .optional(),

    work: z
      .string({
        invalid_type_error: "work must be a string",
      })
      .max(100, "work too long")
      .optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export const updateUsernameSchema = z
  .object({
    user_name: z
      .string({
        required_error: "username is required",
        invalid_type_error: "username must be a string",
      })
      .trim()
      .min(2, "username must be at least 2 characters")
      .max(255, "username is too long")
      .regex(/^(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+[a-zA-Z0-9]$/, {
        message:
          "Username may contain letters, numbers, dots and underscores, and cannot start or end with dot or underscore",
      }),
  })
  .strict();
