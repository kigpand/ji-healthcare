import { getYoutubeEmbedUrl } from '@/utils/youtube';

test.each(['https://youtu.be/dQw4w9WgXcQ', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'])('영상 ID를 추출한다: %s', (url) => {
  expect(getYoutubeEmbedUrl(url)).toContain('/embed/dQw4w9WgXcQ?');
});

test.each([undefined, '', 'https://example.com/video'])('잘못된 영상 주소 %p를 거부한다', (url) => {
  expect(getYoutubeEmbedUrl(url)).toBeNull();
});
