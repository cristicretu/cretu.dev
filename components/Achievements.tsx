import React from 'react';
import { achievements } from '../data/achievements';
import { useState } from 'react';

const Achievements: React.FC = () => {
  const [ShortResults, setShortResults] = useState(true);

  return (
    <div className="flex flex-col space-y-6 max-w-2xl">
      <h2 className="font-bold text-2xl md:text-4xl tracking-tight text-gray-800 dark:text-gray-100">
        Achievements
      </h2>
      <div className="flex flex-col space-y-4">
        <h3 className="font-bold text-black dark:text-white text-xl">2021</h3>
        {achievements.y2021.map((data) => (
          <div
            key={data.title}
            className="flex text-black dark:text-white flex-col space-y-2 mx-4"
          >
            {' '}
            <div className="flex flex-row space-x-2 font-semibold text-md items-center">
              <div>
                {' '}
                <span className="sr-only">Check</span>
                <svg
                  className="h-4 w-4 mr-2 text-green-500"
                  viewBox="0 0 24 24"
                >
                  <g
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                    <path d="M22 4L12 14.01l-3-3" />
                  </g>
                </svg>
              </div>
              <h4>{data.title}</h4>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              {data.description}
            </p>{' '}
          </div>
        ))}
        <hr
          className={
            ShortResults
              ? 'hidden'
              : 'w-full  border-1 border-gray-200 dark:border-gray-800 mb-8'
          }
        />
        <h3
          className={
            ShortResults
              ? 'hidden'
              : 'font-bold text-black dark:text-white text-xl'
          }
        >
          2020
        </h3>
        {!ShortResults &&
          achievements.y2020.map((data) => (
            <div
              key={data.title}
              className="flex text-black dark:text-white flex-col space-y-2 mx-4"
            >
              {' '}
              <div className="flex flex-row space-x-2 font-semibold text-md items-center">
                <div>
                  {' '}
                  <span className="sr-only">Check</span>
                  <svg
                    className="h-4 w-4 mr-2 text-green-500"
                    viewBox="0 0 24 24"
                  >
                    <g
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                      <path d="M22 4L12 14.01l-3-3" />
                    </g>
                  </svg>
                </div>
                <h4>{data.title}</h4>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                {data.description}
              </p>{' '}
            </div>
          ))}
        <hr
          className={
            ShortResults
              ? 'hidden'
              : 'w-full  border-1 border-gray-200 dark:border-gray-800 mb-8'
          }
        />
        <h3
          className={
            ShortResults
              ? 'hidden'
              : 'font-bold text-black dark:text-white text-xl'
          }
        >
          2019
        </h3>
        {!ShortResults &&
          achievements.y2019.map((data) => (
            <div
              key={data.title}
              className="flex text-black dark:text-white flex-col space-y-2 mx-4"
            >
              {' '}
              <div className="flex flex-row space-x-2 font-semibold text-md items-center">
                <div>
                  {' '}
                  <span className="sr-only">Check</span>
                  <svg
                    className="h-4 w-4 mr-2 text-green-500"
                    viewBox="0 0 24 24"
                  >
                    <g
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                      <path d="M22 4L12 14.01l-3-3" />
                    </g>
                  </svg>
                </div>
                <h4>{data.title}</h4>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                {data.description}
              </p>{' '}
            </div>
          ))}
        <hr
          className={
            ShortResults
              ? 'hidden'
              : 'w-full  border-1 border-gray-200 dark:border-gray-800 mb-8'
          }
        />
        <h3
          className={
            ShortResults
              ? 'hidden'
              : 'font-bold dark:text-white text-black text-xl'
          }
        >
          2016
        </h3>
        {!ShortResults &&
          achievements.y2016.map((data) => (
            <div
              key={data.title}
              className="flex text-black dark:text-white flex-col space-y-2 mx-4"
            >
              {' '}
              <div className="flex flex-row space-x-2 font-semibold text-md items-center">
                <div>
                  {' '}
                  <span className="sr-only">Check</span>
                  <svg
                    className="h-4 w-4 mr-2 text-green-500"
                    viewBox="0 0 24 24"
                  >
                    <g
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                      <path d="M22 4L12 14.01l-3-3" />
                    </g>
                  </svg>
                </div>
                <h4>{data.title}</h4>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                {data.description}
              </p>{' '}
            </div>
          ))}
        <hr
          className={
            ShortResults
              ? 'hidden'
              : 'w-full  border-1 border-gray-200 dark:border-gray-800 mb-8'
          }
        />
        <h3
          className={
            ShortResults
              ? 'hidden'
              : 'font-bold text-black dark:text-white text-xl'
          }
        >
          2015
        </h3>
        {!ShortResults &&
          achievements.y2015.map((data) => (
            <div
              key={data.title}
              className="flex flex-col text-black dark:text-white space-y-2 mx-4"
            >
              {' '}
              <div className="flex flex-row space-x-2 font-semibold text-md items-center">
                <div>
                  {' '}
                  <span className="sr-only">Check</span>
                  <svg
                    className="h-4 w-4 mr-2 text-green-500"
                    viewBox="0 0 24 24"
                  >
                    <g
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                      <path d="M22 4L12 14.01l-3-3" />
                    </g>
                  </svg>
                </div>
                <h4>{data.title}</h4>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                {data.description}
              </p>{' '}
            </div>
          ))}
        <hr
          className={
            ShortResults
              ? 'hidden'
              : 'w-full  border-1 border-gray-200 dark:border-gray-800 mb-8'
          }
        />
        <h3
          className={
            ShortResults
              ? 'hidden'
              : 'font-bold text-black dark:text-white text-xl'
          }
        >
          2009
        </h3>
        {!ShortResults &&
          achievements.y2009.map((data) => (
            <div
              key={data.title}
              className="flex text-black dark:text-white flex-col space-y-2 mx-4"
            >
              {' '}
              <div className="flex flex-row space-x-2 font-semibold text-md items-center">
                <div>
                  {' '}
                  <span className="sr-only">Check</span>
                  <svg
                    className="h-4 w-4 mr-2 text-green-500"
                    viewBox="0 0 24 24"
                  >
                    <g
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                      <path d="M22 4L12 14.01l-3-3" />
                    </g>
                  </svg>
                </div>
                <h4>{data.title}</h4>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                {data.description}
              </p>{' '}
            </div>
          ))}
        <hr
          className={
            ShortResults
              ? 'hidden'
              : 'w-full  border-1 border-gray-200 dark:border-gray-800 mb-8'
          }
        />
        <button
          onClick={() => setShortResults(!ShortResults)}
          className="mx-auto px-4 py-2 rounded-md text-gray-900 bg-gray-100 dark:text-gray-100 dark:bg-gray-800 transition-all"
        >
          {ShortResults ? 'Show More' : 'Show less'}
        </button>
      </div>
    </div>
  );
};

export default Achievements;

// function AchivementCard() {
//     return achievements.map((data) => (

//     ));
// }
