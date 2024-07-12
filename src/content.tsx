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

    async function generatePdf(vals: FieldValues, e?: React.BaseSyntheticEvent) {
        e!.preventDefault()
        const builder = new Builder()
        const baseUrl = `https://ebooks.cenreader.com/v1/reader/stream/${bookData.book_content_id}/${bookData.version}/`
        console.log(vals)

        if (vals.download === "selected") {
            for (let v in vals) {
                if (v != "download" && vals[v]) {
                    const unescaped = v.replace("%2E", ".")
                    const html = await (await fetch(baseUrl + unescaped)).text()
                    await builder.addPage(html, baseUrl + unescaped)
                }
            }
        }
        if (vals.download === "all") {
            for (let v in vals) {
                if (v != "download") {
                    const unescaped = v.replace("%2E", ".")
                    const html = await (await fetch(baseUrl + unescaped)).text()
                    await builder.addPage(html, baseUrl + unescaped)
                }
            }
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

    function buildTOC(element: any) {
        if (element.isPage === "true") {
            return (
                <div style={{
                    paddingLeft: "4px",
                }}>
                    <input type="checkbox" {...register(element.localPath.replace(".", "%2E"))} />
                    <label>{element.title}</label>
                </div>
            )
        }
        return (
            <div style={{
                display: "flex",
                flexDirection: "column",
                paddingLeft: "4px"
            }}>
                <p style={{
                    marginBlockStart: 0,
                    marginBlockEnd: 0
                }}>{element.title}</p>
                {element.content ? element.content.map((element: any) => buildTOC(element)) : <></>}
            </div>
        )
    }

    return(
        <div style={{
            position: "absolute",
            zIndex: 10000,
            height: "100vh", 
            width: "100vw", 
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(0, 0, 0, 0.4)",
        }}>
            <div style={{
                zIndex: 10001,
                display: "flex",
                flexDirection: "column",
                gap: "4px",
                alignItems: "center",
                padding: "4px",
                backgroundColor: "rgb(255, 255, 255)",
                maxHeight: "100%",
                overflowY: "scroll",
            }}>
                <h2>Cengage Downloader V1</h2>
                <p>ISBN: {props.eISBN}</p>
                <form onSubmit={handleSubmit(generatePdf)}>
                {structure ? 
                    <div style={{
                        display: "flex",
                        gap: "4px"
                    }}>
                        <p style={{
                            marginBlockStart: 0,
                            marginBlockEnd: 0
                        }}>Select sections to download:</p>
                        <div style={{
                            display: "flex",
                            gap: "4px"
                        }}>
                            <button type="submit" value="all" {...register("download")}>Download All</button>
                            <button type="submit" value="selected" {...register("download")}>Download Selected</button>
                        </div>
                        <div style={{
                            display: "flex",
                            flexDirection: "column",
                        }}>
                            {structure.map((element: any) => buildTOC(element))}
                        </div>
                    </div>
                    :
                    <div>
                        <p>Loading Contents...</p>
                    </div>
                }
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
