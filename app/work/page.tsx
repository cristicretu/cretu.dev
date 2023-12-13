import WorkLayout from './layout';
import { ReactElement } from 'react';

export default function Work() {
  return (
    <div>
      <Card />
      <Card />
      <Card />
      <Card />
      <Card />
      <Card />
    </div>
  );
}

function Card() {
  return (
    <div className="card bg-emerald-500 p-4">
      <div className="card-body">
        <h2 className="card-title">TailwindCSS</h2>
        <p className="card-text">
          A utility-first CSS framework for rapidly building custom designs.
        </p>
        <a
          className="btn btn-primary"
          href="https://tailwindcss.com"
          rel="noopener noreferrer"
          target="_blank"
        >
          Visit
        </a>
      </div>
    </div>
  );
}

Work.getLayout = function getLayout(page: ReactElement) {
  return <WorkLayout>{page}</WorkLayout>;
};
