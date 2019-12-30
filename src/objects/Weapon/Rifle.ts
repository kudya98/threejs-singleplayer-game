import * as THREE from 'three'
import Weapon from './Weapon'
import Unit from '../Unit/Unit'
import Action from '../Action'
import RifleBullet from '../Projectile/RifleBullet'
import Sounds from '../Sounds'

const options = {
    bullets: 30,
    firerate: 12,
    bulletSpeed: 4000,
    reloadDuration: 2300,
    accuracy: 1,
}

export default class Rifle extends Weapon {
    constructor(owner: Unit) {
        super()
        const duration = 1000 / options.firerate
        const animation = owner.animations.list.find(animation => animation.name === 'shoot')
        if (animation) animation.setDuration(duration / 1000)
        this.name = 'Rifle'
        this.sounds = new Sounds([
            { url: 'sounds/rifle/shoot.wav' },
            { url: 'sounds/rifle/reload.wav' },
            { url: 'sounds/rifle/foley.wav' },
        ])

        this.bullets = this.maxBullets = options.bullets
        this.actions = [
            new Action({
                name: 'shoot',
                duration,
                unit: owner,
                onStart: (direction: THREE.Vector2): boolean => {
                    if (this.bullets > 0) {
                        this.sounds.play('shoot')
                        this.sounds.reinit({ url: 'sounds/rifle/shoot.wav' })
                        this.bullets--
                        const newDirection = direction
                            .clone()
                            .rotateAround(new THREE.Vector2(0, 0), (Math.random() - 0.5) * (1 - options.accuracy))
                        new RifleBullet(owner, newDirection, {
                            speed: options.bulletSpeed,
                        })
                        return true
                    } else {
                        this.sounds.play('foley')
                        this.sounds.clear('foley')
                        return false
                    }
                },
                onStop: () => {},
                onComplete: () => {},
            }),
            new Action({
                name: 'reload',
                duration: options.reloadDuration,
                unit: owner,
                onStart: (): boolean => {
                    if (this.bullets < this.maxBullets) {
                        this.sounds.load('reload')
                        this.sounds.play('reload')
                        return true
                    } else {
                        return false
                    }
                },
                onStop: () => {
                    this.sounds.pause('reload')
                },
                onComplete: () => {
                    this.bullets = this.maxBullets
                    this.sounds.reinit({ url: 'sounds/rifle/foley.wav' })
                    this.sounds.pause('reload')
                },
            }),
        ]
    }
    public name: string
    public actions: Action[]
    public bullets: number
    public maxBullets: number
    private sounds: Sounds
}
