export const getUploadedThumbnail = (req) => {
  if (!req.files || typeof req.files !== "object") return null;

  const files = req.files;
  if (Array.isArray(files.thumbnail) && files.thumbnail.length > 0) {
    return files.thumbnail[0];
  }
  if (Array.isArray(files.thumbnail_url) && files.thumbnail_url.length > 0) {
    return files.thumbnail_url[0];
  }

  return null;
};
