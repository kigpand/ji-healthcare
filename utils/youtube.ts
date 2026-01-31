const YOUTUBE_ID_REGEX =
  /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/i;

export function getYoutubeEmbedUrl(link?: string) {
  if (!link) return null;
  const match = link.trim().match(YOUTUBE_ID_REGEX);
  if (!match) return null;
  const videoId = match[1];
  return `https://www.youtube.com/embed/${videoId}?rel=0&showinfo=0&modestbranding=1`;
}
