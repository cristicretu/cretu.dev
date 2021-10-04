import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

function ProjectCard({ data }) {
  const { resolvedTheme, systemTheme } = useTheme();

  const [Mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div>
      {Mounted === true ? (
        <div
          className={classNames(
            "flex flex-col  space-y-4 p-4  rounded-md motion-reduce:transition-none motion-reduce:transform-none  border dark:border-gray-600 border-gray-200",
            resolvedTheme === undefined
              ? systemTheme === "dark"
                ? "pattern-dark"
                : "pattern-white"
              : resolvedTheme === "dark"
              ? "pattern-dark"
              : "pattern-white"
          )}
        >
          <div className="flex space-x-2 items-center">
            <h1 className="font-bold text-black dark:text-white">
              {data.name}
            </h1>
          </div>
          <div className="text-gray-600 dark:text-gray-400">
            {data.description}
          </div>
        </div>
      ) : (
        ""
      )}
    </div>
  );
}

export default ProjectCard;
