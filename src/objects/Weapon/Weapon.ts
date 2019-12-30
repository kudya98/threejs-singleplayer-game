import Action from '../Action'

export default abstract class Weapon {
    protected constructor() {}
    public abstract actions: Action[]
    public abstract name: string
    public abstract bullets: number
    public abstract maxBullets: number
}
