import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { crtChannel } from '../src/components/home/crt-channel';
import { studioBrowserProject } from '../src/components/home/studio-browser-model';
import { channelNumber, tvProjects } from '../src/lib/tv-channels';

describe('CRT project channel readout', () => {
  it('reserves the Studio and Teletext channels before the first project', () => {
    assert.equal(crtChannel('home').number, 'CH 00');
    assert.equal(channelNumber('teletext'), '01');
    assert.equal(crtChannel('projects', true, 0).number, 'CH 02');
  });

  it('matches the channel guide and mobile remote for every project', () => {
    tvProjects.forEach((project, index) => {
      const channel = crtChannel('projects', true, index);
      assert.equal(channel.number, `CH ${channelNumber(project.slug)}`);
      assert.equal(channel.label, project.name);
    });
  });

  it('shows the same fallback project as the browser for invalid indices', () => {
    for (const index of [-1, tvProjects.length, 0.5, Number.NaN, Infinity, -Infinity]) {
      const channel = crtChannel('projects', true, index);
      const { project } = studioBrowserProject(index);
      assert.equal(channel.number, `CH ${channelNumber(project.slug)}`);
      assert.equal(channel.label, project.name);
    }
  });
});
