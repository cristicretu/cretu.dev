import Link from "next/dist/client/link";

function BlogPost({ title, summary, slug }) {
    return (
        <Link href={`blog/${slug}`}>
            <a className="w-full space-x-2 flex items-center rounded-md ">
                <div className="flex flex-col space-y-2">
                    <div className="flex justify-between">
                        <h1 className="font-bold text-2xl">{title}</h1>
                    </div>
                    <p className="text-gray-500 max-w-2xl">{summary}</p>
                </div>
            </a>
        </Link>
    );
}

export default BlogPost;
