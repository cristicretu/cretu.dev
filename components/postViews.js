import useSWR from "swr";

import fetchData from "../lib/fetchData";
import { useEffect } from "react";

function postViews({ slug }) {
    const url = `/api/views/${slug}`;
    const { data } = useSWR(url, fetchData);
    const views = new Number(data?.total);

    useEffect(() => {
        const countView = () =>
            fetch(url, {
                method: POST,
            });

        countView();
    }, [slug]);
    return <h4>{views ? views.toString() : "---"} views</h4>;
}

export default postViews;
