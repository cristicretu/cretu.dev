import React, { useState } from 'react'

// import styles from 'styles/mobile-menu.module.css';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

interface MobileMenuProps { }

export const MobileMenu: React.FC<MobileMenuProps> = ({ }) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        className={classNames('md:hidden visible', "")}
        aria-label="Toggle Menu"
        type="button"
        onClick={() => setOpen(open === true ? false : true)}
      >
        <MenuIcon visibility={open === true ? "hidden" : "visible"} />
        <CrossIcon visibility={open === true ? "visible" : "collapse"} />

      </button>
    </>
  );
}

function MenuIcon(props: JSX.IntrinsicElements['svg']) {
  return (
    <svg
      className="h-5 w-5 -mt-4 absolute text-gray-900 dark:text-gray-100"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      {...props}
    >
      <path
        d="M2.5 7.5H17.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2.5 12.5H17.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CrossIcon(props: JSX.IntrinsicElements['svg']) {
  return (
    <svg
      className="h-5 w-5 -mt-4 absolute text-gray-900 dark:text-gray-100"
      viewBox="0 0 24 24"
      width="24"
      height="24"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
      shapeRendering="geometricPrecision"
      {...props}
    >
      <path d="M18 6L6 18" />
      <path d="M6 6l12 12" />
    </svg>
  );
}