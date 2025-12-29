import { supabase } from "../config/supabase.js";
import crypto from "crypto";

export const uploadAvatar = async (userId, file) => {
  // 1. Generate clean file name
  const ext = file.originalname.split(".").pop();
  const fileName = `${crypto.randomUUID()}.${ext}`;
  const filePath = `${userId}/${fileName}`;

  // 2. Upload file to Supabase
  const { error: uploadError } = await supabase.storage
    .from("fluxo-pfp")
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
      upsert: true,
    });

  if (uploadError) throw uploadError;

  // 3. Get public URL
  const { data: publicData } = supabase.storage
    .from("fluxo-pfp")
    .getPublicUrl(filePath);

  return {
    url: publicData.publicUrl,
    path: filePath,
  };
};
