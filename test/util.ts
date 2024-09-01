export function PromiseTimeout(timeoutMs: number = 10000) : Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, timeoutMs))
}