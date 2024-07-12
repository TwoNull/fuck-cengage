import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { FieldValues, useForm } from "react-hook-form";
import { Builder } from "./output/builder";

const CENGAGE_APPID = "43a266a6-ff71-473d-896a-7b33b60f901c" 

declare global {
    interface Window {
        renderContent: (eISBN: string) => void
    }
}

function Dashboard(props: {eISBN: string}) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const [bookData, setBookData] = useState<any>(undefined)
    const [structure, setStructure] = useState<any>(undefined)

    async function generatePdf(vals: FieldValues) {
        const builder = new Builder()
        const baseUrl = `https://ebooks.cenreader.com/v1/reader/stream/${bookData.book_content_id}/${bookData.version}/`
        for (let v in vals) {
            const html = await (await fetch(baseUrl + vals[v])).text()
            await builder.addPage(html, baseUrl + vals[v])
        }
        await builder.generate()
    }

    async function fetchBookData(eISBN: string) {
        const authToken = (window.localStorage.token as string).slice(1,-1)
        const id = await (await fetch(`https://hapi.hapicen.com/ap/books/appId/${CENGAGE_APPID}/reference/${eISBN}?type=cengageISBN`)).text()
        const data = await (await fetch(`https://hapi.hapicen.com/v2/reader/books/store?metaType=web&app_studio_id=${CENGAGE_APPID}&app_id=${CENGAGE_APPID}&book_id=${id}`, {
            headers: {
                authorization: authToken
            }
        })).json()
        setBookData(data[0].books[0])
        const structure = await (await fetch(`https://ebooks.cenreader.com/v1/reader/read/${id}/${data[0].books[0].version}/structure.json`)).json()
        setStructure(structure.book.content)
    }

    useEffect(() => {
        fetchBookData(props.eISBN)
    }, [])

    function buildTOC(content: any) {
        if (content.isPage) {
            return (
                <option value={content.localPath} {...register(content.path)}>{content.title}</option>
            )
        }
        return (
            <optgroup label={content.title}>
                {content.content ? buildTOC(content.content) : <></>}
            </optgroup>
        )
    }

    return(
        <div style={{
            position: "absolute",
            zIndex: 10,
            height: "100vh", 
            width: "100vw", 
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(0, 0, 0, 0.4)",
        }}>
            <div style={{
                zIndex: 11,
                display: "flex",
                flexDirection: "column",
                gap: "4px",
                alignItems: "center",
                justifyContent: "center",
                padding: "4px",
                backgroundColor: "rgb(255, 255, 255)",
            }}>
                <h2>Cengage Downloader V1</h2>
                <p>ISBN: {props.eISBN}</p>
                <form onSubmit={handleSubmit(generatePdf)}>
                    <div>
                        <label>Select sections to download:</label>
                        <select>
                            {structure.map((content: any) => {buildTOC(content)})}
                        </select>
                    </div>
                </form>
            </div>
        </div>
    )
};

window.renderContent = (eISBN: string) => {
    const root = createRoot(document.getElementById("contentroot")!)

    root.render(
        <React.StrictMode>
            <Dashboard eISBN={eISBN} />
        </React.StrictMode>
    )
}
