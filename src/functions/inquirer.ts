import inquirer from "inquirer";
import { handleCatchBlock } from "./common";

export function selectOptionInput ({
    choices,
    message,
}: {
    message: string,
    choices: {
        name: string,
        value: string,
    }[]
}) {
    return new Promise<string | null>(async (resolve, reject) => {
        try {
            
            const answer = await inquirer.prompt([
                {
                    message,
                    type: "list",
                    name: "choice",
                    choices,
                }
            ])

            return resolve(answer.choice as string | null);

        } catch (err) {
            const message = handleCatchBlock(err);
            return reject(message);
        }
    })
}

export async function textInput (question: string) {
    return new Promise<string>(async (resolve, reject) => {
        try {
        
        const answer = await inquirer.prompt([
            {
                message: question,
                type: "input",
                name: "choice",
                required: true,
            }
        ])

        return resolve(answer.choice as string)

        } catch (err) {
            const message = handleCatchBlock(err);
            return reject(message);
        }
    })
}