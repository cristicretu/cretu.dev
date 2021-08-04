function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
}

function ProjectCard({ data }) {
    return (
        <div className="flex flex-col transition duration-600 ease-in-out transform hover:-translate-y-1 hover:scale-105 space-y-4 p-4 rounded-md motion-reduce:transition-none motion-reduce:transform-none bg-gray-100 dark:bg-gray-900 border dark:border-gray-600 border-gray-200">
            <div className="flex space-x-2 items-center">
                <h1 className="font-bold">{data.name}</h1>

                <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 whitespace-nowrap overflow-auto">
                    {data.tags.map((tags) => (
                        <h3
                            key={tags}
                            className={classNames(
                                "rounded-md bg-opacity-20 group-hover:animate-bounce text-opacity-65 px-2 text-sm py-1",
                                tags === "reactjs"
                                    ? "bg-blue-900 text-blue-500"
                                    : tags === "tailwindcss"
                                    ? "bg-blue-700 text-blue-400"
                                    : tags === "javascript"
                                    ? "bg-orange-900 text-orange-400"
                                    : tags === "API"
                                    ? "bg-orange-900 text-orange-600"
                                    : tags === "python"
                                    ? "bg-yellow-900 text-orange-500"
                                    : tags === "html"
                                    ? "bg-orange-800 text-orange-700"
                                    : tags === "css"
                                    ? "bg-blue-600 text-blue-200"
                                    : tags === "nextjs"
                                    ? "bg-black text-gray-200"
                                    : tags === "blog"
                                    ? "bg-green-800 text-green-400"
                                    : tags === "firebase"
                                    ? "bg-orange-900 text-orange-400"
                                    : tags === "mongodb"
                                    ? "bg-green-900 text-green-500"
                                    : tags === "expressjs"
                                    ? "bg-black text-white"
                                    : tags === "nodejs"
                                    ? "bg-green-900 text-green-600"
                                    : tags === "beautifulSoup"
                                    ? "bg-orange-700 text-orange-400"
                                    : tags === "local-file-creation"
                                    ? "bg-red-900 text-red-400"
                                    : tags === "parsing"
                                    ? "bg-pink-900 text-pink-400"
                                    : tags === "algorithm"
                                    ? "bg-red-900 text-red-500"
                                    : tags === "pygame"
                                    ? "bg-orange-900 text-orange-500"
                                    : tags === "visualization"
                                    ? "text-pink-500 bg-pink-900"
                                    : tags === "flask"
                                    ? "bg-gray-700 text-gray-500"
                                    : tags === "jinja"
                                    ? "text-red-400 bg-red-800"
                                    : tags === "sqlite"
                                    ? "bg-blue-700 text-blue-400"
                                    : tags === "next-auth"
                                    ? "bg-black text-white"
                                    : tags === "facebook-api"
                                    ? "bg-blue-900 text-blue-400"
                                    : tags === "imdb-api"
                                    ? "bg-red-800 text-red-400"
                                    : tags === "mdx"
                                    ? "bg-pink-900 text-pink-500"
                                    : "bg-black text-white"
                            )}
                        >
                            {tags}
                        </h3>
                    ))}
                </div>
            </div>
            <div>{data.description}</div>
        </div>
    );
}

export default ProjectCard;
