export function writeInfo(message: string): void {
    console.info("[info] " + message)
}

export function writeWarn(message: string): void {
    console.warn("[warn] " + message)
}

export function writeError(message: string): void {
    console.error("[error] " + message)
}

export function writeDebug(message: string): void {
    console.debug("[debug] " + message)
}