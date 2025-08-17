import Link from 'next/link';
import './style.css';
import type { ComponentProps, FC } from 'react';

type Props = ComponentProps<'a'>;

export const MainLogo: FC<Props> = ({ ...props }) => {
  return (
    <Link href="/" id="main-logo" {...props}>
      <div> </div>
    </Link>
  );
};
