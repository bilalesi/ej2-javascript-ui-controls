import { OneDimension } from '../one-dimension';


/**
 * codabar used to calculate the barcode of type codabar
 */
export class CodaBar extends OneDimension {
    /** @private */
    public validateInput(char: string): string {
        if (char.search(/^[0-9A-D\-\.\$\/\+\%\:]+$/) === -1) {
            return 'Supports 0-9, A-D and symbols (-,$, /, ., +).';
        } else {
            return undefined;
        }
    }


    private getCodeValue(): object {
        let codes: object = {
            '0': '101010011',
            '1': '101011001',
            '2': '101001011',
            '3': '110010101',
            '4': '101101001',
            '5': '110101001',
            '6': '100101011',
            '7': '100101101',
            '8': '100110101',
            '9': '110100101',
            '-': '101001101',
            '$': '101100101',
            ':': '1101011011',
            '/': '1101101011',
            '.': '1101101101',
            '+': '101100110011',
            'A': '1011001001',
            'B': '1001001011',
            'C': '1010010011',
            'D': '1010011001'
        };
        return codes;
    }

    private appendStartStopCharacters(char: string): string {
        return 'A' + char + 'A';
    }

    private getPatternCollection(givenCharacter: string, codes: string[]): number[] {
        let code: number[] = [];
        for (let i: number = 0; i < givenCharacter.length; i++) {
            let char: string = givenCharacter[i];
            code.push(codes[char]);
        }
        return code;
    }

    /** @private */
    public draw(canvas: HTMLElement): void {
        let codes: string[] = this.getCodeValue() as string[];
        let givenCharacter: string = this.value;
        givenCharacter = this.appendStartStopCharacters(givenCharacter);
        let code: number[] = this.getPatternCollection(givenCharacter, codes);
        this.calculateBarCodeAttributes(code, canvas);
    }
}