import React from "react";
import { createRoot } from "react-dom/client";
import { FieldValues, useForm } from "react-hook-form";

function getAuth(vals: FieldValues) {
    const launchUrl = vals.link
    chrome.runtime.sendMessage({type: "openBook", launchUrl: launchUrl})
}

function Popup () {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm()

    return (
        <div>
            <form onSubmit={handleSubmit(getAuth)}>
                <input {...register("link")}/>
                <button>Open Book</button>
            </form>
        </div>
    )
}

const root = createRoot(document.getElementById("root")!)

root.render(
    <React.StrictMode>
        <Popup />
    </React.StrictMode>
)
