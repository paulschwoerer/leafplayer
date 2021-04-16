import React, { PropsWithChildren, ReactElement } from 'react';

type Props = {
  condition: boolean;
};

function If({ condition, children }: PropsWithChildren<Props>): ReactElement {
  return <>{condition ? children : null}</>;
}

export default If;
