import type { Meta, StoryObj } from '@storybook/angular';
import { FullNameComponent } from './full-name.component';
import { Person } from '../../models/person.model';

function samplePerson(): Person {
  const person = new Person();
  person.firstName = 'Jordan';
  person.middleName = '';
  person.lastName = 'Smith';
  return person;
}

const meta: Meta<FullNameComponent> = {
  title: 'Components/Identity/FullName',
  component: FullNameComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<FullNameComponent>;

export const Default: Story = {
  args: {
    person: samplePerson(),
    required: true,
    disabled: false,
  },
};

export const Empty: Story = {
  args: {
    person: new Person(),
    required: false,
  },
};
