import { describe, expect, it } from 'vitest';
import { certificateLabel, eventLine, ordinal } from './labels';

describe('certificate labels', () => {
  it('names the type, with the place when there is one', () => {
    expect(certificateLabel({ type: 'participation', place: null })).toBe('Participation');
    expect(certificateLabel({ type: 'winner', place: 1 })).toBe('Winner, 1st place');
    expect(certificateLabel({ type: 'runner_up', place: 2 })).toBe('Runner-up, 2nd place');
    expect(certificateLabel({ type: 'runner_up', place: 3 })).toBe('Runner-up, 3rd place');
  });

  it.each([
    [1, '1st'],
    [2, '2nd'],
    [3, '3rd'],
    [4, '4th'],
    [11, '11th'],
    [12, '12th'],
    [13, '13th'],
    [21, '21st'],
    [22, '22nd'],
    [111, '111th'],
  ])('ordinal(%i) is %s', (n, text) => {
    expect(ordinal(n)).toBe(text);
  });

  it('joins the event and series', () => {
    expect(eventLine({ event: { slug: 'robo-sumo', title: 'Robo Sumo', series: "TechnoVIT '26" } })).toBe("Robo Sumo, TechnoVIT '26");
    expect(eventLine({ event: { slug: 'x', title: 'Workshop', series: null } })).toBe('Workshop');
  });
});
