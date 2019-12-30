import World from './World'

interface ISound {
    url: string
    name?: string
}

interface ISoundsSrc {
    [s: string]: HTMLAudioElement
}

export default class Sounds {
    constructor(sounds: ISound[]) {
        sounds.forEach(sound => {
            const name = sound.name || sound.url.match(/(\w+)\.wav|mp3/)![1]
            this.src[name] = new Audio(sound.url)
        })
    }
    public play(name: string) {
        if (!this.src[name]) return
        this.src[name].volume = World.SOUNDS_LEVEL
        this.src[name].play()
    }
    public pause(name: string) {
        if (!this.src[name]) return
        this.src[name].pause()
    }
    public load(name: string) {
        if (!this.src[name]) return
        this.src[name].load()
    }
    public reinit(sound: ISound) {
        const name = sound.name || sound.url.match(/(\w+)\.wav|mp3/)![1]
        this.src[name] = new Audio(sound.url)
    }
    public clear(name: string) {
        if (!this.src[name]) return
        delete this.src[name]
    }
    private src: ISoundsSrc = {}
}
