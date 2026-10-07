import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { FIXTURE_PHOTOS } from '@/lib/data/fixtures';
import { GalleryGrid } from './GalleryGrid';
import { PhotoViewer } from './PhotoViewer';

const photos = FIXTURE_PHOTOS.slice(0, 3);

describe('GalleryGrid', () => {
  it('links every photo to its full image, named by its caption', () => {
    render(<GalleryGrid photos={photos} onOpen={() => {}} />);
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(3);
    expect(links[0]).toHaveAccessibleName(`Open photo: ${photos[0].caption}`);
    expect(links[0].getAttribute('href')).toContain('ik.imagekit.io');
    expect(screen.getByAltText(photos[1].caption!)).toBeInTheDocument();
  });

  it('opens the viewer instead of following the link when JS is on', async () => {
    const onOpen = vi.fn();
    render(<GalleryGrid photos={photos} onOpen={onOpen} />);
    await userEvent.click(screen.getAllByRole('link')[2]);
    expect(onOpen).toHaveBeenCalledWith(2, expect.any(HTMLElement));
  });
});

describe('PhotoViewer', () => {
  it('shows the caption and the counter, and closes', async () => {
    const onIndexChange = vi.fn();
    render(<PhotoViewer photos={photos} index={1} onIndexChange={onIndexChange} />);
    expect(await screen.findByText(photos[1].caption!)).toBeInTheDocument();
    expect(screen.getAllByText('2 of 3').length).toBeGreaterThan(0);
    await userEvent.click(screen.getByRole('button', { name: 'Close photo' }));
    expect(onIndexChange).toHaveBeenCalledWith(null);
  });

  it('steps with the buttons and the arrow keys, and stops at the ends', async () => {
    const onIndexChange = vi.fn();
    const { rerender } = render(<PhotoViewer photos={photos} index={0} onIndexChange={onIndexChange} />);
    const previous = await screen.findAllByRole('button', { name: 'Previous photo' });
    previous.forEach(button => expect(button).toBeDisabled());
    await userEvent.click(screen.getAllByRole('button', { name: 'Next photo' })[0]);
    expect(onIndexChange).toHaveBeenLastCalledWith(1);

    rerender(<PhotoViewer photos={photos} index={2} onIndexChange={onIndexChange} />);
    screen.getAllByRole('button', { name: 'Next photo' }).forEach(button => expect(button).toBeDisabled());
    await userEvent.keyboard('{ArrowLeft}');
    expect(onIndexChange).toHaveBeenLastCalledWith(1);
  });

  it('renders nothing when closed', () => {
    render(<PhotoViewer photos={photos} index={null} onIndexChange={() => {}} />);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('shows the photo in true colour with its caption as alt text', async () => {
    render(<PhotoViewer photos={photos} index={0} onIndexChange={() => {}} />);
    const img = await screen.findByAltText(photos[0].caption!);
    expect(img.getAttribute('src')).toContain('q-82');
  });
});
