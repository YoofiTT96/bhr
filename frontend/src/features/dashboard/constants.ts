import type { EventType } from './types/dashboard.types';

/**
 * Event type options for dropdowns and forms.
 * Used in CreateEventModal and EditEventModal.
 */
export const EVENT_TYPE_OPTIONS = [
  { value: 'MEETING', label: 'Meeting' },
  { value: 'CELEBRATION', label: 'Celebration' },
  { value: 'TRAINING', label: 'Training' },
  { value: 'COMPANY_WIDE', label: 'Company Wide' },
  { value: 'SOCIAL', label: 'Social' },
  { value: 'OTHER', label: 'Other' },
] as const;

/**
 * Styling configuration for event type badges.
 * Maps event types to their background color, text color, and display label.
 */
export const EVENT_TYPE_STYLES: Record<EventType, { bg: string; text: string; label: string }> = {
  MEETING: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Meeting' },
  CELEBRATION: { bg: 'bg-pink-100', text: 'text-pink-800', label: 'Celebration' },
  TRAINING: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Training' },
  COMPANY_WIDE: { bg: 'bg-amber-100', text: 'text-amber-800', label: 'Company Wide' },
  SOCIAL: { bg: 'bg-green-100', text: 'text-green-800', label: 'Social' },
  OTHER: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Other' },
};

/**
 * Gets the styling for an event type badge.
 * Returns a default style if the type is not found.
 */
export function getEventTypeStyle(eventType: EventType) {
  return EVENT_TYPE_STYLES[eventType] || EVENT_TYPE_STYLES.OTHER;
}
