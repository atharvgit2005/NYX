import type { Announcements, ScreenReaderInstructions } from '@dnd-kit/core';

/**
 * Shared accessibility config for the admin drag-and-drop views (kanban,
 * calendar, partner calendar). Pairing these with a KeyboardSensor makes the
 * drag workflow operable and announced for keyboard + screen-reader users
 * (WCAG 2.1.1). `getName` resolves a draggable id to a human label so the
 * announcements read "Picked up Launch teaser" instead of a raw uuid.
 */
export const dndScreenReaderInstructions: ScreenReaderInstructions = {
  draggable:
    'To pick up a draggable item, press Space or Enter. While dragging, use the arrow keys to move the item. Press Space or Enter again to drop the item in its new position, or press Escape to cancel.',
};

export function makeDndAnnouncements(
  getName: (id: string) => string,
): Announcements {
  const name = (id: string | number | undefined) =>
    id == null ? 'item' : getName(String(id));
  return {
    onDragStart: ({ active }) => `Picked up ${name(active.id)}.`,
    onDragOver: ({ active, over }) =>
      over
        ? `${name(active.id)} was moved over ${name(over.id)}.`
        : `${name(active.id)} is no longer over a drop target.`,
    onDragEnd: ({ active, over }) =>
      over
        ? `${name(active.id)} was dropped onto ${name(over.id)}.`
        : `${name(active.id)} was dropped.`,
    onDragCancel: ({ active }) => `Dragging ${name(active.id)} was cancelled.`,
  };
}
