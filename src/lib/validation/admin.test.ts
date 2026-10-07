import { describe, expect, it } from 'vitest';
import { eventSchema, firstError, formFields, memberSchema, partnerSchema, photoSchema } from './admin';

const event = {
  title: 'Robo Sumo',
  slug: 'robo-sumo',
  summary: '',
  description: '',
  category: '',
  status: 'completed',
  starts_on: '',
  date_label: '',
  series: "TechnoVIT '26",
  cover_url: '',
  registration_url: '',
  recap_url: '',
  is_published: true,
};

describe('eventSchema', () => {
  it('turns empty optional fields into null', () => {
    const parsed = eventSchema.parse(event);
    expect(parsed).toMatchObject({ summary: null, starts_on: null, cover_url: null, series: "TechnoVIT '26" });
  });

  it('rejects http links and bad slugs', () => {
    const http = eventSchema.safeParse({ ...event, registration_url: 'http://eventhub.example' });
    expect(http.success).toBe(false);
    expect(firstError(http.error!, { registration_url: 'Registration link' })).toBe('Registration link: Links must start with https://.');
    expect(eventSchema.safeParse({ ...event, slug: 'Robo Sumo' }).success).toBe(false);
  });

  it('checks dates and lengths', () => {
    expect(eventSchema.safeParse({ ...event, starts_on: '14/03/2027' }).success).toBe(false);
    expect(eventSchema.safeParse({ ...event, summary: 'x'.repeat(161) }).success).toBe(false);
    expect(eventSchema.parse({ ...event, starts_on: '2027-03-14' }).starts_on).toBe('2027-03-14');
  });
});

describe('photoSchema', () => {
  const photo = { image_url: 'https://ik.imagekit.io/x/gallery/1.jpg', caption: '', event_id: '', taken_on: '', sort_order: '3', width: null, height: null, is_published: false };
  it('needs an ImageKit https address', () => {
    expect(photoSchema.safeParse(photo).success).toBe(true);
    expect(photoSchema.safeParse({ ...photo, image_url: 'http://ik.imagekit.io/x/1.jpg' }).success).toBe(false);
    expect(photoSchema.safeParse({ ...photo, image_url: 'https://example.com/1.jpg' }).success).toBe(false);
  });
});

describe('memberSchema and partnerSchema', () => {
  it('reject http profile links', () => {
    const member = { full_name: 'Test Person', role_title: '', level: 'lead', division: 'projects', year_of_study: '', degree: '', joined_year: '2024', about: '', currently_building: '', fun_fact: '', github_url: 'http://github.com/x', linkedin_url: '', instagram_url: '', portfolio_url: '', sort_order: '0', is_published: false };
    expect(memberSchema.safeParse(member).success).toBe(false);
    expect(memberSchema.parse({ ...member, github_url: 'https://github.com/x' }).joined_year).toBe(2024);
    expect(partnerSchema.safeParse({ name: 'Test Partner', website_url: 'http://example.com', logo_url: '', relationship: '', sort_order: '0', is_published: true }).success).toBe(false);
  });
});

describe('formFields', () => {
  it('reads strings and named checkboxes, and skips Next internals', () => {
    const form = new FormData();
    form.set('title', 'Robo Sumo');
    form.set('$ACTION_ID_abc', 'x');
    form.set('is_published', 'on');
    expect(formFields(form, ['is_published', 'other'])).toEqual({ title: 'Robo Sumo', is_published: true, other: false });
  });
});
