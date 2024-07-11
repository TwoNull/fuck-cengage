import React from "react";
import { createRoot } from "react-dom/client";
import { FieldValues, useForm } from "react-hook-form";
import { Builder } from "./output/builder";

declare global {
    interface Window {
        renderContent: () => void
    }
}

async function getPdf(vals: FieldValues) {
    const html = vals.html
    try {
    }
    catch (e) {
        console.log(e)
    }
}

function Dashboard() {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    return(
        <div style={{width:"100%", padding:"10px", display:"flex", gap:"5px"}}>
            <p>Hello!</p>
            <form onSubmit={handleSubmit(getPdf)}>
                <textarea {...register("html")}/>
                <button>Generate Pdf</button>
            </form>
        </div>
    )
};

window.renderContent = () => {
    const root = createRoot(document.getElementById("contentroot")!)

    root.render(
        <React.StrictMode>
            <Dashboard />
        </React.StrictMode>
    )
}
