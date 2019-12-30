import Unit from './Unit/Unit'

interface IOptions {
    name: string
    duration?: number
    unit: Unit
    // возвращает true если успешно
    onStart: (...args: any) => boolean
    onComplete: (...args: any) => void
    onStop: () => void
}

export default class Action {
    constructor(options: IOptions) {
        const { name, unit, onStart, onStop, onComplete } = options
        this.name = name
        if (options.duration) {
            this.duration = options.duration
        } else {
            this.duration = Infinity
        }
        this.start = (...args: any): boolean => {
            if (unit.currentAction) {
                if (unit.currentAction === this || unit.currentAction.duration === Infinity) {
                    return false
                }
                unit.currentAction.stop()
            }

            if (onStart(...args)) {
                unit.currentAction = this
                this.onComplete = this.duration
                this.passedArgs = args
                return true
            } else {
                return false
            }
        }
        this.stop = () => {
            onStop()
            this.onComplete = 0
            this.passedArgs = []
            unit.currentAction = undefined
        }
        this.complete = () => {
            onComplete(...this.passedArgs)
            this.onComplete = 0
            this.passedArgs = []
            unit.currentAction = undefined
        }
    }
    public update(delta: number) {
        if (this.isActive()) {
            if (this.onComplete !== Infinity) {
                this.onComplete -= delta
                if (!this.isActive()) this.complete()
            }
        }
    }
    public name: string
    public start: (...args: any) => boolean
    public complete: () => void
    public stop: () => void
    private passedArgs: any
    private isActive() {
        return this.onComplete > 0
    }
    private onComplete = 0
    private duration: number
}
