import test from 'ava';

import { weighStringsUsingSearchTerm } from '../../lib/helpers/search';

test('it should weigh items correctly 01', t => {
  const items = ['aribo', 'Bob Marley', 'bananobo', 'bonobo', 'Bonanza'];

  const result = items.sort((a: string, b: string) =>
    weighStringsUsingSearchTerm('Bo', a, b),
  );

  t.deepEqual(result, ['Bob Marley', 'Bonanza', 'bonobo', 'aribo', 'bananobo']);
});

test('it should weigh items correctly 02', t => {
  const items = [
    'Bob Marley & The Wailers',
    'the smashing pumpkins',
    'The Machine',
  ];

  const result = items.sort((a: string, b: string) =>
    weighStringsUsingSearchTerm('the', a, b),
  );

  t.deepEqual(result, [
    'the smashing pumpkins',
    'The Machine',
    'Bob Marley & The Wailers',
  ]);
});
