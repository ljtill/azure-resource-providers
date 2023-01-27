import chalk from "chalk"

export class Logger {
    public debug(message: string): void {
        if (process.argv.indexOf("--debug") > -1) {
            console.debug(chalk.blue("[DEBUG] " + message))
        }
    }

    public info(message: string): void {
        console.info("[INFO] " + message)
    }

    public warn(message: string): void {
        console.warn(chalk.yellow("[WARN] " + message))
    }

    public error(message: string): void {
        console.error(chalk.red("[ERROR] " + message))
    }
}
