import axios from "axios";
import { useEffect, useReducer } from "react";

interface State<T> {
    data?: T;
    loading: boolean;
    error:boolean;
    message?: string;
}

type Action<T> =
    | { type: "FETCH_START" }
    | { type: "FETCH_SUCCESS"; payload: T }
    | { type: "FETCH_ERROR"; payload: string };

function dataReducer<T>(state: State<T>, action: Action<T>): State<T> {
    switch (action.type) {
        case "FETCH_START":
            return { loading: true,error:false };
        case "FETCH_SUCCESS":
            return { loading: false, data: action.payload,error:false };
        case "FETCH_ERROR":
            return { loading: false, error:true,message:action.payload };
        default:
            return state;
    }
}

export function useFetch<T = unknown>(url: string) {
    const [state, dispatch] = useReducer(dataReducer<T>, {
        loading: true,
        error:false
    });

    useEffect(() => {
        const fetchData = async () => {
            dispatch({ type: "FETCH_START" });

            try {
                const res = await axios.get<T>(url);
                console.log(res)
                dispatch({ type: "FETCH_SUCCESS", payload: res.data });
            } catch (err: any) {
                dispatch({ type: "FETCH_ERROR", payload: err.message });
            }
        };

        fetchData();
    }, [url]);

    return state;
}
