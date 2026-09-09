'use client';
import FsLightbox from 'fslightbox-react';

export default function GalleryLightbox({
  toggler,
  sources,
  slide,
}: {
  toggler: boolean;
  sources: string[];
  slide: number;
}) {
  return <FsLightbox toggler={toggler} sources={sources} slide={slide} />;
}
